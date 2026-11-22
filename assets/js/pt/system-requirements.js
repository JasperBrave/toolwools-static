// system-requirements.js — Verificador de requisitos do sistema do GTA 6 page logic.
// Uses the shared bottleneck-engine catalog (assets/js/engines/bottleneck-engine.js)
// as the single source of truth for GPU/CPU scores (AUDIT FIX H1: the old
// page carried its own local score tables, which disagreed with this catalog).
// Weights: GPU 55%, CPU 30%, RAM 10%, storage 5%.
// Nível thresholds re-tuned against the shared scores (AUDIT FIX H1):
// below 35, minimum 35-47, recommended 48-81, ultra 82+. The old 40/60/82
// bands were tuned to the local tables; against the shared catalog the modal
// Steam build (RTX 3060 + Ryzen 5 5600 + 16 GB + SSD, score 51) must land in
// Recomendado, and the GTX 1660 Super floor (score 41) in Minimum.
// State lives in the URL (?gpu=&cpu=&ram=&ssd=) so results are shareable.
import { GPUS, CPUS } from "../engines/pt/bottleneck-engine.js";
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
  below: { label: "Abaixo do mínimo", tone: "upgrade", blurb: "Sua máquina terá dificuldades. Espere menos de 30 fps em 1080p no Baixo, ou o jogo não vai iniciar direito." },
  min: { label: "Atende o mínimo", tone: "borderline", blurb: "Jogável em 1080p no Baixo a cerca de 30 fps. Se você tem um upgrade planejado, faça-o antes do lançamento." },
  rec: { label: "Atende o Recomendado", tone: "ready", blurb: "60 fps confortáveis em 1080p Alto ou 1440p Médio. O ponto ideal para jogar com fluidez. Recomendado começa em 48 pontos (Mínimo 35 · Ultra 82)." },
  ultra: { label: "Pronto para Ultra", tone: "ready", blurb: "4K no Alto ou 1440p no Ultra com folga para ray tracing. Você vai ser um dos prints que o pessoal compartilha." },
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
  notice.textContent = "Desconhecido " + parsed.bad.join(" e ") + " no link, então esta página foi redefinida para o PC padrão. Escolha suas peças abaixo.";
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
      ? "Pronto para Ultra, " + gpu.label + " + " + cpu.label + " com " + state.ram + " GB de RAM em " + (state.ssd ? "SSD" : "HDD") + " obtém " + result.score + "/100. Supera todos os níveis com folga."
      : result.tier === "rec"
        ? "Sim, " + gpu.label + " + " + cpu.label + " com " + state.ram + " GB de RAM em " + (state.ssd ? "SSD" : "HDD") + " obtém " + result.score + "/100 e atende o nível recomendado para GTA 6."
        : result.tier === "min"
          ? "Somente o mínimo, " + gpu.label + " + " + cpu.label + " com " + state.ram + " GB de RAM em " + (state.ssd ? "SSD" : "HDD") + " obtém " + result.score + "/100. Jogável em 1080p no Baixo a cerca de 30 fps."
          : "Abaixo do mínimo, " + gpu.label + " + " + cpu.label + " com " + state.ram + " GB de RAM em " + (state.ssd ? "SSD" : "HDD") + " obtém " + result.score + "/100. Espere menos de 30 fps em 1080p no Baixo.";
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
      '<div><dt>Nível de GPU</dt><dd>' + gpu.score + '/100</dd></div>' +
      '<div><dt>Nível de CPU</dt><dd>' + cpu.score + '/100</dd></div>' +
      '<div><dt>RAM</dt><dd>' + state.ram + ' GB</dd></div>' +
      '</dl>' +
      '<dl class="stat-grid">' +
      '<div><dt>Storage</dt><dd>' + (state.ssd ? "SSD" : "HDD") + '</dd></div>' +
      '<div><dt>Elo mais fraco</dt><dd>' + weakest.name + ' (' + weakest.score + '/100)</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredito</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " · Veredito de GTA 6: " + meta.label + " (" + result.score + "/100)") + '&url=' + encodeURIComponent(shareUrl()) + '">Compartilhar no X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " — " + meta.label + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Pontuação " + result.score + " de 100. " + meta.label + ". " + gpu.label + " mais " + cpu.label + ", " + state.ram + " GB de RAM, " + (state.ssd ? "SSD" : "HDD") + ".";
  syncUrl();
}

function shareText() {
  var gpu = findPart(GPUS, state.gpu);
  var cpu = findPart(CPUS, state.cpu);
  var result = computeVerdict(gpu.score, cpu.score, state.ram, state.ssd);
  return gpu.label + " + " + cpu.label + " · Veredito de GTA 6: " + L(TIER_META[result.tier].label) + " (" + result.score + "/100). Verifique seu PC: " + shareUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copiar";
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

if (gpuSel) gpuSel.addEventListener("change", function () { state.gpu = gpuSel.value; render(); });
if (cpuSel) cpuSel.addEventListener("change", function () { state.cpu = cpuSel.value; render(); });
if (ramRange) ramRange.addEventListener("input", function () { state.ram = Number(ramRange.value); render(); });
ssdButtons.forEach(function (b) { b.addEventListener("click", function () { state.ssd = Number(b.dataset.ssdButton); render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
