// economy-calculator.js — GTA 6 Money & Business ROI Calculator page logic.
// Uses the ported economy engine (assets/js/engines/economy-engine.js).
// AUDIT FIX M15: projected payouts round to compact figures in the UI
// (about 2.4M GTA$) and every result carries a "projected, not datamined"
// label, not only the methodology section.
// State lives in the URL (?mode=&method=&goal=&balance=&session=&horizon=)
// so results are shareable.
import { METHODS, BUSINESSES, SHARK_CARDS, findMethod, rateFor, rankedMethods, rankedBusinesses, planGrind, valueTable, money, compactMoney } from "../engines/tr/economy-engine.js";

var DEFAULTS = { mode: "grind", method: "contract-mission", goal: 5000000, balance: 0, session: 2, horizon: 60 };
var MODES = ["grind", "business", "cards"];
var MODE_META = {
  grind: { label: "Saatteki kazanç", hint: "Yöntemleri sıralayın ve birikim hedefinizi zamanlayın" },
  business: { label: "İşletme ROI", hint: "Geri ödeme saatleri ve kâr ufku" },
  cards: { label: "Shark Card değeri", hint: "Dolar başına GTA$ ve grind saatleriyle karşılaştırma" }
};
var PROJ_BADGE = '<span class="proj-badge">Tahmini, veri madenciliği değil</span>';

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var modeRaw = q.get("mode");
  var state = {
    mode: MODES.indexOf(modeRaw) !== -1 ? modeRaw : DEFAULTS.mode,
    method: q.get("method") || DEFAULTS.method,
    goal: numOr(q.get("goal"), DEFAULTS.goal),
    balance: numOr(q.get("balance"), DEFAULTS.balance),
    session: numOr(q.get("session"), DEFAULTS.session),
    horizon: numOr(q.get("horizon"), DEFAULTS.horizon)
  };
  function numOr(raw, fallback) {
    if (raw === null || raw === "") return fallback;
    var n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  state.goal = Math.max(0, state.goal);
  state.balance = Math.max(0, state.balance);
  if (state.session < 0.5 || state.session > 6) state.session = DEFAULTS.session;
  if (state.horizon < 10 || state.horizon > 300) state.horizon = DEFAULTS.horizon;
  var bad = [];
  if (modeRaw !== null && MODES.indexOf(modeRaw) === -1) bad.push("mod");
  if (!findMethod(state.method)) { bad.push("para yöntemi"); state.method = DEFAULTS.method; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Bağlantıdaki bilinmeyen " + parsed.bad.join(" ve ") + ", bu sayfa varsayılanlara sıfırlandı. Yönteminizi aşağıdan seçin.";
  notice.classList.add("show");
}

var modeButtons = $all("[data-mode-button]");
var methodSel = $("[data-method-select]");
var methodNote = $("[data-method-note]");
var goalInput = $("[data-goal-input]");
var balanceInput = $("[data-balance-input]");
var sessionInput = $("[data-session-input]");
var sessionLabel = $("[data-session-label]");
var horizonInput = $("[data-horizon-input]");
var horizonLabel = $("[data-horizon-label]");
var modeHint = $("[data-mode-hint]");
var grindRateEl = $("[data-grind-rate]");
var fieldWraps = $all("[data-field]");

function shareUrl() {
  var p = new URLSearchParams({ mode: state.mode, method: state.method, goal: String(state.goal), balance: String(state.balance), session: String(state.session), horizon: String(state.horizon) });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ mode: state.mode, method: state.method, goal: String(state.goal), balance: String(state.balance), session: String(state.session), horizon: String(state.horizon) });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function shareLinks(text, title) {
  var url = shareUrl();
  var x = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url);
  var r = "https://www.reddit.com/submit?title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url);
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı X\'te paylaş" href="' + x + '">X\'te paylaş</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı Reddit\'te paylaş" href="' + r + '">Reddit</a>'
    + "</div>";
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

function methodTableHtml(rows, activeId) {
  var body = rows.map(function (r) {
    var hl = r.method.id === activeId ? ' class="hl-row"' : "";
    return "<tr" + hl + "><th scope=\"row\">" + r.method.label + "</th>"
      + "<td class=\"mono\">about " + compactMoney(r.method.payout) + "</td>"
      + "<td class=\"mono\">" + money(r.perHour) + "</td>"
      + "<td class=\"muted\">" + r.method.minutes + " dk</td>"
      + "<td class=\"muted\">" + compactMoney(r.method.cost) + "</td>"
      + "<td class=\"mono\">" + money(r.perHourPerPlayer) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="method-table">\n      <h2 id="method-table">Her GTA 6 para yöntemi, saat başına net GTA$\'a göre sıralı</h2>\n'
    + '      <p class="section-dek">Net oran, ödemeden giriş ücreti çıkarılarak tam döngü süresine bölünmesiyle bulunur. Ödemeler tahmini olup yuvarlanmış gösterilir. Ankesörlü telefon vuruşları ve depo kargo satışları GTA Online yöntemleridir ve mevcut en yakın benzerler olarak gösterilir.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Her GTA 6 para yöntemi, saat başına net GTA$\'a göre sıralı, kaydırılabilir tablo">\n'
    + '      <table class="data-table" id="method-table">\n        <caption class="sr-only">Tahmini GTA 6 para yöntemleri, saat başına net GTA dolarına göre sıralı; ödeme, döngü süresi, giriş ücreti ve oyuncu başına oran dahil.</caption>\n'
    + '        <thead><tr><th scope="col">Yöntem</th><th scope="col">Ödeme</th><th scope="col">Net / sa</th><th scope="col">Döngü</th><th scope="col">Giriş ücreti</th><th scope="col">Oyuncu başına</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Ödemeler tahmini olup veri madenciliğiyle elde edilmemiştir. Saat başına net, ödemeden giriş ücreti çıkarılarak tam döngünün aldığı dakikalara bölünmesiyle bulunur.</p>\n    </section>';
}
function businessTableHtml(rows, horizon) {
  var body = rows.map(function (r) {
    return "<tr><th scope=\"row\">" + r.business.label + "<span class=\"field-hint\">" + r.business.note + "</span></th>"
      + "<td class=\"muted\">" + compactMoney(r.business.price) + "</td>"
      + "<td class=\"mono\">" + money(r.netPerHour) + "</td>"
      + "<td class=\"mono\">" + r.paybackHours + "sa</td>"
      + "<td class=\"mono\">" + compactMoney(r.profitAtHorizon) + "</td>"
      + "<td class=\"muted\">" + r.activeShare + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="business-table">\n      <h2 id="business-table">Hangi GTA 6 işletmesi kendini önce amorti eder</h2>\n'
    + '      <p class="section-dek">Her işletmenin kendi net oranına göre geri ödeme saatleri, satın alma bedeli ödendikten sonra ' + horizon + ' saatlik oyunun ardından gelen kâr dahil.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Hangi GTA 6 işletmesi kendini önce amorti eder, kaydırılabilir tablo">\n'
    + '      <table class="data-table" id="business-table">\n        <caption class="sr-only">Tahmini GTA 6 işletme satın alma fiyatları, saat başına net üretim, geri ödeme saatleri ve seçilen ufuktaki kâr.</caption>\n'
    + '        <thead><tr><th scope="col">İşletme</th><th scope="col">Fiyat</th><th scope="col">Net / sa</th><th scope="col">Geri ödeme</th><th scope="col">' + horizon + ' saatte kâr</th><th scope="col">Aktif</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' İşletme oranları tahmini olup veri madenciliğiyle elde edilmemiştir.</p>\n    </section>';
}
function cardsTableHtml(rows) {
  var body = rows.map(function (r) {
    var best = r.best ? ' class="hl-row"' : "";
    var tag = r.best ? ' <span class="proj-badge">En iyi değer</span>' : "";
    return "<tr" + best + "><th scope=\"row\">" + r.card.label + tag + "</th>"
      + "<td class=\"muted\">" + compactMoney(r.card.gtaDollars) + "</td>"
      + "<td class=\"muted\">$" + r.card.usd.toFixed(2) + "</td>"
      + "<td class=\"mono\">" + money(r.perUsd) + "</td>"
      + "<td class=\"mono\">" + r.hoursSaved + "sa</td>"
      + "<td class=\"mono\">$" + r.impliedWage.toFixed(2) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="cards-table">\n      <h2 id="cards-table">Gerçek dolar başına Shark Card değeri ve geri kazandırdığı saatler</h2>\n'
    + '      <p class="section-dek">Büyük paketler dolar başına her zaman daha fazla GTA$ alır. Tahmini ücret sütunu bunu gerçekten verebileceğiniz bir karara dönüştürür.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Gerçek dolar başına Shark Card değeri, kaydırılabilir tablo">\n'
    + '      <table class="data-table" id="cards-table">\n        <caption class="sr-only">ABD doları başına GTA doları, yerini aldığı grind saatleri ve tahmini gerçek dünya saatlik ücretiyle Shark Card paketleri.</caption>\n'
    + '        <thead><tr><th scope="col">Paket</th><th scope="col">GTA$</th><th scope="col">ABD$</th><th scope="col">GTA$ / 1$</th><th scope="col">Kazanılan saat</th><th scope="col">Tahmini ücret</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Kart fiyatları güncel ABD mağazasını takip eder. Kazanılan saatler yukarıdaki grind oranınıza bağlıdır.</p>\n    </section>';
}

var lastShareText = "";
var lastShareTitle = "";

function render() {
  var method = findMethod(state.method) || METHODS[5];
  var rate = rateFor(method);
  var plan = planGrind(method, state.goal, state.balance, state.session);
  var ranked = rankedMethods();
  var bizRanked = rankedBusinesses(state.horizon);
  var cards = valueTable(rate.perHour);
  var bestCard = null;
  cards.forEach(function (c) { if (c.best) bestCard = c; });

  modeButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modeButton === state.mode)); });
  if (modeHint) modeHint.textContent = MODE_META[state.mode].hint;
  if (methodSel) methodSel.value = state.method;
  if (methodNote) methodNote.textContent = method.note;
  if (goalInput && document.activeElement !== goalInput) goalInput.value = String(state.goal);
  if (balanceInput && document.activeElement !== balanceInput) balanceInput.value = String(state.balance);
  if (sessionInput) sessionInput.value = String(state.session);
  if (sessionLabel) sessionLabel.textContent = "Tipik oturum süresi: " + state.session + " sa";
  if (horizonInput) horizonInput.value = String(state.horizon);
  if (horizonLabel) horizonLabel.textContent = "Oyun ufku: " + state.horizon + " saat";
  if (grindRateEl) grindRateEl.textContent = money(rate.perHour);
  fieldWraps.forEach(function (w) {
    var f = w.dataset.field;
    var show = (f === "grind" && state.mode === "grind")
      || (f === "business" && state.mode === "business")
      || (f === "cards" && state.mode === "cards")
      || (f === "method" && state.mode !== "business");
    w.hidden = !show;
  });

  var tldr = "";
  var verdictLine = "";
  var outHtml = "";
  var tableHtml = "";
  var outputLabel = $(".output-panel-label");
  if (state.mode === "business") {
    var top = bizRanked[0];
    tldr = "En hızlı geri ödeme: " + top.business.label + ", " + money(top.business.price) + " tutarını yaklaşık " + top.paybackHours + " saatlik oyunda geri öder, sonra saatte " + money(top.netPerHour) + " net kazandırır.";
    verdictLine = top.business.label + " · " + top.paybackHours + " sa geri ödeme";
    lastShareText = "En hızlı GTA 6 işletme geri ödemesi: " + top.business.label + ", " + money(top.business.price) + " tutarını yaklaşık " + top.paybackHours + " saatte geri öder, sonra saatte " + money(top.netPerHour) + " net kazandırır.";
    lastShareTitle = "En hızlı GTA 6 işletme geri ödemesi: " + top.business.label;
    if (outputLabel) outputLabel.textContent = MODE_META.business.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>En hızlı geri ödeme</dt><dd>" + top.business.label + "</dd></div>"
      + "<div><dt>Geri ödeme</dt><dd>" + top.paybackHours + "sa</dd></div>"
      + "<div><dt>Saatte net</dt><dd>" + money(top.netPerHour) + "</dd></div>"
      + "<div><dt>" + state.horizon + " saatte kâr</dt><dd>" + compactMoney(top.profitAtHorizon) + "</dd></div>"
      + "<div><dt>Aktif pay</dt><dd>" + top.activeShare + "%</dd></div>"
      + "<div><dt>Fiyat</dt><dd>" + compactMoney(top.business.price) + "</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' İşletme oranları tahmini olup veri madenciliğiyle elde edilmemiştir.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = businessTableHtml(bizRanked, state.horizon);
  } else if (state.mode === "cards") {
    var maxPerUsd = Math.max.apply(null, cards.map(function (c) { return c.perUsd; }));
    tldr = "En iyi değer paketi, gerçek dolar başına " + money(maxPerUsd) + " GTA$ alır; mevcut " + money(rate.perHour) + "/saat oranınızda yaklaşık " + bestCard.hoursSaved + " saatlik grind ortadan kalkar.";
    verdictLine = bestCard.card.label + " · 1$ başına " + money(maxPerUsd) + " GTA$";
    lastShareText = "En iyi Shark Card değeri: 1$ başına " + money(maxPerUsd) + " GTA$, yaklaşık " + bestCard.hoursSaved + " saatlik grind ortadan kalkar.";
    lastShareTitle = "En iyi Shark Card değeri: " + bestCard.card.label;
    if (outputLabel) outputLabel.textContent = MODE_META.cards.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>En iyi değer paketi</dt><dd>" + bestCard.card.label + "</dd></div>"
      + "<div><dt>1 ABD$ başına GTA$</dt><dd>" + money(maxPerUsd) + "</dd></div>"
      + "<div><dt>Grind oranınız</dt><dd>" + money(rate.perHour) + "/hr</dd></div>"
      + "<div><dt>Tahmini ücret</dt><dd>$" + bestCard.impliedWage.toFixed(2) + "/hr</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Kart fiyatları güncel ABD mağazasını takip eder. Kazanılan saatler yukarıdaki grind oranınıza bağlıdır.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = cardsTableHtml(cards);
  } else {
    tldr = method.label + ", saatte " + money(rate.perHour) + " net kazandırır. " + compactMoney(state.balance) + " bakiyeden " + compactMoney(state.goal) + " hedefine ulaşmak " + plan.cycles + " döngü, yaklaşık " + plan.hours + " saat veya " + plan.sessionsNeeded + " oturum (" + state.session + " sa) sürer.";
    verdictLine = method.label + " · saatte " + money(rate.perHour);
    lastShareText = method.label + ", GTA 6'da saatte " + money(rate.perHour) + " net kazandırır. " + compactMoney(state.goal) + " hedefine " + plan.cycles + " döngü, yaklaşık " + plan.hours + " saat. ToolWools'ta GTA 6 para planı.";
    lastShareTitle = method.label + " saatte " + money(rate.perHour) + " net kazandırır (GTA 6)";
    if (outputLabel) outputLabel.textContent = MODE_META.grind.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Saatte net</dt><dd>" + money(rate.perHour) + "</dd></div>"
      + "<div><dt>Döngü başına</dt><dd>" + money(rate.netPerCycle) + "</dd></div>"
      + "<div><dt>Hedefe kalan döngü</dt><dd>" + plan.cycles + "</dd></div>"
      + "<div><dt>Hedefe kalan saat</dt><dd>" + plan.hours + "sa</dd></div>"
      + "<div><dt>Oturumlar</dt><dd>" + plan.sessionsNeeded + " x " + state.session + "sa</dd></div>"
      + "<div><dt>Oyuncu başına</dt><dd>" + money(rate.perHourPerPlayer) + "/hr</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Ödemeler tahmini olup veri madenciliğiyle elde edilmemiştir.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = methodTableHtml(ranked, state.method);
  }

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Para planı · Özet";
    if (text) text.textContent = tldr;
    if (verdictEl) verdictEl.textContent = verdictLine;
  }
  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML = outHtml;
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(lastShareText + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }
  var slot = $("[data-table-slot]");
  if (slot) slot.innerHTML = tableHtml;

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = document.querySelector('.share-panel a[aria-label="Bu sonucu X\'te paylaş"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Bu sonucu Reddit\'te paylaş"]');
  if (xLink) xLink.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(lastShareText) + "&url=" + encodeURIComponent(shareUrl());
  if (rLink) rLink.href = "https://www.reddit.com/submit?title=" + encodeURIComponent(lastShareTitle) + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = tldr;
  syncUrl();
}

modeButtons.forEach(function (b) { b.addEventListener("click", function () { state.mode = b.dataset.modeButton; render(); }); });
if (methodSel) methodSel.addEventListener("change", function () { state.method = methodSel.value; render(); });
if (goalInput) goalInput.addEventListener("change", function () { var n = Number(goalInput.value); state.goal = Number.isFinite(n) ? Math.max(0, n) : DEFAULTS.goal; render(); });
if (balanceInput) balanceInput.addEventListener("change", function () { var n = Number(balanceInput.value); state.balance = Number.isFinite(n) ? Math.max(0, n) : DEFAULTS.balance; render(); });
if (sessionInput) sessionInput.addEventListener("input", function () { state.session = Number(sessionInput.value); render(); });
if (horizonInput) horizonInput.addEventListener("input", function () { state.horizon = Number(horizonInput.value); render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
