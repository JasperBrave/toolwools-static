// bottleneck.js — GTA 6 Bottleneck Calculator page logic.
// Uses the ported engine (assets/js/engines/bottleneck-engine.js) with the
// same defaults as the source route (src/routes/tools.bottleneck-calculator.tsx):
// RTX 4070 + Ryzen 5 5600X at 1440p, GTA Online. Compare rig defaults to
// RTX 4080 + Ryzen 7 7700X. State lives in the URL (?gpu=&cpu=&res=&mode=,
// plus &compare=1&gpu2=&cpu2=) so results are shareable and reload-safe.
import { GPUS, CPUS, WORKLOAD_META, computeBalance, suggestUpgrade, verdictLabelOf as verdictLabelOfEn } from "../engines/fr/bottleneck-engine.js";

var MODE_LABEL = { story: "Mode Histoire", online: "GTA Online", stream: "Streaming + enregistrement" };
function modeLabel(m) { return MODE_LABEL[m] || WORKLOAD_META[m].label; }
function verdictLabelOf(r) { var s = verdictLabelOfEn(r); if (s === "Balanced build") return "Configuration équilibrée"; if (s.indexOf("CPU bottleneck ") === 0) return "Goulot d'étranglement CPU " + s.slice(15) + " %"; if (s.indexOf("GPU bottleneck ") === 0) return "Goulot d'étranglement GPU " + s.slice(15) + " %"; return s; }

var DEFAULTS = { gpu: "rtx-4070", cpu: "r5-5600x", res: "1440p", mode: "online", gpu2: "rtx-4080", cpu2: "r7-7700x" };
var RES_LIST = ["1080p", "1440p", "4K"];
var MODE_LIST = ["story", "online", "stream"];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function findPart(list, id) { return list.find(function (p) { return p.id === id; }); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    cpu: q.get("cpu") || DEFAULTS.cpu,
    res: RES_LIST.indexOf(q.get("res")) !== -1 ? q.get("res") : DEFAULTS.res,
    mode: MODE_LIST.indexOf(q.get("mode")) !== -1 ? q.get("mode") : DEFAULTS.mode,
    compare: q.get("compare") === "1" || q.get("compare") === "true",
    gpu2: q.get("gpu2") || DEFAULTS.gpu2,
    cpu2: q.get("cpu2") || DEFAULTS.cpu2,
  };
  // Invalid input state: unknown part ids in the link fall back to defaults
  // and the page says so, instead of silently computing the wrong rig.
  var bad = [];
  if (!findPart(GPUS, state.gpu)) { bad.push("GPU"); state.gpu = DEFAULTS.gpu; }
  if (!findPart(CPUS, state.cpu)) { bad.push("CPU"); state.cpu = DEFAULTS.cpu; }
  if (!findPart(GPUS, state.gpu2)) { bad.push("comparison GPU"); state.gpu2 = DEFAULTS.gpu2; }
  if (!findPart(CPUS, state.cpu2)) { bad.push("comparison CPU"); state.cpu2 = DEFAULTS.cpu2; }
  return { state: state, bad: bad };
}

function readinessOf(result) {
  if (result.absPct >= 15 || result.avgFps < 45) return "upgrade";
  if (result.absPct >= 8) return "borderline";
  return "ready";
}
function tldrOf(result, gpu, cpu, res, mode) {
  var v = verdictLabelOf(result);
  if (readinessOf(result) === "ready")
    return "Oui, " + gpu.label + " + " + cpu.label + " est prêt pour GTA 6 en " + res + " en " + modeLabel(mode) + ". " + v + ", cible environ " + result.avgFps + " ips en moyenne.";
  if (readinessOf(result) === "borderline")
    return "Limite, " + gpu.label + " + " + cpu.label + " fera tourner GTA 6 en " + res + " en " + modeLabel(mode) + " avec un goulot d'étranglement de " + result.absPct + " % " + (result.verdict === "cpu" ? "CPU" : result.verdict === "gpu" ? "GPU" : "") + " (~" + result.avgFps + " ips). Jouable, mais vous perdrez des images.";
  if (result.verdict === "balanced")
    return "Mise à niveau recommandée, " + gpu.label + " + " + cpu.label + " est équilibré mais lent en " + res + " en " + modeLabel(mode) + " (~" + result.avgFps + " ips). Les deux composants ont besoin de plus de puissance pour des fréquences d'images fluides.";
  return "Mise à niveau recommandée, " + gpu.label + " + " + cpu.label + " montre un goulot d'étranglement de " + result.absPct + " % " + (result.verdict === "cpu" ? "CPU" : "GPU") + " en " + res + " en " + modeLabel(mode) + " (~" + result.avgFps + " ips). Un composant freine l'autre.";
}
function toneOf(result) {
  if (result.verdict === "balanced") return result.avgFps < 45 ? "upgrade" : "ready";
  return result.absPct >= 15 ? "upgrade" : "borderline";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Inconnu " + parsed.bad.map(function (b) { return b === "comparison GPU" ? "GPU de comparaison" : b === "comparison CPU" ? "CPU de comparaison" : b; }).join(" et ") + " dans le lien, donc cette page est revenue à la configuration par défaut. Choisissez vos composants ci-dessous.";
  notice.classList.add("show");
}

function fillSelect(select, parts, value) {
  parts.forEach(function (p) {
    var opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.label;
    select.appendChild(opt);
  });
  select.value = value;
}
var gpuSel = $("[data-gpu-select]");
var cpuSel = $("[data-cpu-select]");
var gpu2Sel = $("[data-gpu2-select]");
var cpu2Sel = $("[data-cpu2-select]");
if (gpuSel) fillSelect(gpuSel, GPUS, state.gpu);
if (cpuSel) fillSelect(cpuSel, CPUS, state.cpu);
if (gpu2Sel) fillSelect(gpu2Sel, GPUS, state.gpu2);
if (cpu2Sel) fillSelect(cpu2Sel, CPUS, state.cpu2);

var resButtons = $all("[data-res-button]");
var modeButtons = $all("[data-mode-button]");
var compareToggle = $("[data-compare-toggle]");
var compareSection = $("[data-compare-section]");
var compareInputs = $("[data-compare-inputs]");

function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, res: state.res, mode: state.mode });
  if (state.compare) { p.set("compare", "1"); p.set("gpu2", state.gpu2); p.set("cpu2", state.cpu2); }
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, res: state.res, mode: state.mode });
  if (state.compare) { p.set("compare", "1"); p.set("gpu2", state.gpu2); p.set("cpu2", state.cpu2); }
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function render() {
  var gpu = findPart(GPUS, state.gpu);
  var cpu = findPart(CPUS, state.cpu);
  var result = computeBalance(gpu, cpu, state.res, state.mode);
  var verdictLabel = verdictLabelOf(result);
  var tone = toneOf(result);
  var readiness = readinessOf(result);

  // Controls reflect state.
  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  resButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.resButton === state.res)); });
  modeButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modeButton === state.mode)); });
  if (compareToggle) compareToggle.setAttribute("aria-pressed", String(state.compare));
  if (compareToggle) compareToggle.querySelector("[data-compare-label]").textContent = state.compare ? "Comparaison activée" : "Comparer un deuxième PC";
  if (compareSection) compareSection.hidden = !state.compare;
  if (compareInputs) compareInputs.hidden = !state.compare;

  // TL;DR card.
  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = readiness;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdict = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    if (label) label.textContent = readiness === "ready" ? "Prêt · En bref" : readiness === "borderline" ? "Limite · En bref" : "Mise à niveau recommandée · En bref";
    if (text) text.textContent = tldrOf(result, gpu, cpu, state.res, state.mode);
    if (verdict) verdict.textContent = verdictLabel;
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  // Output panel.
  var out = $("[data-output-panel]");
  if (out) {
    var kicker = result.verdict === "balanced" ? "Équilibré ±7 %" : result.verdict === "cpu" ? "Limité par le CPU" : "Limité par le GPU";
    var upgrade = !state.compare ? suggestUpgrade(gpu, cpu, state.res, state.mode) : null;
    var upgradeHtml = upgrade
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Plus petite correction</p><p>Remplacez votre ' + (upgrade.kind === "cpu" ? "CPU" : "GPU") + ' par <strong>' + upgrade.part.label + '</strong>, ce qui réduit le goulot de <span class="mono">' + upgrade.fromPct + ' %</span> à <span class="mono">' + upgrade.toPct + ' %</span>.</p></div>'
      : "";
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + kicker + '</p>' +
      '<h3 class="verdict-title">' + verdictLabel + '</h3>' +
      '<p class="verdict-desc">Estimé <strong>' + result.fpsLow + '–' + result.fpsHigh + ' ips</strong> en ' + state.res + ' en ' + modeLabel(state.mode) + '. La plage d\'images suppose le préréglage Élevé sans ray tracing.</p></div></div>' +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Marge GPU</span><span class="val">' + Math.round(result.headGpu * 100) + '%</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + Math.min(100, Math.round(result.headGpu * 100)) + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">Marge CPU</span><span class="val">' + Math.round(result.headCpu * 100) + '%</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + Math.min(100, Math.round(result.headCpu * 100)) + '%"></div></div></div>' +
      '</div>' + upgradeHtml +
      '<dl class="verdict-stats">' +
      '<div><dt>Niveau GPU</dt><dd>' + gpu.score + '/100</dd></div>' +
      '<div><dt>Niveau CPU</dt><dd>' + cpu.score + '/100</dd></div>' +
      '<div><dt>Delta</dt><dd>' + (result.verdict === "balanced" ? "±7%" : result.absPct + "%") + '</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg><span data-copy-verdict-label>Copier le verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " @ " + state.res + " · " + verdictLabel + " sur le calculateur de goulot d'étranglement GTA 6 de ToolWools") + '&url=' + encodeURIComponent(shareUrl()) + '">Partager sur X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " | " + verdictLabel + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Compare section.
  if (state.compare && compareSection) {
    var gpuB = findPart(GPUS, state.gpu2);
    var cpuB = findPart(CPUS, state.cpu2);
    var resultB = computeBalance(gpuB, cpuB, state.res, state.mode);
    var diff = resultB.avgFps - result.avgFps;
    var winner = Math.abs(diff) <= 3 ? "Tie" : diff > 0 ? "B" : "A";
    var cardA = $("[data-compare-card-a]", compareSection);
    var cardB = $("[data-compare-card-b]", compareSection);
    if (cardA) {
      cardA.classList.toggle("winner", winner === "A");
      $("[data-compare-title]", cardA).textContent = "PC A, " + gpu.label + " + " + cpu.label;
      $("[data-compare-verdict]", cardA).textContent = verdictLabelOf(result);
      $("[data-compare-fps]", cardA).innerHTML = "~" + result.fpsLow + "–" + result.fpsHigh + " ips · moy. <strong>" + result.avgFps + "</strong>";
      $("[data-compare-pill]", cardA).hidden = winner !== "A";
    }
    if (cardB) {
      cardB.classList.toggle("winner", winner === "B");
      $("[data-compare-title]", cardB).textContent = "PC B, " + gpuB.label + " + " + cpuB.label;
      $("[data-compare-verdict]", cardB).textContent = verdictLabelOf(resultB);
      $("[data-compare-fps]", cardB).innerHTML = "~" + resultB.fpsLow + "–" + resultB.fpsHigh + " ips · moy. <strong>" + resultB.avgFps + "</strong>";
      $("[data-compare-pill]", cardB).hidden = winner !== "B";
    }
    var summary = $("[data-compare-summary]", compareSection);
    if (summary) {
      var winText = winner === "Tie" ? "Égalité à 3 ips près" : (winner === "A" ? "PC A" : "PC B") + " gagne de " + Math.abs(diff) + " ips";
      summary.innerHTML = "<strong>" + winText + "</strong> en moyenne en " + state.res + " en " + modeLabel(state.mode) + ". PC A : " + (result.verdict === "balanced" ? "équilibre" : result.absPct + " % de goulot " + result.verdict.toUpperCase()) + " ; PC B : " + (resultB.verdict === "balanced" ? "équilibre" : resultB.absPct + " % de goulot " + resultB.verdict.toUpperCase()) + ".";
    }
  }

  // Share panel permalink.
  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  // Screen-reader announcement (same strings as the source live region).
  var live = $("[data-live-region]");
  if (live) {
    live.textContent = state.compare
      ? verdictLabel + ". PC A " + result.avgFps + " ips en moyenne en " + state.res + " en " + modeLabel(state.mode) + ". PC B " + verdictLabelOf(computeBalance(findPart(GPUS, state.gpu2), findPart(CPUS, state.cpu2), state.res, state.mode)) + ", " + computeBalance(findPart(GPUS, state.gpu2), findPart(CPUS, state.cpu2), state.res, state.mode).avgFps + " ips en moyenne."
      : verdictLabel + ". Estimé de " + result.fpsLow + " à " + result.fpsHigh + " images par seconde en " + state.res + " en " + modeLabel(state.mode) + ".";
  }
  syncUrl();
}

function shareText() {
  var gpu = findPart(GPUS, state.gpu);
  var cpu = findPart(CPUS, state.cpu);
  var result = computeBalance(gpu, cpu, state.res, state.mode);
  if (state.compare) {
    var gpuB = findPart(GPUS, state.gpu2);
    var cpuB = findPart(CPUS, state.cpu2);
    var resultB = computeBalance(gpuB, cpuB, state.res, state.mode);
    var diff = resultB.avgFps - result.avgFps;
    var winner = Math.abs(diff) <= 3 ? "Égalité" : diff > 0 ? "PC B" : "PC A";
    return gpu.label + "/" + cpu.label + " vs " + gpuB.label + "/" + cpuB.label + " @ " + state.res + ". Comparaison GTA 6 : " + shareUrl() + " (" + winner + ")";
  }
  return gpu.label + " + " + cpu.label + " @ " + state.res + " · " + modeLabel(state.mode) + " → " + verdictLabelOf(result) + ". Vérification du goulot d'étranglement GTA 6 : " + shareUrl();
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

// Events.
if (gpuSel) gpuSel.addEventListener("change", function () { state.gpu = gpuSel.value; render(); });
if (cpuSel) cpuSel.addEventListener("change", function () { state.cpu = cpuSel.value; render(); });
if (gpu2Sel) gpu2Sel.addEventListener("change", function () { state.gpu2 = gpu2Sel.value; render(); });
if (cpu2Sel) cpu2Sel.addEventListener("change", function () { state.cpu2 = cpu2Sel.value; render(); });
resButtons.forEach(function (b) { b.addEventListener("click", function () { state.res = b.dataset.resButton; render(); }); });
modeButtons.forEach(function (b) { b.addEventListener("click", function () { state.mode = b.dataset.modeButton; render(); }); });
if (compareToggle) compareToggle.addEventListener("click", function () { state.compare = !state.compare; render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
