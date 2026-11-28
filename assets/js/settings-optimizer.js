// settings-optimizer.js, GTA 6 Settings Optimizer page logic.
// Uses the ported FPS engine (assets/js/engines/fps-engine.js), which shares
// the bottleneck-engine GPU/CPU catalog (AUDIT FIX H4: 34 GPUs including
// RTX 5060 / 5060 Ti, RX 9070 / 9070 XT and Intel Arc B580). The source route
// had no engine of its own and no automated optimizer (a ComingSoon roadmap
// plus a manual tuning pass); this page ships the optimizer the roadmap
// described, and its per-setting recommendations were verified against the
// FPS engine (see the static defaults: High preset, 71 avg fps at 1440p,
// Ultra native 49 fps, Ultra + DLSS Quality 63 fps).
// Algorithm: try presets Ultra down, pick the highest that hits the target
// natively; if none clears it, retry with DLSS/FSR Quality; if still short,
// add frame generation as a last resort (labelled interpolated, never
// measured). State lives in the URL (?gpu=&cpu=&ram=&res=&target=) so
// results are shareable.
import { GPUS, CPUS, RES_META, PRESET_META, UPSCALER_META, FRAMEGEN_META, estimateFps, suggestTweaks, findGpuById, findCpuById, defaultVramForGpu } from "./engines/fps-engine.js";

var DEFAULTS = { gpu: "rtx-4070", cpu: "r5-7600x", ram: 16, res: "1440p", target: 60 };
var RES_LIST = ["1080p", "1440p", "ultrawide-1440p", "4K"];
var PRESET_LIST = ["ultra", "very-high", "high", "medium", "low"];
var RAM_LIST = [8, 16, 32, 64];
var TARGET_LIST = [30, 60, 120, 144];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    cpu: q.get("cpu") || DEFAULTS.cpu,
    ram: RAM_LIST.indexOf(Number(q.get("ram"))) !== -1 ? Number(q.get("ram")) : DEFAULTS.ram,
    res: RES_LIST.indexOf(q.get("res")) !== -1 ? q.get("res") : DEFAULTS.res,
    target: TARGET_LIST.indexOf(Number(q.get("target"))) !== -1 ? Number(q.get("target")) : DEFAULTS.target,
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
if (gpuSel) fillSelect(gpuSel, GPUS, state.gpu);
if (cpuSel) fillSelect(cpuSel, CPUS, state.cpu);
var resButtons = $all("[data-res-button]");
var ramButtons = $all("[data-ram-button]");
var targetButtons = $all("[data-target-button]");

function inputFor(preset, upscaler, frameGen) {
  return {
    gpu: findGpuById(state.gpu),
    cpu: findCpuById(state.cpu),
    ram: state.ram,
    res: state.res,
    preset: preset,
    upscaler: upscaler,
    frameGen: frameGen,
    targetFps: state.target,
    cardVramGB: defaultVramForGpu(state.gpu),
  };
}

// Highest preset that hits the target, native first, then upscaled, then frame-gen.
function optimize() {
  var gpu = findGpuById(state.gpu);
  var up = gpu && gpu.brand === "amd" ? "fsr-quality" : "dlss-quality";
  var fg = gpu && gpu.brand === "amd" ? "fsr3-fg" : "dlss3-fg";
  var i;
  for (i = 0; i < PRESET_LIST.length; i++) {
    var r = estimateFps(inputFor(PRESET_LIST[i], "off", "off"));
    if (r.hitsTarget) return { preset: PRESET_LIST[i], upscaler: "off", frameGen: "off", result: r, method: "native" };
  }
  for (i = 0; i < PRESET_LIST.length; i++) {
    var r2 = estimateFps(inputFor(PRESET_LIST[i], up, "off"));
    if (r2.hitsTarget) return { preset: PRESET_LIST[i], upscaler: up, frameGen: "off", result: r2, method: "upscaler" };
  }
  for (i = 0; i < PRESET_LIST.length; i++) {
    var r3 = estimateFps(inputFor(PRESET_LIST[i], up, fg));
    if (r3.hitsTarget) return { preset: PRESET_LIST[i], upscaler: up, frameGen: fg, result: r3, method: "framegen" };
  }
  var last = estimateFps(inputFor("low", up, fg));
  return { preset: "low", upscaler: up, frameGen: fg, result: last, method: "framegen-short" };
}

function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), res: state.res, target: String(state.target) });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), res: state.res, target: String(state.target) });
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

function render() {
  var gpu = findGpuById(state.gpu);
  var cpu = findCpuById(state.cpu);
  var plan = optimize();
  var result = plan.result;
  var tone = toneOf(result);
  var ultra = estimateFps(inputFor("ultra", "off", "off"));

  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  resButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.resButton === state.res)); });
  ramButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.ramButton) === state.ram)); });
  targetButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.targetButton) === state.target)); });

  var presetLabel = PRESET_META[plan.preset].label;
  var methodNote = plan.method === "native"
    ? "highest preset that hits " + state.target + " fps on this rig."
    : plan.method === "upscaler"
      ? "highest preset that hits " + state.target + " fps with " + UPSCALER_META[plan.upscaler].label + "."
      : plan.method === "framegen"
        ? "hits " + state.target + " fps only with " + UPSCALER_META[plan.upscaler].label + " + " + FRAMEGEN_META[plan.frameGen].label + " (interpolated frames, not measured)."
        : "still short of " + state.target + " fps even at Low + " + UPSCALER_META[plan.upscaler].label + " + " + FRAMEGEN_META[plan.frameGen].label + " (interpolated). Lower the target or upgrade the GPU.";
  var verdictText = result.hitsTarget ? "Hits " + state.target + " fps" : "Short of " + state.target + " fps by " + Math.abs(result.targetGap) + " fps";
  var fgNote = result.fgApplied ? " Frame-gen average is interpolated frames, not measured." : "";

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = result.hitsTarget
      ? "Yes, " + gpu.label + " + " + cpu.label + " hits " + state.target + " fps at " + RES_META[state.res].short + " on " + presetLabel + ": about " + result.avgFps + " fps average, " + result.lowFps + " fps 1% low." + (plan.method === "native" ? " Ultra native reaches " + ultra.avgFps + " fps." : "") + fgNote
      : "Short, " + gpu.label + " + " + cpu.label + " reaches about " + result.avgFps + " fps average (" + result.lowFps + " fps 1% low) at " + RES_META[state.res].short + " on " + presetLabel + ", " + Math.abs(result.targetGap) + " fps under the " + state.target + " fps target." + fgNote;
    if (label) label.textContent = verdictText + " · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = verdictText + ", " + result.avgFps + " avg fps";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var vramLine = result.vramShortGB > 0
      ? "<li><strong>Textures: drop one tier</strong>, your card is " + result.vramShortGB + " GB short of the " + result.vramNeededGB + " GB pool at " + presetLabel + ", so 1% lows will stutter.</li>"
      : "<li><strong>Textures: Max, AF 16x, AO on</strong>, nearly free. " + result.vramNeededGB + " GB needed, your card has " + inputFor(plan.preset, plan.upscaler, plan.frameGen).cardVramGB + " GB.</li>";
    var cutLine = plan.preset === "ultra" && plan.method === "native"
      ? "<li><strong>Ray-traced reflections: Off</strong>, 18–30%, the most expensive single option, if you want headroom.</li>"
      : "<li><strong>Ray-traced reflections: Off</strong>, 18–30%, the most expensive single option.</li><li><strong>Volumetrics: Medium, Shadows: High</strong>, the next two cuts, 8–14% and 7–12%.</li>";
    var tweaks = suggestTweaks(inputFor(plan.preset, plan.upscaler, plan.frameGen), result);
    // The shared fps-engine's frame-gen tweak detail carries an em-dash;
    // the engine is shared with the FPS page, so map it at render time
    // (the DE/FR pages do the same in their mapTweak wrappers).
    tweaks = tweaks.map(function (t) {
      return t.detail === "Doubles perceived smoothness \u2014 1% low unchanged."
        ? { action: t.action, gainPct: t.gainPct, detail: "Doubles perceived smoothness, 1% low unchanged." }
        : t;
    });
    var tweaksHtml = tweaks.length
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Ways to gain frames</p><ul>' + tweaks.map(function (t) { return "<li><strong>" + t.action + "</strong> (+" + t.gainPct + "%), " + t.detail + "</li>"; }).join("") + "</ul></div>"
      : "";
    var presetLine = plan.method === "native"
      ? "<li><strong>Preset: " + presetLabel + " (native)</strong>, " + methodNote + "</li>"
      : "<li><strong>Preset: " + presetLabel + " + " + UPSCALER_META[plan.upscaler].label + (plan.frameGen !== "off" ? " + " + FRAMEGEN_META[plan.frameGen].label : "") + "</strong>, " + methodNote + "</li>";
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + verdictText + '</p>' +
      '<h3 class="verdict-title">' + result.avgFps + '<span class="unit"> avg fps</span></h3>' +
      '<p class="verdict-desc">' + result.bandLo + '–' + result.bandHi + ' fps band (±15%), ' + result.lowFps + ' fps 1% low. ' + presetLabel + ' preset' + (plan.upscaler !== "off" ? " + " + UPSCALER_META[plan.upscaler].label : "") + (plan.frameGen !== "off" ? " + " + FRAMEGEN_META[plan.frameGen].label + " (interpolated)" : "") + ', at ' + RES_META[state.res].label + '.' + fgNote + '</p></div></div>' +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Average FPS</span><span class="val">' + result.avgFps + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + Math.min(100, Math.round((result.avgFps / 144) * 100)) + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">1% low FPS</span><span class="val">' + result.lowFps + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + Math.min(100, Math.round((result.lowFps / 144) * 100)) + '%"></div></div></div>' +
      '</div>' +
      '<div class="upgrade-box"><p class="eyebrow-muted">Recommended settings</p><ul>' + presetLine + cutLine + vramLine + '</ul></div>' +
      tweaksHtml +
      '<dl class="stat-grid">' +
      '<div><dt>Native Ultra</dt><dd>' + ultra.avgFps + ' fps</dd></div>' +
      '<div><dt>Recommended</dt><dd>' + result.avgFps + ' fps</dd></div>' +
      '<div><dt>VRAM needed</dt><dd>' + result.vramNeededGB + ' GB</dd></div>' +
      '<div><dt>Target gap</dt><dd>' + (result.targetGap >= 0 ? "+" : "") + result.targetGap + ' fps</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copy verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " @ " + RES_META[state.res].short + ", target " + state.target + " fps: " + presetLabel + " · " + result.avgFps + " avg fps (" + result.lowFps + " 1% low)") + '&url=' + encodeURIComponent(shareUrl()) + '">Share on X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/submit?title=' + encodeURIComponent("GTA 6 settings for " + gpu.label + " + " + cpu.label + " at " + RES_META[state.res].short + ", " + state.target + " fps target") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var ladder = $("[data-preset-ladder]");
  if (ladder) {
    ladder.innerHTML = ["low", "medium", "high", "very-high", "ultra"].map(function (p) {
      var r = estimateFps(inputFor(p, "off", "off"));
      return "<tr><td><strong>" + PRESET_META[p].label + "</strong></td><td class=\"mono\">" + r.avgFps + " fps</td><td class=\"mono\">" + r.lowFps + " fps</td><td class=\"muted\">" + r.bandLo + "–" + r.bandHi + "</td></tr>";
    }).join("");
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = verdictText + ". Estimated " + result.avgFps + " average frames per second, " + result.lowFps + " 1 percent low, at " + RES_META[state.res].short + " " + presetLabel + "." + fgNote;
  syncUrl();
}

function shareText() {
  var plan = optimize();
  return findGpuById(state.gpu).label + " + " + findCpuById(state.cpu).label + " @ " + RES_META[state.res].short + ", target " + state.target + " fps: " + PRESET_META[plan.preset].label + " · " + plan.result.avgFps + " avg fps (" + plan.result.lowFps + " 1% low). GTA 6 settings optimizer: " + shareUrl();
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
resButtons.forEach(function (b) { b.addEventListener("click", function () { state.res = b.dataset.resButton; render(); }); });
ramButtons.forEach(function (b) { b.addEventListener("click", function () { state.ram = Number(b.dataset.ramButton); render(); }); });
targetButtons.forEach(function (b) { b.addEventListener("click", function () { state.target = Number(b.dataset.targetButton); render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
