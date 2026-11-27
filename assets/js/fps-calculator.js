// fps-calculator.js — GTA 6 FPS Calculator page logic.
// Uses the ported FPS engine (assets/js/engines/fps-engine.js), which shares
// the bottleneck-engine GPU/CPU catalog (now including RTX 5060 / 5060 Ti,
// RX 9070 / 9070 XT and Intel Arc B580, AUDIT FIX H4).
// AUDIT FIX M6: ultrawide 1440p VRAM need is 1.34x the 1440p pool (applied in
// the engine), and frame-gen FPS is labelled as interpolated frames, not
// measured, wherever the number renders.
// State lives in the URL (?gpu=&cpu=&ram=&res=&preset=&up=&fg=&target=&vram=)
// so results are shareable.
import { GPUS, CPUS, RES_META, PRESET_META, UPSCALER_META, FRAMEGEN_META, estimateFps, suggestTweaks, findGpuById, findCpuById, defaultVramForGpu } from "./engines/fps-engine.js";

var DEFAULTS = { gpu: "rtx-4070", cpu: "r5-7600x", ram: 16, res: "1440p", preset: "high", up: "off", fg: "off", target: 60 };
var VRAM_HINT_TEMPLATE = "Leave empty to use the selected card's VRAM ({v} GB for the {card}).";
var RES_LIST = ["1080p", "1440p", "ultrawide-1440p", "4K"];
var PRESET_LIST = ["low", "medium", "high", "very-high", "ultra"];
var RAM_LIST = [8, 16, 32, 64];
var TARGET_LIST = [30, 60, 120, 144];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var vramRaw = q.get("vram");
  var vramNum = vramRaw === null ? null : Number(vramRaw);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    cpu: q.get("cpu") || DEFAULTS.cpu,
    ram: RAM_LIST.indexOf(Number(q.get("ram"))) !== -1 ? Number(q.get("ram")) : DEFAULTS.ram,
    res: RES_LIST.indexOf(q.get("res")) !== -1 ? q.get("res") : DEFAULTS.res,
    preset: PRESET_LIST.indexOf(q.get("preset")) !== -1 ? q.get("preset") : DEFAULTS.preset,
    up: Object.prototype.hasOwnProperty.call(UPSCALER_META, q.get("up")) ? q.get("up") : DEFAULTS.up,
    fg: Object.prototype.hasOwnProperty.call(FRAMEGEN_META, q.get("fg")) ? q.get("fg") : DEFAULTS.fg,
    target: TARGET_LIST.indexOf(Number(q.get("target"))) !== -1 ? Number(q.get("target")) : DEFAULTS.target,
    vram: vramNum !== null && Number.isFinite(vramNum) && vramNum >= 3 && vramNum <= 32 ? vramNum : null,
  };
  var bad = [];
  if (!findGpuById(state.gpu)) { bad.push("GPU"); state.gpu = DEFAULTS.gpu; }
  if (!findCpuById(state.cpu)) { bad.push("CPU"); state.cpu = DEFAULTS.cpu; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Unknown " + parsed.bad.join(" and ") + " in the link, so this page reset to the default rig. Pick your parts below.";
  notice.classList.add("show");
}

function fillSelect(select, parts, value, scoreSuffix) {
  parts.forEach(function (p) {
    var opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label + (scoreSuffix ? " (" + p.score + "/100)" : "");
    select.appendChild(opt);
  });
  select.value = value;
}
var gpuSel = $("[data-gpu-select]");
var cpuSel = $("[data-cpu-select]");
var vramInput = $("[data-vram-input]");
var resButtons = $all("[data-res-button]");
var presetButtons = $all("[data-preset-button]");
var ramButtons = $all("[data-ram-button]");
var upSel = $("[data-upscaler-select]");
var fgSel = $("[data-framegen-select]");
var targetButtons = $all("[data-target-button]");
if (gpuSel) fillSelect(gpuSel, GPUS, state.gpu, true);
if (cpuSel) fillSelect(cpuSel, CPUS, state.cpu, true);
if (upSel) {
  Object.keys(UPSCALER_META).forEach(function (k) {
    var opt = document.createElement("option");
    opt.value = k;
    opt.textContent = UPSCALER_META[k].label + (UPSCALER_META[k].mult > 1 ? " (x" + UPSCALER_META[k].mult + ")" : "");
    upSel.appendChild(opt);
  });
  upSel.value = state.up;
}
if (fgSel) {
  Object.keys(FRAMEGEN_META).forEach(function (k) {
    var opt = document.createElement("option");
    opt.value = k;
    opt.textContent = FRAMEGEN_META[k].label + (FRAMEGEN_META[k].mult > 1 ? " (x" + FRAMEGEN_META[k].mult + " avg, interpolated)" : "");
    fgSel.appendChild(opt);
  });
  fgSel.value = state.fg;
}
if (vramInput && state.vram !== null) vramInput.value = String(state.vram);

function inputFor() {
  var gpu = findGpuById(state.gpu);
  return {
    gpu: gpu,
    cpu: findCpuById(state.cpu),
    ram: state.ram,
    res: state.res,
    preset: state.preset,
    upscaler: state.up,
    frameGen: state.fg,
    targetFps: state.target,
    cardVramGB: state.vram !== null ? state.vram : defaultVramForGpu(state.gpu),
  };
}
function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), res: state.res, preset: state.preset, up: state.up, fg: state.fg, target: String(state.target) });
  if (state.vram !== null) p.set("vram", String(state.vram));
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), res: state.res, preset: state.preset, up: state.up, fg: state.fg, target: String(state.target) });
  if (state.vram !== null) p.set("vram", String(state.vram));
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function toneOf(result) {
  if (result.hitsTarget) return "ready";
  return result.targetGap >= -20 ? "borderline" : "upgrade";
}
var LIMITER_LABEL = { gpu: "GPU-bound", cpu: "CPU-bound", vram: "VRAM-bound", balanced: "Balanced" };

function shortPartLabel(label) {
  return label.replace(/^GeForce /, "").split(" / ")[0];
}

// Monotonicity clamp for the preset ladder's 1% low (iter14 B6a): the
// engine's 1% low factor switches at the +-7% limiter band, so with DLSS
// Quality the CPU-capped Low row can print a lower 1% low than the Medium
// row at the same average. A lower preset cannot have a worse 1% low than
// a higher preset, so walk from Ultra down and floor each row at the
// next-higher preset's 1% low.
function presetLadderResults(input) {
  var results = PRESET_LIST.map(function (p) { return estimateFps(Object.assign({}, input, { preset: p })); });
  var floor = 0;
  for (var i = results.length - 1; i >= 0; i--) {
    if (results[i].lowFps < floor) results[i].lowFps = floor;
    floor = results[i].lowFps;
  }
  return results;
}

function render() {
  var input = inputFor();
  var result = estimateFps(input);
  var ladderResults = presetLadderResults(input);
  var displayLow = ladderResults[PRESET_LIST.indexOf(state.preset)].lowFps;
  var tone = toneOf(result);
  var gpu = input.gpu;
  var cpu = input.cpu;
  var vramHint = $("[data-vram-hint]");
  if (vramHint) vramHint.textContent = VRAM_HINT_TEMPLATE.replace("{v}", String(defaultVramForGpu(state.gpu))).replace("{card}", shortPartLabel(gpu.label));

  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  if (upSel) upSel.value = state.up;
  if (fgSel) fgSel.value = state.fg;
  resButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.resButton === state.res)); });
  presetButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.presetButton === state.preset)); });
  ramButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.ramButton) === state.ram)); });
  targetButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.targetButton) === state.target)); });

  var verdictText = result.hitsTarget
    ? "Hits " + state.target + " fps"
    : "Short of " + state.target + " fps by " + Math.abs(result.targetGap) + " fps";
  var fgNote = result.fgApplied ? " Frame-gen average is interpolated frames, not measured." : "";
  var uwNote = state.res === "ultrawide-1440p" ? " VRAM need includes the ultrawide 1.34x factor." : "";

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = result.hitsTarget
      ? "Yes, " + gpu.label + " + " + cpu.label + " hits " + state.target + " fps at " + RES_META[state.res].short + " " + PRESET_META[state.preset].label + ": about " + result.avgFps + " fps average, " + displayLow + " fps 1% low." + fgNote
      : "Short, " + gpu.label + " + " + cpu.label + " reaches about " + result.avgFps + " fps average (" + displayLow + " fps 1% low) at " + RES_META[state.res].short + " " + PRESET_META[state.preset].label + ", " + Math.abs(result.targetGap) + " fps under the " + state.target + " fps target." + fgNote;
    if (label) label.textContent = verdictText + " · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = verdictText + " — " + result.avgFps + " avg fps";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var tweaks = suggestTweaks(input, result);
    var tweaksHtml = tweaks.length
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Ways to gain frames</p><ul>' + tweaks.map(function (t) { return "<li><strong>" + t.action + "</strong> (+" + t.gainPct + "%), " + t.detail.replace(/ — /g, ", ") + "</li>"; }).join("") + "</ul></div>"
      : "";
    var vramNote = result.vramShortGB > 0
      ? '<p class="verdict-desc">VRAM-limited: your ' + input.cardVramGB + ' GB card is ' + result.vramShortGB + ' GB short of the ' + result.vramNeededGB + ' GB needed, so a stutter penalty is applied.' + uwNote + '</p>'
      : '<p class="verdict-desc">VRAM clears: ' + result.vramNeededGB + ' GB needed at these settings, your card has ' + input.cardVramGB + ' GB.' + uwNote + '</p>';
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + verdictText + '</p>' +
      '<h3 class="verdict-title">' + result.avgFps + '<span class="unit"> avg fps</span></h3>' +
      '<p class="verdict-desc">' + result.bandLo + '–' + result.bandHi + ' fps band (±15%), ' + displayLow + ' fps 1% low. ' + LIMITER_LABEL[result.limiter] + ' at ' + RES_META[state.res].label + ' ' + PRESET_META[state.preset].label + '.' + fgNote + '</p></div></div>' +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Average FPS</span><span class="val">' + result.avgFps + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + Math.min(100, Math.round((result.avgFps / 144) * 100)) + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">1% low FPS</span><span class="val">' + displayLow + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + Math.min(100, Math.round((displayLow / 144) * 100)) + '%"></div></div></div>' +
      '</div>' + vramNote + tweaksHtml +
      '<dl class="stat-grid">' +
      '<div><dt>GPU-bound FPS</dt><dd>' + result.gpuFps + '</dd></div>' +
      '<div><dt>CPU cap</dt><dd>' + result.cpuCapFps + '</dd></div>' +
      '<div><dt>VRAM needed</dt><dd>' + result.vramNeededGB + ' GB</dd></div>' +
      '<div><dt>Target gap</dt><dd>' + (result.targetGap >= 0 ? "+" : "") + result.targetGap + ' fps</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copy verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " @ " + RES_META[state.res].short + " " + PRESET_META[state.preset].label + " · " + result.avgFps + " avg fps (" + displayLow + " 1% low)") + '&url=' + encodeURIComponent(shareUrl()) + '">Share on X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " — " + result.avgFps + " avg fps (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Preset ladder follows the live GPU/CPU/res (heading follows the selected resolution).
  var ladder = $("[data-preset-ladder]");
  if (ladder) {
    ladder.innerHTML = PRESET_LIST.map(function (p, i) {
      var r = ladderResults[i];
      var fgTag = r.fgApplied ? " (interpolated)" : "";
      return "<tr><td><strong>" + PRESET_META[p].label + "</strong></td><td class=\"mono\">" + r.avgFps + " fps" + fgTag + "</td><td class=\"mono\">" + r.lowFps + " fps</td><td class=\"muted\">" + r.bandLo + "–" + r.bandHi + "</td></tr>";
    }).join("");
  }
  // Preset-ladder heading follows the selected rig and resolution: the rows
  // above re-render per GPU/CPU/res, so rebuild the heading from the live
  // part labels too. Short labels drop the "GeForce " prefix and any
  // " / ..." alternate, so the default rig still reads exactly
  // "RTX 4070 + Ryzen 5 7600X" as in the static heading.
  var ladderHead = document.getElementById("preset-ladder");
  if (ladderHead) {
    if (!ladderHead.dataset.baseHeading) ladderHead.dataset.baseHeading = ladderHead.textContent;
    var rigLabel = shortPartLabel(gpu.label) + " + " + shortPartLabel(cpu.label);
    ladderHead.textContent = ladderHead.dataset.baseHeading
      .replace("RTX 4070 + Ryzen 5 7600X", rigLabel)
      .replace(/UW 1440p|1080p|1440p|4K/, RES_META[state.res].label);
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Estimated " + result.avgFps + " average frames per second, " + displayLow + " 1 percent low, at " + RES_META[state.res].short + " " + PRESET_META[state.preset].label + ". " + verdictText + "." + fgNote;
  syncUrl();
}

function shareText() {
  var input = inputFor();
  var result = estimateFps(input);
  var ladderResults = presetLadderResults(input);
  var displayLow = ladderResults[PRESET_LIST.indexOf(state.preset)].lowFps;
  return input.gpu.label + " + " + input.cpu.label + " @ " + RES_META[state.res].short + " " + PRESET_META[state.preset].label + " · " + result.avgFps + " avg fps (" + displayLow + " 1% low). GTA 6 FPS estimate: " + shareUrl();
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
    try { document.execCommand("copy"); done("Copied!"); } catch (e) { done("Copy failed"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copied!"); }, fallback);
  } else {
    fallback();
  }
}

if (gpuSel) gpuSel.addEventListener("change", function () { state.gpu = gpuSel.value; render(); });
if (cpuSel) cpuSel.addEventListener("change", function () { state.cpu = cpuSel.value; render(); });
if (vramInput) vramInput.addEventListener("change", function () {
  var n = Number(vramInput.value);
  state.vram = vramInput.value === "" ? null : (Number.isFinite(n) ? Math.max(3, Math.min(32, n)) : null);
  render();
});
resButtons.forEach(function (b) { b.addEventListener("click", function () { state.res = b.dataset.resButton; render(); }); });
presetButtons.forEach(function (b) { b.addEventListener("click", function () { state.preset = b.dataset.presetButton; render(); }); });
ramButtons.forEach(function (b) { b.addEventListener("click", function () { state.ram = Number(b.dataset.ramButton); render(); }); });
targetButtons.forEach(function (b) { b.addEventListener("click", function () { state.target = Number(b.dataset.targetButton); render(); }); });
if (upSel) upSel.addEventListener("change", function () { state.up = upSel.value; render(); });
if (fgSel) fgSel.addEventListener("change", function () { state.fg = fgSel.value; render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
