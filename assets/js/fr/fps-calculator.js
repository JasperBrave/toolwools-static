// fps-calculator.js — GTA 6 FPS Calculator page logic.
// Uses the ported FPS engine (assets/js/engines/fps-engine.js), which shares
// the bottleneck-engine GPU/CPU catalog (now including RTX 5060 / 5060 Ti,
// RX 9070 / 9070 XT and Intel Arc B580, AUDIT FIX H4).
// AUDIT FIX M6: ultrawide 1440p VRAM need is 1.34x the 1440p pool (applied in
// the engine), and frame-gen FPS is labelled as interpolated frames, not
// measured, wherever the number renders.
// State lives in the URL (?gpu=&cpu=&ram=&res=&preset=&up=&fg=&target=&vram=)
// so results are shareable.
import { GPUS, CPUS, RES_META, PRESET_META, UPSCALER_META, FRAMEGEN_META, estimateFps, suggestTweaks as suggestTweaksEn, findGpuById, findCpuById, defaultVramForGpu } from "../engines/fr/fps-engine.js";

var PRESET_LABEL = { low: "Faible", medium: "Moyen", high: "Élevé", "very-high": "Très élevé", ultra: "Ultra" };
function presetLabel(p) { return PRESET_LABEL[p] || PRESET_META[p].label; }
var UPSCALER_LABEL = { off: "Natif (désactivé)" };
function upscalerLabel(k) { return UPSCALER_LABEL[k] || UPSCALER_META[k].label; }
var FRAMEGEN_LABEL = { off: "Désactivé" };
function framegenLabel(k) { return FRAMEGEN_LABEL[k] || FRAMEGEN_META[k].label; }
var RES_SHORT = { "ultrawide-1440p": "UW 1440p" };
function resShort(r) { return RES_SHORT[r] || RES_META[r].short; }
function resLabel(r) { return RES_META[r].label; }
function mapTweak(t) {
  var a = t.action, d = t.detail, m;
  if (a.indexOf("Drop preset to ") === 0) a = "Baisser le préréglage à " + presetLabel(a.slice(15) === "Low" ? "low" : a.slice(15) === "Medium" ? "medium" : a.slice(15) === "High" ? "high" : a.slice(15) === "Very High" ? "very-high" : "ultra");
  else if (a === "Enable DLSS / FSR Quality") a = "Activer DLSS / FSR Qualité";
  else if (a === "Switch upscaler to Balanced") a = "Passer l'upscaler à Équilibré";
  else if (a.indexOf("Enable ") === 0) a = "Activer " + a.slice(7);
  else if (a === "Render at 1440p") a = "Rendre en 1440p";
  if (d === "Doubles perceived smoothness — 1% low unchanged.") d = "Double la fluidité perçue, 1 % faible inchangé.";
  else if (d.indexOf("Estimated ") === 0 && d.indexOf("(was ") !== -1) { m = d.match(/Estimated ([\d.]+) fps \(was ([\d.]+)\)/); if (m) d = "Estimé " + m[1] + " ips (était " + m[2] + ")."; }
  else if (d.indexOf("Estimated ") === 0) { m = d.match(/Estimated ([\d.]+) fps at 1440p /); if (m) d = "Estimé " + m[1] + " ips à 1440p " + presetLabel("high") + "."; }
  return { action: a, gainPct: t.gainPct, detail: d };
}
function suggestTweaks(input, result) { return suggestTweaksEn(input, result).map(mapTweak); }

var DEFAULTS = { gpu: "rtx-4070", cpu: "r5-7600x", ram: 16, res: "1440p", preset: "high", up: "off", fg: "off", target: 60 };
var VRAM_HINT_TEMPLATE = "Laissez vide pour utiliser la VRAM de la carte sélectionnée ({v} Go pour la {card}).";
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
  notice.textContent = "Inconnu " + parsed.bad.join(" et ") + " dans le lien, donc cette page est revenue à la configuration par défaut. Choisissez vos composants ci-dessous.";
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
    opt.textContent = upscalerLabel(k) + (UPSCALER_META[k].mult > 1 ? " (x" + UPSCALER_META[k].mult + ")" : "");
    upSel.appendChild(opt);
  });
  upSel.value = state.up;
}
if (fgSel) {
  Object.keys(FRAMEGEN_META).forEach(function (k) {
    var opt = document.createElement("option");
    opt.value = k;
    opt.textContent = framegenLabel(k) + (FRAMEGEN_META[k].mult > 1 ? " (x" + FRAMEGEN_META[k].mult + " en moy., interpolé)" : "");
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
var LIMITER_LABEL = { gpu: "Limité par le GPU", cpu: "Limité par le CPU", vram: "Limité par la VRAM", balanced: "Équilibré" };

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
    ? "Atteint " + state.target + " ips"
    : "Sous " + state.target + " ips de " + Math.abs(result.targetGap) + " ips";
  var fgNote = result.fgApplied ? " La moyenne de génération d'images correspond à des images interpolées, pas mesurées." : "";
  var uwNote = state.res === "ultrawide-1440p" ? " Le besoin en VRAM inclut le facteur ultrawide 1,34x." : "";

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = result.hitsTarget
      ? "Oui, " + gpu.label + " + " + cpu.label + " atteint " + state.target + " ips en " + resShort(state.res) + " " + presetLabel(state.preset) + " : environ " + result.avgFps + " ips en moyenne, " + displayLow + " ips 1 % faible." + fgNote
      : "Insuffisant, " + gpu.label + " + " + cpu.label + " atteint environ " + result.avgFps + " ips en moyenne (" + displayLow + " ips 1 % faible) en " + resShort(state.res) + " " + presetLabel(state.preset) + ", " + Math.abs(result.targetGap) + " ips sous l'objectif de " + state.target + " ips." + fgNote;
    if (label) label.textContent = verdictText + " · TL;DR";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = verdictText + " | " + result.avgFps + " ips en moyenne";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var tweaks = suggestTweaks(input, result);
    var tweaksHtml = tweaks.length
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Moyens de gagner des images</p><ul>' + tweaks.map(function (t) { return "<li><strong>" + t.action + "</strong> (+" + t.gainPct + " %), " + t.detail + "</li>"; }).join("") + "</ul></div>"
      : "";
    var vramNote = result.vramShortGB > 0
      ? '<p class="verdict-desc">Limité par la VRAM : votre carte de ' + input.cardVramGB + ' Go est à ' + result.vramShortGB + ' Go des ' + result.vramNeededGB + ' Go nécessaires, donc une pénalité de saccades est appliquée.' + uwNote + '</p>'
      : '<p class="verdict-desc">VRAM suffisante : ' + result.vramNeededGB + ' Go nécessaires avec ces réglages, votre carte en a ' + input.cardVramGB + '.' + uwNote + '</p>';
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + verdictText + '</p>' +
      '<h3 class="verdict-title">' + result.avgFps + '<span class="unit"> ips en moyenne</span></h3>' +
      '<p class="verdict-desc">' + result.bandLo + '–' + result.bandHi + ' ips de plage (±15 %), ' + displayLow + ' ips 1 % faible. ' + LIMITER_LABEL[result.limiter] + ' en ' + resLabel(state.res) + ' ' + presetLabel(state.preset) + '.' + fgNote + '</p></div></div>' +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">FPS moyens</span><span class="val">' + result.avgFps + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + Math.min(100, Math.round((result.avgFps / 144) * 100)) + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">FPS 1 % faible</span><span class="val">' + displayLow + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + Math.min(100, Math.round((displayLow / 144) * 100)) + '%"></div></div></div>' +
      '</div>' + vramNote + tweaksHtml +
      '<dl class="stat-grid">' +
      '<div><dt>IPS limités par le GPU</dt><dd>' + result.gpuFps + '</dd></div>' +
      '<div><dt>Plafond CPU</dt><dd>' + result.cpuCapFps + '</dd></div>' +
      '<div><dt>VRAM nécessaire</dt><dd>' + result.vramNeededGB + ' GB</dd></div>' +
      '<div><dt>Écart à l\'objectif</dt><dd>' + (result.targetGap >= 0 ? "+" : "") + result.targetGap + ' fps</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " @ " + resShort(state.res) + " " + presetLabel(state.preset) + " · " + result.avgFps + " ips en moyenne (" + displayLow + " 1 % faible)") + '&url=' + encodeURIComponent(shareUrl()) + '">Partager sur X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " | " + result.avgFps + " ips en moyenne (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Preset ladder follows the live GPU/CPU/res (heading follows the selected resolution).
  var ladder = $("[data-preset-ladder]");
  if (ladder) {
    ladder.innerHTML = PRESET_LIST.map(function (p, i) {
      var r = ladderResults[i];
      var fgTag = r.fgApplied ? " (interpolé)" : "";
      return "<tr><td><strong>" + presetLabel(p) + "</strong></td><td class=\"mono\">" + r.avgFps + " ips" + fgTag + "</td><td class=\"mono\">" + r.lowFps + " ips</td><td class=\"muted\">" + r.bandLo + "–" + r.bandHi + "</td></tr>";
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
  if (live) live.textContent = "Estimé à " + result.avgFps + " images par seconde en moyenne, " + displayLow + " pour le 1 % faible, en " + resShort(state.res) + " " + presetLabel(state.preset) + ". " + verdictText + "." + fgNote;
  syncUrl();
}

function shareText() {
  var input = inputFor();
  var result = estimateFps(input);
  var ladderResults = presetLadderResults(input);
  var displayLow = ladderResults[PRESET_LIST.indexOf(state.preset)].lowFps;
  return input.gpu.label + " + " + input.cpu.label + " @ " + resShort(state.res) + " " + presetLabel(state.preset) + " · " + result.avgFps + " ips en moyenne (" + displayLow + " 1 % faible). Estimation d'ips GTA 6 : " + shareUrl();
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
