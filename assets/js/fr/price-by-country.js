// price-by-country.js — GTA 6 Price by Country page logic.
// Uses the ported price engine (assets/js/engines/price-engine.js).
// AUDIT FIX M8: the reference exchange-rate date (RATES_AS_OF,
// 2026-11-20) is shown prominently on the page, and regional list prices
// are flagged as reported, not confirmed store prices, wherever they
// appear. Standard ($79.99) and Ultimate ($99.99) US prices are confirmed by Rockstar.
// State lives in the URL (?country=&edition=&tab=) so results are
// shareable. The country defaults to a guess from the browser language
// when no ?country= is given, matching the source route.
import { MARKETS, EDITIONS, RATES_AS_OF, BAND_LABEL as BAND_LABEL_EN, priceFor as priceForEn, allPrices as allPricesEn, editionValues as editionValuesEn, importVerdict as importVerdictEn, guessMarketCode, marketByCode, formatLocal, formatUsd } from "../engines/fr/price-engine.js";

var COUNTRY = { US: "États-Unis", CA: "Canada", MX: "Mexique", BR: "Brésil", AR: "Argentine", CL: "Chili", CO: "Colombie", PE: "Pérou", GB: "Royaume-Uni", DE: "Allemagne", FR: "France", ES: "Espagne", IT: "Italie", NL: "Pays-Bas", PL: "Pologne", SE: "Suède", NO: "Norvège", DK: "Danemark", CH: "Suisse", TR: "Turquie", UA: "Ukraine", RO: "Roumanie", PT: "Portugal", IE: "Irlande", IN: "Inde", PK: "Pakistan", BD: "Bangladesh", ID: "Indonésie", PH: "Philippines", TH: "Thaïlande", VN: "Vietnam", MY: "Malaisie", SG: "Singapour", JP: "Japon", KR: "Corée du Sud", CN: "Chine", AU: "Australie", NZ: "Nouvelle-Zélande", AE: "Émirats arabes unis", SA: "Arabie saoudite", EG: "Égypte", ZA: "Afrique du Sud", NG: "Nigeria", IL: "Israël" };
var TAX_LABEL = { "Sales tax (avg)": "Taxe de vente (moy.)", "Sales tax": "Taxe de vente", "Tax included": "Taxe incluse", "Consumption tax": "Taxe de consommation" };
var INCLUDES = { "Base game": "Jeu de base", "Story mode": "Mode Histoire", "Online access": "Accès en ligne", "Starter vehicle pack": "Pack de véhicule de démarrage", "Wardrobe pack": "Pack de garde-robe", "Early-access weekend": "Week-end d'accès anticipé", "Season 1 pass": "Pass Saison 1" };
var BAND_LABEL = { cheapest: "Parmi les marchés les moins chers", "below-average": "Moins cher qu'aux États-Unis", typical: "En ligne avec le prix américain", "above-average": "Plus cher qu'aux États-Unis", "most-expensive": "Parmi les marchés les plus chers" };
function mapMarket(m) { if (!m) return m; var c = Object.assign({}, m); c.country = COUNTRY[m.code] || m.country; c.taxLabel = TAX_LABEL[m.taxLabel] || m.taxLabel; return c; }
function mapPrice(p) { if (!p) return p; var c = Object.assign({}, p); c.market = mapMarket(p.market); return c; }
function priceFor(code, edition) { return mapPrice(priceForEn(code, edition)); }
function allPrices(edition) { return allPricesEn(edition).map(mapPrice); }
function editionValues(code) { return editionValuesEn(code).map(function (e) { var c = Object.assign({}, e); c.includes = e.includes.map(function (s) { return INCLUDES[s] || s; }); return c; }); }
function importVerdict(code, edition) { var v = importVerdictEn(code, edition); var cheap = mapPrice(v.cheapest), home = mapPrice(v.home); var headline; if (cheap.market.code === home.market.code) headline = home.market.country + " est déjà le marché le moins cher de cette liste, il n'y a rien à importer."; else if (v.worthIt) headline = "Acheter en " + cheap.market.country + " coûte environ " + formatUsd(cheap.usdEquivalent) + " contre " + formatUsd(home.usdEquivalent) + " chez vous, soit environ " + formatUsd(v.savingUsd) + " (" + v.savingPercent + " %) de moins."; else headline = "L'écart entre " + home.market.country + " et le marché le moins cher n'est que d'environ " + formatUsd(Math.abs(v.savingUsd)) + ", cela ne vaut pas l'effort."; return { cheapest: cheap, home: home, savingUsd: v.savingUsd, savingPercent: v.savingPercent, worthIt: v.worthIt, headline: headline, caveat: "Les prix régionaux des boutiques sont liés à la région de votre compte et, sur la plupart des boutiques, à un moyen de paiement local. Changer de région pour chasser un prix plus bas enfreint généralement les conditions d'utilisation de la boutique et peut vous faire perdre l'accès à votre bibliothèque. Considérez ces chiffres comme une comparaison de prix, pas comme un guide d'achat." }; }

var DEFAULTS = { country: "US", edition: "standard", tab: "country" };
var EDITION_KEYS = Object.keys(EDITIONS);
var TABS = ["country", "editions", "compare"];
var RATES_LABEL = "20 novembre 2026 (2026-11-20)";

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
  notice.textContent = "Pays inconnu dans le lien, donc cette page est revenue aux États-Unis. Choisissez votre pays ci-dessous.";
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
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copier";
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
    try { document.execCommand("copy"); done("Copié !"); } catch (e) { done("Échec de la copie"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copié !"); }, fallback);
  } else {
    fallback();
  }
}

function shortAnswer(price) {
  var s = "GTA 6 coûte " + formatUsd(EDITIONS.standard.usd) + " USD pour l'édition Standard ; Ultimate coûte 99,99 $, les deux confirmés par Rockstar. "
    + "En " + price.market.country + ", cela donne " + formatLocal(price.totalLocal, price.market) + " pour " + EDITIONS[state.edition].label + ", soit environ "
    + formatUsd(price.usdEquivalent) + ", une fois " + price.market.taxLabel.toLowerCase() + " comptée. "
    + "C'est " + BAND_LABEL[price.band].toLowerCase();
  if (price.regionallyPriced) s += ", et ce marché est tarifé régionalement plutôt que converti.";
  else s += ", converti au taux de référence ci-dessous.";
  return s;
}
function shareRowHtml(text, title) {
  var url = shareUrl();
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + "&url=" + encodeURIComponent(url) + '">Partager sur X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/submit?title=' + encodeURIComponent(title) + "&url=" + encodeURIComponent(url) + '">Reddit</a>'
    + "</div>";
}
function countryTabHtml(price) {
  var vs = (price.vsUsPercent > 0 ? "+" : "") + price.vsUsPercent.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  var note = price.regionallyPriced
    ? "Tarifé régionalement : cette boutique fixe un prix local plus bas au lieu de convertir le montant en USD. Les prix catalogue régionaux sont signalés, pas des prix de boutique confirmés."
    : "Converti à partir du prix américain confirmé au taux de référence daté.";
  if (price.unconfirmed) note += " " + EDITIONS[state.edition].label + " : prix modélisé, pas confirmé par Rockstar.";
  var taxHint = price.market.taxIncludedInList ? price.market.taxLabel + " déjà incluse" : "Avant " + price.market.taxLabel;
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">' + BAND_LABEL[price.band] + "</p>"
    + '<h3 class="verdict-title">' + formatLocal(price.totalLocal, price.market) + "</h3>"
    + '<p class="verdict-desc">' + BAND_LABEL[price.band] + " · " + vs + " % contre le total du reçu américain</p></div></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Prix en rayon</dt><dd>" + formatLocal(price.listLocal, price.market) + "</dd></div>"
    + "<div><dt>" + price.market.taxLabel + "</dt><dd>" + formatLocal(price.taxLocal, price.market) + "</dd></div>"
    + "<div><dt>Total du reçu</dt><dd>" + formatLocal(price.totalLocal, price.market) + "</dd></div>"
    + "<div><dt>Équivalent USD</dt><dd>" + formatUsd(price.usdEquivalent) + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + taxHint + ". " + note + "</p>"
    + '<p class="verdict-desc">Taux de change de référence datés du ' + RATES_LABEL + ". Les prix américains Standard (79,99 $) et Ultimate (99,99 $) sont confirmés.</p>";
}
function editionsTabHtml(price, ladder) {
  var items = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modélisé</span>';
    var line = formatUsd(e.usdEquivalent) + " équivalent USD"
      + (e.premiumOverStandardLocal > 0 ? " · " + formatLocal(e.premiumOverStandardLocal, price.market) + " au-dessus de Standard" : " · base")
      + (e.localPer100kGta !== null ? " · " + formatLocal(e.localPer100kGta, price.market) + " pour 100 000 GTA$" : "");
    return '<li class="rank-item"><div class="rank-head"><h3>' + e.label + badge + "</h3><p>" + formatLocal(e.totalLocal, price.market) + "</p></div>"
      + "<p>" + line + "</p>"
      + "<p>" + e.includes.join(" · ") + "</p></li>";
  }).join("");
  return '<ul class="rank-list" role="list">' + items + "</ul>"
    + '<p class="verdict-desc">Les prix Standard (79,99 $) et Ultimate (99,99 $) sont confirmés. Le montant de GTA$ groupés d\'Ultimate est modélisé, pas confirmé. Taux de change de référence datés du ' + RATES_LABEL + ".</p>";
}
function compareTabHtml(price, verdict) {
  return '<p class="verdict-desc">' + verdict.headline + "</p>"
    + '<dl class="stat-grid">'
    + "<div><dt>Marché le moins cher</dt><dd>" + verdict.cheapest.market.country + "</dd></div>"
    + "<div><dt>Votre marché</dt><dd>" + verdict.home.market.country + "</dd></div>"
    + "<div><dt>Écart</dt><dd>" + formatUsd(Math.abs(verdict.savingUsd)) + "</dd></div>"
    + "<div><dt>Vaut-il l'importation ?</dt><dd>" + (verdict.worthIt ? "Seulement sur le papier" : "Non") + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + verdict.caveat + "</p>";
}
function priceTableHtml(ranked, country, editionLabel) {
  var body = ranked.map(function (p) {
    var hl = p.market.code === country ? ' class="hl-row"' : "";
    var reg = p.regionallyPriced ? ' <span class="flag-badge">Régional</span>' : "";
    var vs = (p.vsUsPercent > 0 ? "+" : "") + p.vsUsPercent.toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return '<tr id="market-' + p.market.code.toLowerCase() + '"' + hl + "><th scope=\"row\">" + p.market.country + reg + "</th>"
      + "<td class=\"muted\">" + formatLocal(p.listLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatLocal(p.taxLocal, p.market) + "</td>"
      + "<td class=\"mono\">" + formatLocal(p.totalLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatUsd(p.usdEquivalent) + "</td>"
      + "<td class=\"mono\">" + vs + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="price-table">\n      <h2 id="price-table">Prix de GTA 6 dans chaque pays : ' + editionLabel + "</h2>\n"
    + '      <p class="section-dek">Classé par total de reçu équivalent en USD, le moins cher en premier. Le total de reçu inclut la taxe ; la colonne du rayon montre le prix affiché, qui exclut la taxe aux États-Unis, au Canada et en Argentine (ajoutée en caisse).</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Prix de GTA 6 dans chaque pays, tableau défilant">\n'
    + '      <table class="data-table" id="price-table-data">\n        <caption class="sr-only">Prix GTA 6 modélisé ' + editionLabel + " pour 44 marchés, équivalent USD le moins cher en premier, taux datés du " + RATES_AS_OF + ".</caption>\n"
    + '        <thead><tr><th scope="col">Pays</th><th scope="col">Prix en rayon</th><th scope="col">Taxe</th><th scope="col">Total du reçu</th><th scope="col">USD</th><th scope="col">vs É.-U.</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Les prix catalogue régionaux sont signalés, pas des prix de boutique confirmés. Taux de change de référence datés du ' + RATES_LABEL + ".</p>\n    </section>";
}
function ladderTableHtml(price, ladder) {
  var body = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modélisé</span>';
    return "<tr><th scope=\"row\">" + e.label + badge + "</th>"
      + "<td class=\"mono\">" + formatLocal(e.totalLocal, price.market) + "</td>"
      + "<td class=\"muted\">" + (e.premiumOverStandardLocal > 0 ? formatLocal(e.premiumOverStandardLocal, price.market) : "Base") + "</td>"
      + "<td class=\"muted\">" + (e.gtaDollars > 0 ? e.gtaDollars.toLocaleString("fr-FR") : "0") + "</td>"
      + "<td class=\"muted\">" + (e.localPer100kGta !== null ? formatLocal(e.localPer100kGta, price.market) : "n/d") + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="edition-ladder">\n      <h2 id="edition-ladder">GTA 6 Standard vs Ultimate</h2>\n'
    + '      <p class="section-dek">La question de la mise à niveau, répondue par un taux de valeur et non par une liste de fonctionnalités. Prix en ' + price.market.currency + " pour " + price.market.country + ".</p>\n"
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 Standard contre Ultimate, tableau défilant">\n'
    + '      <table class="data-table" id="edition-ladder-data">\n        <caption class="sr-only">Échelle des éditions GTA 6 tarifée en ' + price.market.currency + " pour " + price.market.country + ", avec supplément par rapport à Standard et coût pour 100 000 GTA$ groupés.</caption>\n"
    + '        <thead><tr><th scope="col">Édition</th><th scope="col">Total local</th><th scope="col">Au-dessus de Standard</th><th scope="col">GTA$ groupés</th><th scope="col">Pour 100 000 GTA$</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Les prix Standard (79,99 $) et Ultimate (99,99 $) sont confirmés. Le montant de GTA$ groupés d\'Ultimate est modélisé, pas confirmé.</p>\n    </section>';
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
  if (outputLabel) outputLabel.textContent = "Prix de GTA 6 en " + price.market.country;

  lastShareText = "Prix de GTA 6 en " + price.market.country + " : " + formatLocal(price.totalLocal, price.market) + " pour " + EDITIONS[state.edition].label + " (" + formatUsd(price.usdEquivalent) + "). 44 marchés comparés sur ToolWools.";
  lastShareTitle = "Prix de GTA 6 en " + price.market.country + " : " + formatLocal(price.totalLocal, price.market) + " (" + EDITIONS[state.edition].label + ")";

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Vérification des prix · En bref";
    if (text) text.textContent = short;
    if (verdictEl) verdictEl.textContent = price.market.country + " · " + formatLocal(price.totalLocal, price.market) + " total du reçu";
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
  var xLink = document.querySelector('.share-panel a[href*="twitter.com"]');
  var rLink = document.querySelector('.share-panel a[href*="reddit.com"]');
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
