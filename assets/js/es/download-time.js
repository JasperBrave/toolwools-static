// download-time.js — Calculadora de tiempo de descarga de GTA 6 page logic.
// Math follows the source route (src/routes/tools.download-time.tsx):
// seconds = totalGB * 8000 / effectiveMbps, effectiveMbps = mbps * eff / 100.
// AUDIT FIX H2 (pass 2A): one install-size constant, 212 GB base (212 GB
// game install plus a 1.7-3.8 GB day-one patch). The old default was 150 GB base
// + 15 GB patch, for a 165 GB total; the new total is 214.8 GB. State lives in the URL (?mbps=&gb=&patch=&eff=).
var DEFAULTS = { mbps: 100, gb: 212, patch: 2.8, eff: 80 };
var PRESETS = [
  { label: "5G Inicio", mbps: 25 },
  { label: "Cable básico", mbps: 100 },
  { label: "Cable rápido", mbps: 300 },
  { label: "Fibra 500", mbps: 500 },
  { label: "Gigabit", mbps: 1000 },
];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function clampNum(v, min, max, fallback) {
  if (v === null || v === undefined || v === "") return fallback;
  var n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function readState() {
  var q = new URLSearchParams(window.location.search);
  return {
    mbps: clampNum(q.get("mbps"), 5, 10000, DEFAULTS.mbps),
    gb: clampNum(q.get("gb"), 20, 400, DEFAULTS.gb),
    patch: clampNum(q.get("patch"), 0, 100, DEFAULTS.patch),
    eff: clampNum(q.get("eff"), 40, 100, DEFAULTS.eff),
  };
}
var state = readState();

var gbRange = $("[data-gb-range]");
var gbValue = $("[data-gb-value]");
var patchRange = $("[data-patch-range]");
var patchValue = $("[data-patch-value]");
var mbpsRange = $("[data-mbps-range]");
var mbpsValue = $("[data-mbps-value]");
var effRange = $("[data-eff-range]");
var effValue = $("[data-eff-value]");
var presetButtons = $all("[data-preset-button]");

function formatDuration(seconds) {
  if (!Number.isFinite(seconds) || seconds <= 0) return { h: 0, m: 0, text: "0m" };
  var h = Math.floor(seconds / 3600);
  var m = Math.round((seconds % 3600) / 60);
  if (m === 60) { h += 1; m = 0; }
  return { h: h, m: m, text: h > 0 ? h + "h " + m + "m" : m + "m" };
}
function compute() {
  var totalGb = state.gb + state.patch;
  var effMbps = state.mbps * (state.eff / 100);
  var seconds = (totalGb * 8000) / effMbps;
  return {
    totalGb: totalGb,
    effMbps: effMbps,
    total: formatDuration(seconds),
    base: formatDuration((state.gb * 8000) / effMbps),
    patch: formatDuration((state.patch * 8000) / effMbps),
    finish: new Date(Date.now() + seconds * 1000),
  };
}
function shareUrl() {
  var p = new URLSearchParams({ mbps: String(state.mbps), gb: String(state.gb), patch: String(state.patch), eff: String(state.eff) });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ mbps: String(state.mbps), gb: String(state.gb), patch: String(state.patch), eff: String(state.eff) });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function toneOf(hours) {
  if (hours <= 6) return "ready";
  if (hours <= 14) return "borderline";
  return "upgrade";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>';
}

function render() {
  var r = compute();
  var hours = (r.total.h * 60 + r.total.m) / 60;
  var tone = toneOf(hours);

  if (gbRange) gbRange.value = String(state.gb);
  if (gbValue) gbValue.textContent = state.gb + " GB";
  if (patchRange) patchRange.value = String(state.patch);
  if (patchValue) patchValue.textContent = state.patch + " GB";
  if (mbpsRange) mbpsRange.value = String(state.mbps);
  if (mbpsValue) mbpsValue.textContent = state.mbps + " Mbps";
  if (effRange) effRange.value = String(state.eff);
  if (effValue) effValue.textContent = state.eff + "%";
  // Accessible labels follow the live values: the static HTML says
  // "currently 100 Mbps" forever, so swap only the number in each
  // slider's stored base label.
  function syncAria(input, value) {
    if (!input) return;
    if (!input.dataset.baseAria) input.dataset.baseAria = input.getAttribute("aria-label") || "";
    input.setAttribute("aria-label", input.dataset.baseAria.replace(/[\d.]+/, String(value)));
  }
  syncAria(gbRange, state.gb);
  syncAria(patchRange, state.patch);
  syncAria(mbpsRange, state.mbps);
  syncAria(effRange, state.eff);

  presetButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.presetButton) === state.mbps)); });

  var clock = r.finish.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = r.totalGb + " GB a " + state.mbps + " Mbps (" + state.eff + "% de eficiencia, " + Math.round(r.effMbps) + " Mbps efectivos) termina en aproximadamente " + r.total.text + ". GTA 6 ya está disponible: descarga el juego completo hoy.";
    if (label) label.textContent = "Acerca de " + r.total.text + " · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = r.total.text + " for " + r.totalGb + " GB";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">Tiempo estimado de finalización</p>' +
      '<h3 class="verdict-title">' + r.total.h + '<span class="unit"> h</span> ' + r.total.m + '<span class="unit"> min</span></h3>' +
      '<p class="verdict-desc">' + r.totalGb + ' GB en total a ' + Math.round(r.effMbps) + ' Mbps efectivos.</p>' +
      '<p class="verdict-desc">Finishes around <strong>' + clock + '</strong> si empiezas ahora.</p></div></div>' +
      '<dl class="stat-grid">' +
      '<div><dt>Instalación base</dt><dd>' + r.base.text + '</dd></div>' +
      '<div><dt>Parche del primer día</dt><dd>' + r.patch.text + '</dd></div>' +
      '<div><dt>Tamaño base</dt><dd>' + state.gb + ' GB</dd></div>' +
      '<div><dt>Eficiencia</dt><dd>' + state.eff + '%</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredicto</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent("Tiempo de descarga de GTA 6: " + r.total.text + " a " + state.mbps + " Mbps para " + r.totalGb + " GB") + '&url=' + encodeURIComponent(shareUrl()) + '">Compartir en X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent("Tiempo de descarga de GTA 6: " + r.total.text + " a " + state.mbps + " Mbps") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Velocidad comparison table follows the live total and efficiency.
  var table = $("[data-speed-table]");
  if (table) {
    var speeds = [25, 50, 100, 300, 500, 1000];
    var names = ["DSL lento", "Cable estándar", "Cable rápido", "Fibra 300", "Fibra 500", "Gigabit"];
    table.innerHTML = speeds.map(function (mbps, i) {
      var eff = mbps * (state.eff / 100);
      var d = formatDuration((r.totalGb * 8000) / eff);
      return "<tr><th scope=\"row\" class=\"mono\">" + names[i] + "</th><td>" + mbps + " Mbps</td><td class=\"mono\">" + d.text + "</td></tr>";
    }).join("");
  }
  var tableNote = $("[data-speed-note]");
  if (tableNote) tableNote.textContent = r.totalGb + " GB en total (instalación + parche) a " + state.eff + "% de eficiencia real.";

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Tiempo de descarga estimado " + r.total.h + " horas " + r.total.m + " minutos para " + r.totalGb + " gigabytes a " + state.mbps + " megabits por segundo, " + state.eff + " por ciento de eficiencia.";
  syncUrl();
}

function shareText() {
  var r = compute();
  return "Tiempo de descarga de GTA 6: " + r.total.text + " a " + state.mbps + " Mbps para " + r.totalGb + " GB. Calcula el tuyo: " + shareUrl();
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
    try { document.execCommand("copy"); done("¡Copiado!"); } catch (e) { done("No se pudo copiar"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("¡Copiado!"); }, fallback);
  } else {
    fallback();
  }
}

if (gbRange) gbRange.addEventListener("input", function () { state.gb = Number(gbRange.value); render(); });
if (patchRange) patchRange.addEventListener("input", function () { state.patch = Number(patchRange.value); render(); });
if (mbpsRange) mbpsRange.addEventListener("input", function () { state.mbps = Number(mbpsRange.value); render(); });
if (effRange) effRange.addEventListener("input", function () { state.eff = Number(effRange.value); render(); });
presetButtons.forEach(function (b) { b.addEventListener("click", function () { state.mbps = Number(b.dataset.presetButton); render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
