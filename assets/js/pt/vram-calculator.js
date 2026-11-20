// vram-calculator.js — Verificador de requisitos de VRAM do GTA 6 page logic.
// Uses the ported VRAM engine (assets/js/engines/vram-engine.js).
// Dicas de ajuste are computed per resolution inside the engine (AUDIT FIX M5).
// State lives in the URL (?gpu=&vram=&res=&preset=&rt=&fg=&hd=) so results
// are shareable. A custom VRAM number overrides the selected card's VRAM.
import { GPUS, RES_META, PRESET_META, estimateVramNeeded, verdictForCard, findGpuById } from "../engines/pt/vram-engine.js";
import { L } from "./l10n.js";

var DEFAULTS = { gpu: "rtx-4070", res: "1440p", preset: "ultra", rt: false, fg: false, hd: false };
var RES_LIST = ["1080p", "1440p", "4K"];
var PRESET_LIST = ["low", "medium", "high", "very-high", "ultra"];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var vramRaw = q.get("vram");
  var vramNum = vramRaw === null ? null : Number(vramRaw);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    vram: vramNum !== null && Number.isFinite(vramNum) && vramNum >= 3 && vramNum <= 32 ? vramNum : null,
    res: RES_LIST.indexOf(q.get("res")) !== -1 ? q.get("res") : DEFAULTS.res,
    preset: PRESET_LIST.indexOf(q.get("preset")) !== -1 ? q.get("preset") : DEFAULTS.preset,
    rt: q.get("rt") === "1" || q.get("rt") === "true",
    fg: q.get("fg") === "1" || q.get("fg") === "true",
    hd: q.get("hd") === "1" || q.get("hd") === "true",
  };
  var bad = [];
  if (!findGpuById(state.gpu)) { bad.push("GPU"); state.gpu = DEFAULTS.gpu; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Desconhecido GPU in the link, so this page reset to the default card. Pick your card below.";
  notice.classList.add("show");
}

var gpuSel = $("[data-gpu-select]");
var vramInput = $("[data-vram-input]");
var resButtons = $all("[data-res-button]");
var presetButtons = $all("[data-preset-button]");
var rtBox = $("[data-rt-toggle]");
var fgBox = $("[data-fg-toggle]");
var hdBox = $("[data-hd-toggle]");

if (gpuSel) {
  GPUS.forEach(function (g) {
    var opt = document.createElement("option");
    opt.value = g.id;
    opt.textContent = g.label + " (" + g.vramGB + " GB)";
    gpuSel.appendChild(opt);
  });
  gpuSel.value = state.gpu;
}
if (vramInput && state.vram !== null) vramInput.value = String(state.vram);

function extras() { return { rayTracing: state.rt, frameGen: state.fg, hdTextures: state.hd }; }
function effectiveVram() {
  var gpu = findGpuById(state.gpu);
  return state.vram !== null ? state.vram : (gpu ? gpu.vramGB : 8);
}
function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, res: state.res, preset: state.preset });
  if (state.vram !== null) p.set("vram", String(state.vram));
  if (state.rt) p.set("rt", "1");
  if (state.fg) p.set("fg", "1");
  if (state.hd) p.set("hd", "1");
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, res: state.res, preset: state.preset });
  if (state.vram !== null) p.set("vram", String(state.vram));
  if (state.rt) p.set("rt", "1");
  if (state.fg) p.set("fg", "1");
  if (state.hd) p.set("hd", "1");
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function toneOf(status) {
  return status === "comfortable" ? "ready" : status === "insufficient" ? "upgrade" : "borderline";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}

function render() {
  var gpu = findGpuById(state.gpu);
  var cardVram = effectiveVram();
  var needed = estimateVramNeeded(state.res, state.preset, extras());
  var verdict = verdictForCard(cardVram, needed, { res: state.res, preset: state.preset, extras: extras() });
  var tone = toneOf(verdict.status);

  if (gpuSel) gpuSel.value = state.gpu;
  resButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.resButton === state.res)); });
  presetButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.presetButton === state.preset)); });
  if (rtBox) rtBox.checked = state.rt;
  if (fgBox) fgBox.checked = state.fg;
  if (hdBox) hdBox.checked = state.hd;
  var hdHint = $("[data-hd-hint]");
  if (hdHint) hdHint.textContent = "+" + ({ low: 0, medium: 0.4, high: 0.8, "very-high": 1.4, ultra: 2.2 })[state.preset] + " GB at " + L(PRESET_META[state.preset].label);

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var name = state.vram !== null ? cardVram + " GB VRAM" : gpu.label + " (" + cardVram + " GB)";
    var tldrText = verdict.status === "comfortable"
      ? "Sim, " + name + " tem VRAM confortável para GTA 6 em " + state.res + " " + L(PRESET_META[state.preset].label) + ". Precisa de " + needed.totalGB + " GB no total (" + needed.recommendedGB + " GB recomendados)."
      : verdict.status === "adequate"
        ? "Adequado, " + name + " cumpre o total de " + needed.totalGB + " GB de GTA 6 em " + state.res + " " + L(PRESET_META[state.preset].label) + ", mas não tem reserva para picos. Recomendados " + needed.recommendedGB + " GB."
        : verdict.status === "tight"
          ? "Apertado, " + name + " está " + Math.abs(verdict.deltaGB) + " GB abaixo do pool de " + needed.totalGB + " GB de GTA 6 em " + state.res + " " + L(PRESET_META[state.preset].label) + ". Jogável, mas o streamer de texturas vai trocar visivelmente."
          : "Insuficiente, " + name + " está " + Math.abs(verdict.deltaGB) + " GB abaixo do pool de " + needed.totalGB + " GB de GTA 6 em " + state.res + " " + L(PRESET_META[state.preset].label) + ". Espere pop de texturas e engasgos.";
    if (label) label.textContent = verdict.status.charAt(0).toUpperCase() + verdict.status.slice(1) + " · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = verdict.label;
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var bar = function (label, gb, max, cls) {
      var pct = Math.max(0, Math.min(100, Math.round((gb / max) * 100)));
      return '<div><div class="balance-bar-head"><span class="lbl">' + label + '</span><span class="val">' + gb.toFixed(1) + ' GB</span></div><div class="balance-bar-track"><div class="balance-bar-fill ' + cls + '" style="width:' + pct + '%"></div></div></div>';
    };
    var tuningHtml = verdict.tuning.length
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Dicas de ajuste</p><ul>' + verdict.tuning.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></div>"
      : "";
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + verdict.label + '</p>' +
      '<h3 class="verdict-title">' + needed.totalGB.toFixed(1) + '<span class="unit"> GB necessários</span></h3>' +
      '<p class="verdict-desc">' + verdict.message + ' Recomendado ' + needed.recommendedGB.toFixed(1) + ' GB for a stutter buffer.</p></div></div>' +
      '<div class="balance-bars">' +
      bar("Pool de texturas", needed.breakdown.texturePool, needed.recommendedGB, "purple") +
      bar("Framebuffer + G-buffer", needed.breakdown.framebuffer, needed.recommendedGB, "blue") +
      (needed.breakdown.rayTracing > 0 ? bar("Ray tracing", needed.breakdown.rayTracing, needed.recommendedGB, "pink") : "") +
      (needed.breakdown.frameGen > 0 ? bar("Geração de quadros", needed.breakdown.frameGen, needed.recommendedGB, "cyan") : "") +
      (needed.breakdown.hdTextures > 0 ? bar("Pacote de texturas HD", needed.breakdown.hdTextures, needed.recommendedGB, "pink") : "") +
      '</div>' + tuningHtml +
      '<dl class="stat-grid">' +
      '<div><dt>Total necessário</dt><dd>' + needed.totalGB.toFixed(1) + ' GB</dd></div>' +
      '<div><dt>Recomendado</dt><dd>' + needed.recommendedGB.toFixed(1) + ' GB</dd></div>' +
      '<div><dt>Sua placa</dt><dd>' + cardVram + ' GB</dd></div>' +
      '<div><dt>Margem</dt><dd>' + (verdict.deltaGB > 0 ? "+" : "") + verdict.deltaGB.toFixed(1) + ' GB</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredito</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " (" + cardVram + " GB) @ " + state.res + " " + L(PRESET_META[state.preset].label) + " · GTA 6 VRAM: " + verdict.label) + '&url=' + encodeURIComponent(shareUrl()) + '">Compartilhar no X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " (" + cardVram + " GB) — " + verdict.label + " (GTA 6 VRAM)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Breakdown table follows the live settings.
  var breakdown = $("[data-breakdown-table]");
  if (breakdown) {
    var rows = [
      ["Pool de texturas", needed.breakdown.texturePool, L(PRESET_META[state.preset].label) + " preset"],
      ["Framebuffer + G-buffer", needed.breakdown.framebuffer, L(RES_META[state.res].label)],
      ["Ray tracing", needed.breakdown.rayTracing, needed.breakdown.rayTracing > 0 ? "+" + needed.breakdown.rayTracing.toFixed(1) + " GB" : "off"],
      ["Geração de quadros", needed.breakdown.frameGen, needed.breakdown.frameGen > 0 ? "DLSS/FSR FG buffer" : "off"],
      ["Pacote de texturas HD", needed.breakdown.hdTextures, needed.breakdown.hdTextures > 0 ? "uncompressed layer" : "off"],
    ];
    breakdown.innerHTML = rows.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td class=\"mono\">" + r[1].toFixed(1) + "</td><td class=\"muted\">" + r[2] + "</td></tr>";
    }).join("") +
      "<tr><td><strong>Total necessário</strong></td><td class=\"mono\"><strong>" + needed.totalGB.toFixed(1) + "</strong></td><td class=\"muted\">pool base + sobrecarga</td></tr>" +
      "<tr><td><strong>Recomendado</strong></td><td class=\"mono\"><strong>" + needed.recommendedGB.toFixed(1) + "</strong></td><td class=\"muted\">total + " + state.res + " stutter headroom</td></tr>";
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = verdict.label + ". GTA 6 precisa de " + needed.totalGB + " gigabytes em " + state.res + " em " + L(PRESET_META[state.preset].label) + ". Sua placa tem " + cardVram + " gigabytes.";
  syncUrl();
}

function shareText() {
  var gpu = findGpuById(state.gpu);
  var cardVram = effectiveVram();
  var needed = estimateVramNeeded(state.res, state.preset, extras());
  var verdict = verdictForCard(cardVram, needed, { res: state.res, preset: state.preset, extras: extras() });
  return gpu.label + " (" + cardVram + " GB) @ " + state.res + " " + L(PRESET_META[state.preset].label) + " · " + verdict.label + ". GTA 6 VRAM check: " + shareUrl();
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
if (vramInput) vramInput.addEventListener("change", function () {
  var n = Number(vramInput.value);
  state.vram = vramInput.value === "" ? null : (Number.isFinite(n) ? Math.max(3, Math.min(32, n)) : null);
  render();
});
resButtons.forEach(function (b) { b.addEventListener("click", function () { state.res = b.dataset.resButton; render(); }); });
presetButtons.forEach(function (b) { b.addEventListener("click", function () { state.preset = b.dataset.presetButton; render(); }); });
if (rtBox) rtBox.addEventListener("change", function () { state.rt = rtBox.checked; render(); });
if (fgBox) fgBox.addEventListener("change", function () { state.fg = fgBox.checked; render(); });
if (hdBox) hdBox.addEventListener("change", function () { state.hd = hdBox.checked; render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
