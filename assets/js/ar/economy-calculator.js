// economy-calculator.js — GTA 6 Money & Business ROI Calculator page logic.
// Uses the ported economy engine (assets/js/engines/economy-engine.js).
// AUDIT FIX M15: projected payouts round to compact figures in the UI
// (about 2.4M GTA$) and every result carries a "projected, not datamined"
// label, not only the methodology section.
// State lives in the URL (?mode=&method=&goal=&balance=&session=&horizon=)
// so results are shareable.
import { METHODS, BUSINESSES, SHARK_CARDS, findMethod, rateFor, rankedMethods, rankedBusinesses, planGrind, valueTable, money, compactMoney } from "../engines/ar/economy-engine.js";

var DEFAULTS = { mode: "grind", method: "contract-mission", goal: 5000000, balance: 0, session: 2, horizon: 60 };
var MODES = ["grind", "business", "cards"];
var MODE_META = {
  grind: { label: "المال في الساعة", hint: "رتّب الطرق وحدّد وقت هدف الادخار" },
  business: { label: "عائد الاستثمار في الأعمال", hint: "ساعات الاسترداد وأفق الربح" },
  cards: { label: "قيمة بطاقة Shark", hint: "GTA$ لكل دولار مقابل ساعات الطحن" }
};
var PROJ_BADGE = '<span class="proj-badge">تقديري وليس مستخرجًا من البيانات</span>';

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
  if (modeRaw !== null && MODES.indexOf(modeRaw) === -1) bad.push("الوضع");
  if (!findMethod(state.method)) { bad.push("طريقة كسب المال"); state.method = DEFAULTS.method; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "الـ" + parsed.bad.join(" و ") + " غير معروف في الرابط، لذلك أعادت هذه الصفحة التعيين إلى الافتراضيات. اختر طريقتك أدناه.";
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
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>نسخ الحكم</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="شارك الحكم على X" href="' + x + '">مشاركة على X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="شارك الحكم على Reddit" href="' + r + '">Reddit</a>'
    + "</div>";
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

function methodTableHtml(rows, activeId) {
  var body = rows.map(function (r) {
    var hl = r.method.id === activeId ? ' class="hl-row"' : "";
    return "<tr" + hl + "><th scope=\"row\">" + r.method.label + "</th>"
      + "<td class=\"mono\">about " + compactMoney(r.method.payout) + "</td>"
      + "<td class=\"mono\">" + money(r.perHour) + "</td>"
      + "<td class=\"muted\">" + r.method.minutes + " د</td>"
      + "<td class=\"muted\">" + compactMoney(r.method.cost) + "</td>"
      + "<td class=\"mono\">" + money(r.perHourPerPlayer) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="method-table">\n      <h2 id="method-table">كل طرق كسب المال في GTA 6 مرتبة حسب صافي GTA$ في الساعة</h2>\n'
    + '      <p class="section-dek">المعدل الصافي هو العائد مطروحًا منه رسوم الدخول، مقسومًا على زمن الدورة الكاملة. العوائد تقديرية وتُعرض مقربة. وضربات الهاتف العمومي ومبيعات شحنة المستودع من طرق GTA Online، وتُعرض كأقرب نظائر متاحة.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="كل طرق كسب المال في GTA 6 مرتبة حسب صافي GTA$ في الساعة، جدول قابل للتمرير">\n'
    + '      <table class="data-table" id="method-table">\n        <caption class="sr-only">طرق كسب المال التقديرية في GTA 6 مرتبة حسب صافي دولارات GTA في الساعة، مع العائد وزمن الدورة ورسوم الدخول ومعدل اللاعب الواحد.</caption>\n'
    + '        <thead><tr><th scope="col">الطريقة</th><th scope="col">العائد</th><th scope="col">الصافي / ساعة</th><th scope="col">الدورة</th><th scope="col">رسوم الدخول</th><th scope="col">لكل لاعب</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' العوائد تقديرية وليست مستخرجة من البيانات. الصافي في الساعة هو العائد مطروحًا منه رسوم الدخول، مقسومًا على دقائق الدورة الكاملة.</p>\n    </section>';
}
function businessTableHtml(rows, horizon) {
  var body = rows.map(function (r) {
    return "<tr><th scope=\"row\">" + r.business.label + "<span class=\"field-hint\">" + r.business.note + "</span></th>"
      + "<td class=\"muted\">" + compactMoney(r.business.price) + "</td>"
      + "<td class=\"mono\">" + money(r.netPerHour) + "</td>"
      + "<td class=\"mono\">" + r.paybackHours + "س</td>"
      + "<td class=\"mono\">" + compactMoney(r.profitAtHorizon) + "</td>"
      + "<td class=\"muted\">" + r.activeShare + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="business-table">\n      <h2 id="business-table">أي عمل في GTA 6 يسترد تكلفته أولًا</h2>\n'
    + '      <p class="section-dek">ساعات الاسترداد بمعدل كل عمل الصافي، إضافة إلى الربح بعد ' + horizon + ' ساعات لعب بعد سداد سعر الشراء.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="أي عمل في GTA 6 يسترد تكلفته أولًا، جدول قابل للتمرير">\n'
    + '      <table class="data-table" id="business-table">\n        <caption class="sr-only">أسعار شراء الأعمال التقديرية في GTA 6، والإنتاج الصافي في الساعة، وساعات الاسترداد والربح عند الأفق المحدد.</caption>\n'
    + '        <thead><tr><th scope="col">العمل</th><th scope="col">السعر</th><th scope="col">الصافي / ساعة</th><th scope="col">الاسترداد</th><th scope="col">الربح عند ' + horizon + ' ساعة</th><th scope="col">النشط</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' معدلات الأعمال تقديرية وليست مستخرجة من البيانات.</p>\n    </section>';
}
function cardsTableHtml(rows) {
  var body = rows.map(function (r) {
    var best = r.best ? ' class="hl-row"' : "";
    var tag = r.best ? ' <span class="proj-badge">أفضل قيمة</span>' : "";
    return "<tr" + best + "><th scope=\"row\">" + r.card.label + tag + "</th>"
      + "<td class=\"muted\">" + compactMoney(r.card.gtaDollars) + "</td>"
      + "<td class=\"muted\">$" + r.card.usd.toFixed(2) + "</td>"
      + "<td class=\"mono\">" + money(r.perUsd) + "</td>"
      + "<td class=\"mono\">" + r.hoursSaved + "س</td>"
      + "<td class=\"mono\">$" + r.impliedWage.toFixed(2) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="cards-table">\n      <h2 id="cards-table">قيمة بطاقة Shark لكل دولار حقيقي، والساعات التي تستعيدها</h2>\n'
    + '      <p class="section-dek">الحزم الأكبر تشتري دائمًا المزيد من GTA$ لكل دولار. وعمود الأجر الضمني يحوّل ذلك إلى قرار يمكنك اتخاذه فعلًا.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="قيمة بطاقة Shark لكل دولار حقيقي، جدول قابل للتمرير">\n'
    + '      <table class="data-table" id="cards-table">\n        <caption class="sr-only">حزم بطاقات Shark بدولارات GTA لكل دولار أمريكي، وساعات الطحن المستبدَلة، والأجر الضمني في الساعة في العالم الحقيقي.</caption>\n'
    + '        <thead><tr><th scope="col">الحزمة</th><th scope="col">GTA$</th><th scope="col">دولار أمريكي</th><th scope="col">GTA$ / 1$</th><th scope="col">الساعات الموفرة</th><th scope="col">الأجر الضمني</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' أسعار البطاقات تتبع المتجر الأمريكي الحالي. الساعات الموفرة تعتمد على معدل الطحن أعلاه.</p>\n    </section>';
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
  if (sessionLabel) sessionLabel.textContent = "طول الجلسة المعتاد: " + state.session + " ساعة";
  if (horizonInput) horizonInput.value = String(state.horizon);
  if (horizonLabel) horizonLabel.textContent = "أفق اللعب: " + state.horizon + " ساعة";
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
    tldr = "أسرع استرداد: " + top.business.label + " يسترد " + money(top.business.price) + " في نحو " + top.paybackHours + " ساعات لعب، ثم يدرّ " + money(top.netPerHour) + " في الساعة.";
    verdictLine = top.business.label + " · استرداد خلال " + top.paybackHours + " ساعة";
    lastShareText = "أسرع استرداد لعمل في GTA 6: " + top.business.label + " يسترد " + money(top.business.price) + " في نحو " + top.paybackHours + " ساعات، ثم يدرّ " + money(top.netPerHour) + " في الساعة.";
    lastShareTitle = "أسرع استرداد لعمل في GTA 6: " + top.business.label;
    if (outputLabel) outputLabel.textContent = MODE_META.business.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>أسرع استرداد</dt><dd>" + top.business.label + "</dd></div>"
      + "<div><dt>الاسترداد</dt><dd>" + top.paybackHours + "س</dd></div>"
      + "<div><dt>الصافي في الساعة</dt><dd>" + money(top.netPerHour) + "</dd></div>"
      + "<div><dt>الربح عند " + state.horizon + " ساعة</dt><dd>" + compactMoney(top.profitAtHorizon) + "</dd></div>"
      + "<div><dt>الحصة النشطة</dt><dd>" + top.activeShare + "%</dd></div>"
      + "<div><dt>السعر</dt><dd>" + compactMoney(top.business.price) + "</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' معدلات الأعمال تقديرية وليست مستخرجة من البيانات.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = businessTableHtml(bizRanked, state.horizon);
  } else if (state.mode === "cards") {
    var maxPerUsd = Math.max.apply(null, cards.map(function (c) { return c.perUsd; }));
    tldr = "أفضل حزمة قيمة تشتري " + money(maxPerUsd) + " GTA$ لكل دولار حقيقي، أي نحو " + bestCard.hoursSaved + " ساعات طحن تختفي بمعدلك الحالي " + money(rate.perHour) + " في الساعة.";
    verdictLine = bestCard.card.label + " · " + money(maxPerUsd) + " GTA$ لكل 1$";
    lastShareText = "أفضل قيمة لبطاقة Shark: " + money(maxPerUsd) + " GTA$ لكل 1$، أي نحو " + bestCard.hoursSaved + " ساعات طحن تختفي.";
    lastShareTitle = "أفضل قيمة لبطاقة Shark: " + bestCard.card.label;
    if (outputLabel) outputLabel.textContent = MODE_META.cards.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>أفضل حزمة قيمة</dt><dd>" + bestCard.card.label + "</dd></div>"
      + "<div><dt>GTA$ لكل 1 دولار أمريكي</dt><dd>" + money(maxPerUsd) + "</dd></div>"
      + "<div><dt>معدل الطحن لديك</dt><dd>" + money(rate.perHour) + "/hr</dd></div>"
      + "<div><dt>الأجر الضمني</dt><dd>$" + bestCard.impliedWage.toFixed(2) + "/hr</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' أسعار البطاقات تتبع المتجر الأمريكي الحالي. الساعات الموفرة تعتمد على معدل الطحن أعلاه.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = cardsTableHtml(cards);
  } else {
    tldr = method.label + " يدرّ " + money(rate.perHour) + " في الساعة. الوصول إلى " + compactMoney(state.goal) + " من " + compactMoney(state.balance) + " يستغرق " + plan.cycles + " دورات، أي نحو " + plan.hours + " ساعات، أو " + plan.sessionsNeeded + " جلسات من " + state.session + " ساعات.";
    verdictLine = method.label + " · " + money(rate.perHour) + " في الساعة";
    lastShareText = method.label + " يدرّ " + money(rate.perHour) + " في الساعة في GTA 6. " + plan.cycles + " دورات للوصول إلى " + compactMoney(state.goal) + "، أي نحو " + plan.hours + " ساعات. خطة المال في GTA 6 على ToolWools.";
    lastShareTitle = method.label + " يدرّ " + money(rate.perHour) + " في الساعة (GTA 6)";
    if (outputLabel) outputLabel.textContent = MODE_META.grind.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>الصافي في الساعة</dt><dd>" + money(rate.perHour) + "</dd></div>"
      + "<div><dt>لكل دورة</dt><dd>" + money(rate.netPerCycle) + "</dd></div>"
      + "<div><dt>الدورات حتى الهدف</dt><dd>" + plan.cycles + "</dd></div>"
      + "<div><dt>الساعات حتى الهدف</dt><dd>" + plan.hours + "س</dd></div>"
      + "<div><dt>الجلسات</dt><dd>" + plan.sessionsNeeded + " x " + state.session + "س</dd></div>"
      + "<div><dt>لكل لاعب</dt><dd>" + money(rate.perHourPerPlayer) + "/hr</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' العوائد تقديرية وليست مستخرجة من البيانات.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = methodTableHtml(ranked, state.method);
  }

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "خطة المال · ملخّص";
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
  var xLink = document.querySelector('.share-panel a[aria-label="شارك هذه النتيجة على X"]');
  var rLink = document.querySelector('.share-panel a[aria-label="شارك هذه النتيجة على Reddit"]');
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
