// hardware-comparison.js, GTA 6 Hardware Comparison page logic.
// Uses the ported bottleneck engine (assets/js/engines/bottleneck-engine.js),
// the shared 34-GPU / 21-CPU catalog (AUDIT FIX H4: sorted by score, the
// "15900K" typo fixed, RTX 5060 / 5060 Ti, RX 9070 / 9070 XT and Intel Arc
// B580 included). The source route had no interactive workspace (tables +
// a ComingSoon roadmap); this page ships the comparison the roadmap
// described: two rigs, same resolution and workload, diffed live.
// Defaults mirror the bottleneck calculator's compare defaults (Rig A
// RTX 4070 + Ryzen 5 5600X, Rig B RTX 4080 + Ryzen 7 7700X, 1440p, Online).
// State lives in the URL (?gpu=&cpu=&gpu2=&cpu2=&res=&mode=) so results
// are shareable.
import { GPUS, CPUS, WORKLOAD_META, computeBalance, suggestUpgrade, verdictLabelOf as verdictLabelOfEn } from "../engines/fr/bottleneck-engine.js";

var MODE_LABEL = { story: "Mode Histoire", online: "GTA Online", stream: "Streaming + enregistrement" };
function modeLabel(m) { return MODE_LABEL[m] || WORKLOAD_META[m].label; }
function verdictLabelOf(r) { var s = verdictLabelOfEn(r); if (s === "Balanced build") return "Configuration équilibrée"; if (s.indexOf("CPU bottleneck ") === 0) return "Goulot CPU " + s.slice(15) + " %"; if (s.indexOf("GPU bottleneck ") === 0) return "Goulot GPU " + s.slice(15) + " %"; return s; }

var DEFAULTS = { gpu: "rtx-4070", cpu: "r5-5600x", gpu2: "rtx-4080", cpu2: "r7-7700x", res: "1440p", mode: "online" };
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
    gpu2: q.get("gpu2") || DEFAULTS.gpu2,
    cpu2: q.get("cpu2") || DEFAULTS.cpu2,
    res: RES_LIST.indexOf(q.get("res")) !== -1 ? q.get("res") : DEFAULTS.res,
    mode: MODE_LIST.indexOf(q.get("mode")) !== -1 ? q.get("mode") : DEFAULTS.mode,
  };
  var bad = [];
  if (!findPart(GPUS, state.gpu)) { bad.push("GPU du PC A"); state.gpu = DEFAULTS.gpu; }
  if (!findPart(CPUS, state.cpu)) { bad.push("CPU du PC A"); state.cpu = DEFAULTS.cpu; }
  if (!findPart(GPUS, state.gpu2)) { bad.push("GPU du PC B"); state.gpu2 = DEFAULTS.gpu2; }
  if (!findPart(CPUS, state.cpu2)) { bad.push("CPU du PC B"); state.cpu2 = DEFAULTS.cpu2; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Inconnu " + parsed.bad.join(" et ") + " dans le lien, donc cette page est revenue aux configurations par défaut. Choisissez vos composants ci-dessous.";
  notice.classList.add("show");
}

function fillSelect(select, parts, value) {
  parts.forEach(function (p) {
    var opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label + " (" + p.score + "/100)";
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

function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, gpu2: state.gpu2, cpu2: state.cpu2, res: state.res, mode: state.mode });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, gpu2: state.gpu2, cpu2: state.cpu2, res: state.res, mode: state.mode });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function toneOf(result) {
  if (result.verdict === "balanced") return "ready";
  return result.absPct >= 15 ? "upgrade" : "borderline";
}
function shareText(a, b, ra, rb) {
  return a.label + " + " + b.label + " @ " + state.res + " " + modeLabel(state.mode) + " · " + verdictLabelOf(ra) + " (" + ra.fpsLow + "–" + ra.fpsHigh + " FPS) vs " + verdictLabelOf(rb) + " (" + rb.fpsLow + "–" + rb.fpsHigh + " FPS). Comparaison matérielle GTA 6 : " + shareUrl();
}

function render() {
  var gpuA = findPart(GPUS, state.gpu);
  var cpuA = findPart(CPUS, state.cpu);
  var gpuB = findPart(GPUS, state.gpu2);
  var cpuB = findPart(CPUS, state.cpu2);
  var ra = computeBalance(gpuA, cpuA, state.res, state.mode);
  var rb = computeBalance(gpuB, cpuB, state.res, state.mode);
  var tone = toneOf(ra);
  var labelA = verdictLabelOf(ra);
  var labelB = verdictLabelOf(rb);
  var workload = modeLabel(state.mode);

  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  if (gpu2Sel) gpu2Sel.value = state.gpu2;
  if (cpu2Sel) cpu2Sel.value = state.cpu2;
  resButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.resButton === state.res)); });
  modeButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modeButton === state.mode)); });

  var upgrade = suggestUpgrade(gpuA, cpuA, state.res, state.mode);
  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = ra.verdict === "balanced"
      ? "Oui, " + gpuA.label + " + " + cpuA.label + " est équilibré à " + state.res + " en " + workload + ", environ " + ra.avgFps + " FPS en moyenne (" + ra.fpsLow + "–" + ra.fpsHigh + " FPS)."
      : gpuA.label + " + " + cpuA.label + " montre un goulot d'étranglement de " + ra.absPct + " % " + (ra.verdict === "cpu" ? "CPU" : "GPU") + " à " + state.res + " en " + workload + ", environ " + ra.avgFps + " FPS en moyenne." + (upgrade ? " La plus petite correction est " + upgrade.part.label + ", qui réduit le goulot à " + upgrade.toPct + " %." : "");
    if (label) label.textContent = labelA + " · En bref";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = labelA + ", " + ra.avgFps + " FPS en moyenne";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var upgradeHtml = upgrade
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Plus petite mise à niveau</p><ul><li><strong>' + upgrade.part.label + '</strong>, goulot ' + (upgrade.kind === "cpu" ? "CPU" : "GPU") + ' de ' + upgrade.fromPct + ' % à ' + upgrade.toPct + ' % à ' + state.res + ' en ' + workload + '.</li></ul></div>'
      : '<div class="upgrade-box"><p class="eyebrow-muted">Plus petite mise à niveau</p><ul><li>Aucune mise à niveau nécessaire, ce PC est équilibré à ' + state.res + ' en ' + workload + '.</li></ul></div>';
    var gap = rb.avgFps - ra.avgFps;
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + labelA + '</p>' +
      '<h3 class="verdict-title">' + ra.avgFps + '<span class="unit"> FPS moyens</span></h3>' +
      '<p class="verdict-desc">' + ra.fpsLow + '–' + ra.fpsHigh + ' FPS à ' + state.res + ' en ' + workload + '. ' + gpuA.label + ' + ' + cpuA.label + '.</p></div></div>' +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Marge GPU</span><span class="val">' + Math.round(ra.headGpu * 100) + '%</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + Math.min(100, Math.round(ra.headGpu * 100)) + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">Marge CPU</span><span class="val">' + Math.round(ra.headCpu * 100) + '%</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + Math.min(100, Math.round(ra.headCpu * 100)) + '%"></div></div></div>' +
      '</div>' + upgradeHtml +
      '<dl class="stat-grid">' +
      '<div><dt>PC A FPS moyens</dt><dd>' + ra.avgFps + '</dd></div>' +
      '<div><dt>PC B FPS moyens</dt><dd>' + rb.avgFps + '</dd></div>' +
      '<div><dt>Écart FPS</dt><dd>' + (gap >= 0 ? "+" : "") + gap + ' (' + (gap >= 0 ? "PC B" : "PC A") + ')</dd></div>' +
      '<div><dt>Goulot du PC B</dt><dd>' + rb.absPct + '% ' + (rb.verdict === "balanced" ? "équilibré" : rb.verdict === "cpu" ? "CPU" : "GPU") + '</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpuA.label + " + " + cpuA.label + " @ " + state.res + " " + workload + " · " + labelA + " (" + ra.fpsLow + "–" + ra.fpsHigh + " FPS)") + '&url=' + encodeURIComponent(shareUrl()) + '">Partager sur X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpuA.label + " + " + cpuA.label + " vs " + gpuB.label + " + " + cpuB.label + ", comparaison matérielle GTA 6") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(gpuA, cpuA, ra, rb), copyBtn, "[data-copy-verdict-label]"); });
  }

  var cardA = $("[data-compare-card-a]");
  var cardB = $("[data-compare-card-b]");
  var winner = rb.avgFps > ra.avgFps ? "b" : ra.avgFps > rb.avgFps ? "a" : null;
  if (cardA) {
    cardA.classList.toggle("winner", winner === "a");
    var t = $("[data-compare-title]", cardA);
    var v = $("[data-compare-verdict]", cardA);
    var f = $("[data-compare-fps]", cardA);
    var p = $("[data-compare-pill]", cardA);
    if (t) t.textContent = "PC A";
    if (v) v.textContent = gpuA.label + " + " + cpuA.label + ", " + labelA;
    if (f) f.textContent = ra.fpsLow + "–" + ra.fpsHigh + " FPS, " + ra.avgFps + " en moyenne à " + state.res + " en " + workload;
    if (p) p.hidden = winner !== "a";
  }
  if (cardB) {
    cardB.classList.toggle("winner", winner === "b");
    var t2 = $("[data-compare-title]", cardB);
    var v2 = $("[data-compare-verdict]", cardB);
    var f2 = $("[data-compare-fps]", cardB);
    var p2 = $("[data-compare-pill]", cardB);
    if (t2) t2.textContent = "PC B";
    if (v2) v2.textContent = gpuB.label + " + " + cpuB.label + ", " + labelB;
    if (f2) f2.textContent = rb.fpsLow + "–" + rb.fpsHigh + " FPS, " + rb.avgFps + " en moyenne à " + state.res + " en " + workload;
    if (p2) p2.hidden = winner !== "b";
  }
  var summary = $("[data-compare-summary]");
  if (summary) {
    var gapAbs = Math.abs(rb.avgFps - ra.avgFps);
    summary.textContent = winner === null
      ? "Les deux PC atteignent " + ra.avgFps + " FPS en moyenne à " + state.res + " en " + workload + ", égalité parfaite."
      : "Le PC " + winner.toUpperCase() + " mène de " + gapAbs + " FPS en moyenne (" + Math.max(ra.avgFps, rb.avgFps) + " vs " + Math.min(ra.avgFps, rb.avgFps) + ") et a moins de goulot (" + (winner === "b" ? rb.absPct : ra.absPct) + " % contre " + (winner === "b" ? ra.absPct : rb.absPct) + " %)." + (upgrade && winner === "b" ? " La plus petite correction pour le PC A est " + upgrade.part.label + "." : "");
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = labelA + ". Estimé de " + ra.fpsLow + " à " + ra.fpsHigh + " images par seconde à " + state.res + " en " + workload + ". PC B : " + labelB + ", " + rb.avgFps + " FPS en moyenne.";
  syncUrl();
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

if (gpuSel) gpuSel.addEventListener("change", function () { state.gpu = gpuSel.value; render(); });
if (cpuSel) cpuSel.addEventListener("change", function () { state.cpu = cpuSel.value; render(); });
if (gpu2Sel) gpu2Sel.addEventListener("change", function () { state.gpu2 = gpu2Sel.value; render(); });
if (cpu2Sel) cpu2Sel.addEventListener("change", function () { state.cpu2 = cpu2Sel.value; render(); });
resButtons.forEach(function (b) { b.addEventListener("click", function () { state.res = b.dataset.resButton; render(); }); });
modeButtons.forEach(function (b) { b.addEventListener("click", function () { state.mode = b.dataset.modeButton; render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
