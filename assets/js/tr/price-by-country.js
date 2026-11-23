// price-by-country.js — GTA 6 Price by Country page logic.
// Uses the ported price engine (assets/js/engines/price-engine.js).
// AUDIT FIX M8: the reference exchange-rate date (RATES_AS_OF,
// 2026-11-20) is shown prominently on the page, and regional list prices
// are flagged as reported, not confirmed store prices, wherever they
// appear. Standard ($79.99) and Ultimate ($99.99) US prices are confirmed by Rockstar.
// State lives in the URL (?country=&edition=&tab=) so results are
// shareable. The country defaults to a guess from the browser language
// when no ?country= is given, matching the source route.
import { MARKETS, EDITIONS, RATES_AS_OF, BAND_LABEL, priceFor, allPrices, editionValues, importVerdict, guessMarketCode, marketByCode, formatLocal, formatUsd } from "../engines/tr/price-engine.js";

var DEFAULTS = { country: "US", edition: "standard", tab: "country" };
var EDITION_KEYS = Object.keys(EDITIONS);
var TABS = ["country", "editions", "compare"];
var RATES_LABEL = "20 Kasım 2026 (2026-11-20)";

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
  notice.textContent = "Bağlantıdaki bilinmeyen ülke, bu sayfa ABD\'ye sıfırlandı. Ülkenizi aşağıdan seçin.";
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

function shortAnswer(price) {
  var s = "GTA 6, Standard sürümü için " + formatUsd(EDITIONS.standard.usd) + " USD; Ultimate 99,99 $ — ikisi de Rockstar tarafından doğrulandı. "
    + price.market.country + " için bu, " + EDITIONS[state.edition].label + " sürümünde " + formatLocal(price.totalLocal, price.market) + " olarak modelleniyor, yani yaklaşık "
    + formatUsd(price.usdEquivalent) + " (" + price.market.taxLabel.toLowerCase() + " dahil). "
    + "Bu, " + BAND_LABEL[price.band].toLowerCase();
  if (price.regionallyPriced) s += ", ve bu pazar dönüştürme yerine bölgesel fiyatlı.";
  else s += ", aşağıdaki referans kurdan dönüştürülmüştür.";
  return s;
}
function shareRowHtml(text, title) {
  var url = shareUrl();
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı X\'te paylaş" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + "&url=" + encodeURIComponent(url) + '">X\'te paylaş</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı Reddit\'te paylaş" href="https://www.reddit.com/submit?title=' + encodeURIComponent(title) + "&url=" + encodeURIComponent(url) + '">Reddit</a>'
    + "</div>";
}
function countryTabHtml(price) {
  var vs = (price.vsUsPercent > 0 ? "+" : "") + price.vsUsPercent.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  var note = price.regionallyPriced
    ? "Bölgesel fiyatlı: bu mağaza, USD tutarını dönüştürmek yerine daha düşük bir yerel fiyat belirler. Bölgesel liste fiyatları bildirilen fiyatlardır, doğrulanmış mağaza fiyatları değil."
    : "Doğrulanmış ABD fiyatından, tarihli referans kur üzerinden dönüştürülmüştür.";
  if (price.unconfirmed) note += " " + EDITIONS[state.edition].label + " fiyatlandırması modellenmiştir, Rockstar tarafından doğrulanmamıştır.";
  var taxHint = price.market.taxIncludedInList ? price.market.taxLabel + " zaten dahil" : price.market.taxLabel + " öncesi";
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">' + BAND_LABEL[price.band] + "</p>"
    + '<h3 class="verdict-title">' + formatLocal(price.totalLocal, price.market) + "</h3>"
    + '<p class="verdict-desc">' + BAND_LABEL[price.band] + " · ABD fiş toplamına göre %" + vs + "</p></div></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Raf fiyatı</dt><dd>" + formatLocal(price.listLocal, price.market) + "</dd></div>"
    + "<div><dt>" + price.market.taxLabel + "</dt><dd>" + formatLocal(price.taxLocal, price.market) + "</dd></div>"
    + "<div><dt>Fiş toplamı</dt><dd>" + formatLocal(price.totalLocal, price.market) + "</dd></div>"
    + "<div><dt>USD karşılığı</dt><dd>" + formatUsd(price.usdEquivalent) + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + taxHint + ". " + note + "</p>"
    + '<p class="verdict-desc">Referans döviz kurları ' + RATES_LABEL + " tarihli. ABD Standard (79,99 $) ve Ultimate (99,99 $) fiyatları doğrulandı.</p>";
}
function editionsTabHtml(price, ladder) {
  var items = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modellendi</span>';
    var line = formatUsd(e.usdEquivalent) + " USD karşılığı"
      + (e.premiumOverStandardLocal > 0 ? " · " + formatLocal(e.premiumOverStandardLocal, price.market) + " Standard'ın üzerinde" : " · temel")
      + (e.localPer100kGta !== null ? " · 100.000 GTA$ başına " + formatLocal(e.localPer100kGta, price.market) : "");
    return '<li class="rank-item"><div class="rank-head"><h3>' + e.label + badge + "</h3><p>" + formatLocal(e.totalLocal, price.market) + "</p></div>"
      + "<p>" + line + "</p>"
      + "<p>" + e.includes.join(" · ") + "</p></li>";
  }).join("");
  return '<ul class="rank-list" role="list">' + items + "</ul>"
    + '<p class="verdict-desc">Standart (79,99 $) ve Ultimate (99,99 $) fiyatları doğrulandı. Deluxe sürümü yoktur. Ultimate\'ın paketlenmiş GTA$ rakamı modellenmiştir, doğrulanmış değildir. Referans döviz kurları ' + RATES_LABEL + " tarihli.</p>";
}
function compareTabHtml(price, verdict) {
  return '<p class="verdict-desc">' + verdict.headline + "</p>"
    + '<dl class="stat-grid">'
    + "<div><dt>En ucuz pazar</dt><dd>" + verdict.cheapest.market.country + "</dd></div>"
    + "<div><dt>Pazarınız</dt><dd>" + verdict.home.market.country + "</dd></div>"
    + "<div><dt>Fark</dt><dd>" + formatUsd(Math.abs(verdict.savingUsd)) + "</dd></div>"
    + "<div><dt>İthal etmeye değer mi?</dt><dd>" + (verdict.worthIt ? "Yalnızca kâğıt üzerinde" : "Hayır") + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + verdict.caveat + "</p>";
}
function priceTableHtml(ranked, country, editionLabel) {
  var body = ranked.map(function (p) {
    var hl = p.market.code === country ? ' class="hl-row"' : "";
    var reg = p.regionallyPriced ? ' <span class="flag-badge">Bölgesel</span>' : "";
    var vs = (p.vsUsPercent > 0 ? "+" : "") + p.vsUsPercent.toLocaleString("tr-TR", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return '<tr id="market-' + p.market.code.toLowerCase() + '"' + hl + "><th scope=\"row\">" + p.market.country + reg + "</th>"
      + "<td class=\"muted\">" + formatLocal(p.listLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatLocal(p.taxLocal, p.market) + "</td>"
      + "<td class=\"mono\">" + formatLocal(p.totalLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatUsd(p.usdEquivalent) + "</td>"
      + "<td class=\"mono\">" + vs + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="price-table">\n      <h2 id="price-table">Her ülkede GTA 6 fiyatı: ' + editionLabel + "</h2>\n"
    + '      <p class="section-dek">USD karşılığı fiş toplamına göre sıralı, en ucuz önce. Fiş toplamı vergiyi içerir; raf sütunu, ABD, Kanada ve Arjantin\'de vergiyi hariç tutan liste fiyatını gösterir (kasada eklenir).</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Her ülkede GTA 6 fiyatı, kaydırılabilir tablo">\n'
    + '      <table class="data-table" id="price-table-data">\n        <caption class="sr-only">Modellenmiş GTA 6 ' + editionLabel + " fiyatı, 44 pazar için, en ucuz USD karşılığı önce, kurlar " + RATES_AS_OF + " tarihli.</caption>\n"
    + '        <thead><tr><th scope="col">Ülke</th><th scope="col">Raf fiyatı</th><th scope="col">Vergi</th><th scope="col">Fiş toplamı</th><th scope="col">USD</th><th scope="col">ABD\'ye göre</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Bölgesel liste fiyatları bildirilen fiyatlardır, doğrulanmış mağaza fiyatları değil. Referans döviz kurları ' + RATES_LABEL + " tarihli.</p>\n    </section>";
}
function ladderTableHtml(price, ladder) {
  var body = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">Modellendi</span>';
    return "<tr><th scope=\"row\">" + e.label + badge + "</th>"
      + "<td class=\"mono\">" + formatLocal(e.totalLocal, price.market) + "</td>"
      + "<td class=\"muted\">" + (e.premiumOverStandardLocal > 0 ? formatLocal(e.premiumOverStandardLocal, price.market) : "Temel") + "</td>"
      + "<td class=\"muted\">" + (e.gtaDollars > 0 ? e.gtaDollars.toLocaleString("tr-TR") : "0") + "</td>"
      + "<td class=\"muted\">" + (e.localPer100kGta !== null ? formatLocal(e.localPer100kGta, price.market) : "n/a") + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="edition-ladder">\n      <h2 id="edition-ladder">GTA 6 Standard ve Ultimate karşılaştırması</h2>\n'
    + '      <p class="section-dek">Yükseltme sorusu, özellik listesi yerine bir değer oranıyla yanıtlandı. Fiyatlar ' + price.market.country + " için " + price.market.currency + " cinsinden.</p>\n"
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 Standard ve Ultimate karşılaştırması, kaydırılabilir tablo">\n'
    + '      <table class="data-table" id="edition-ladder-data">\n        <caption class="sr-only">GTA 6 sürüm basamakları ' + price.market.country + " için " + price.market.currency + " cinsinden fiyatlandırıldı; Standard\'a göre fark ve pakete dahil 100.000 GTA$ başına maliyet dahil.</caption>\n"
    + '        <thead><tr><th scope="col">Sürüm</th><th scope="col">Yerel toplam</th><th scope="col">Standard\'a göre fark</th><th scope="col">Pakete dahil GTA$</th><th scope="col">100 bin GTA$ başına</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">Standart (79,99 $) ve Ultimate (99,99 $) fiyatları doğrulandı. Deluxe sürümü yoktur. Ultimate\'ın paketlenmiş GTA$ rakamı modellenmiştir, doğrulanmış değildir.</p>\n    </section>';
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
  if (outputLabel) outputLabel.textContent = price.market.country + " için GTA 6 fiyatı";

  lastShareText = price.market.country + " için GTA 6 fiyatı: " + formatLocal(price.totalLocal, price.market) + " (" + EDITIONS[state.edition].label + ", " + formatUsd(price.usdEquivalent) + "). ToolWools'ta 44 pazar karşılaştırıldı.";
  lastShareTitle = price.market.country + " için GTA 6 fiyatı: " + formatLocal(price.totalLocal, price.market) + " (" + EDITIONS[state.edition].label + ")";

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Fiyat kontrolü · Özet";
    if (text) text.textContent = short;
    if (verdictEl) verdictEl.textContent = price.market.country + " · " + formatLocal(price.totalLocal, price.market) + " fiş toplamı";
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
  var xLink = document.querySelector('.share-panel a[aria-label="Bu sonucu X\'te paylaş"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Bu sonucu Reddit\'te paylaş"]');
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
