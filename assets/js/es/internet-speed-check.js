// internet-speed-check.js — Asesor de velocidad de internet de GTA 6 page logic.
// Uses the ported speed engine (assets/js/engines/speed-engine.js).
// State lives in the URL (?region=&connection=&device=&tab=&down=&up=&ping=&jitter=&loss=)
// so graded results are shareable. Defaults match the source route's
// loaderDeps: Europa — Oeste, fibre, PC, 100 down / 10 up / 24 ping / 6 jitter / 0.1 loss.
// When no region is in the URL, the region is guessed from the browser
// language, exactly as the source route does after hydration.
import { gradeConnection, regionTargets, regionById, connectionById, deviceById, guessRegion } from "/assets/js/engines/es/speed-engine.js";

var DEFAULTS = { region: "eu-west", connection: "fibre", device: "pc", tab: "check", down: 100, up: 10, ping: 24, jitter: 6, loss: 0.1 };
var TABS = ["check", "targets", "fixes"];
var NUM_KEYS = ["down", "up", "ping", "jitter", "loss"];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function numParam(raw, fallback) {
  if (raw === null) return fallback;
  var n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function readState() {
  var q = new URLSearchParams(window.location.search);
  var regionRaw = q.get("region");
  var connectionRaw = q.get("connection");
  var deviceRaw = q.get("device");
  var state = {
    region: regionRaw === null ? guessRegion(navigator.language || "") : regionRaw,
    connection: connectionRaw || DEFAULTS.connection,
    device: deviceRaw || DEFAULTS.device,
    tab: TABS.indexOf(q.get("tab")) !== -1 ? q.get("tab") : DEFAULTS.tab,
    down: numParam(q.get("down"), DEFAULTS.down),
    up: numParam(q.get("up"), DEFAULTS.up),
    ping: numParam(q.get("ping"), DEFAULTS.ping),
    jitter: numParam(q.get("jitter"), DEFAULTS.jitter),
    loss: numParam(q.get("loss"), DEFAULTS.loss),
  };
  var bad = [];
  if (!regionById(state.region)) { bad.push("region"); state.region = DEFAULTS.region; }
  if (!connectionById(state.connection)) { bad.push("line type"); state.connection = DEFAULTS.connection; }
  if (!deviceById(state.device)) { bad.push("device"); state.device = DEFAULTS.device; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Desconocido " + parsed.bad.join(" y ") + " en el enlace, así que esta página se restableció a la conexión predeterminada. Elige tus ajustes abajo.";
  notice.classList.add("show");
}

var regionSel = $("[data-region-select]");
var connectionSel = $("[data-connection-select]");
var deviceSel = $("[data-device-select]");
var numInputs = {};
NUM_KEYS.forEach(function (k) { numInputs[k] = $("[data-num-input=\"" + k + "\"]"); });
var tabButtons = $all("[data-tab-button]");
var deviceButtons = $all("[data-device-button]");
var copyLinkBtn = $("[data-copy-link]");

function shareUrl() {
  var p = new URLSearchParams({
    region: state.region,
    connection: state.connection,
    device: state.device,
    down: String(state.down),
    up: String(state.up),
    ping: String(state.ping),
    jitter: String(state.jitter),
    loss: String(state.loss),
  });
  if (state.tab !== "check") p.set("tab", state.tab);
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  window.history.replaceState(null, "", shareUrl().replace(window.location.origin, ""));
}
function shareText(result) {
  return "Nota de conexión GTA 6 " + result.grade + " en " + result.region.label + ": " + result.pingTarget + " ms de objetivo de latencia por cable, " + result.score + "/100. Califica tu conexión en ToolWools.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent("Nota de conexión GTA 6 " + result.grade + " en " + result.region.label + " (" + result.score + "/100)") + "&url=" + encodeURIComponent(shareUrl());
}

function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="icon-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function toneOf(result) {
  if (!result.blocking && result.grade === "A") return "ready";
  if (result.blocking || result.grade === "D" || result.grade === "F") return "upgrade";
  return "borderline";
}
var STATUS_LABEL = { pass: "Pasa", marginal: "Límite", fail: "Falla" };
var CREDIT = { pass: 100, marginal: 55, fail: 8 };
var OP = { ping: "≤", jitter: "≤", loss: "≤", down: "≥", up: "≥" };

function axesHtml(result) {
  return result.axes.map(function (a) {
    return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + CREDIT[a.status] + '%"></span></span><span class="axis-score">' + esc(a.value) + " " + esc(a.unit) + '</span></div>' +
      '<p class="verdict-desc"><span class="axis-status" data-status="' + a.status + '">' + STATUS_LABEL[a.status] + "</span> — Objetivo " + OP[a.id] + " " + esc(a.target) + " " + esc(a.unit) + ". " + esc(a.detail) + "</p></div>";
  }).join("");
}
function targetsHtml(result) {
  return regionTargets(result.connection.id).map(function (t) {
    var pct = Math.min(100, Math.round((t.wiredTarget / 60) * 100));
    var current = t.region.id === result.region.id ? " <strong>(tu región)</strong>" : "";
    return '<div><div class="axis-row"><span class="axis-label">' + esc(t.region.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + pct + '%"></span></span><span class="axis-score">' + t.wiredTarget + " ms</span></div>" +
      '<p class="verdict-desc">' + esc(t.region.edge) + " · jugable hasta unos " + t.playableCeiling + " ms" + current + "</p></div>";
  }).join("");
}
function fixesHtml(result) {
  return result.fixes.map(function (f, i) {
    var n = String(i + 1).padStart(2, "0");
    return '<li><span class="step-number">' + n + '</span><h3 class="step-title">' + esc(f.title) + '</h3><p class="step-text">' + esc(f.body) + '</p><p class="step-text"><strong>Ganancia esperada:</strong> ' + esc(f.gain) + "</p></li>";
  }).join("");
}
function stepsHtml(device) {
  return device.steps.map(function (s, i) {
    var n = String(i + 1).padStart(2, "0");
    return '<li><span class="step-number">' + n + '</span><p class="step-text">' + esc(s) + "</p></li>";
  }).join("");
}

function render() {
  var result = gradeConnection({
    region: state.region,
    connection: state.connection,
    device: state.device,
    down: state.down,
    up: state.up,
    ping: state.ping,
    jitter: state.jitter,
    loss: state.loss,
  });
  var tone = toneOf(result);

  if (regionSel) regionSel.value = state.region;
  if (connectionSel) connectionSel.value = state.connection;
  if (deviceSel) deviceSel.value = state.device;
  NUM_KEYS.forEach(function (k) { if (numInputs[k]) numInputs[k].value = String(state[k]); });
  tabButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tabButton === state.tab)); });
  deviceButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.deviceButton === state.device)); });
  $all("[data-tab-panel]").forEach(function (p) { p.hidden = p.dataset.tabPanel !== state.tab; });

  var regionLabel = $("[data-output-region]");
  if (regionLabel) regionLabel.textContent = result.region.label;
  var deviceName = $("[data-device-name]");
  if (deviceName) deviceName.textContent = result.device.label;

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    if (label) label.textContent = result.headline + " · Resumen";
    if (text) text.textContent = "Nota " + result.grade + " (" + result.score + "/100) en " + result.region.label + " con una línea de " + result.connection.label.toLowerCase() + ": ping de " + state.ping + " ms contra un objetivo de " + result.pingTarget + " ms, con jitter de " + state.jitter + " ms, pérdida de " + state.loss + "%, " + state.down + " Mbps de bajada y " + state.up + " Mbps de subida. " + result.verdict;
    if (verdictEl) verdictEl.textContent = "Nota " + result.grade + " — " + result.score + "/100";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var shortAnswer = $("[data-short-answer]");
  if (shortAnswer) {
    shortAnswer.innerHTML = "El juego en línea de GTA 6 necesita aproximadamente <strong>25 Mbps de bajada y 5 Mbps de subida</strong> para ser cómodo, y funcionará con <strong>10 Mbps de bajada</strong>. Lo que realmente decide si se siente bien es la latencia: en <strong>" + esc(result.region.label) + "</strong> una línea cableada de <strong>" + esc(result.connection.label.toLowerCase()) + "</strong> debería alcanzar aproximadamente <strong>" + result.pingTarget + " ms</strong> hasta <strong>" + esc(result.region.edge) + "</strong>, con jitter por debajo de <strong>10 ms</strong> y pérdida de paquetes por debajo de <strong>0,5%</strong>. Califica tus propios cinco números abajo.";
  }

  var checkPanel = $("[data-tab-panel=\"check\"]");
  if (checkPanel) {
    var worst = result.axes.find(function (a) { return a.status === "fail"; }) || result.axes.find(function (a) { return a.status === "marginal"; });
    var worstText = worst ? worst.label + " (" + STATUS_LABEL[worst.status].toLowerCase() + ")" : "Ninguno — todos los ejes pasan";
    var pingPct = Math.min(100, Math.round((state.ping / 60) * 100));
    checkPanel.innerHTML =
      '<div class="verdict-body">' + iconFor(tone).replace("icon-lg", "verdict-icon tone-" + tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + esc(result.headline) + '</p>' +
      '<h3 class="verdict-title">' + esc(result.grade) + '<span class="unit"> · ' + result.score + '/100</span></h3>' +
      '<p class="verdict-desc">' + esc(result.verdict) + "</p></div></div>" +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Puntuación general</span><span class="val">' + result.score + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + result.score + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">Ping contra objetivo de ' + result.pingTarget + ' ms</span><span class="val">' + esc(state.ping) + ' ms</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + pingPct + '%"></div></div></div>' +
      "</div>" +
      '<div data-axes-list>' + axesHtml(result) + "</div>" +
      '<dl class="stat-grid">' +
      "<div><dt>Nota</dt><dd>" + esc(result.grade) + "</dd></div>" +
      "<div><dt>Score</dt><dd>" + result.score + "/100</dd></div>" +
      "<div><dt>Objetivo de ping cableado</dt><dd>" + result.pingTarget + " ms</dd></div>" +
      "<div><dt>Eje más débil</dt><dd>" + esc(worstText) + "</dd></div>" +
      "</dl>" +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredicto</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en X" href="' + xUrl(result) + '">Compartir en X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en Reddit" href="' + redditUrl(result) + '">Reddit</a>' +
      "</div>";
    var copyBtn = $("[data-copy-verdict]", checkPanel);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(result) + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var targetsPanel = $("[data-tab-panel=\"targets\"]");
  if (targetsPanel) {
    var intro = $(".verdict-desc", targetsPanel);
    if (intro) intro.textContent = "Pisos de latencia sobre " + result.connection.label.toLowerCase() + ". Cambia el tipo de línea para ver la penalización aplicada a cada región a la vez.";
    var list = $("[data-targets-list]", targetsPanel);
    if (list) list.innerHTML = targetsHtml(result);
  }

  var fixesPanel = $("[data-tab-panel=\"fixes\"]");
  if (fixesPanel) {
    var fixList = $("[data-fixes-list]", fixesPanel);
    if (fixList) fixList.innerHTML = fixesHtml(result);
  }

  var deviceTitle = $("[data-device-title]");
  if (deviceTitle) deviceTitle.textContent = "Cómo medir tu conexión en " + result.device.label;
  var steps = $("[data-device-steps]");
  if (steps) steps.innerHTML = stepsHtml(result.device);
  var caveat = $("[data-device-caveat]");
  if (caveat) caveat.innerHTML = "<strong>Advertencia para este dispositivo:</strong> " + esc(result.device.caveat);

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = $("[data-share-x]");
  if (xLink) xLink.href = xUrl(result);
  var redditLink = $("[data-share-reddit]");
  if (redditLink) redditLink.href = redditUrl(result);

  var live = $("[data-live-region]");
  if (live) live.textContent = "Nota " + result.grade + ", " + result.score + " de 100. " + result.headline + ". " + result.verdict;
  syncUrl();
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
    try { document.execCommand("copy"); done("¡Copiado!"); } catch (e) { done("No se pudo copiar"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("¡Copiado!"); }, fallback);
  } else {
    fallback();
  }
}

if (regionSel) regionSel.addEventListener("change", function () { state.region = regionSel.value; render(); });
if (connectionSel) connectionSel.addEventListener("change", function () { state.connection = connectionSel.value; render(); });
if (deviceSel) deviceSel.addEventListener("change", function () { state.device = deviceSel.value; render(); });
NUM_KEYS.forEach(function (k) {
  var input = numInputs[k];
  if (!input) return;
  input.addEventListener("change", function () {
    var n = Number(input.value);
    state[k] = Number.isFinite(n) && n >= 0 ? n : DEFAULTS[k];
    render();
  });
});
tabButtons.forEach(function (b) { b.addEventListener("click", function () { state.tab = b.dataset.tabButton; render(); }); });
deviceButtons.forEach(function (b) { b.addEventListener("click", function () { state.device = b.dataset.deviceButton; render(); }); });
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
