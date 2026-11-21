// readiness-score.js — Puntuación de preparación de GTA 6 page logic.
// Uses the ported readiness engine (assets/js/engines/readiness-engine.js).
// AUDIT FIX H2 (pass 2A): the install-size reference is 212 GB (was 150 GB); full
// network marks at 111 Mbps now mean about 4.2 h for a 212 GB install.
// AUDIT FIX M15: projected figures are shown rounded, and the
// "projected, not datamined" label sits next to the results.
// State lives in the URL (?gpu=&cpu=&ram=&storage=&drive=&mbps=).
import { estimateReadiness, DRIVE_META } from "../engines/es/readiness-engine.js";
import { GPUS, CPUS } from "../engines/es/fps-engine.js";
import { L } from "./l10n.js";

var DEFAULTS = { gpu: "rtx-3060", cpu: "r5-5600x", ram: 16, storage: 500, drive: "ssd", mbps: 150 };
var RAM_LIST = [8, 16, 32, 64];
var DRIVE_LIST = ["nvme", "ssd", "hdd"];
var WEAKEST_LINK = {
  performance: { label: "Open calculadora de FPS", href: "/tools/fps-calculator" },
  vram: { label: "Open calculadora de VRAM", href: "/tools/vram-calculator" },
  storage: { label: "Open planificador de almacenamiento", href: "/tools/storage-planner" },
  network: { label: "Abrir la calculadora de tiempo de descarga", href: "/tools/download-time" },
};
var SUB_LABEL = { performance: "Rendimiento", vram: "VRAM", storage: "Storage", network: "Network" };

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function findPart(list, id) { return list.find(function (p) { return p.id === id; }); }

function clampNum(v, min, max, fallback) {
  if (v === null || v === undefined || v === "") return fallback;
  var n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function readState() {
  var q = new URLSearchParams(window.location.search);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    cpu: q.get("cpu") || DEFAULTS.cpu,
    ram: RAM_LIST.indexOf(Number(q.get("ram"))) !== -1 ? Number(q.get("ram")) : DEFAULTS.ram,
    storage: clampNum(q.get("storage"), 0, 20000, DEFAULTS.storage),
    drive: DRIVE_LIST.indexOf(q.get("drive")) !== -1 ? q.get("drive") : DEFAULTS.drive,
    mbps: clampNum(q.get("mbps"), 0, 10000, DEFAULTS.mbps),
  };
  var bad = [];
  if (!findPart(GPUS, state.gpu)) { bad.push("GPU"); state.gpu = DEFAULTS.gpu; }
  if (!findPart(CPUS, state.cpu)) { bad.push("CPU"); state.cpu = DEFAULTS.cpu; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Desconocido " + parsed.bad.join(" y ") + " en el enlace, así que esta página se restableció al equipo predeterminado. Elige tus piezas abajo.";
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
var ramButtons = $all("[data-ram-button]");
var storageInput = $("[data-storage-input]");
var driveButtons = $all("[data-drive-button]");
var mbpsInput = $("[data-mbps-input]");
if (gpuSel) fillSelect(gpuSel, GPUS, state.gpu);
if (cpuSel) fillSelect(cpuSel, CPUS, state.cpu);
if (storageInput) storageInput.value = String(state.storage);
if (mbpsInput) mbpsInput.value = String(state.mbps);

function inputFor() {
  return {
    gpu: findPart(GPUS, state.gpu),
    cpu: findPart(CPUS, state.cpu),
    ram: state.ram,
    freeStorageGB: Math.max(0, state.storage),
    driveType: state.drive,
    internetMbps: Math.max(0, state.mbps),
  };
}
function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), storage: String(state.storage), drive: state.drive, mbps: String(state.mbps) });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), storage: String(state.storage), drive: state.drive, mbps: String(state.mbps) });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function toneOf(grade) {
  return grade === "S" || grade === "A" ? "ready" : grade === "B" || grade === "C" ? "borderline" : "upgrade";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function dialColor(tone) {
  return tone === "ready" ? "var(--accent-blue)" : tone === "borderline" ? "var(--amber)" : "var(--accent-pink)";
}

function render() {
  var input = inputFor();
  var result = estimateReadiness(input);
  var tone = toneOf(result.grade);
  var gpu = input.gpu;
  var cpu = input.cpu;

  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  if (storageInput && document.activeElement !== storageInput) storageInput.value = String(state.storage);
  if (mbpsInput && document.activeElement !== mbpsInput) mbpsInput.value = String(state.mbps);
  ramButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.ramButton) === state.ram)); });
  driveButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.driveButton === state.drive)); });

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = gpu.label + " + " + cpu.label + " con " + state.ram + " GB de RAM, " + state.storage + " GB free on " + L(DRIVE_META[state.drive].label) + " y " + state.mbps + " Mbps down scores " + result.score + "/100 (grade " + result.grade + "). " + result.verdict + " Weakest link: " + SUB_LABEL[result.weakest] + ".";
    if (label) label.textContent = "Grade " + result.grade + " · " + result.gradeLabel;
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = "Grade " + result.grade + " — " + result.score + "/100";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var sub = function (key, weight, cls) {
      var s = result[key];
      var rounded = Math.round(s.score);
      var pct = Math.max(0, Math.min(100, rounded));
      return '<div><div class="balance-bar-head"><span class="lbl">' + SUB_LABEL[key] + ' · ' + weight + '</span><span class="val">' + rounded + '/100</span></div><div class="balance-bar-track"><div class="balance-bar-fill ' + cls + '" style="width:' + pct + '%"></div></div><p class="field-hint">' + s.detail + '</p></div>';
    };
    var circ = 2 * Math.PI * 52;
    var dash = (result.score / 100) * circ;
    var weakest = WEAKEST_LINK[result.weakest];
    var fixBox = result.score >= 100
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Arregla esto primero</p><p>No weak link. Every sub-score is at full marks.</p></div>'
      : '<div class="upgrade-box"><p class="eyebrow-muted">Arregla esto primero</p><p>Tu subpuntuación más débil es <strong>' + SUB_LABEL[result.weakest] + '</strong> (' + Math.round(result[result.weakest].score) + '/100). Profundiza con la calculadora dedicada.</p><p><a href="' + weakest.href + '">' + weakest.label + ' →</a></p></div>';
    out.innerHTML =
      '<div style="text-align:center">' +
      '<div class="score-dial" role="img" aria-label="Puntuación de preparación ' + result.score + ' de 100, grade ' + result.grade + '">' +
      '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" stroke-width="9"/><circle cx="60" cy="60" r="52" fill="none" stroke="' + dialColor(tone) + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '"/></svg>' +
      '<div class="score-dial-center"><div><div class="big">' + result.score + '</div><div class="small">/ 100 · Grade ' + result.grade + '</div></div></div>' +
      '</div>' +
      '<p class="verdict-kicker tone-' + tone + '" style="margin-top:0.75rem">Grade ' + result.grade + ' · ' + result.gradeLabel + '</p>' +
      '<p class="verdict-desc" style="max-width:24rem;margin-inline:auto">' + result.verdict + '</p>' +
      '<p class="field-hint">Proyectado, no extraído de datos: las cuatro subpuntuaciones son estimaciones del modelo, no datos medidos del lanzamiento.</p>' +
      '</div>' +
      '<div class="balance-bars">' +
      sub("performance", "55%", "blue") +
      sub("vram", "20%", "pink") +
      sub("storage", "15%", "purple") +
      sub("network", "10%", "cyan") +
      '</div>' + fixBox +
      '<dl class="stat-grid">' +
      '<div><dt>Rendimiento</dt><dd>' + Math.round(result.performance.score) + '/100</dd></div>' +
      '<div><dt>VRAM</dt><dd>' + Math.round(result.vram.score) + '/100</dd></div>' +
      '<div><dt>Storage</dt><dd>' + Math.round(result.storage.score) + '/100</dd></div>' +
      '<div><dt>Network</dt><dd>' + Math.round(result.network.score) + '/100</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredicto</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " · GTA 6 readiness " + result.score + "/100, grade " + result.grade) + '&url=' + encodeURIComponent(shareUrl()) + '">Compartir en X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " — GTA 6 readiness " + result.score + "/100 (grade " + result.grade + ")") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Grade ladder highlights the live grade.
  var ladderRows = $all("[data-grade-row]");
  ladderRows.forEach(function (row) {
    var active = row.dataset.gradeRow === result.grade;
    row.classList.toggle("hl-row", active);
    var mark = row.querySelector("[data-grade-you]");
    if (mark) mark.hidden = !active;
  });

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Puntuación de preparación " + result.score + " de 100, grade " + result.grade + ". " + result.gradeLabel + ". Weakest link: " + SUB_LABEL[result.weakest] + ".";
  syncUrl();
}

function shareText() {
  var input = inputFor();
  var result = estimateReadiness(input);
  return input.gpu.label + " + " + input.cpu.label + " · GTA 6 readiness " + result.score + "/100, grade " + result.grade + ". Check your rig: " + shareUrl();
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
    try { document.execCommand("copy"); done("¡Copiado!"); } catch (e) { done("No se pudo copiar"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("¡Copiado!"); }, fallback);
  } else {
    fallback();
  }
}

if (gpuSel) gpuSel.addEventListener("change", function () { state.gpu = gpuSel.value; render(); });
if (cpuSel) cpuSel.addEventListener("change", function () { state.cpu = cpuSel.value; render(); });
ramButtons.forEach(function (b) { b.addEventListener("click", function () { state.ram = Number(b.dataset.ramButton); render(); }); });
driveButtons.forEach(function (b) { b.addEventListener("click", function () { state.drive = b.dataset.driveButton; render(); }); });
if (storageInput) storageInput.addEventListener("change", function () { state.storage = clampNum(storageInput.value, 0, 20000, DEFAULTS.storage); render(); });
if (mbpsInput) mbpsInput.addEventListener("change", function () { state.mbps = clampNum(mbpsInput.value, 0, 10000, DEFAULTS.mbps); render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
