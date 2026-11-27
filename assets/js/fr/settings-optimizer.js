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
import { GPUS, CPUS, RES_META, PRESET_META, UPSCALER_META, FRAMEGEN_META, estimateFps, suggestTweaks as suggestTweaksEn, findGpuById, findCpuById, defaultVramForGpu } from "../engines/fr/fps-engine.js";

var PRESET_LABEL_OF = { low: "Faible", medium: "Moyen", high: "Élevé", "very-high": "Très élevé", ultra: "Ultra" };
function presetLabelOf(p) { return PRESET_LABEL_OF[p] || PRESET_META[p].label; }
var UPSCALER_LABEL_OF = { off: "Natif (désactivé)" };
function upscalerLabelOf(k) { return UPSCALER_LABEL_OF[k] || UPSCALER_META[k].label; }
var FRAMEGEN_LABEL_OF = { off: "Désactivé" };
function framegenLabelOf(k) { return FRAMEGEN_LABEL_OF[k] || FRAMEGEN_META[k].label; }
var RES_SHORT_OF = { "ultrawide-1440p": "UW 1440p" };
function resShort(r) { return RES_SHORT_OF[r] || RES_META[r].short; }
function resLabel(r) { return RES_META[r].label; }
function mapTweak(t) {
  var a = t.action, d = t.detail, m;
  if (a.indexOf("Drop preset to ") === 0) a = "Baisser le préréglage à " + presetLabelOf(a.slice(15) === "Low" ? "low" : a.slice(15) === "Medium" ? "medium" : a.slice(15) === "High" ? "high" : a.slice(15) === "Very High" ? "very-high" : "ultra");
  else if (a === "Enable DLSS / FSR Quality") a = "Activer DLSS / FSR Qualité";
  else if (a === "Switch upscaler to Balanced") a = "Passer l'upscaler à Équilibré";
  else if (a.indexOf("Enable ") === 0) a = "Activer " + a.slice(7);
  else if (a === "Render at 1440p") a = "Rendre en 1440p";
  if (d === "Doubles perceived smoothness — 1% low unchanged.") d = "Double la fluidité perçue, 1 % faible inchangé.";
  else if (d.indexOf("Estimated ") === 0 && d.indexOf("(was ") !== -1) { m = d.match(/Estimated ([\d.]+) fps \(was ([\d.]+)\)/); if (m) d = "Estimé " + m[1] + " FPS (était " + m[2] + ")."; }
  else if (d.indexOf("Estimated ") === 0) { m = d.match(/Estimated ([\d.]+) fps at 1440p (.+)\./); if (m) d = "Estimé " + m[1] + " FPS en 1440p " + presetLabelOf(m[2] === "Low" ? "low" : m[2] === "Medium" ? "medium" : m[2] === "High" ? "high" : m[2] === "Very High" ? "very-high" : "ultra") + "."; }
  return { action: a, gainPct: t.gainPct, detail: d };
}
function suggestTweaks(input, result) { return suggestTweaksEn(input, result).map(mapTweak); }

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
  notice.textContent = "Inconnu " + parsed.bad.join(" et ") + " dans le lien, donc cette page est revenue à la configuration par défaut. Choisissez vos composants ci-dessous.";
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
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
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

  var presetLabel = presetLabelOf(plan.preset);
  var methodNote = plan.method === "native"
    ? "préréglage le plus élevé qui atteint " + state.target + " FPS sur ce PC."
    : plan.method === "upscaler"
      ? "préréglage le plus élevé qui atteint " + state.target + " FPS avec " + upscalerLabelOf(plan.upscaler) + "."
      : plan.method === "framegen"
        ? "atteint " + state.target + " FPS seulement avec " + upscalerLabelOf(plan.upscaler) + " + " + framegenLabelOf(plan.frameGen) + " (images interpolées, non mesurées)."
        : "toujours en dessous de " + state.target + " FPS même en Faible + " + upscalerLabelOf(plan.upscaler) + " + " + framegenLabelOf(plan.frameGen) + " (interpolé). Baissez l'objectif ou mettez à niveau la GPU.";
  var verdictText = result.hitsTarget ? "Atteint " + state.target + " FPS" : "En dessous de " + state.target + " FPS de " + Math.abs(result.targetGap) + " FPS";
  var fgNote = result.fgApplied ? " La moyenne de génération d'images est constituée d'images interpolées, non mesurées." : "";

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = result.hitsTarget
      ? "Oui, " + gpu.label + " + " + cpu.label + " atteint " + state.target + " FPS à " + resShort(state.res) + " sur " + presetLabel + " : environ " + result.avgFps + " FPS en moyenne, " + result.lowFps + " FPS 1 % faible." + (plan.method === "native" ? " Ultra natif atteint " + ultra.avgFps + " FPS." : "") + fgNote
      : "Court, " + gpu.label + " + " + cpu.label + " atteint environ " + result.avgFps + " FPS en moyenne (" + result.lowFps + " FPS 1 % faible) à " + resShort(state.res) + " sur " + presetLabel + ", " + Math.abs(result.targetGap) + " FPS sous l'objectif de " + state.target + " FPS." + fgNote;
    if (label) label.textContent = verdictText + " · En bref";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = verdictText + ", " + result.avgFps + " FPS en moyenne";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var vramLine = result.vramShortGB > 0
      ? "<li><strong>Textures : baisser d'un niveau</strong>, il manque " + result.vramShortGB + " Go à votre carte pour le pool de " + result.vramNeededGB + " Go à " + presetLabel + ", donc les 1 % faibles vont saccader.</li>"
      : "<li><strong>Textures : Max, AF 16x, AO activé</strong>, presque gratuit. " + result.vramNeededGB + " Go nécessaires, votre carte en a " + inputFor(plan.preset, plan.upscaler, plan.frameGen).cardVramGB + " Go.</li>";
    var cutLine = plan.preset === "ultra" && plan.method === "native"
      ? "<li><strong>Reflets ray-tracés : désactivés</strong>, 18–30 %, l'option individuelle la plus chère, si vous voulez de la marge.</li>"
      : "<li><strong>Reflets ray-tracés : désactivés</strong>, 18–30 %, l'option individuelle la plus chère.</li><li><strong>Volumétrie : Moyen, Ombres : Élevé</strong>, les deux prochaines réductions, 8–14 % et 7–12 %.</li>";
    var tweaks = suggestTweaks(inputFor(plan.preset, plan.upscaler, plan.frameGen), result);
    var tweaksHtml = tweaks.length
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Moyens de gagner des images</p><ul>' + tweaks.map(function (t) { return "<li><strong>" + t.action + "</strong> (+" + t.gainPct + " %), " + t.detail + "</li>"; }).join("") + "</ul></div>"
      : "";
    var presetLine = plan.method === "native"
      ? "<li><strong>Préréglage : " + presetLabel + " (natif)</strong>, " + methodNote + "</li>"
      : "<li><strong>Préréglage : " + presetLabel + " + " + upscalerLabelOf(plan.upscaler) + (plan.frameGen !== "off" ? " + " + framegenLabelOf(plan.frameGen) : "") + "</strong>, " + methodNote + "</li>";
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + verdictText + '</p>' +
      '<h3 class="verdict-title">' + result.avgFps + '<span class="unit"> FPS moyens</span></h3>' +
      '<p class="verdict-desc">' + result.bandLo + '–' + result.bandHi + ' FPS (±15 %), ' + result.lowFps + ' FPS 1 % faible. Préréglage ' + presetLabel + (plan.upscaler !== "off" ? " + " + upscalerLabelOf(plan.upscaler) : "") + (plan.frameGen !== "off" ? " + " + framegenLabelOf(plan.frameGen) + " (interpolé)" : "") + ', à ' + resLabel(state.res) + '.' + fgNote + '</p></div></div>' +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">FPS moyens</span><span class="val">' + result.avgFps + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + Math.min(100, Math.round((result.avgFps / 144) * 100)) + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">1 % faible FPS</span><span class="val">' + result.lowFps + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + Math.min(100, Math.round((result.lowFps / 144) * 100)) + '%"></div></div></div>' +
      '</div>' +
      '<div class="upgrade-box"><p class="eyebrow-muted">Réglages recommandés</p><ul>' + presetLine + cutLine + vramLine + '</ul></div>' +
      tweaksHtml +
      '<dl class="stat-grid">' +
      '<div><dt>Ultra natif</dt><dd>' + ultra.avgFps + ' FPS</dd></div>' +
      '<div><dt>Recommandé</dt><dd>' + result.avgFps + ' FPS</dd></div>' +
      '<div><dt>VRAM nécessaire</dt><dd>' + result.vramNeededGB + ' GB</dd></div>' +
      '<div><dt>Écart cible</dt><dd>' + (result.targetGap >= 0 ? "+" : "") + result.targetGap + ' FPS</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " @ " + resShort(state.res) + ", objectif " + state.target + " FPS : " + presetLabel + " · " + result.avgFps + " FPS en moyenne (" + result.lowFps + " 1 % faible)") + '&url=' + encodeURIComponent(shareUrl()) + '">Partager sur X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="https://www.reddit.com/submit?title=' + encodeURIComponent("Réglages GTA 6 pour " + gpu.label + " + " + cpu.label + " à " + resShort(state.res) + ", objectif " + state.target + " FPS") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var ladder = $("[data-preset-ladder]");
  if (ladder) {
    ladder.innerHTML = ["low", "medium", "high", "very-high", "ultra"].map(function (p) {
      var r = estimateFps(inputFor(p, "off", "off"));
      return "<tr><td><strong>" + presetLabelOf(p) + "</strong></td><td class=\"mono\">" + r.avgFps + " FPS</td><td class=\"mono\">" + r.lowFps + " FPS</td><td class=\"muted\">" + r.bandLo + "–" + r.bandHi + "</td></tr>";
    }).join("");
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = verdictText + ". Estimé " + result.avgFps + " images par seconde en moyenne, " + result.lowFps + " 1 pour cent faible, à " + resShort(state.res) + " " + presetLabel + "." + fgNote;
  syncUrl();
}

function shareText() {
  var plan = optimize();
  return findGpuById(state.gpu).label + " + " + findCpuById(state.cpu).label + " @ " + resShort(state.res) + ", objectif " + state.target + " FPS : " + presetLabelOf(plan.preset) + " · " + plan.result.avgFps + " FPS en moyenne (" + plan.result.lowFps + " 1 % faible). Optimiseur de réglages GTA 6 : " + shareUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copier";
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
    try { document.execCommand("copy"); done("Copié !"); } catch (e) { done("Échec de la copie"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copié !"); }, fallback);
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
