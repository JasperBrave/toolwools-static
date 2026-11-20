// price-by-country.js — GTA 6 Price by Country page logic.
// Uses the ported price engine (assets/js/engines/price-engine.js).
// AUDIT FIX M8: the reference exchange-rate date (RATES_AS_OF,
// 2026-11-20) is shown prominently on the page, and regional list prices
// are flagged as reported, not confirmed store prices, wherever they
// appear. Standard ($79.99) and Ultimate ($99.99) US prices are confirmed by Rockstar.
// State lives in the URL (?country=&edition=&tab=) so results are
// shareable. The country defaults to a guess from the browser language
// when no ?country= is given, matching the source route.
import { MARKETS, EDITIONS, RATES_AS_OF, BAND_LABEL, priceFor, allPrices, editionValues, importVerdict, guessMarketCode, marketByCode, formatLocal, formatUsd } from "/assets/js/engines/price-engine.js";

var DEFAULTS = { country: "US", edition: "standard", tab: "country" };
var EDITION_KEYS = Object.keys(EDITIONS);
var TABS = ["country", "editions", "compare"];
var RATES_LABEL = "20 November 2026 (2026-11-20)";

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var countryRaw = q.get("country");
  var country = DEFAULTS.country;
  if (countryRaw) {
    country = countryRaw.toUpperCase();
  } else if (typeof navigator !== "undefined" && navigator.language) {
    country = guessMarketCode(navigator.language);
  }
  var state = {
    country: country,
    edition: EDITION_KEYS.indexOf(q.get("edition")) !== -1 ? q.get("edition") : DEFAULTS.edition,
    tab: TABS.indexOf(q.get("tab")) !== -1 ? q.get("tab") : DEFAULTS.tab
  };
  var bad = [];
  if (countryRaw !== null && !marketByCode(state.country)) { bad.push("country"); state.country = DEFAULTS.country; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Unknown country in the link, so this page reset to the United States. Pick your country below.";
  notice.classList.add("show");
}

var countrySel = $("[data-country-select]");
var editionSel = $("[data-edition-select]");
var tabButtons = $all("[data-tab-button]");

function shareUrl() {
  var p = new URLSearchParams({ country: state.country, edition: state.edition, tab: state.tab });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ country: state.country, edition: state.edition, tab: state.tab });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
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

function shortAnswer(price) {
  var s = "GTA 6 costs " + formatUsd(EDITIONS.standard.usd) + " USD for the Standard edition; Ultimate is $99.99 — both confirmed by Rockstar. "
    + "In " + price.market.country + " that models out to " + formatLocal(price.totalLocal, price.market) + " for " + EDITIONS[state.edition].label + ", or about "
    + formatUsd(price.usdEquivalent) + " once " + price.market.taxLabel.toLowerCase() + " is counted. "
    + "That is " + BAND_LABEL[price.band].toLowerCase();
  if (price.regionallyPriced) s += ", and this market is regionally priced rather than converted.";
  else s += ", converted at the reference rate below.";
  return s;
}
function shareRowHtml(text, title) {
  var url = shareUrl();
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copy verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + "&url=" + encodeURIComponent(url) + '">Share on X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Share verdict on Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(title) + "&url=" + encodeURIComponent(url) + '">Reddit</a>'
    + "</div>";
}
function countryTabHtml(price) {
  var vs = (price.vsUsPercent > 0 ? "+" : "") + price.vsUsPercent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  var note = price.regionallyPriced
    ? "Regionally priced: this storefront sets a lower local price instead of converting the USD figure. Regional list prices are reported, not confirmed store prices."
    : "Converted from the confirmed US price at the dated reference rate.";
  if (price.unconfirmed) note += " " + EDITIONS[state.edition].label + " pricing is modelled, not confirmed by Rockstar.";
  var taxHint = price.market.taxIncludedInList ? price.market.taxLabel + " already included" : "Before " + price.market.taxLabel;
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">' + BAND_LABEL[price.band] + "</p>"
    + '<h3 class="verdict-title">' + formatLocal(price.totalLocal, price.market) + "</h3>"
    + '<p class="verdict-desc">' + BAND_LABEL[price.band] + " · " + vs + "% vs the US receipt total</p></div></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Shelf price</dt><dd>" + formatLocal(price.listLocal, price.market) + "</dd></div>"
    + "<div><dt>" + price.market.taxLabel + "</dt><dd>" + formatLocal(price.taxLocal, price.market) + "</dd></div>"
    + "<div><dt>Receipt total</dt><dd>" + formatLocal(price.totalLocal, price.market) + "</dd></div>"
    + "<div><dt>USD equivalent</dt><dd>" + formatUsd(price.usdEquivalent) + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + taxHint + ". " + note + "</p>"
    + '<p class="verdict-desc">Reference exchange rates dated ' + RATES_LABEL + ". Standard ($79.99) and Ultimate ($99.99) US prices are confirmed.</p>";
}
function editionsTabHtml(price, ladder) {
  var items = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modelled</span>';
    var line = formatUsd(e.usdEquivalent) + " USD equivalent"
      + (e.premiumOverStandardUsd > 0 ? " · " + formatUsd(e.premiumOverStandardUsd) + " over Standard" : " · baseline")
      + (e.usdPer100kGta !== null ? " · " + formatUsd(e.usdPer100kGta) + " per 100,000 GTA$" : "");
    return '<li class="rank-item"><div class="rank-head"><h3>' + e.label + badge + "</h3><p>" + formatLocal(e.totalLocal, price.market) + "</p></div>"
      + "<p>" + line + "</p>"
      + "<p>" + e.includes.join(" · ") + "</p></li>";
  }).join("");
  return '<ul class="rank-list" role="list">' + items + "</ul>"
    + '<p class="verdict-desc">Standard ($79.99) and Ultimate ($99.99) prices are confirmed. Ultimate\'s bundled GTA$ figure is modelled, not confirmed. Reference exchange rates dated ' + RATES_LABEL + ".</p>";
}
function compareTabHtml(price, verdict) {
  return '<p class="verdict-desc">' + verdict.headline + "</p>"
    + '<dl class="stat-grid">'
    + "<div><dt>Cheapest market</dt><dd>" + verdict.cheapest.market.country + "</dd></div>"
    + "<div><dt>Your market</dt><dd>" + verdict.home.market.country + "</dd></div>"
    + "<div><dt>Gap</dt><dd>" + formatUsd(Math.abs(verdict.savingUsd)) + "</dd></div>"
    + "<div><dt>Worth importing?</dt><dd>" + (verdict.worthIt ? "Only on paper" : "No") + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + verdict.caveat + "</p>";
}
function priceTableHtml(ranked, country, editionLabel) {
  var body = ranked.map(function (p) {
    var hl = p.market.code === country ? ' class="hl-row"' : "";
    var reg = p.regionallyPriced ? ' <span class="flag-badge">Regional</span>' : "";
    var vs = (p.vsUsPercent > 0 ? "+" : "") + p.vsUsPercent.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return '<tr id="market-' + p.market.code.toLowerCase() + '"' + hl + "><th scope=\"row\">" + p.market.country + reg + "</th>"
      + "<td class=\"muted\">" + formatLocal(p.listLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatLocal(p.taxLocal, p.market) + "</td>"
      + "<td class=\"mono\">" + formatLocal(p.totalLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatUsd(p.usdEquivalent) + "</td>"
      + "<td class=\"mono\">" + vs + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="price-table">\n      <h2 id="price-table">GTA 6 price in every country: ' + editionLabel + "</h2>\n"
    + '      <p class="section-dek">Ranked by USD-equivalent receipt total, cheapest first. Tax is inside the total, the shelf column shows the listed price.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 price in every country, scrollable table">\n'
    + '      <table class="data-table" id="price-table">\n        <caption class="sr-only">Modelled GTA 6 ' + editionLabel + " price for 44 markets, cheapest USD equivalent first, rates dated " + RATES_AS_OF + ".</caption>\n"
    + '        <thead><tr><th scope="col">Country</th><th scope="col">Shelf price</th><th scope="col">Tax</th><th scope="col">Receipt total</th><th scope="col">USD</th><th scope="col">vs US</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Regional list prices are reported, not confirmed store prices. Reference exchange rates dated ' + RATES_LABEL + ".</p>\n    </section>";
}
function ladderTableHtml(price, ladder) {
  var body = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modelled</span>';
    return "<tr><th scope=\"row\">" + e.label + badge + "</th>"
      + "<td class=\"mono\">" + formatLocal(e.totalLocal, price.market) + "</td>"
      + "<td class=\"muted\">" + (e.premiumOverStandardUsd > 0 ? formatUsd(e.premiumOverStandardUsd) : "Baseline") + "</td>"
      + "<td class=\"muted\">" + (e.gtaDollars > 0 ? e.gtaDollars.toLocaleString("en-US") : "0") + "</td>"
      + "<td class=\"muted\">" + (e.usdPer100kGta !== null ? formatUsd(e.usdPer100kGta) : "n/a") + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="edition-ladder">\n      <h2 id="edition-ladder">GTA 6 Standard vs Ultimate</h2>\n'
    + '      <p class="section-dek">The upgrade question, answered with a value rate instead of a feature list. Prices in ' + price.market.currency + " for " + price.market.country + ".</p>\n"
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 Standard vs Ultimate, scrollable table">\n'
    + '      <table class="data-table" id="edition-ladder">\n        <caption class="sr-only">GTA 6 edition ladder priced in ' + price.market.currency + " for " + price.market.country + ", with premium over Standard and cost per 100,000 bundled GTA$.</caption>\n"
    + '        <thead><tr><th scope="col">Edition</th><th scope="col">Local total</th><th scope="col">Over Standard</th><th scope="col">Bundled GTA$</th><th scope="col">Per 100k GTA$</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Standard ($79.99) and Ultimate ($99.99) prices are confirmed. Ultimate\'s bundled GTA$ figure is modelled, not confirmed.</p>\n    </section>';
}

var lastShareText = "";
var lastShareTitle = "";

function render() {
  var price = priceFor(state.country, state.edition);
  var ladder = editionValues(state.country);
  var ranked = allPrices(state.edition);
  var verdict = importVerdict(state.country, state.edition);
  var short = shortAnswer(price);

  if (countrySel) countrySel.value = state.country;
  if (editionSel) editionSel.value = state.edition;
  tabButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tabButton === state.tab)); });
  var outputLabel = $(".output-panel-label");
  if (outputLabel) outputLabel.textContent = "GTA 6 price in " + price.market.country;

  lastShareText = "GTA 6 price in " + price.market.country + ": " + formatLocal(price.totalLocal, price.market) + " for " + EDITIONS[state.edition].label + " (" + formatUsd(price.usdEquivalent) + "). 44 markets compared on ToolWools.";
  lastShareTitle = "GTA 6 price in " + price.market.country + ": " + formatLocal(price.totalLocal, price.market) + " (" + EDITIONS[state.edition].label + ")";

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Price check · TL;DR";
    if (text) text.textContent = short;
    if (verdictEl) verdictEl.textContent = price.market.country + " · " + formatLocal(price.totalLocal, price.market) + " receipt total";
  }

  var out = $("[data-output-panel]");
  if (out) {
    var body = state.tab === "editions" ? editionsTabHtml(price, ladder)
      : state.tab === "compare" ? compareTabHtml(price, verdict)
      : countryTabHtml(price);
    body += shareRowHtml(lastShareText, lastShareTitle);
    out.innerHTML = body;
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(lastShareText + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }
  var tableSlot = $("[data-price-table-slot]");
  if (tableSlot) tableSlot.innerHTML = priceTableHtml(ranked, state.country, EDITIONS[state.edition].label);
  var ladderSlot = $("[data-ladder-slot]");
  if (ladderSlot) ladderSlot.innerHTML = ladderTableHtml(price, ladder);

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = document.querySelector('.share-panel a[aria-label="Share this result on X"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Share this result on Reddit"]');
  if (xLink) xLink.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(lastShareText) + "&url=" + encodeURIComponent(shareUrl());
  if (rLink) rLink.href = "https://www.reddit.com/submit?title=" + encodeURIComponent(lastShareTitle) + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = short;
  syncUrl();
}

if (countrySel) countrySel.addEventListener("change", function () { state.country = countrySel.value; render(); });
if (editionSel) editionSel.addEventListener("change", function () { state.edition = editionSel.value; render(); });
tabButtons.forEach(function (b) { b.addEventListener("click", function () { state.tab = b.dataset.tabButton; render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
