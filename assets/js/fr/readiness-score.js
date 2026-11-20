// readiness-score.js — GTA 6 Readiness Score page logic.
// Uses the ported readiness engine (assets/js/engines/readiness-engine.js).
// AUDIT FIX H2 (pass 2A): the install-size reference is 212 GB (was 150 GB); full
// network marks at 111 Mbps now mean about 4.2 h for a 212 GB install.
// AUDIT FIX M15: projected figures are shown rounded, and the
// "projected, not datamined" label sits next to the results.
// State lives in the URL (?gpu=&cpu=&ram=&storage=&drive=&mbps=).
import { estimateReadiness as estimateReadinessEn, DRIVE_META } from "../engines/fr/readiness-engine.js";

var GRADE_LABEL = { S: "Sans accroc le jour du lancement", A: "Prêt Ultra", B: "Prêt confortablement", C: "Jouable, prévoyez des ajustements", D: "Sous les specs, mettez à niveau d'abord", F: "Pas prêt" };
var VERDICT = { S: "Tout suffit avec de la marge. Vous jouerez le jour du lancement avec les réglages maximum.", A: "Prêt aujourd'hui, vous n'ajusterez qu'un ou deux réglages le jour du lancement.", B: "Prêt. Un sous-score est en retard, mais rien ne bloque un lancement sans accroc.", C: "Jouable, mais choisissez une échelle résolution/préréglage adaptée à votre maillon le plus faible.", D: "Sous la limite inférieure pratique. Corrigez votre score le plus faible avant le préchargement.", F: "Pas prêt. Vous n'aurez pas un lancement sans accroc tant que vous n'aurez pas mis à niveau." };
var DRIVE_LABEL = { nvme: "SSD NVMe", ssd: "SSD SATA", hdd: "Disque dur (mécanique)" };
function driveLabel(k) { return DRIVE_LABEL[k] || DRIVE_META[k].label; }
function mapPerf(d) { var m = d.match(/([\d.]+) avg fps · ([\d.]+) 1% low at (\S+) High native\./); return m ? m[1] + " ips en moyenne · " + m[2] + " 1 % faible en " + m[3] + " Élevé natif." : d; }
function mapVram(d) { var m = d.match(/([\d.]+) GB card, needs ([\d.]+) GB — short by ([\d.]+) GB\./); if (m) return "Carte de " + m[1] + " Go, besoin de " + m[2] + " Go, il manque " + m[3] + " Go."; m = d.match(/([\d.]+) GB card clears the ([\d.]+) GB estimated need\./); return m ? "Carte de " + m[1] + " Go, couvre le besoin estimé de " + m[2] + " Go." : d; }
function mapStorage(d) { var m = d.match(/([\d.]+) GB free on an HDD — modern open worlds stream from SSD; expect pop-in\./); if (m) return m[1] + " Go libres sur un disque dur, les mondes ouverts modernes streament depuis un SSD ; attendez-vous à du pop-in."; m = d.match(/([\d.]+) GB free on (.+)\. Target: 212 GB\./); return m ? m[1] + " Go libres sur " + m[2] + ". Objectif : 212 Go." : d; }
function mapNetwork(d) { var m = d.match(/([\d.]+) Mbps down — installs 212 GB in ~(.+)\./); if (!m) return d; var h = m[2] === "very long" ? "très longtemps" : m[2]; return m[1] + " Mbps en téléchargement, installe 212 Go en ~" + h + "."; }
function estimateReadiness(input) { var r = estimateReadinessEn(input); r.gradeLabel = GRADE_LABEL[r.grade] || r.gradeLabel; r.verdict = VERDICT[r.grade] || r.verdict; r.performance.detail = mapPerf(r.performance.detail); r.vram.detail = mapVram(r.vram.detail); r.storage.detail = mapStorage(r.storage.detail); r.network.detail = mapNetwork(r.network.detail); return r; }
import { GPUS, CPUS } from "../engines/fr/fps-engine.js";

var DEFAULTS = { gpu: "rtx-3060", cpu: "r5-5600x", ram: 16, storage: 500, drive: "ssd", mbps: 150 };
var RAM_LIST = [8, 16, 32, 64];
var DRIVE_LIST = ["nvme", "ssd", "hdd"];
var WEAKEST_LINK = {
  performance: { label: "Ouvrir le calculateur de FPS", href: "/fr/tools/fps-calculator" },
  vram: { label: "Ouvrir le vérificateur de VRAM", href: "/fr/tools/vram-calculator" },
  storage: { label: "Ouvrir le planificateur de stockage", href: "/fr/tools/storage-planner" },
  network: { label: "Ouvrir le calculateur de temps de téléchargement", href: "/fr/tools/download-time" },
};
var SUB_LABEL = { performance: "Performance", vram: "VRAM", storage: "Stockage", network: "Réseau" };

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function findPart(list, id) { return list.find(function (p) { return p.id === id; }); }

function clampNum(v, min, max, fallback) {
  if (v === null || v === undefined || v === "") return fallback;
  var n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function readState() {
  var q = new URLSearchParams(window.location.search);
  var state = {
    gpu: q.get("gpu") || DEFAULTS.gpu,
    cpu: q.get("cpu") || DEFAULTS.cpu,
    ram: RAM_LIST.indexOf(Number(q.get("ram"))) !== -1 ? Number(q.get("ram")) : DEFAULTS.ram,
    storage: clampNum(q.get("storage"), 0, 20000, DEFAULTS.storage),
    drive: DRIVE_LIST.indexOf(q.get("drive")) !== -1 ? q.get("drive") : DEFAULTS.drive,
    mbps: clampNum(q.get("mbps"), 0, 10000, DEFAULTS.mbps),
  };
  var bad = [];
  if (!findPart(GPUS, state.gpu)) { bad.push("GPU"); state.gpu = DEFAULTS.gpu; }
  if (!findPart(CPUS, state.cpu)) { bad.push("CPU"); state.cpu = DEFAULTS.cpu; }
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
var ramButtons = $all("[data-ram-button]");
var storageInput = $("[data-storage-input]");
var driveButtons = $all("[data-drive-button]");
var mbpsInput = $("[data-mbps-input]");
if (gpuSel) fillSelect(gpuSel, GPUS, state.gpu);
if (cpuSel) fillSelect(cpuSel, CPUS, state.cpu);
if (storageInput) storageInput.value = String(state.storage);
if (mbpsInput) mbpsInput.value = String(state.mbps);

function inputFor() {
  return {
    gpu: findPart(GPUS, state.gpu),
    cpu: findPart(CPUS, state.cpu),
    ram: state.ram,
    freeStorageGB: Math.max(0, state.storage),
    driveType: state.drive,
    internetMbps: Math.max(0, state.mbps),
  };
}
function shareUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), storage: String(state.storage), drive: state.drive, mbps: String(state.mbps) });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ gpu: state.gpu, cpu: state.cpu, ram: String(state.ram), storage: String(state.storage), drive: state.drive, mbps: String(state.mbps) });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function toneOf(grade) {
  return grade === "S" || grade === "A" ? "ready" : grade === "B" || grade === "C" ? "borderline" : "upgrade";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function dialColor(tone) {
  return tone === "ready" ? "var(--accent-blue)" : tone === "borderline" ? "var(--amber)" : "var(--accent-pink)";
}

function render() {
  var input = inputFor();
  var result = estimateReadiness(input);
  var tone = toneOf(result.grade);
  var gpu = input.gpu;
  var cpu = input.cpu;

  if (gpuSel) gpuSel.value = state.gpu;
  if (cpuSel) cpuSel.value = state.cpu;
  if (storageInput && document.activeElement !== storageInput) storageInput.value = String(state.storage);
  if (mbpsInput && document.activeElement !== mbpsInput) mbpsInput.value = String(state.mbps);
  ramButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.ramButton) === state.ram)); });
  driveButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.driveButton === state.drive)); });

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = gpu.label + " + " + cpu.label + " avec " + state.ram + " Go de RAM, " + state.storage + " Go libres sur " + driveLabel(state.drive) + " et " + state.mbps + " Mbps en téléchargement obtient " + result.score + "/100 (note " + result.grade + "). " + result.verdict + " Maillon le plus faible : " + SUB_LABEL[result.weakest] + ".";
    if (label) label.textContent = "Note " + result.grade + " · " + result.gradeLabel;
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = "Note " + result.grade + " | " + result.score + "/100";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var sub = function (key, weight, cls) {
      var s = result[key];
      var rounded = Math.round(s.score);
      var pct = Math.max(0, Math.min(100, rounded));
      return '<div><div class="balance-bar-head"><span class="lbl">' + SUB_LABEL[key] + ' · ' + weight + '</span><span class="val">' + rounded + '/100</span></div><div class="balance-bar-track"><div class="balance-bar-fill ' + cls + '" style="width:' + pct + '%"></div></div><p class="field-hint">' + s.detail + '</p></div>';
    };
    var circ = 2 * Math.PI * 52;
    var dash = (result.score / 100) * circ;
    var weakest = WEAKEST_LINK[result.weakest];
    var fixBox = result.score >= 100
      ? '<div class="upgrade-box"><p class="eyebrow-muted">Corrigez ceci d\'abord</p><p>Aucun maillon faible. Chaque sous-score est au maximum.</p></div>'
      : '<div class="upgrade-box"><p class="eyebrow-muted">Corrigez ceci d\'abord</p><p>Votre sous-score le plus faible est <strong>' + SUB_LABEL[result.weakest] + '</strong> (' + Math.round(result[result.weakest].score) + '/100). Approfondissez-le avec le calculateur dédié.</p><p><a href="' + weakest.href + '">' + weakest.label + ' →</a></p></div>';
    out.innerHTML =
      '<div style="text-align:center">' +
      '<div class="score-dial" role="img" aria-label="Score de préparation ' + result.score + ' sur 100, note ' + result.grade + '">' +
      '<svg viewBox="0 0 120 120" aria-hidden="true"><circle cx="60" cy="60" r="52" fill="none" stroke="var(--muted)" stroke-width="9"/><circle cx="60" cy="60" r="52" fill="none" stroke="' + dialColor(tone) + '" stroke-width="9" stroke-linecap="round" stroke-dasharray="' + dash.toFixed(1) + ' ' + circ.toFixed(1) + '"/></svg>' +
      '<div class="score-dial-center"><div><div class="big">' + result.score + '</div><div class="small">/ 100 · Note ' + result.grade + '</div></div></div>' +
      '</div>' +
      '<p class="verdict-kicker tone-' + tone + '" style="margin-top:0.75rem">Note ' + result.grade + ' · ' + result.gradeLabel + '</p>' +
      '<p class="verdict-desc" style="max-width:24rem;margin-inline:auto">' + result.verdict + '</p>' +
      '<p class="field-hint">Projeté, pas dataminé : les quatre sous-scores sont des estimations de modèle, pas des données de lancement mesurées.</p>' +
      '</div>' +
      '<div class="balance-bars">' +
      sub("performance", "55%", "blue") +
      sub("vram", "20%", "pink") +
      sub("storage", "15%", "purple") +
      sub("network", "10%", "cyan") +
      '</div>' + fixBox +
      '<dl class="stat-grid">' +
      '<div><dt>Performance</dt><dd>' + Math.round(result.performance.score) + '/100</dd></div>' +
      '<div><dt>VRAM</dt><dd>' + Math.round(result.vram.score) + '/100</dd></div>' +
      '<div><dt>Stockage</dt><dd>' + Math.round(result.storage.score) + '/100</dd></div>' +
      '<div><dt>Réseau</dt><dd>' + Math.round(result.network.score) + '/100</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(gpu.label + " + " + cpu.label + " · Préparation GTA 6 " + result.score + "/100, note " + result.grade) + '&url=' + encodeURIComponent(shareUrl()) + '">Partager sur X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(gpu.label + " + " + cpu.label + " | Préparation GTA 6 " + result.score + "/100 (note " + result.grade + ')') + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Grade ladder highlights the live grade.
  var ladderRows = $all("[data-grade-row]");
  ladderRows.forEach(function (row) {
    var active = row.dataset.gradeRow === result.grade;
    row.classList.toggle("hl-row", active);
    var mark = row.querySelector("[data-grade-you]");
    if (mark) mark.hidden = !active;
  });

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Score de préparation " + result.score + " sur 100, note " + result.grade + ". " + result.gradeLabel + ". Maillon le plus faible : " + SUB_LABEL[result.weakest] + ".";
  syncUrl();
}

function shareText() {
  var input = inputFor();
  var result = estimateReadiness(input);
  return input.gpu.label + " + " + input.cpu.label + " · Préparation GTA 6 " + result.score + "/100, note " + result.grade + ". Vérifiez votre PC : " + shareUrl();
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
ramButtons.forEach(function (b) { b.addEventListener("click", function () { state.ram = Number(b.dataset.ramButton); render(); }); });
driveButtons.forEach(function (b) { b.addEventListener("click", function () { state.drive = b.dataset.driveButton; render(); }); });
if (storageInput) storageInput.addEventListener("change", function () { state.storage = clampNum(storageInput.value, 0, 20000, DEFAULTS.storage); render(); });
if (mbpsInput) mbpsInput.addEventListener("change", function () { state.mbps = clampNum(mbpsInput.value, 0, 10000, DEFAULTS.mbps); render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
