// storage-planner.js — Planificador de almacenamiento de GTA 6 page logic.
// Math follows the source route (src/routes/tools.storage-planner.tsx):
// subtotal = base + patch + dlc; headroom = round(subtotal * buffer / 100);
// total = subtotal + headroom. Instalación base default is 212 GB (AUDIT FIX H2:
// one install-size constant shared with download-time, readiness and the
// registry copy). State lives in the URL (?base=&patch=&dlc=&buffer=&platform=).
var DEFAULTS = { base: 212, patch: 2.8, dlc: 30, buffer: 20, platform: "ps5" };
var PLATFORMS = {
  pc: { label: "PC", usableGB: 0, note: "Planificación para PC (no hay versión para PC anunciada): tu unidad, tus reglas; el número de abajo es exactamente lo que necesitaría GTA 6." },
  ps5: { label: "PS5", usableGB: 667, note: "El SSD de 825 GB de Sony reporta 667 GB utilizables tras la reserva del sistema." },
  xsx: { label: "Xbox Series X", usableGB: 802, note: "El SSD de 1 TB de Xbox reporta 802 GB utilizables tras la reserva del sistema." },
};
var PLATFORM_ROWS = [
  { p: "PC (planificación)", drive: "Tu SSD NVMe / SATA", reserve: "n/a", usable: 0 },
  { p: "PS5 (825 GB)", drive: "SSD personalizado de Sony", reserve: "158 GB de sistema", usable: 667 },
  { p: "PS5 Slim (1 TB)", drive: "SSD personalizado de Sony", reserve: "158 GB de sistema", usable: 842 },
  { p: "Xbox Series X (1 TB)", drive: "Tarjeta de expansión NVMe", reserve: "198 GB de sistema", usable: 802 },
  { p: "Xbox Series S (512 GB)", drive: "Tarjeta de expansión NVMe", reserve: "148 GB de sistema", usable: 364 },
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
  var platform = q.get("platform");
  return {
    base: clampNum(q.get("base"), 50, 300, DEFAULTS.base),
    patch: clampNum(q.get("patch"), 0, 100, DEFAULTS.patch),
    dlc: clampNum(q.get("dlc"), 0, 200, DEFAULTS.dlc),
    buffer: clampNum(q.get("buffer"), 0, 50, DEFAULTS.buffer),
    platform: Object.prototype.hasOwnProperty.call(PLATFORMS, platform) ? platform : DEFAULTS.platform,
  };
}
var state = readState();

var baseRange = $("[data-base-range]");
var baseValue = $("[data-base-value]");
var patchRange = $("[data-patch-range]");
var patchValue = $("[data-patch-value]");
var dlcRange = $("[data-dlc-range]");
var dlcValue = $("[data-dlc-value]");
var bufferRange = $("[data-buffer-range]");
var bufferValue = $("[data-buffer-value]");
var platformButtons = $all("[data-platform-button]");

// Iter 10: live-text templates, captured once from the server-rendered
// defaults before render() rewrites anything. fmtLike swaps only the
// first number in a template, so each locale keeps its own wording,
// spacing, unit and % placement while the value follows the sliders.
function fmtLike(template, value) {
  if (!template) return null;
  if (!/[\d]/.test(template)) return null;
  return template.replace(/[\d]+(?:\.[\d]+)?/, String(value));
}
function captureText(sel) {
  var el = $(sel);
  return el ? el.textContent : null;
}
function captureAttr(sel, attr) {
  var el = $(sel);
  return el ? el.getAttribute(attr) : null;
}
function setSliderText(range, labelTemplate, value, valueEl) {
  if (!range) return;
  var name = fmtLike(labelTemplate, value);
  if (name) range.setAttribute("aria-label", name);
  if (valueEl) range.setAttribute("aria-valuetext", valueEl.textContent);
}
var freeSpaceTotalTemplate = captureText("[data-free-space-total]");
var bufferPctTemplate = captureText("[data-buffer-pct]");
var methodBufferPctTemplate = captureText("[data-method-buffer-pct]");
var baseLabelTemplate = captureAttr("[data-base-range]", "aria-label");
var patchLabelTemplate = captureAttr("[data-patch-range]", "aria-label");
var dlcLabelTemplate = captureAttr("[data-dlc-range]", "aria-label");
var bufferLabelTemplate = captureAttr("[data-buffer-range]", "aria-label");

function compute() {
  var subtotal = state.base + state.patch + state.dlc;
  var headroom = Math.round(subtotal * (state.buffer / 100));
  return { subtotal: subtotal, headroom: headroom, total: subtotal + headroom };
}
// Display convention: 1 decimal. Binary floating point makes e.g.
// 364 - 293.8 print as 70.1999... instead of 70.2, so every computed GB
// value is rounded to 1 decimal at the point it is rendered.
function fmt1(v) { return String(Math.round(v * 10) / 10); }
function shareUrl() {
  var p = new URLSearchParams({ base: String(state.base), patch: String(state.patch), dlc: String(state.dlc), buffer: String(state.buffer), platform: state.platform });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ base: String(state.base), patch: String(state.patch), dlc: String(state.dlc), buffer: String(state.buffer), platform: state.platform });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function toneOf(total) {
  if (total <= 250) return "ready";
  if (total <= 400) return "borderline";
  return "upgrade";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}

function render() {
  // The patch slider only expresses 0.1 GB steps: normalise state to that
  // resolution so the slider value, label, total and announced value agree
  // (a ?patch= URL can otherwise carry a long float into the slider).
  state.patch = Math.round(state.patch * 10) / 10;
  var r = compute();
  var tone = toneOf(r.total);
  var meta = PLATFORMS[state.platform];

  if (baseRange) baseRange.value = String(state.base);
  if (baseValue) baseValue.textContent = state.base + " GB";
  if (patchRange) patchRange.value = String(state.patch);
  if (patchValue) patchValue.textContent = state.patch + " GB";
  if (dlcRange) dlcRange.value = String(state.dlc);
  if (dlcValue) dlcValue.textContent = state.dlc + " GB";
  if (bufferRange) bufferRange.value = String(state.buffer);
  if (bufferValue) bufferValue.textContent = state.buffer + "%";
  // Iter 10: slider accessible names and value text follow the live value.
  // Chrome ignores aria-valuetext on native range inputs, so the name
  // (aria-label) is the effective fix; aria-valuetext is set as well for
  // assistive tech that honours it. The value text reuses the visible
  // label span, so it already carries the locale unit.
  setSliderText(baseRange, baseLabelTemplate, state.base, baseValue);
  setSliderText(patchRange, patchLabelTemplate, fmt1(state.patch), patchValue);
  setSliderText(dlcRange, dlcLabelTemplate, state.dlc, dlcValue);
  setSliderText(bufferRange, bufferLabelTemplate, state.buffer, bufferValue);
  platformButtons.forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.platformButton === state.platform));
  });

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = "Mantén " + fmt1(r.total) + " GB libres para GTA 6 en " + meta.label + ": " + state.base + " GB de instalación + " + state.patch + " GB de parche + " + state.dlc + " GB de DLC + " + r.headroom + " GB de margen.";
    if (label) label.textContent = "Mantén " + fmt1(r.total) + " GB libres · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = fmt1(r.total) + " GB de espacio libre recomendado";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var pct = function (v) { return Math.round(Math.max(0, Math.min(100, (v / r.total) * 100)) * 10) / 10; };
    var consoleLine = state.platform === "pc" ? "" :
      '<p class="verdict-desc">' + meta.note + ' Eso te deja <strong>' + fmt1(Math.max(0, meta.usableGB - r.total)) + ' GB</strong> para otros juegos después de GTA 6.</p>';
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">Espacio libre recomendado</p>' +
      '<h3 class="verdict-title">' + fmt1(r.total) + '<span class="unit"> GB</span></h3>' +
      '<p class="verdict-desc">' + fmt1(r.subtotal) + ' GB de contenido + ' + r.headroom + ' GB de margen seguro para futuros parches.</p>' +
      consoleLine + '</div></div>' +
      '<div><div class="stack-bar" role="img" aria-label="Composition: Instalación base ' + state.base + ' GB, Parche del primer día ' + state.patch + ' GB, DLC y contenido de temporada ' + state.dlc + ' GB, Margen para actualizaciones ' + r.headroom + ' GB">' +
      '<span class="seg-purple" style="width:' + pct(state.base) + '%"></span>' +
      '<span class="seg-pink" style="width:' + pct(state.patch) + '%"></span>' +
      '<span class="seg-blue" style="width:' + pct(state.dlc) + '%"></span>' +
      '<span class="seg-muted" style="width:' + pct(r.headroom) + '%"></span>' +
      '</div></div>' +
      '<dl class="stat-grid">' +
      '<div><dt>Instalación base</dt><dd>' + state.base + ' GB</dd></div>' +
      '<div><dt>Parche del primer día</dt><dd>' + state.patch + ' GB</dd></div>' +
      '<div><dt>DLC + temporada</dt><dd>' + state.dlc + ' GB</dd></div>' +
      '<div><dt>Margen para actualizaciones</dt><dd>' + r.headroom + ' GB</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredicto</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent("GTA 6 necesita unos " + fmt1(r.total) + " GB libres") + '&url=' + encodeURIComponent(shareUrl()) + '">Compartir en X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/submit?title=' + encodeURIComponent("GTA 6 necesita unos " + fmt1(r.total) + " GB libres") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Plataforma table follows the live total.
  var table = $("[data-platform-table]");
  if (table) {
    table.innerHTML = PLATFORM_ROWS.map(function (row) {
      var after = row.usable === 0 ? "Depende de la unidad" : fmt1(Math.max(0, row.usable - r.total)) + " GB libres" + (r.total > row.usable ? " (faltan " + fmt1(r.total - row.usable) + " GB)" : "");
      return "<tr><th scope=\"row\" class=\"mono\">" + row.p + "</th><td>" + row.drive + "</td><td>" + row.reserve + "</td><td class=\"mono\">" + after + "</td></tr>";
    }).join("");
  }
  var tableNote = $("[data-platform-note]");
  if (tableNote) tableNote.textContent = "Cuánto espacio te deja GTA 6 para otros juegos, con tu plan actual de " + fmt1(r.total) + " GB.";
  // Iter 10: free-space subtitle and buffer helper follow the live total / %.
  var dekTotal = $("[data-free-space-total]");
  if (dekTotal) { var dekText = fmtLike(freeSpaceTotalTemplate, fmt1(r.total)); if (dekText) dekTotal.textContent = dekText; }
  var bufPct = $("[data-buffer-pct]");
  if (bufPct) { var bufText = fmtLike(bufferPctTemplate, state.buffer); if (bufText) bufPct.textContent = bufText; }
  var methodBufPct = $("[data-method-buffer-pct]");
  if (methodBufPct) { var methodBufText = fmtLike(methodBufferPctTemplate, state.buffer); if (methodBufText) methodBufPct.textContent = methodBufText; }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Espacio libre recomendado de " + fmt1(r.total) + " gigabytes: instalación de " + state.base + " gigabytes, parche de " + state.patch + " gigabytes, " + state.dlc + " gigabytes de DLC, " + r.headroom + " gigabytes de margen.";
  syncUrl();
}

function shareText() {
  var r = compute();
  return "GTA 6 necesita unos " + fmt1(r.total) + " GB libres: " + state.base + " GB de instalación + " + state.patch + " GB de parche + " + state.dlc + " GB de DLC + " + r.headroom + " GB de margen. Planifica tu espacio: " + shareUrl();
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

if (baseRange) baseRange.addEventListener("input", function () { state.base = Number(baseRange.value); render(); });
if (patchRange) patchRange.addEventListener("input", function () { state.patch = Math.round(Number(patchRange.value) * 10) / 10; render(); });
if (dlcRange) dlcRange.addEventListener("input", function () { state.dlc = Number(dlcRange.value); render(); });
if (bufferRange) bufferRange.addEventListener("input", function () { state.buffer = Number(bufferRange.value); render(); });
platformButtons.forEach(function (b) { b.addEventListener("click", function () { state.platform = b.dataset.platformButton; render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
