// download-time.js — Calculadora de tempo de download do GTA 6 page logic.
// Math follows the source route (src/routes/tools.download-time.tsx):
// seconds = totalGB * 8000 / effectiveMbps, effectiveMbps = mbps * eff / 100.
// AUDIT FIX H2: one install-size constant, 150 GB base. The old default was
// 165 GB base; the base install is now 150 GB and the day-one patch 15 GB,
// for a 165 GB total. State lives in the URL (?mbps=&gb=&patch=&eff=).
var DEFAULTS = { mbps: 100, gb: 150, patch: 15, eff: 80 };
var PRESETS = [
  { label: "5G Início", mbps: 25 },
  { label: "Cabo básico", mbps: 100 },
  { label: "Cabo rápido", mbps: 300 },
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
  presetButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.presetButton) === state.mbps)); });

  var clock = r.finish.toLocaleString(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" });
  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = r.totalGb + " GB at " + state.mbps + " Mbps (" + state.eff + "% efficiency, " + Math.round(r.effMbps) + " Mbps effective) finishes in about " + r.total.text + ". Start the pre-load the moment it opens if you are on anything under 100 Mbps.";
    if (label) label.textContent = "Sobre " + r.total.text + " · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = r.total.text + " for " + r.totalGb + " GB";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">Tempo estimado de conclusão</p>' +
      '<h3 class="verdict-title">' + r.total.h + '<span class="unit"> h</span> ' + r.total.m + '<span class="unit"> min</span></h3>' +
      '<p class="verdict-desc">' + r.totalGb + ' GB total at ' + Math.round(r.effMbps) + ' Mbps effective.</p>' +
      '<p class="verdict-desc">Finishes around <strong>' + clock + '</strong> se você começar agora.</p></div></div>' +
      '<dl class="stat-grid">' +
      '<div><dt>Instalação base</dt><dd>' + r.base.text + '</dd></div>' +
      '<div><dt>Patch do primeiro dia</dt><dd>' + r.patch.text + '</dd></div>' +
      '<div><dt>Tamanho base</dt><dd>' + state.gb + ' GB</dd></div>' +
      '<div><dt>Eficiência</dt><dd>' + state.eff + '%</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredito</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent("GTA 6 download time: " + r.total.text + " at " + state.mbps + " Mbps for " + r.totalGb + " GB") + '&url=' + encodeURIComponent(shareUrl()) + '">Compartilhar no X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent("GTA 6 download time: " + r.total.text + " at " + state.mbps + " Mbps") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Velocidade comparison table follows the live total and efficiency.
  var table = $("[data-speed-table]");
  if (table) {
    var speeds = [25, 50, 100, 300, 500, 1000];
    var names = ["DSL lento", "Cabo padrão", "Cabo rápido", "Fibra 300", "Fibra 500", "Gigabit"];
    table.innerHTML = speeds.map(function (mbps, i) {
      var eff = mbps * (state.eff / 100);
      var d = formatDuration((r.totalGb * 8000) / eff);
      return "<tr><th scope=\"row\" class=\"mono\">" + names[i] + "</th><td>" + mbps + " Mbps</td><td class=\"mono\">" + d.text + "</td></tr>";
    }).join("");
  }
  var tableNote = $("[data-speed-note]");
  if (tableNote) tableNote.textContent = r.totalGb + " GB total (install + patch) at " + state.eff + "% real-world efficiency.";

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Estimated download time " + r.total.h + " hours " + r.total.m + " minutes for " + r.totalGb + " gigabytes at " + state.mbps + " megabits per second, " + state.eff + " percent efficiency.";
  syncUrl();
}

function shareText() {
  var r = compute();
  return "GTA 6 download time: " + r.total.text + " at " + state.mbps + " Mbps for " + r.totalGb + " GB. Calcule o seu: " + shareUrl();
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

if (gbRange) gbRange.addEventListener("input", function () { state.gb = Number(gbRange.value); render(); });
if (patchRange) patchRange.addEventListener("input", function () { state.patch = Number(patchRange.value); render(); });
if (mbpsRange) mbpsRange.addEventListener("input", function () { state.mbps = Number(mbpsRange.value); render(); });
if (effRange) effRange.addEventListener("input", function () { state.eff = Number(effRange.value); render(); });
presetButtons.forEach(function (b) { b.addEventListener("click", function () { state.mbps = Number(b.dataset.presetButton); render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
