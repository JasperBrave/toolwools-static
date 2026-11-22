// price-by-country.js — GTA 6 Price by Country page logic.
// Uses the ported price engine (assets/js/engines/price-engine.js).
// AUDIT FIX M8: the reference exchange-rate date (RATES_AS_OF,
// 2026-11-20) is shown prominently on the page, and regional list prices
// are flagged as reported, not confirmed store prices, wherever they
// appear. Standard ($79.99) and Ultimate ($99.99) US prices are confirmed by Rockstar.
// State lives in the URL (?country=&edition=&tab=) so results are
// shareable. The country defaults to a guess from the browser language
// when no ?country= is given, matching the source route.
import { MARKETS, EDITIONS, RATES_AS_OF, BAND_LABEL, priceFor, allPrices, editionValues, importVerdict, guessMarketCode, marketByCode, formatLocal, formatUsd } from "../engines/ar/price-engine.js";

var DEFAULTS = { country: "US", edition: "standard", tab: "country" };
var EDITION_KEYS = Object.keys(EDITIONS);
var TABS = ["country", "editions", "compare"];
var RATES_LABEL = "20 نوفمبر 2026 (2026-11-20)";

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
  notice.textContent = "البلد غير معروف في الرابط، لذلك أعادت هذه الصفحة التعيين إلى الولايات المتحدة. اختر بلدك أدناه.";
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
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "نسخ";
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
    try { document.execCommand("copy"); done("تم النسخ!"); } catch (e) { done("فشل النسخ"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("تم النسخ!"); }, fallback);
  } else {
    fallback();
  }
}

function shortAnswer(price) {
  var s = "تكلف GTA 6 ما يعادل " + formatUsd(EDITIONS.standard.usd) + " دولار أمريكي للإصدار Standard، و Ultimate 99.99 دولار أمريكي — وكلا السعرين مؤكدان من Rockstar. "
    + "وفي " + price.market.country + " يُقدَّر ذلك بـ " + formatLocal(price.totalLocal, price.market) + " مقابل " + EDITIONS[state.edition].label + "، أي نحو "
    + formatUsd(price.usdEquivalent) + " بعد احتساب " + price.market.taxLabel.toLowerCase() + ". "
    + "وهذا يعني " + BAND_LABEL[price.band].toLowerCase();
  if (price.regionallyPriced) s += "، وهذا السوق مسعّر إقليميًا بدلًا من التحويل.";
  else s += "، محوّلًا بسعر الصرف المرجعي أدناه.";
  return s;
}
function shareRowHtml(text, title) {
  var url = shareUrl();
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>نسخ الحكم</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="شارك الحكم على X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(text) + "&url=" + encodeURIComponent(url) + '">مشاركة على X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="شارك الحكم على Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(title) + "&url=" + encodeURIComponent(url) + '">Reddit</a>'
    + "</div>";
}
function countryTabHtml(price) {
  var vs = (price.vsUsPercent > 0 ? "+" : "") + price.vsUsPercent.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
  var note = price.regionallyPriced
    ? "مسعّر إقليميًا: يحدد هذا المتجر سعرًا محليًا أقل بدلًا من تحويل مبلغ الدولار. أسعار القوائم الإقليمية مُبلَّغ عنها، وليست أسعار متاجر مؤكدة."
    : "محوّل من السعر الأمريكي المؤكد بسعر الصرف المرجعي المؤرخ.";
  if (price.unconfirmed) note += " تسعير " + EDITIONS[state.edition].label + " مُقدَّر، ولم تؤكده Rockstar.";
  var taxHint = price.market.taxIncludedInList ? price.market.taxLabel + " مشمول بالفعل" : "قبل " + price.market.taxLabel;
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">' + BAND_LABEL[price.band] + "</p>"
    + '<h3 class="verdict-title">' + formatLocal(price.totalLocal, price.market) + "</h3>"
    + '<p class="verdict-desc">' + BAND_LABEL[price.band] + " · " + vs + "% مقابل إجمالي الإيصال الأمريكي</p></div></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>سعر الرف</dt><dd>" + formatLocal(price.listLocal, price.market) + "</dd></div>"
    + "<div><dt>" + price.market.taxLabel + "</dt><dd>" + formatLocal(price.taxLocal, price.market) + "</dd></div>"
    + "<div><dt>إجمالي الإيصال</dt><dd>" + formatLocal(price.totalLocal, price.market) + "</dd></div>"
    + "<div><dt>ما يعادل بالدولار</dt><dd>" + formatUsd(price.usdEquivalent) + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + taxHint + ". " + note + "</p>"
    + '<p class="verdict-desc">أسعار الصرف المرجعية مؤرخة في ' + RATES_LABEL + ". وسعرا Standard الأمريكي (79.99 دولار) و Ultimate (99.99 دولار) مؤكدان.</p>";
}
function editionsTabHtml(price, ladder) {
  var items = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">مُقدَّر</span>';
    var line = formatUsd(e.usdEquivalent) + " ما يعادل بالدولار"
      + (e.premiumOverStandardLocal > 0 ? " · " + formatLocal(e.premiumOverStandardLocal, price.market) + " فوق Standard" : " · الأساس")
      + (e.localPer100kGta !== null ? " · " + formatLocal(e.localPer100kGta, price.market) + " لكل 100,000 GTA$" : "");
    return '<li class="rank-item"><div class="rank-head"><h3>' + e.label + badge + "</h3><p>" + formatLocal(e.totalLocal, price.market) + "</p></div>"
      + "<p>" + line + "</p>"
      + "<p>" + e.includes.join(" · ") + "</p></li>";
  }).join("");
  return '<ul class="rank-list" role="list">' + items + "</ul>"
    + '<p class="verdict-desc">وسعرا Standard (79.99 دولار) و Ultimate (99.99 دولار) مؤكدان. ولا توجد نسخة Deluxe. ورقم GTA$ المضمّنة في Ultimate منمذج وليس مؤكدًا. أسعار الصرف المرجعية مؤرخة في ' + RATES_LABEL + ".</p>";
}
function compareTabHtml(price, verdict) {
  return '<p class="verdict-desc">' + verdict.headline + "</p>"
    + '<dl class="stat-grid">'
    + "<div><dt>أرخص سوق</dt><dd>" + verdict.cheapest.market.country + "</dd></div>"
    + "<div><dt>سوقك</dt><dd>" + verdict.home.market.country + "</dd></div>"
    + "<div><dt>الفرق</dt><dd>" + formatUsd(Math.abs(verdict.savingUsd)) + "</dd></div>"
    + "<div><dt>هل يستحق الاستيراد؟</dt><dd>" + (verdict.worthIt ? "على الورق فقط" : "لا") + "</dd></div>"
    + "</dl>"
    + '<p class="verdict-desc">' + verdict.caveat + "</p>";
}
function priceTableHtml(ranked, country, editionLabel) {
  var body = ranked.map(function (p) {
    var hl = p.market.code === country ? ' class="hl-row"' : "";
    var reg = p.regionallyPriced ? ' <span class="flag-badge">إقليمي</span>' : "";
    var vs = (p.vsUsPercent > 0 ? "+" : "") + p.vsUsPercent.toLocaleString("ar-EG-u-nu-latn", { minimumFractionDigits: 0, maximumFractionDigits: 1 });
    return '<tr id="market-' + p.market.code.toLowerCase() + '"' + hl + "><th scope=\"row\">" + p.market.country + reg + "</th>"
      + "<td class=\"muted\">" + formatLocal(p.listLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatLocal(p.taxLocal, p.market) + "</td>"
      + "<td class=\"mono\">" + formatLocal(p.totalLocal, p.market) + "</td>"
      + "<td class=\"muted\">" + formatUsd(p.usdEquivalent) + "</td>"
      + "<td class=\"mono\">" + vs + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="price-table">\n      <h2 id="price-table">سعر GTA 6 في كل بلد: ' + editionLabel + "</h2>\n"
    + '      <p class="section-dek">مرتبة حسب إجمالي الإيصال بما يعادل الدولار، الأرخص أولًا. يشمل إجمالي الإيصال الضريبة؛ ويُظهر عمود الرف السعر المعلن، الذي يستثني الضريبة في الولايات المتحدة وكندا والأرجنتين (تُضاف عند الدفع).</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="سعر GTA 6 في كل بلد، جدول قابل للتمرير">\n'
    + '      <table class="data-table" id="price-table">\n        <caption class="sr-only">سعر GTA 6 المُقدَّر ' + editionLabel + " لـ 44 سوقًا، الأرخص بما يعادل الدولار أولًا، والأسعار مؤرخة في " + RATES_AS_OF + ".</caption>\n"
    + '        <thead><tr><th scope="col">البلد</th><th scope="col">سعر الرف</th><th scope="col">الضريبة</th><th scope="col">إجمالي الإيصال</th><th scope="col">دولار أمريكي</th><th scope="col">مقابل الولايات المتحدة</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">أسعار القوائم الإقليمية مُبلَّغ عنها، وليست أسعار متاجر مؤكدة. أسعار الصرف المرجعية مؤرخة في ' + RATES_LABEL + ".</p>\n    </section>";
}
function ladderTableHtml(price, ladder) {
  var body = ladder.map(function (e) {
    var badge = e.confirmed ? "" : ' <span class="flag-badge">مُقدَّر</span>';
    return "<tr><th scope=\"row\">" + e.label + badge + "</th>"
      + "<td class=\"mono\">" + formatLocal(e.totalLocal, price.market) + "</td>"
      + "<td class=\"muted\">" + (e.premiumOverStandardLocal > 0 ? formatLocal(e.premiumOverStandardLocal, price.market) : "الأساس") + "</td>"
      + "<td class=\"muted\">" + (e.gtaDollars > 0 ? e.gtaDollars.toLocaleString("ar-EG-u-nu-latn") : "0") + "</td>"
      + "<td class=\"muted\">" + (e.localPer100kGta !== null ? formatLocal(e.localPer100kGta, price.market) : "n/a") + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="edition-ladder">\n      <h2 id="edition-ladder">GTA 6 Standard مقابل Ultimate</h2>\n'
    + '      <p class="section-dek">سؤال الترقية، مجاب بمعدل قيمة بدلًا من قائمة مزايا. الأسعار بـ ' + price.market.currency + " لـ " + price.market.country + ".</p>\n"
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="GTA 6 Standard مقابل Ultimate، جدول قابل للتمرير">\n'
    + '      <table class="data-table" id="edition-ladder">\n        <caption class="sr-only">سلّم إصدارات GTA 6 مسعّر بـ ' + price.market.currency + " لـ " + price.market.country + "، مع الفرق عن Standard والتكلفة لكل 100,000 GTA$ مضمّنة.</caption>\n"
    + '        <thead><tr><th scope="col">الإصدار</th><th scope="col">الإجمالي المحلي</th><th scope="col">فوق Standard</th><th scope="col">GTA$ المضمّنة</th><th scope="col">لكل 100 ألف GTA$</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">وسعرا Standard (79.99 دولار) و Ultimate (99.99 دولار) مؤكدان. ولا توجد نسخة Deluxe. ورقم GTA$ المضمّنة في Ultimate منمذج وليس مؤكدًا.</p>\n    </section>';
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
  if (outputLabel) outputLabel.textContent = "سعر GTA 6 في " + price.market.country;

  lastShareText = "سعر GTA 6 في " + price.market.country + ": " + formatLocal(price.totalLocal, price.market) + " مقابل " + EDITIONS[state.edition].label + " (" + formatUsd(price.usdEquivalent) + "). قارنّا 44 سوقًا على ToolWools.";
  lastShareTitle = "سعر GTA 6 في " + price.market.country + ": " + formatLocal(price.totalLocal, price.market) + " (" + EDITIONS[state.edition].label + ")";

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "فحص السعر · ملخّص";
    if (text) text.textContent = short;
    if (verdictEl) verdictEl.textContent = price.market.country + " · " + formatLocal(price.totalLocal, price.market) + " إجمالي الإيصال";
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
  var xLink = document.querySelector('.share-panel a[aria-label="شارك هذه النتيجة على X"]');
  var rLink = document.querySelector('.share-panel a[aria-label="شارك هذه النتيجة على Reddit"]');
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
