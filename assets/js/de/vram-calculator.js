// vram-calculator.js — GTA 6 VRAM Requirements Checker page logic.
// Uses the ported VRAM engine (assets/js/engines/vram-engine.js).
// Tuning tips are computed per resolution inside the engine (AUDIT FIX M5).
// State lives in the URL (?gpu=&vram=&res=&preset=&rt=&fg=&hd=) so results
// are shareable. A custom VRAM number overrides the selected card's VRAM.
import { GPUS, RES_META, PRESET_META, estimateVramNeeded, verdictForCard as verdictForCardEn, findGpuById } from "../engines/de/vram-engine.js";

var PRESET_LABEL = { low: "Niedrig", medium: "Mittel", high: "Hoch", "very-high": "Sehr hoch", ultra: "Ultra" };
function presetLabel(p) { return PRESET_LABEL[p] || PRESET_META[p].label; }
var STATUS_LABEL = { comfortable: "Komfortabel", adequate: "Ausreichend", tight: "Knapp", insufficient: "Unzureichend" };
function mapTuning(t) {
  var m;
  if (t === "Turn off the HD texture pack — biggest single VRAM saver.") return "Schalte das HD-Textur-Paket aus, größter einzelner VRAM-Sparer.";
  if (t.indexOf("Disable ray tracing to reclaim ~") === 0) { m = t.match(/~([\d.]+) GB/); return "Deaktiviere Raytracing, um ~" + (m ? m[1] : "") + " GB zurückzugewinnen."; }
  if (t.indexOf("Drop preset from Ultra") === 0) { m = t.match(/~([\d.]+) GB/); return "Senke das Preset von Ultra auf Sehr hoch (Textur-Pool schrumpft ~" + (m ? m[1] : "") + " GB)."; }
  if (t.indexOf("Drop preset from Very High") === 0) { m = t.match(/~([\d.]+) GB/); return "Senke das Preset von Sehr hoch auf Hoch (Textur-Pool schrumpft ~" + (m ? m[1] : "") + " GB)."; }
  if (t.indexOf("Render at 1440p and upscale") === 0) { m = t.match(/~([\d.]+) GB/); return "Rendere bei 1440p und upscale (DLSS/FSR Quality), schneidet den Framebuffer ~" + (m ? m[1] : "") + " GB."; }
  if (t === "Enable DLSS/FSR Quality mode — the internal render shrinks, cutting framebuffer use.") return "Aktiviere den DLSS/FSR-Quality-Modus, der interne Render schrumpft und schneidet die Framebuffer-Nutzung.";
  if (t === "Disable frame generation to reclaim its extra buffer.") return "Deaktiviere die Frame-Generierung, um ihren extra Buffer zurückzugewinnen.";
  return t;
}
function verdictForCard(cardVramGB, needed, ctx) {
  var v = verdictForCardEn(cardVramGB, needed, ctx);
  var d = Math.abs(v.deltaGB);
  var head = Math.round((needed.recommendedGB - needed.totalGB) * 10) / 10;
  var label = v.status === "comfortable" ? "Komfortabel · " + (v.deltaGB > 0 ? "+" + v.deltaGB : v.deltaGB) + " GB Headroom" : v.status === "adequate" ? "Ausreichend · erfüllt Gesamt, " + head + " GB unter empfohlen" : v.status === "tight" ? "Knapp · " + d + " GB unter dem Gesamt-Pool" : "Unzureichend · " + d + " GB zu wenig, erwarte Textur-Pop / Stottern";
  var message = v.status === "comfortable" ? "Deine Karte hat genug VRAM für " + presetLabel(ctx.preset) + " bei " + ctx.res + ", inklusive des empfohlenen Stotter-Buffers." : v.status === "adequate" ? "Deine Karte erfüllt den Pool exakt, hat aber keine Reserve für Spitzen, erwarte gelegentliche 1 %-Low-Dips." : v.status === "tight" ? "Du bist in der Fallback-Zone des Treibers. Spielbar, aber der Textur-Streamer wird in dichten Szenen sichtbar swappen." : "VRAM wird in den System-RAM auslaufen, erwarte Textur-Pop-in, Stottern und niedrige 1 %-Frame-Rates. Senke Preset oder Auflösung.";
  return { status: v.status, label: label, message: message, deltaGB: v.deltaGB, tuning: v.tuning.map(mapTuning) };
}

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
  notice.textContent = "Unbekannte GPU im Link, also hat diese Seite auf die Standard-Karte zurückgesetzt. Wähle unten deine Karte.";
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
  if (hdHint) hdHint.textContent = "+" + ({ low: 0, medium: 0.4, high: 0.8, "very-high": 1.4, ultra: 2.2 })[state.preset] + " GB bei " + presetLabel(state.preset);

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var name = state.vram !== null ? cardVram + " GB VRAM" : gpu.label + " (" + cardVram + " GB)";
    var tldrText = verdict.status === "comfortable"
      ? "Ja, " + name + " hat komfortable VRAM für GTA 6 bei " + state.res + " " + presetLabel(state.preset) + ". Braucht " + needed.totalGB + " GB gesamt (" + needed.recommendedGB + " GB empfohlen)."
      : verdict.status === "adequate"
        ? "Ausreichend, " + name + " erfüllt die " + needed.totalGB + " GB gesamt von GTA 6 bei " + state.res + " " + presetLabel(state.preset) + ", hat aber keine Reserve für Spitzen. Empfohlen " + needed.recommendedGB + " GB."
        : verdict.status === "tight"
          ? "Knapp, " + name + " liegt " + Math.abs(verdict.deltaGB) + " GB unter dem " + needed.totalGB + "-GB-Pool von GTA 6 bei " + state.res + " " + presetLabel(state.preset) + ". Spielbar, aber der Textur-Streamer wird sichtbar swappen."
          : "Unzureichend, " + name + " liegt " + Math.abs(verdict.deltaGB) + " GB unter dem " + needed.totalGB + "-GB-Pool von GTA 6 bei " + state.res + " " + presetLabel(state.preset) + ". Erwarte Textur-Pop und Stottern.";
    if (label) label.textContent = STATUS_LABEL[verdict.status] + " · Kurzfassung";
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
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Tuning-Tipps</p><ul>' + verdict.tuning.map(function (t) { return "<li>" + t + "</li>"; }).join("") + "</ul></div>"
      : "";
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + verdict.label + '</p>' +
      '<h3 class="verdict-title">' + needed.totalGB.toFixed(1) + '<span class="unit"> GB benötigt</span></h3>' +
      '<p class="verdict-desc">' + verdict.message + ' Empfohlen ' + needed.recommendedGB.toFixed(1) + ' GB für einen Stotter-Buffer.</p></div></div>' +
      '<div class="balance-bars">' +
      bar("Textur-Pool", needed.breakdown.texturePool, needed.recommendedGB, "purple") +
      bar("Framebuffer + G-Buffer", needed.breakdown.framebuffer, needed.recommendedGB, "blue") +
      (needed.breakdown.rayTracing > 0 ? bar("Raytracing", needed.breakdown.rayTracing, needed.recommendedGB, "pink") : "") +
      (needed.breakdown.frameGen > 0 ? bar("Frame-Generierung", needed.breakdown.frameGen, needed.recommendedGB, "cyan") : "") +
      (needed.breakdown.hdTextures > 0 ? bar("HD-Textur-Paket", needed.breakdown.hdTextures, needed.recommendedGB, "pink") : "") +
      '</div>' + tuningHtml +
      '<dl class="stat-grid">' +
      '<div><dt>Gesamt benötigt</dt><dd>' + needed.totalGB.toFixed(1) + ' GB</dd></div>' +
      '<div><dt>Empfohlen</dt><dd>' + needed.recommendedGB.toFixed(1) + ' GB</dd></div>' +
      '<div><dt>Deine Karte</dt><dd>' + cardVram + ' GB</dd></div>' +
      '<div><dt>Headroom</dt><dd>' + (verdict.deltaGB > 0 ? "+" : "") + verdict.deltaGB.toFixed(1) + ' GB</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " (" + cardVram + " GB) @ " + state.res + " " + presetLabel(state.preset) + " · GTA-6-VRAM: " + verdict.label) + '&url=' + encodeURIComponent(shareUrl()) + '">Auf X teilen</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " (" + cardVram + " GB) | " + verdict.label + " (GTA-6-VRAM)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Breakdown table follows the live settings.
  var breakdown = $("[data-breakdown-table]");
  if (breakdown) {
    var rows = [
      ["Textur-Pool", needed.breakdown.texturePool, presetLabel(state.preset) + "-Preset"],
      ["Framebuffer + G-Buffer", needed.breakdown.framebuffer, RES_META[state.res].label],
      ["Raytracing", needed.breakdown.rayTracing, needed.breakdown.rayTracing > 0 ? "+" + needed.breakdown.rayTracing.toFixed(1) + " GB" : "aus"],
      ["Frame-Generierung", needed.breakdown.frameGen, needed.breakdown.frameGen > 0 ? "DLSS/FSR-FG-Buffer" : "aus"],
      ["HD-Textur-Paket", needed.breakdown.hdTextures, needed.breakdown.hdTextures > 0 ? "unkomprimierte Ebene" : "aus"],
    ];
    breakdown.innerHTML = rows.map(function (r) {
      return "<tr><td>" + r[0] + "</td><td class=\"mono\">" + r[1].toFixed(1) + "</td><td class=\"muted\">" + r[2] + "</td></tr>";
    }).join("") +
      "<tr><td><strong>Gesamt benötigt</strong></td><td class=\"mono\"><strong>" + needed.totalGB.toFixed(1) + "</strong></td><td class=\"muted\">roher Pool + Overhead</td></tr>" +
      "<tr><td><strong>Empfohlen</strong></td><td class=\"mono\"><strong>" + needed.recommendedGB.toFixed(1) + "</strong></td><td class=\"muted\">gesamt + " + state.res + " Stotter-Headroom</td></tr>";
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = verdict.label + ". GTA 6 braucht " + needed.totalGB + " Gigabyte bei " + state.res + " auf " + presetLabel(state.preset) + ". Deine Karte hat " + cardVram + " Gigabyte.";
  syncUrl();
}

function shareText() {
  var gpu = findGpuById(state.gpu);
  var cardVram = effectiveVram();
  var needed = estimateVramNeeded(state.res, state.preset, extras());
  var verdict = verdictForCard(cardVram, needed, { res: state.res, preset: state.preset, extras: extras() });
  return gpu.label + " (" + cardVram + " GB) @ " + state.res + " " + presetLabel(state.preset) + " · " + verdict.label + ". GTA-6-VRAM-Check: " + shareUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Kopieren";
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
    try { document.execCommand("copy"); done("Kopiert!"); } catch (e) { done("Kopieren fehlgeschlagen"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Kopiert!"); }, fallback);
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
