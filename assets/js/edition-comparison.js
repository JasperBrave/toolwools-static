// edition-comparison.js — GTA 6 Edition Picker page logic.
// Uses the ported edition engine (assets/js/engines/edition-engine.js).
// AUDIT FIX H3: Ultimate uplift is 37.5% (109.99 / 79.99), never 42%.
// State lives in the URL (?platform=&profile=&uplift=&p=&view=) so results
// are shareable. Defaults match the source route loaderDeps:
// PlayStation 5, story plus casual online, 30% uplift ceiling.
import { EDITIONS, BONUSES, PROFILES, CATEGORY_LABEL, CONFIDENCE_LABEL, PLATFORM_LABEL, evaluateEditions, profileById, platformById } from "/assets/js/engines/edition-engine.js";

var DEFAULTS = { platform: "ps5", profile: "online-casual", uplift: 30, p: [], view: "verdict" };
var PLATFORMS = ["ps5", "xbox", "pc"];
var VIEWS = ["verdict", "matrix", "upgrade"];
var VIEW_LABEL = { verdict: "What to buy", matrix: "Bonus matrix", upgrade: "Upgrade math" };
var CATEGORIES = Object.keys(CATEGORY_LABEL);
var CONF_SHORT = { confirmed: "Confirmed", reported: "Reported", precedent: "Precedent" };

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var upliftParam = q.get("uplift");
  var upliftRaw = upliftParam === null ? NaN : Number(upliftParam);
  var pRaw = q.get("p") || "";
  var state = {
    platform: PLATFORMS.indexOf(q.get("platform")) !== -1 ? q.get("platform") : DEFAULTS.platform,
    profile: profileById(q.get("profile")) ? q.get("profile") : DEFAULTS.profile,
    uplift: Number.isFinite(upliftRaw) ? Math.max(0, Math.min(200, Math.round(upliftRaw))) : DEFAULTS.uplift,
    p: pRaw.split(",").map(function (s) { return s.trim(); }).filter(function (s) { return CATEGORIES.indexOf(s) !== -1; }),
    view: VIEWS.indexOf(q.get("view")) !== -1 ? q.get("view") : DEFAULTS.view
  };
  var bad = [];
  if (q.get("platform") && PLATFORMS.indexOf(q.get("platform")) === -1) bad.push("platform");
  if (q.get("profile") && !profileById(q.get("profile"))) bad.push("profile");
  if (q.get("uplift") !== null && !Number.isFinite(Number(q.get("uplift")))) bad.push("uplift ceiling");
  if (q.get("view") && VIEWS.indexOf(q.get("view")) === -1) bad.push("view");
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Unknown " + parsed.bad.join(", ") + " in the link, so this page reset to the default setup. Pick your options below.";
  notice.classList.add("show");
}

var platformSel = $("[data-platform-select]");
var profileSel = $("[data-profile-select]");
var profileNote = $("[data-profile-note]");
var upliftInput = $("[data-uplift-input]");
var upliftValue = $("[data-uplift-value]");
var priorityBtns = $all("[data-priority]");
var viewBtns = $all("[data-view-button]");

function shareUrl() {
  var p = new URLSearchParams({ platform: state.platform, profile: state.profile, uplift: String(state.uplift) });
  if (state.p.length) p.set("p", state.p.join(","));
  if (state.view !== "verdict") p.set("view", state.view);
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ platform: state.platform, profile: state.profile, uplift: String(state.uplift) });
  if (state.p.length) p.set("p", state.p.join(","));
  if (state.view !== "verdict") p.set("view", state.view);
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function buyerPhrase(profile) {
  var l = profile.label.toLowerCase();
  return /buyer$/.test(l) ? l : l + " buyer";
}
function shareTitle(result) {
  return "Best GTA 6 edition for " + result.profile.label.toLowerCase() + " players: " + result.best.edition.label + " (" + result.best.score + "/100). GTA 6 edition picker on ToolWools.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareTitle(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent(result.best.edition.label + " - best GTA 6 edition for " + result.profile.label.toLowerCase() + " players (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());
}

function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function toneOf(result) {
  if (result.best.score >= 85) return "ready";
  if (result.best.score >= 60) return "borderline";
  return "upgrade";
}

function verdictHtml(result) {
  var items = result.ranked.map(function (e, i) {
    var desc;
    if (e.edition.upliftPercent === 0) {
      desc = "Baseline price. Complete game.";
    } else {
      desc = "+" + e.edition.upliftPercent + "% over Standard \u00b7 adds " + e.utilityDelta + " weighted points (" + e.utilityPerUpliftPoint + " per 10% spent).";
    }
    if (!e.available) desc += " Not sold on " + result.platformLabel + ".";
    else if (e.overBudget) desc += " Above the ceiling you set.";
    desc += " Confidence: " + CONFIDENCE_LABEL[e.confidence] + ".";
    return "<li><strong>" + (i + 1) + ". " + esc(e.edition.label) + " \u2014 " + e.score + "/100</strong> \u2014 " + esc(desc) + "</li>";
  }).join("");
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">Best value \u00b7 ' + result.best.score + "/100</p>"
    + '<h3 class="verdict-title">' + esc(result.best.edition.label) + "</h3>"
    + '<p class="verdict-desc">' + esc(result.best.edition.note) + "</p></div></div>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">Ranked editions</p><ul>' + items + "</ul></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Value score</dt><dd>" + result.best.score + "/100</dd></div>"
    + "<div><dt>Uplift over Standard</dt><dd>+" + result.best.edition.upliftPercent + "%</dd></div>"
    + "<div><dt>Added usefulness</dt><dd>+" + result.best.utilityDelta + " pts</dd></div>"
    + "<div><dt>Your ceiling</dt><dd>" + result.upliftTolerance + "%</dd></div></dl>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copy verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on X" href="' + xUrl(result) + '">Share on X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on Reddit" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function matrixHtml(result) {
  var items = result.best.bonuses.map(function (b) {
    return "<li><strong>" + esc(b.label) + " \u2014 " + b.utility + " pts</strong> \u2014 " + esc(CATEGORY_LABEL[b.category]) + " \u00b7 " + esc(CONFIDENCE_LABEL[b.confidence]) + ". " + esc(b.detail) + "</li>";
  }).join("");
  var added = result.best.addedOverPrevious.length
    ? '<p class="verdict-desc">New in this tier: ' + esc(result.best.addedOverPrevious.map(function (b) { return b.label; }).join(", ")) + ".</p>"
    : "";
  return '<p class="verdict-desc">What ' + esc(result.best.edition.label) + " grants, ordered by how much it is worth to a " + esc(result.profile.label.toLowerCase()) + " player. Confidence is labelled on every bonus.</p>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">' + esc(result.best.edition.label) + " bonuses</p><ul>" + items + "</ul></div>" + added
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copy verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on X" href="' + xUrl(result) + '">Share on X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on Reddit" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function upgradeHtml(result) {
  var items = result.upgradeMath.map(function (m) {
    return "<li><strong>" + esc(m.title) + "</strong> \u2014 " + esc(m.body) + "</li>";
  }).join("");
  return '<div class="upgrade-box"><p class="eyebrow-muted">Upgrade math</p><ul>' + items + "</ul></div>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copy verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on X" href="' + xUrl(result) + '">Share on X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on Reddit" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function render() {
  var result = evaluateEditions({ platform: state.platform, profile: state.profile, upliftTolerance: state.uplift, priorities: state.p });
  var tone = toneOf(result);

  if (platformSel) platformSel.value = state.platform;
  if (profileSel) profileSel.value = state.profile;
  if (profileNote) profileNote.textContent = result.profile.note;
  if (upliftInput) upliftInput.value = String(state.uplift);
  if (upliftValue) upliftValue.textContent = state.uplift + "%";
  priorityBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(state.p.indexOf(b.dataset.priority) !== -1)); });
  viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.viewButton === state.view)); });

  var label = $("[data-output-label]");
  if (label) label.textContent = "Editions on " + result.platformLabel;

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var tLabel = $("[data-tldr-label]", tldr);
    var tText = $("[data-tldr-text]", tldr);
    var tVerdict = $("[data-tldr-verdict]", tldr);
    var tIcon = $("[data-tldr-icon]", tldr);
    if (tLabel) tLabel.textContent = result.best.edition.label + " \u00b7 TL;DR";
    if (tText) tText.textContent = result.best.edition.label + " is the best value for a " + buyerPhrase(result.profile) + " on " + result.platformLabel + " at a " + result.upliftTolerance + "% ceiling: " + result.best.score + "/100, adding " + result.best.utilityDelta + " weighted points over Standard for a " + result.best.edition.upliftPercent + "% uplift.";
    if (tVerdict) tVerdict.textContent = result.best.edition.label + " \u2014 " + result.best.score + "/100 value for uplift";
    if (tIcon) tIcon.innerHTML = iconFor(tone);
  }

  var shortEl = $("[data-short-answer-text]");
  if (shortEl) {
    shortEl.innerHTML = "Every GTA 6 edition includes the full story campaign and the full online mode \u2014 the game launches 19 November 2026 at 05:00 UTC and no tier sells extra story. On " + esc(result.platformLabel) + ", for a " + esc(buyerPhrase(result.profile)) + " with a " + result.upliftTolerance + "% ceiling over Standard, the best value is <strong>" + esc(result.best.edition.label) + "</strong>. " + esc(result.reason);
  }

  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML = state.view === "matrix" ? matrixHtml(result) : state.view === "upgrade" ? upgradeHtml(result) : verdictHtml(result);
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(result), copyBtn, "[data-copy-verdict-label]"); });
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var shareLinks = $all(".share-panel .share-row a");
  if (shareLinks[0]) shareLinks[0].href = xUrl(result);
  if (shareLinks[1]) shareLinks[1].href = redditUrl(result);

  var live = $("[data-live-region]");
  if (live) live.textContent = "Best value: " + result.best.edition.label + ", " + result.best.score + " out of 100, for a " + buyerPhrase(result.profile) + " on " + result.platformLabel + " at a " + result.upliftTolerance + " percent ceiling over Standard.";
  syncUrl();
}

function shareText(result) {
  return shareTitle(result) + " " + shareUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copy";
    }, 1600);
  }
  if (!btn.dataset.defaultLabel && labelSel) {
    var l = btn.querySelector(labelSel);
    if (l) btn.dataset.defaultLabel = l.textContent;
  }
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done("Copied!"); } catch (e) { done("Copy failed"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copied!"); }, fallback);
  } else {
    fallback();
  }
}

if (platformSel) platformSel.addEventListener("change", function () { state.platform = platformSel.value; render(); });
if (profileSel) profileSel.addEventListener("change", function () { state.profile = profileSel.value; render(); });
if (upliftInput) upliftInput.addEventListener("input", function () { state.uplift = Number(upliftInput.value); render(); });
priorityBtns.forEach(function (b) {
  b.addEventListener("click", function () {
    var c = b.dataset.priority;
    var i = state.p.indexOf(c);
    if (i === -1) state.p.push(c); else state.p.splice(i, 1);
    render();
  });
});
viewBtns.forEach(function (b) {
  b.addEventListener("click", function () { state.view = b.dataset.viewButton; render(); });
});
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
