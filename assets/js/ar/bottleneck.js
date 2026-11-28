// bottleneck.js — GTA 6 Bottleneck Calculator page logic.
// Uses the ported engine (assets/js/engines/bottleneck-engine.js) with the
// same defaults as the source route (src/routes/tools.bottleneck-calculator.tsx):
// RTX 4070 + Ryzen 5 5600X at 1440p, GTA Online. Compare rig defaults to
// RTX 4080 + Ryzen 7 7700X. State lives in the URL (?gpu=&cpu=&res=&mode=,
// plus &compare=1&gpu2=&cpu2=) so results are shareable and reload-safe.
import { GPUS, CPUS, WORKLOAD_META, computeBalance, suggestUpgrade, verdictLabelOf } from "../engines/ar/bottleneck-engine.js";

var DEFAULTS = { gpu: "rtx-4070", cpu: "r5-5600x", res: "1440p", mode: "online", gpu2: "rtx-4080", cpu2: "r7-7700x" };
var RES_LIST = ["1080p", "1440p", "4K"];
var MODE_LIST = ["story", "online", "stream"];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function findPart(list, id) { return list.find(function (p) { return p.id === id; }); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    cpu: q.get("cpu") || DEFAULTS.cpu,
    res: RES_LIST.indexOf(q.get("res")) !== -1 ? q.get("res") : DEFAULTS.res,
    mode: MODE_LIST.indexOf(q.get("mode")) !== -1 ? q.get("mode") : DEFAULTS.mode,
    compare: q.get("compare") === "1" || q.get("compare") === "true",
    gpu2: q.get("gpu2") || DEFAULTS.gpu2,
    cpu2: q.get("cpu2") || DEFAULTS.cpu2,
  };
  // Invalid input state: unknown part ids in the link fall back to defaults
  // and the page says so, instead of silently computing the wrong rig.
  var bad = [];
  if (!findPart(GPUS, state.gpu)) { bad.push("GPU"); state.gpu = DEFAULTS.gpu; }
  if (!findPart(CPUS, state.cpu)) { bad.push("CPU"); state.cpu = DEFAULTS.cpu; }
  if (!findPart(GPUS, state.gpu2)) { bad.push("وحدة معالجة الرسومات للمقارنة"); state.gpu2 = DEFAULTS.gpu2; }
  if (!findPart(CPUS, state.cpu2)) { bad.push("وحدة المعالجة المركزية للمقارنة"); state.cpu2 = DEFAULTS.cpu2; }
  return { state: state, bad: bad };
}

function readinessOf(result) {
  if (result.absPct >= 15 || result.avgFps < 45) return "upgrade";
  if (result.absPct >= 8) return "borderline";
  return "ready";
}
function tldrOf(result, gpu, cpu, res, mode) {
  var v = verdictLabelOf(result);
  if (readinessOf(result) === "ready")
    return "نعم، " + gpu.label + " + " + cpu.label + " جاهز لـ GTA 6 عند " + res + " في " + WORKLOAD_META[mode].label + ". " + v + "، بهدف ~" + result.avgFps + " إطار/ث في المتوسط.";
  if (readinessOf(result) === "borderline")
    return "على الحد، " + gpu.label + " + " + cpu.label + " سيعمل مع GTA 6 عند " + res + " في " + WORKLOAD_META[mode].label + " مع اختناق " + (result.verdict === "cpu" ? "CPU" : result.verdict === "gpu" ? "GPU" : "") + " بنسبة %" + result.absPct + " (~" + result.avgFps + " إطار/ث). قابل للعب، لكنك ستفقد بعض الإطارات.";
  if (result.verdict === "balanced")
    return "يُوصى بالترقية، " + gpu.label + " + " + cpu.label + " متوازن لكنه بطيء عند " + res + " في " + WORKLOAD_META[mode].label + " (~" + result.avgFps + " إطار/ث). يحتاج كلا المكوّنين إلى مزيد من القوة للوصول إلى معدلات إطارات سلسة.";
  return "يُوصى بالترقية، " + gpu.label + " + " + cpu.label + " يُظهر اختناقًا بنسبة %" + result.absPct + " " + (result.verdict === "cpu" ? "CPU" : "GPU") + " عند " + res + " في " + WORKLOAD_META[mode].label + " (~" + result.avgFps + " إطار/ث). أحد المكوّنين يُبطئ الآخر.";
}
function toneOf(result) {
  if (result.verdict === "balanced") return result.avgFps < 45 ? "upgrade" : "ready";
  return result.absPct >= 15 ? "upgrade" : "borderline";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "غير معروف " + parsed.bad.join(" و ") + " في الرابط، لذلك أعادت هذه الصفحة التعيين إلى العتاد الافتراضي. اختر قطعك أدناه.";
  notice.classList.add("show");
}

function fillSelect(select, parts, value) {
  parts.forEach(function (p) {
    var opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label;
    select.appendChild(opt);
  });
  select.value = value;
}
var gpuSel = $("[data-gpu-select]");
var cpuSel = $("[data-cpu-select]");
var gpu2Sel = $("[data-gpu2-select]");
var cpu2Sel = $("[data-cpu2-select]");
if (gpuSel) fillSelect(gpuSel, GPUS, state.gpu);
if (cpuSel) fillSelect(cpuSel, CPUS, state.cpu);
if (gpu2Sel) fillSelect(gpu2Sel, GPUS, state.gpu2);
if (cpu2Sel) fillSelect(cpu2Sel, CPUS, state.cpu2);

var resButtons = $all("[data-res-button]");
var modeButtons = $all("[data-mode-button]");
var compareToggle = $("[data-compare-toggle]");
var compareSection = $("[data-compare-section]");
var compareInputs = $("[data-compare-inputs]");

function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, res: state.res, mode: state.mode });
  if (state.compare) { p.set("compare", "1"); p.set("gpu2", state.gpu2); p.set("cpu2", state.cpu2); }
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, res: state.res, mode: state.mode });
  if (state.compare) { p.set("compare", "1"); p.set("gpu2", state.gpu2); p.set("cpu2", state.cpu2); }
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function render() {
  var gpu = findPart(GPUS, state.gpu);
  var cpu = findPart(CPUS, state.cpu);
  var result = computeBalance(gpu, cpu, state.res, state.mode);
  var verdictLabel = verdictLabelOf(result);
  var tone = toneOf(result);
  var readiness = readinessOf(result);

  // Controls reflect state.
  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  resButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.resButton === state.res)); });
  modeButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modeButton === state.mode)); });
  if (compareToggle) compareToggle.setAttribute("aria-pressed", String(state.compare));
  if (compareToggle) compareToggle.querySelector("[data-compare-label]").textContent = state.compare ? "المقارنة مفعّلة" : "قارن حاسوبا ثانيا";
  if (compareSection) compareSection.hidden = !state.compare;
  if (compareInputs) compareInputs.hidden = !state.compare;

  // TL;DR card.
  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = readiness;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdict = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    if (label) label.textContent = readiness === "ready" ? "جاهز · ملخّص" : readiness === "borderline" ? "حدّي · ملخّص" : "يوصى بالترقية · باختصار";
    if (text) text.textContent = tldrOf(result, gpu, cpu, state.res, state.mode);
    if (verdict) verdict.textContent = verdictLabel;
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  // Output panel.
  var out = $("[data-output-panel]");
  if (out) {
    var upgrade = !state.compare ? suggestUpgrade(gpu, cpu, state.res, state.mode) : null;
    var upgradeHtml = upgrade
      ? '<div class="upgrade-box"><p class="eyebrow-muted">أصغر إصلاح</p><p>استبدل ' + (upgrade.kind === "cpu" ? "CPU" : "GPU") + ' بـ <strong>' + upgrade.part.label + '</strong>، فهذا يخفض الاختناق من <span class="mono">%' + upgrade.fromPct + '</span> إلى <span class="mono">%' + upgrade.toPct + '</span>.</p></div>'
      : "";
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div>' +
      '<h3 class="verdict-title">' + verdictLabel + '</h3>' +
      '<p class="verdict-desc">تقديريًا <strong>' + result.fpsLow + '–' + result.fpsHigh + ' إطار/ث</strong> عند ' + state.res + ' في ' + WORKLOAD_META[state.mode].label + '. يفترض نطاق الإطارات الإعداد المرتفع دون تتبع الأشعة.</p></div></div>' +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">هامش وحدة معالجة الرسومات</span><span class="val">' + result.headGpu.toFixed(2) + '×</span></div><div class="balance-bar-track"><div class="balance-bar-fill fill-gpu" style="width:' + Math.min(100, Math.round(result.headGpu * 100)) + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">هامش وحدة المعالجة المركزية</span><span class="val">' + result.headCpu.toFixed(2) + '×</span></div><div class="balance-bar-track"><div class="balance-bar-fill fill-cpu" style="width:' + Math.min(100, Math.round(result.headCpu * 100)) + '%"></div></div></div>' +
      '</div>' + '<div class="balance-legend" aria-hidden="true"><span><span class="swatch gpu"></span>هامش وحدة معالجة الرسومات</span><span><span class="swatch cpu"></span>هامش وحدة المعالجة المركزية</span></div>' + upgradeHtml +
      '<dl class="verdict-stats">' +
      '<div><dt>مستوى GPU</dt><dd>' + gpu.score + '/100</dd></div>' +
      '<div><dt>مستوى CPU</dt><dd>' + cpu.score + '/100</dd></div>' +
      '<div><dt>الفرق</dt><dd>' + (result.verdict === "balanced" ? "±7%" : result.absPct + "%") + '</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span data-copy-verdict-label>نسخ الحكم</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="شارك الحكم على X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " @ " + state.res + " · " + verdictLabel + " — حاسبة اختناق GTA 6 من ToolWools") + '&url=' + encodeURIComponent(shareUrl()) + '">مشاركة على X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="شارك الحكم على Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " — " + verdictLabel + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Compare section.
  if (state.compare && compareSection) {
    var gpuB = findPart(GPUS, state.gpu2);
    var cpuB = findPart(CPUS, state.cpu2);
    var resultB = computeBalance(gpuB, cpuB, state.res, state.mode);
    var diff = resultB.avgFps - result.avgFps;
    var winner = Math.abs(diff) <= 3 ? "Tie" : diff > 0 ? "B" : "A";
    var cardA = $("[data-compare-card-a]", compareSection);
    var cardB = $("[data-compare-card-b]", compareSection);
    if (cardA) {
      cardA.classList.toggle("winner", winner === "A");
      $("[data-compare-title]", cardA).textContent = "الجهاز A: " + gpu.label + " + " + cpu.label;
      $("[data-compare-verdict]", cardA).textContent = verdictLabelOf(result);
      $("[data-compare-fps]", cardA).innerHTML = "~" + result.fpsLow + "–" + result.fpsHigh + " إطار/ث · متوسط <strong>" + result.avgFps + "</strong>";
      $("[data-compare-pill]", cardA).hidden = winner !== "A";
    }
    if (cardB) {
      cardB.classList.toggle("winner", winner === "B");
      $("[data-compare-title]", cardB).textContent = "الجهاز B: " + gpuB.label + " + " + cpuB.label;
      $("[data-compare-verdict]", cardB).textContent = verdictLabelOf(resultB);
      $("[data-compare-fps]", cardB).innerHTML = "~" + resultB.fpsLow + "–" + resultB.fpsHigh + " إطار/ث · متوسط <strong>" + resultB.avgFps + "</strong>";
      $("[data-compare-pill]", cardB).hidden = winner !== "B";
    }
    var summary = $("[data-compare-summary]", compareSection);
    if (summary) {
      var winText = winner === "Tie" ? "تعادل ضمن 3 إطارات/ث" : (winner === "A" ? "الجهاز A" : "الجهاز B") + " يفوز بفارق " + Math.abs(diff) + " إطار/ث";
      summary.innerHTML = "<strong>" + winText + "</strong>، بمتوسط " + state.res + " في " + WORKLOAD_META[state.mode].label + ". الجهاز A فيه " + (result.verdict === "balanced" ? "توازن" : "اختناق " + result.verdict.toUpperCase() + " بنسبة %" + result.absPct) + "؛ والجهاز B فيه " + (resultB.verdict === "balanced" ? "توازن" : "اختناق " + resultB.verdict.toUpperCase() + " بنسبة %" + resultB.absPct) + ".";
    }
  }

  // Share panel permalink.
  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  // Screen-reader announcement (same strings as the source live region).
  var live = $("[data-live-region]");
  if (live) {
    live.textContent = state.compare
      ? verdictLabel + ". الجهاز A: " + result.avgFps + " إطار/ث في المتوسط (" + state.res + "، " + WORKLOAD_META[state.mode].label + "). الجهاز B: " + verdictLabelOf(computeBalance(findPart(GPUS, state.gpu2), findPart(CPUS, state.cpu2), state.res, state.mode)) + "، " + computeBalance(findPart(GPUS, state.gpu2), findPart(CPUS, state.cpu2), state.res, state.mode).avgFps + " إطار/ث في المتوسط."
      : verdictLabel + ". تقديريًا من " + result.fpsLow + " إلى " + result.fpsHigh + " إطارًا في الثانية عند " + state.res + " في " + WORKLOAD_META[state.mode].label + ".";
  }
  syncUrl();
}

function shareText() {
  var gpu = findPart(GPUS, state.gpu);
  var cpu = findPart(CPUS, state.cpu);
  var result = computeBalance(gpu, cpu, state.res, state.mode);
  if (state.compare) {
    var gpuB = findPart(GPUS, state.gpu2);
    var cpuB = findPart(CPUS, state.cpu2);
    var resultB = computeBalance(gpuB, cpuB, state.res, state.mode);
    var diff = resultB.avgFps - result.avgFps;
    var winner = Math.abs(diff) <= 3 ? "تعادل" : diff > 0 ? "الجهاز B" : "الجهاز A";
    return gpu.label + "/" + cpu.label + " مقابل " + gpuB.label + "/" + cpuB.label + " @ " + state.res + ". مقارنة GTA 6: " + shareUrl() + " (" + winner + ")";
  }
  return gpu.label + " + " + cpu.label + " @ " + state.res + " · " + WORKLOAD_META[state.mode].label + " ← " + verdictLabelOf(result) + ". فحص اختناق GTA 6: " + shareUrl();
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

// Events.
if (gpuSel) gpuSel.addEventListener("change", function () { state.gpu = gpuSel.value; render(); });
if (cpuSel) cpuSel.addEventListener("change", function () { state.cpu = cpuSel.value; render(); });
if (gpu2Sel) gpu2Sel.addEventListener("change", function () { state.gpu2 = gpu2Sel.value; render(); });
if (cpu2Sel) cpu2Sel.addEventListener("change", function () { state.cpu2 = cpu2Sel.value; render(); });
resButtons.forEach(function (b) { b.addEventListener("click", function () { state.res = b.dataset.resButton; render(); }); });
modeButtons.forEach(function (b) { b.addEventListener("click", function () { state.mode = b.dataset.modeButton; render(); }); });
if (compareToggle) compareToggle.addEventListener("click", function () { state.compare = !state.compare; render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
