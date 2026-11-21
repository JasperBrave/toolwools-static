// price-by-country.js — Preço do GTA 6 por País page logic.
// Uses the ported price engine (assets/js/engines/price-engine.js).
// AUDIT FIX M8: the reference exchange-rate date (RATES_AS_OF,
// 2026-11-20) is shown prominently on the page, and regional list prices
// are flagged as reported, not confirmed store prices, wherever they
// appear. Standard ($79.99) and Ultimate ($99.99) US prices are confirmed by Rockstar.
// State lives in the URL (?country=&edition=&tab=) so results are
// shareable. The country defaults to a guess from the browser language
// when no ?country= is given, matching the source route.
import { MARKETS, EDITIONS, RATES_AS_OF, BAND_LABEL, priceFor, allPrices, editionValues, importVerdict, guessMarketCode, marketByCode, formatLocal, formatUsd } from "/assets/js/engines/pt/price-engine.js";
import { L } from "./l10n.js";

var DEFAULTS = { country: "US", edition: "standard", tab: "country" };
var EDITION_KEYS = Object.keys(EDITIONS);
var TABS = ["country", "editions", "compare"];
var RATES_LABEL = "20 de novembro de 2026 (2026-11-20)";

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
  notice.textContent = "País desconhecido no link, então esta página foi redefinida para os Estados Unidos. Escolha seu país abaixo.";
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
    try { document.execCommand("copy"); done("Copiado!"); } catch (e) { done("Não foi possível copiar"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copiado!"); }, fallback);
  } else {
    fallback();
  }
}

function shortAnswer(price) {
  var s = "GTA 6 custa " + formatUsd(EDITIONS.standard.usd) + " USD pela edição Standard; Ultimate custa US$ 99,99, ambos confirmados pela Rockstar. "
    + "In " + price.market.country + " that models out to " + formatLocal(price.totalLocal, price.market) + " for " + EDITIONS[state.edition].label + ", or about "
    + formatUsd(price.usdEquivalent) + " once " + price.market.taxLabel.toLowerCase() + " is counted. "
    + "That is " + L(BAND_LABEL[price.band]).toLowerCase();
  if (price.regionallyPriced) s += ", e este mercado tem preço regional em vez de convertido.";
  else s += ", convertido à taxa de referência abaixo.";
  return s;
}
function shareRowHtml(text, title) {
  var url = shareUrl();
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredito</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + "&url=" + encodeURIComponent(url) + '">Compartilhar no X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(title) + "&url=" + encodeURIComponent(url) + '">Reddit</a>'
    + "</div>";
}
function countryTabHtml(price) {
  var vs = (price.vsUsPercent > 0 ? "+" : "") + price.vsUsPercent.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  var note = price.regionallyPriced
    ? "Preço regional: esta loja define um preço local mais baixo em vez de converter o valor em USD. Os preços de lista regionais são reportados, não preços confirmados de loja."
    : "Convertido a partir do preço confirmado dos EUA à taxa de referência datada.";
  if (price.unconfirmed) note += " " + EDITIONS[state.edition].label + " o preço é modelado, não confirmado pela Rockstar.";
  var taxHint = price.market.taxIncludedInList ? price.market.taxLabel + " already included" : "Before " + price.market.taxLabel;
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">' + L(BAND_LABEL[price.band]) + "</p>"
    + '<h3 class="verdict-title">' + formatLocal(price.totalLocal, price.market) + "</h3>"
    + '<p class="verdict-desc">' + L(BAND_LABEL[price.band]) + " · " + vs + "% vs the US receipt total</p></div></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Preço de prateleira</dt><dd>" + formatLocal(price.listLocal, price.market) + "</dd></div>"
    + "<div><dt>" + price.market.taxLabel + "</dt><dd>" + formatLocal(price.taxLocal, price.market) + "</dd></div>"
    + "<div><dt>Total do recibo</dt><dd>" + formatLocal(price.totalLocal, price.market) + "</dd></div>"
    + "<div><dt>Equivalente em USD</dt><dd>" + formatUsd(price.usdEquivalent) + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + taxHint + ". " + note + "</p>"
    + '<p class="verdict-desc">Taxas de câmbio de referência datadas ' + RATES_LABEL + ". Os preços Standard (US$ 79,99) e Ultimate (US$ 99,99) dos EUA estão confirmados.</p>";
}
function editionsTabHtml(price, ladder) {
  var items = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modelado</span>';
    var line = formatUsd(e.usdEquivalent) + " Equivalente em USD"
      + (e.premiumOverStandardLocal > 0 ? " · " + formatLocal(e.premiumOverStandardLocal, price.market) + " over Standard" : " · baseline")
      + (e.localPer100kGta !== null ? " · " + formatLocal(e.localPer100kGta, price.market) + " per 100,000 GTA$" : "");
    return '<li class="rank-item"><div class="rank-head"><h3>' + e.label + badge + "</h3><p>" + formatLocal(e.totalLocal, price.market) + "</p></div>"
      + "<p>" + line + "</p>"
      + "<p>" + e.includes.join(" · ") + "</p></li>";
  }).join("");
  return '<ul class="rank-list" role="list">' + items + "</ul>"
    + '<p class="verdict-desc">Os preços Standard (US$ 79,99) e Ultimate (US$ 99,99) estão confirmados. O número de GTA$ incluídos do Ultimate é modelado, não confirmado. Taxas de câmbio de referência datadas ' + RATES_LABEL + ".</p>";
}
function compareTabHtml(price, verdict) {
  return '<p class="verdict-desc">' + verdict.headline + "</p>"
    + '<dl class="stat-grid">'
    + "<div><dt>Cheapest market</dt><dd>" + verdict.cheapest.market.country + "</dd></div>"
    + "<div><dt>Seu mercado</dt><dd>" + verdict.home.market.country + "</dd></div>"
    + "<div><dt>Gap</dt><dd>" + formatUsd(Math.abs(verdict.savingUsd)) + "</dd></div>"
    + "<div><dt>Worth importing?</dt><dd>" + (verdict.worthIt ? "Only on paper" : "No") + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + verdict.caveat + "</p>";
}
function priceTableHtml(ranked, country, editionLabel) {
  var body = ranked.map(function (p) {
    var hl = p.market.code === country ? ' class="hl-row"' : "";
    var reg = p.regionallyPriced ? ' <span class="flag-badge">Regional</span>' : "";
    var vs = (p.vsUsPercent > 0 ? "+" : "") + p.vsUsPercent.toLocaleString("pt-BR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return '<tr id="market-' + p.market.code.toLowerCase() + '"' + hl + "><th scope=\"row\">" + p.market.country + reg + "</th>"
      + "<td class=\"muted\">" + formatLocal(p.listLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatLocal(p.taxLocal, p.market) + "</td>"
      + "<td class=\"mono\">" + formatLocal(p.totalLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatUsd(p.usdEquivalent) + "</td>"
      + "<td class=\"mono\">" + vs + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="price-table">\n      <h2 id="price-table">GTA 6 price in every country: ' + editionLabel + "</h2>\n"
    + '      <p class="section-dek">Classificado por total do recibo equivalente em USD, o mais barato primeiro. O imposto está dentro do total, a coluna de prateleira mostra o preço listado.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 price in every country, scrollable table">\n'
    + '      <table class="data-table" id="price-table">\n        <caption class="sr-only">Modelado GTA 6 ' + editionLabel + " preço para 44 mercados, equivalente em USD mais barato primeiro, taxas datadas " + RATES_AS_OF + ".</caption>\n"
    + '        <thead><tr><th scope="col">Country</th><th scope="col">Preço de prateleira</th><th scope="col">Imposto</th><th scope="col">Total do recibo</th><th scope="col">USD</th><th scope="col">vs EUA</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Os preços de lista regionais são reportados, não preços confirmados de loja. Taxas de câmbio de referência datadas ' + RATES_LABEL + ".</p>\n    </section>";
}
function ladderTableHtml(price, ladder) {
  var body = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modelado</span>';
    return "<tr><th scope=\"row\">" + e.label + badge + "</th>"
      + "<td class=\"mono\">" + formatLocal(e.totalLocal, price.market) + "</td>"
      + "<td class=\"muted\">" + (e.premiumOverStandardLocal > 0 ? formatLocal(e.premiumOverStandardLocal, price.market) : "Base") + "</td>"
      + "<td class=\"muted\">" + (e.gtaDollars > 0 ? e.gtaDollars.toLocaleString("pt-BR") : "0") + "</td>"
      + "<td class=\"muted\">" + (e.localPer100kGta !== null ? formatLocal(e.localPer100kGta, price.market) : "n/a") + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="edition-ladder">\n      <h2 id="edition-ladder">GTA 6 Standard vs Ultimate</h2>\n'
    + '      <p class="section-dek">A pergunta do upgrade, respondida com uma taxa de valor em vez de uma lista de recursos. Preços em ' + price.market.currency + " for " + price.market.country + ".</p>\n"
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 Standard vs Ultimate, scrollable table">\n'
    + '      <table class="data-table" id="edition-ladder">\n        <caption class="sr-only">Escada de edições do GTA 6 com preços em ' + price.market.currency + " for " + price.market.country + ", com prêmio sobre Standard e custo por cada 100.000 GTA$ incluídos.</caption>\n"
    + '        <thead><tr><th scope="col">Edição</th><th scope="col">Total local</th><th scope="col">Sobre Standard</th><th scope="col">GTA$ incluídos</th><th scope="col">Por cada 100 mil GTA$</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Os preços Standard (US$ 79,99) e Ultimate (US$ 99,99) estão confirmados. O número de GTA$ incluídos do Ultimate é modelado, não confirmado.</p>\n    </section>';
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
    if (label) label.textContent = "Verificação de preço · Resumo";
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
  var xLink = document.querySelector('.share-panel a[aria-label="Compartilhe este resultado on X"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Compartilhe este resultado on Reddit"]');
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
