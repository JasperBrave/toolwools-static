// system-requirements.js — Comprobador de requisitos del sistema de GTA 6 page logic.
// Uses the shared bottleneck-engine catalog (assets/js/engines/bottleneck-engine.js)
// as the single source of truth for GPU/CPU scores (AUDIT FIX H1: the old
// page carried its own local score tables, which disagreed with this catalog).
// Weights: GPU 55%, CPU 30%, RAM 10%, storage 5%.
// Nivel thresholds re-tuned against the shared scores (AUDIT FIX H1):
// below 35, minimum 35-47, recommended 48-81, ultra 82+. The old 40/60/82
// bands were tuned to the local tables; against the shared catalog the modal
// Steam build (RTX 3060 + Ryzen 5 5600 + 16 GB + SSD, score 51) must land in
// Recomendado, and the GTX 1660 Super floor (score 41) in Minimum.
// State lives in the URL (?gpu=&cpu=&ram=&ssd=) so results are shareable.
import { GPUS, CPUS } from "../engines/es/bottleneck-engine.js";
import { L } from "./l10n.js";

var DEFAULTS = { gpu: "rtx-3060", cpu: "i5-10600k", ram: 16, ssd: 1 };
var RAM_STEPS = [8, 16, 32, 64];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function findPart(list, id) { return list.find(function (p) { return p.id === id; }); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    cpu: q.get("cpu") || DEFAULTS.cpu,
    ram: RAM_STEPS.indexOf(Number(q.get("ram"))) !== -1 ? Number(q.get("ram")) : DEFAULTS.ram,
    ssd: q.get("ssd") === "0" ? 0 : 1,
  };
  var bad = [];
  if (!findPart(GPUS, state.gpu)) { bad.push("GPU"); state.gpu = DEFAULTS.gpu; }
  if (!findPart(CPUS, state.cpu)) { bad.push("CPU"); state.cpu = DEFAULTS.cpu; }
  return { state: state, bad: bad };
}

function computeVerdict(gpuScore, cpuScore, ram, ssd) {
  var ramScore = Math.min(100, (ram / 32) * 100);
  var ssdScore = ssd ? 100 : 40;
  var total = gpuScore * 0.55 + cpuScore * 0.30 + ramScore * 0.10 + ssdScore * 0.05;
  var score = Math.round(total);
  var tier = total < 35 ? "below" : total < 48 ? "min" : total < 82 ? "rec" : "ultra";
  return { tier: tier, score: score, ramScore: ramScore, ssdScore: ssdScore };
}

var TIER_META = {
  below: { label: "Below Mínimo", tone: "upgrade", blurb: "Tu equipo will struggle. Expect sub-30 fps at 1080p Bajo, or the game won't launch cleanly." },
  min: { label: "Meets Mínimo", tone: "borderline", blurb: "Playable at 1080p Bajo around 30 fps. If you have an upgrade planned, do it before launch." },
  rec: { label: "Cumple Recomendado", tone: "ready", blurb: "60 fps cómodos a 1080p Alto o 1440p Medio. El punto ideal para el día del lanzamiento. Recomendado empieza en 48 puntos (Mínimo 35 · Ultra 82)." },
  ultra: { label: "Ultra Ready", tone: "ready", blurb: "4K Alto o 1440p Ultra with room for ray tracing. You'll be one of the screenshots people share." },
};

function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="15" x2="9" y1="9" y2="15"/><line x1="9" x2="15" y1="9" y2="15"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
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
var ramRange = $("[data-ram-range]");
var ramValue = $("[data-ram-value]");
var ssdButtons = $all("[data-ssd-button]");
if (gpuSel) fillSelect(gpuSel, GPUS, state.gpu);
if (cpuSel) fillSelect(cpuSel, CPUS, state.cpu);

function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), ssd: String(state.ssd) });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), ssd: String(state.ssd) });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function render() {
  var gpu = findPart(GPUS, state.gpu);
  var cpu = findPart(CPUS, state.cpu);
  var result = computeVerdict(gpu.score, cpu.score, state.ram, state.ssd);
  var meta = TIER_META[result.tier];

  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  if (ramRange) ramRange.value = String(state.ram);
  if (ramValue) ramValue.textContent = state.ram + " GB";
  ssdButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.ssdButton) === state.ssd)); });

  // TL;DR card.
  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = meta.tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdict = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = result.tier === "ultra"
      ? "Ultra Ready, " + gpu.label + " + " + cpu.label + " with " + state.ram + " GB RAM on " + (state.ssd ? "SSD" : "HDD") + " scores " + result.score + "/100. Clears every tier with headroom."
      : result.tier === "rec"
        ? "Sí, " + gpu.label + " + " + cpu.label + " with " + state.ram + " GB RAM on " + (state.ssd ? "SSD" : "HDD") + " scores " + result.score + "/100 and meets the Nivel recomendado for GTA 6."
        : result.tier === "min"
          ? "Mínimo only, " + gpu.label + " + " + cpu.label + " with " + state.ram + " GB RAM on " + (state.ssd ? "SSD" : "HDD") + " scores " + result.score + "/100. Playable at 1080p Bajo around 30 fps."
          : "Below Mínimo, " + gpu.label + " + " + cpu.label + " with " + state.ram + " GB RAM on " + (state.ssd ? "SSD" : "HDD") + " scores " + result.score + "/100. Expect sub-30 fps at 1080p Low.";
    if (label) label.textContent = meta.label + " · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdict) verdict.textContent = meta.label + " — " + result.score + "/100";
    if (iconSlot) iconSlot.innerHTML = iconFor(meta.tone);
  }

  // Output panel.
  var out = $("[data-output-panel]");
  if (out) {
    var parts = [
      { name: "GPU", score: gpu.score },
      { name: "CPU", score: cpu.score },
      { name: "RAM", score: Math.round(result.ramScore) },
      { name: "Storage", score: result.ssdScore },
    ];
    var weakest = parts.slice().sort(function (a, b) { return a.score - b.score; })[0];
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(meta.tone) +
      '<div><p class="verdict-kicker tone-' + meta.tone + '">' + meta.label + '</p>' +
      '<h3 class="verdict-title">' + result.score + '<span class="unit"> / 100</span></h3>' +
      '<p class="verdict-desc">' + meta.blurb + '</p></div></div>' +
      '<dl class="verdict-stats">' +
      '<div><dt>Nivel de GPU</dt><dd>' + gpu.score + '/100</dd></div>' +
      '<div><dt>Nivel de CPU</dt><dd>' + cpu.score + '/100</dd></div>' +
      '<div><dt>RAM</dt><dd>' + state.ram + ' GB</dd></div>' +
      '</dl>' +
      '<dl class="stat-grid">' +
      '<div><dt>Storage</dt><dd>' + (state.ssd ? "SSD" : "HDD") + '</dd></div>' +
      '<div><dt>Eslabón más débil</dt><dd>' + weakest.name + ' (' + weakest.score + '/100)</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredicto</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " · Veredicto de GTA 6: " + meta.label + " (" + result.score + "/100)") + '&url=' + encodeURIComponent(shareUrl()) + '">Compartir en X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " — " + meta.label + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Puntuación " + result.score + " sobre 100. " + meta.label + ". " + gpu.label + " más " + cpu.label + ", " + state.ram + " GB de RAM, " + (state.ssd ? "SSD" : "HDD") + ".";
  syncUrl();
}

function shareText() {
  var gpu = findPart(GPUS, state.gpu);
  var cpu = findPart(CPUS, state.cpu);
  var result = computeVerdict(gpu.score, cpu.score, state.ram, state.ssd);
  return gpu.label + " + " + cpu.label + " · Veredicto de GTA 6: " + L(TIER_META[result.tier].label) + " (" + result.score + "/100). Comprueba tu PC: " + shareUrl();
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
if (ramRange) ramRange.addEventListener("input", function () { state.ram = Number(ramRange.value); render(); });
ssdButtons.forEach(function (b) { b.addEventListener("click", function () { state.ssd = Number(b.dataset.ssdButton); render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
