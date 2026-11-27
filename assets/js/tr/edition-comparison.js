// edition-comparison.js — GTA 6 Edition Picker page logic.
// Uses the ported edition engine (assets/js/engines/edition-engine.js).
// AUDIT FIX H3: Ultimate uplift is 25.0% (99.99 / 79.99), never 42%.
// State lives in the URL (?platform=&profile=&uplift=&p=&view=) so results
// are shareable. Defaults match the source route loaderDeps:
// PlayStation 5, story plus casual online, 30% uplift ceiling.
import { EDITIONS, BONUSES, PROFILES, CATEGORY_LABEL, CONFIDENCE_LABEL, PLATFORM_LABEL, evaluateEditions, profileById, platformById } from "../engines/tr/edition-engine.js";

var DEFAULTS = { platform: "ps5", profile: "online-casual", uplift: 30, p: [], view: "verdict" };
var PLATFORMS = ["ps5", "xbox"];
var VIEWS = ["verdict", "matrix", "upgrade"];
var VIEW_LABEL = { verdict: "Ne alınır", matrix: "Bonus matrisi", upgrade: "Yükseltme hesabı" };
var CATEGORIES = Object.keys(CATEGORY_LABEL);
var CONF_SHORT = { confirmed: "Doğrulandı", reported: "Bildirildi", precedent: "Emsal" };

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
  if (q.get("profile") && !profileById(q.get("profile"))) bad.push("profil");
  if (q.get("uplift") !== null && !Number.isFinite(Number(q.get("uplift")))) bad.push("artış tavanı");
  if (q.get("view") && VIEWS.indexOf(q.get("view")) === -1) bad.push("görünüm");
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Bağlantıdaki bilinmeyen " + parsed.bad.join(", ") + ", bu sayfa varsayılan kurulumuna sıfırlandı. Seçeneklerinizi aşağıdan seçin.";
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
var BUYER_PHRASE = {
  "story-only": "yalnızca hikâye oyuncusu",
  "online-casual": "hikâye ağırlıklı rahat çevrimiçi oyuncu",
  "online-grinder": "ilk günden çevrimiçi oyuncu",
  "undecided": "henüz karar vermemiş alıcı"
};
function buyerPhrase(profile) {
  return BUYER_PHRASE[profile.id] || profile.label.toLowerCase();
}
function shareTitle(result) {
  return result.profile.label.toLowerCase() + " oyuncular için en iyi GTA 6 sürümü: " + result.best.edition.label + " (" + result.best.score + "/100). ToolWools'ta GTA 6 sürüm seçici.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareTitle(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent(result.best.edition.label + " - " + result.profile.label.toLowerCase() + " oyuncular için en iyi GTA 6 sürümü (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());
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
      desc = "Temel fiyat. Tam oyun.";
    } else {
      desc = "+" + e.edition.upliftPercent + "% Standard'ın üzerinde \u00b7 " + e.utilityDelta + " ağırlıklı puan ekler (" + e.utilityPerUpliftPoint + " harcanan her %10 başına).";
    }
    if (!e.available) desc += " " + result.platformLabel + " üzerinde satılmıyor.";
    else if (e.overBudget) desc += " Belirlediğiniz tavanın üzerinde.";
    desc += " Güven: " + CONFIDENCE_LABEL[e.confidence] + ".";
    return "<li><strong>" + (i + 1) + ". " + esc(e.edition.label) + ": " + e.score + "/100</strong>, " + esc(desc) + "</li>";
  }).join("");
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">En iyi değer \u00b7 ' + result.best.score + "/100</p>"
    + '<h3 class="verdict-title">' + esc(result.best.edition.label) + "</h3>"
    + '<p class="verdict-desc">' + esc(result.best.edition.note) + "</p></div></div>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">Sıralanmış sürümler</p><ul>' + items + "</ul></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Değer puanı</dt><dd>" + result.best.score + "/100</dd></div>"
    + "<div><dt>Standard'a göre artış</dt><dd>+" + result.best.edition.upliftPercent + "%</dd></div>"
    + "<div><dt>Ek fayda</dt><dd>+" + result.best.utilityDelta + " puan</dd></div>"
    + "<div><dt>Tavanınız</dt><dd>" + result.upliftTolerance + "%</dd></div></dl>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + xUrl(result) + '">X\'te paylaş</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function matrixHtml(result) {
  var items = result.best.bonuses.map(function (b) {
    return "<li><strong>" + esc(b.label) + ": " + b.utility + " pts</strong>, " + esc(CATEGORY_LABEL[b.category]) + " \u00b7 " + esc(CONFIDENCE_LABEL[b.confidence]) + ". " + esc(b.detail) + "</li>";
  }).join("");
  var added = result.best.addedOverPrevious.length
    ? '<p class="verdict-desc">Bu kademede yeni: ' + esc(result.best.addedOverPrevious.map(function (b) { return b.label; }).join(", ")) + ".</p>"
    : "";
  return '<p class="verdict-desc">' + esc(result.best.edition.label) + " sürümünün bir " + esc(result.profile.label.toLowerCase()) + " oyuncusu için ne kadar değerli olduğuna göre sıralanmış olarak neler verdiğini gösterir. Her bonusun güven düzeyi etiketlenmiştir.</p>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">' + esc(result.best.edition.label) + " bonusları</p><ul>" + items + "</ul></div>" + added
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + xUrl(result) + '">X\'te paylaş</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function upgradeHtml(result) {
  var items = result.upgradeMath.map(function (m) {
    return "<li><strong>" + esc(m.title) + "</strong>, " + esc(m.body) + "</li>";
  }).join("");
  return '<div class="upgrade-box"><p class="eyebrow-muted">Yükseltme hesabı</p><ul>' + items + "</ul></div>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + xUrl(result) + '">X\'te paylaş</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + redditUrl(result) + '">Reddit</a>'
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
  if (label) label.textContent = result.platformLabel + " üzerindeki sürümler";

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var tLabel = $("[data-tldr-label]", tldr);
    var tText = $("[data-tldr-text]", tldr);
    var tVerdict = $("[data-tldr-verdict]", tldr);
    var tIcon = $("[data-tldr-icon]", tldr);
    if (tLabel) tLabel.textContent = result.best.edition.label + " \u00b7 Özet";
    if (tText) tText.textContent = result.best.edition.label + ", " + result.platformLabel + " üzerinde bir " + buyerPhrase(result.profile) + " için %" + result.upliftTolerance + " tavanla en iyi değerdir: " + result.best.score + "/100, Standard'a göre %" + result.best.edition.upliftPercent + " artış karşılığında " + result.best.utilityDelta + " ağırlıklı puan ekler.";
    if (tVerdict) tVerdict.textContent = result.best.edition.label + ": " + result.best.score + "/100 artış karşılığı değer";
    if (tIcon) tIcon.innerHTML = iconFor(tone);
  }

  var shortEl = $("[data-short-answer-text]");
  if (shortEl) {
    shortEl.innerHTML = "Her GTA 6 sürümü tam hikâye modunu ve tam çevrimiçi modu içerir, oyun 19 Kasım 2026'da 05:00 UTC'de çıktı ve hiçbir kademe ekstra hikâye satmaz. " + esc(result.platformLabel) + " üzerinde, Standard'a göre %" + result.upliftTolerance + " tavanı olan bir " + esc(buyerPhrase(result.profile)) + " için en iyi değer <strong>" + esc(result.best.edition.label) + "</strong>. " + esc(result.reason);
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
  if (live) live.textContent = "En iyi değer: " + result.best.edition.label + ", 100 üzerinden " + result.best.score + ", " + result.platformLabel + " üzerinde bir " + buyerPhrase(result.profile) + " için, Standard'a göre %" + result.upliftTolerance + " tavanla.";
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
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Kopyala";
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
    try { document.execCommand("copy"); done("Kopyalandı!"); } catch (e) { done("Kopyalama başarısız"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Kopyalandı!"); }, fallback);
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
