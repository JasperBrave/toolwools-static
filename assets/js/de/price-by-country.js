// price-by-country.js — GTA 6 Price by Country page logic.
// Uses the ported price engine (assets/js/engines/price-engine.js).
// AUDIT FIX M8: the reference exchange-rate date (RATES_AS_OF,
// 2026-08-01) is shown prominently on the page, and regional list prices
// are flagged as reported, not confirmed store prices, wherever they
// appear. Only the $79.99 US Standard price is confirmed by Rockstar.
// State lives in the URL (?country=&edition=&tab=) so results are
// shareable. The country defaults to a guess from the browser language
// when no ?country= is given, matching the source route.
import { MARKETS, EDITIONS, RATES_AS_OF, BAND_LABEL as BAND_LABEL_EN, priceFor as priceForEn, allPrices as allPricesEn, editionValues as editionValuesEn, importVerdict as importVerdictEn, guessMarketCode, marketByCode, formatLocal, formatUsd } from "../engines/de/price-engine.js";

var COUNTRY = { US: "Vereinigte Staaten", CA: "Kanada", MX: "Mexiko", BR: "Brasilien", AR: "Argentinien", CL: "Chile", CO: "Kolumbien", PE: "Peru", GB: "Vereinigtes Königreich", DE: "Deutschland", FR: "Frankreich", ES: "Spanien", IT: "Italien", NL: "Niederlande", PL: "Polen", SE: "Schweden", NO: "Norwegen", DK: "Dänemark", CH: "Schweiz", TR: "Türkei", UA: "Ukraine", RO: "Rumänien", PT: "Portugal", IE: "Irland", IN: "Indien", PK: "Pakistan", BD: "Bangladesch", ID: "Indonesien", PH: "Philippinen", TH: "Thailand", VN: "Vietnam", MY: "Malaysia", SG: "Singapur", JP: "Japan", KR: "Südkorea", CN: "China", AU: "Australien", NZ: "Neuseeland", AE: "Vereinigte Arabische Emirate", SA: "Saudi-Arabien", EG: "Ägypten", ZA: "Südafrika", NG: "Nigeria", IL: "Israel" };
var TAX_LABEL = { "Sales tax (avg)": "Umsatzsteuer (Ø)", "Sales tax": "Umsatzsteuer", "Tax included": "Steuer enthalten", "Consumption tax": "Verbrauchssteuer" };
var INCLUDES = { "Base game": "Basis-Spiel", "Story mode": "Story-Modus", "Online access": "Online-Zugang", "Starter vehicle pack": "Starter-Fahrzeug-Pack", "Wardrobe pack": "Garderoben-Pack", "All Deluxe content": "Alle Deluxe-Inhalte", "Early-access weekend": "Early-Access-Wochenende", "Season 1 pass": "Season-1-Pass" };
var BAND_LABEL = { cheapest: "Unter den günstigsten Märkten", "below-average": "Günstiger als in den USA", typical: "Im Einklang mit dem US-Preis", "above-average": "Teurer als in den USA", "most-expensive": "Unter den teuersten Märkten" };
function mapMarket(m) { if (!m) return m; var c = Object.assign({}, m); c.country = COUNTRY[m.code] || m.country; c.taxLabel = TAX_LABEL[m.taxLabel] || m.taxLabel; return c; }
function mapPrice(p) { if (!p) return p; var c = Object.assign({}, p); c.market = mapMarket(p.market); return c; }
function priceFor(code, edition) { return mapPrice(priceForEn(code, edition)); }
function allPrices(edition) { return allPricesEn(edition).map(mapPrice); }
function editionValues(code) { return editionValuesEn(code).map(function (e) { var c = Object.assign({}, e); c.includes = e.includes.map(function (s) { return INCLUDES[s] || s; }); return c; }); }
function importVerdict(code, edition) { var v = importVerdictEn(code, edition); var cheap = mapPrice(v.cheapest), home = mapPrice(v.home); var headline; if (cheap.market.code === home.market.code) headline = home.market.country + " ist bereits der günstigste Markt auf dieser Liste, es gibt nichts zu importieren."; else if (v.worthIt) headline = "Kaufen in " + cheap.market.country + " kostet etwa " + formatUsd(cheap.usdEquivalent) + " gegenüber " + formatUsd(home.usdEquivalent) + " zu Hause, etwa " + formatUsd(v.savingUsd) + " (" + v.savingPercent + " %) weniger."; else headline = "Der Abstand zwischen " + home.market.country + " und dem günstigsten Markt beträgt nur etwa " + formatUsd(Math.abs(v.savingUsd)) + ", das ist den Aufwand nicht wert."; return { cheapest: cheap, home: home, savingUsd: v.savingUsd, savingPercent: v.savingPercent, worthIt: v.worthIt, headline: headline, caveat: "Regionale Store-Preise sind an deine Account-Region gebunden und, bei den meisten Storefronts, an eine lokale Zahlungsmethode. Ein Regionswechsel, um einem niedrigeren Preis nachzujagen, verstößt meist gegen die Nutzungsbedingungen des Stores und kann dich den Zugang zu deiner Bibliothek kosten. Betrachte diese Zahlen als Preisvergleich, nicht als Kaufanleitung." }; }

var DEFAULTS = { country: "US", edition: "standard", tab: "country" };
var EDITION_KEYS = Object.keys(EDITIONS);
var TABS = ["country", "editions", "compare"];
var RATES_LABEL = "1. August 2026 (2026-08-01)";

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
  notice.textContent = "Unbekanntes Land im Link, also hat diese Seite auf die Vereinigten Staaten zurückgesetzt. Wähle unten dein Land.";
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
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Kopieren";
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
    try { document.execCommand("copy"); done("Kopiert!"); } catch (e) { done("Kopieren fehlgeschlagen"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Kopiert!"); }, fallback);
  } else {
    fallback();
  }
}

function shortAnswer(price) {
  var s = "GTA 6 kostet " + formatUsd(EDITIONS.standard.usd) + " USD für die Standard Edition, der einzige Preis, den Rockstar bestätigt hat. "
    + "In " + price.market.country + " ergibt das modelliert " + formatLocal(price.totalLocal, price.market) + " für " + EDITIONS[state.edition].label + ", oder etwa "
    + formatUsd(price.usdEquivalent) + ", sobald " + price.market.taxLabel.toLowerCase() + " eingerechnet ist. "
    + "Das ist " + BAND_LABEL[price.band].toLowerCase();
  if (price.regionallyPriced) s += ", und dieser Markt ist regional bepreist statt umgerechnet.";
  else s += ", umgerechnet zum Referenzkurs unten.";
  return s;
}
function shareRowHtml(text, title) {
  var url = shareUrl();
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + "&url=" + encodeURIComponent(url) + '">Auf X teilen</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="https://www.reddit.com/submit?title=' + encodeURIComponent(title) + "&url=" + encodeURIComponent(url) + '">Reddit</a>'
    + "</div>";
}
function countryTabHtml(price) {
  var vs = price.vsUsPercent > 0 ? "+" + price.vsUsPercent : String(price.vsUsPercent);
  var note = price.regionallyPriced
    ? "Regional bepreist: Dieser Storefront setzt einen niedrigeren lokalen Preis statt den USD-Betrag umzurechnen. Regionale Listenpreise sind gemeldet, keine bestätigten Store-Preise."
    : "Umgerchnet vom bestätigten US-Preis zum datierten Referenzkurs.";
  if (price.unconfirmed) note += " " + EDITIONS[state.edition].label + "-Preise sind modelliert, nicht von Rockstar bestätigt.";
  var taxHint = price.market.taxIncludedInList ? price.market.taxLabel + " bereits enthalten" : "Vor " + price.market.taxLabel;
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">' + BAND_LABEL[price.band] + "</p>"
    + '<h3 class="verdict-title">' + formatLocal(price.totalLocal, price.market) + "</h3>"
    + '<p class="verdict-desc">' + BAND_LABEL[price.band] + " · " + vs + " % vs US-Kassenbon-Gesamtbetrag</p></div></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Regalpreis</dt><dd>" + formatLocal(price.listLocal, price.market) + "</dd></div>"
    + "<div><dt>" + price.market.taxLabel + "</dt><dd>" + formatLocal(price.taxLocal, price.market) + "</dd></div>"
    + "<div><dt>Kassenbon-Gesamtbetrag</dt><dd>" + formatLocal(price.totalLocal, price.market) + "</dd></div>"
    + "<div><dt>USD-Äquivalent</dt><dd>" + formatUsd(price.usdEquivalent) + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + taxHint + ". " + note + "</p>"
    + '<p class="verdict-desc">Referenz-Wechselkurse datiert ' + RATES_LABEL + ". Nur der US-Standard-Preis von 79,99 $ ist bestätigt.</p>";
}
function editionsTabHtml(price, ladder) {
  var items = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modelliert</span>';
    var line = formatUsd(e.usdEquivalent) + " USD-Äquivalent"
      + (e.premiumOverStandardUsd > 0 ? " · " + formatUsd(e.premiumOverStandardUsd) + " über Standard" : " · Basis")
      + (e.usdPer100kGta !== null ? " · " + formatUsd(e.usdPer100kGta) + " pro 100.000 GTA$" : "");
    return '<li class="rank-item"><div class="rank-head"><h3>' + e.label + badge + "</h3><p>" + formatLocal(e.totalLocal, price.market) + "</p></div>"
      + "<p>" + line + "</p>"
      + "<p>" + e.includes.join(" · ") + "</p></li>";
  }).join("");
  return '<ul class="rank-list" role="list">' + items + "</ul>"
    + '<p class="verdict-desc">Nur der Standard-Preis ist bestätigt. Deluxe und Ultimate nutzen den +20-$ / +30-$-Abstand, den Rockstar für GTA 5 und Red Dead Redemption 2 nutzte. Referenz-Wechselkurse datiert ' + RATES_LABEL + ".</p>";
}
function compareTabHtml(price, verdict) {
  return '<p class="verdict-desc">' + verdict.headline + "</p>"
    + '<dl class="stat-grid">'
    + "<div><dt>Günstigster Markt</dt><dd>" + verdict.cheapest.market.country + "</dd></div>"
    + "<div><dt>Dein Markt</dt><dd>" + verdict.home.market.country + "</dd></div>"
    + "<div><dt>Abstand</dt><dd>" + formatUsd(Math.abs(verdict.savingUsd)) + "</dd></div>"
    + "<div><dt>Import lohnenswert?</dt><dd>" + (verdict.worthIt ? "Nur auf dem Papier" : "Nein") + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + verdict.caveat + "</p>";
}
function priceTableHtml(ranked, country, editionLabel) {
  var body = ranked.map(function (p) {
    var hl = p.market.code === country ? ' class="hl-row"' : "";
    var reg = p.regionallyPriced ? ' <span class="flag-badge">Regional</span>' : "";
    var vs = p.vsUsPercent > 0 ? "+" + p.vsUsPercent : String(p.vsUsPercent);
    return '<tr id="market-' + p.market.code.toLowerCase() + '"' + hl + "><th scope=\"row\">" + p.market.country + reg + "</th>"
      + "<td class=\"muted\">" + formatLocal(p.listLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatLocal(p.taxLocal, p.market) + "</td>"
      + "<td class=\"mono\">" + formatLocal(p.totalLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatUsd(p.usdEquivalent) + "</td>"
      + "<td class=\"mono\">" + vs + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="price-table">\n      <h2 id="price-table">GTA-6-Preis in jedem Land: ' + editionLabel + "</h2>\n"
    + '      <p class="section-dek">Gerankt nach USD-äquivalentem Kassenbon-Gesamtbetrag, günstigste zuerst. Steuer ist im Gesamtbetrag enthalten, die Regal-Spalte zeigt den Listenpreis.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA-6-Preis in jedem Land, scrollbare Tabelle">\n'
    + '      <table class="data-table" id="price-table">\n        <caption class="sr-only">Modellierter GTA-6-' + editionLabel + "-Preis für 44 Märkte, günstigstes USD-Äquivalent zuerst, Kurse vom " + RATES_AS_OF + ".</caption>\n"
    + '        <thead><tr><th scope="col">Land</th><th scope="col">Regalpreis</th><th scope="col">Steuer</th><th scope="col">Kassenbon-Gesamtbetrag</th><th scope="col">USD</th><th scope="col">vs USA</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Regionale Listenpreise werden gemeldet, keine bestätigten Store-Preise. Referenz-Wechselkurse vom ' + RATES_LABEL + ".</p>\n    </section>";
}
function ladderTableHtml(price, ladder) {
  var body = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modelliert</span>';
    return "<tr><th scope=\"row\">" + e.label + badge + "</th>"
      + "<td class=\"mono\">" + formatLocal(e.totalLocal, price.market) + "</td>"
      + "<td class=\"muted\">" + (e.premiumOverStandardUsd > 0 ? formatUsd(e.premiumOverStandardUsd) : "Basis") + "</td>"
      + "<td class=\"muted\">" + (e.gtaDollars > 0 ? e.gtaDollars.toLocaleString("en-US") : "0") + "</td>"
      + "<td class=\"muted\">" + (e.usdPer100kGta !== null ? formatUsd(e.usdPer100kGta) : "k. A.") + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="edition-ladder">\n      <h2 id="edition-ladder">GTA 6 Standard vs Deluxe vs Ultimate</h2>\n'
    + '      <p class="section-dek">Die Upgrade-Frage, beantwortet mit einer Wertrate statt einer Feature-Liste. Preise in ' + price.market.currency + " für " + price.market.country + ".</p>\n"
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 Standard vs Deluxe vs Ultimate, scrollbare Tabelle">\n'
    + '      <table class="data-table" id="edition-ladder">\n        <caption class="sr-only">GTA-6-Editions-Leiter, bepreist in ' + price.market.currency + " für " + price.market.country + ", mit Aufpreis über Standard und Kosten pro 100.000 gebündelte GTA$.</caption>\n"
    + '        <thead><tr><th scope="col">Edition</th><th scope="col">Lokaler Gesamtbetrag</th><th scope="col">Über Standard</th><th scope="col">Gebündelte GTA$</th><th scope="col">Pro 100 Tsd. GTA$</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Nur der Standard-Preis ist bestätigt. Deluxe und Ultimate nutzen den +20-$ / +30-$-Abstand, den Rockstar für GTA 5 und Red Dead Redemption 2 nutzte.</p>\n    </section>';
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
  if (outputLabel) outputLabel.textContent = "GTA-6-Preis in " + price.market.country;

  lastShareText = "GTA-6-Preis in " + price.market.country + ": " + formatLocal(price.totalLocal, price.market) + " für " + EDITIONS[state.edition].label + " (" + formatUsd(price.usdEquivalent) + "). 44 Märkte verglichen auf ToolWools.";
  lastShareTitle = "GTA-6-Preis in " + price.market.country + ": " + formatLocal(price.totalLocal, price.market) + " (" + EDITIONS[state.edition].label + ")";

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Preis-Check · Kurzfassung";
    if (text) text.textContent = short;
    if (verdictEl) verdictEl.textContent = price.market.country + " · " + formatLocal(price.totalLocal, price.market) + " Kassenbon-Gesamtbetrag";
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
  var xLink = document.querySelector('.share-panel a[aria-label="Dieses Ergebnis auf X teilen"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Dieses Ergebnis auf Reddit teilen"]');
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
