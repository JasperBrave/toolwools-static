// internet-speed-check.js — GTA 6 Internet Speed Advisor page logic.
// Uses the ported speed engine (assets/js/engines/speed-engine.js).
// State lives in the URL (?region=&connection=&device=&tab=&down=&up=&ping=&jitter=&loss=)
// so graded results are shareable. Defaults match the source route's
// loaderDeps: Europe — West, fibre, PC, 100 down / 10 up / 24 ping / 6 jitter / 0.1 loss.
// When no region is in the URL, the region is guessed from the browser
// language, exactly as the source route does after hydration.
import { gradeConnection, regionTargets, regionById, connectionById, deviceById, guessRegion } from "../engines/tr/speed-engine.js";

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
  if (!regionById(state.region)) { bad.push("bölge"); state.region = DEFAULTS.region; }
  if (!connectionById(state.connection)) { bad.push("hat türü"); state.connection = DEFAULTS.connection; }
  if (!deviceById(state.device)) { bad.push("cihaz"); state.device = DEFAULTS.device; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Bağlantıdaki bilinmeyen " + parsed.bad.join(" ve ") + ", bu sayfa varsayılan bağlantıya sıfırlandı. Ayarlarınızı aşağıdan seçin.";
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
  return result.region.label + " bölgesinde GTA 6 bağlantı notu " + result.grade + ": kablolu gecikme hedefi " + result.pingTarget + " ms, " + result.score + "/100. Bağlantınızı ToolWools'ta notlandırın.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent(result.region.label + " bölgesinde GTA 6 bağlantı notu " + result.grade + " (" + result.score + "/100)") + "&url=" + encodeURIComponent(shareUrl());
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
var STATUS_LABEL = { pass: "Geçti", marginal: "Sınırda", fail: "Kaldı" };
var CREDIT = { pass: 100, marginal: 55, fail: 8 };
var OP = { ping: "≤", jitter: "≤", loss: "≤", down: "≥", up: "≥" };

function axesHtml(result) {
  return result.axes.map(function (a) {
    return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + CREDIT[a.status] + '%"></span></span><span class="axis-score">' + esc(a.value) + " " + esc(a.unit) + '</span></div>' +
      '<p class="verdict-desc"><span class="axis-status" data-status="' + a.status + '">' + STATUS_LABEL[a.status] + "</span> — Hedef " + OP[a.id] + " " + esc(a.target) + " " + esc(a.unit) + ". " + esc(a.detail) + "</p></div>";
  }).join("");
}
function targetsHtml(result) {
  return regionTargets(result.connection.id).map(function (t) {
    var pct = Math.min(100, Math.round((t.wiredTarget / 60) * 100));
    var current = t.region.id === result.region.id ? " <strong>(bölgeniz)</strong>" : "";
    return '<div><div class="axis-row"><span class="axis-label">' + esc(t.region.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + pct + '%"></span></span><span class="axis-score">' + t.wiredTarget + " ms</span></div>" +
      '<p class="verdict-desc">' + esc(t.region.edge) + " · yaklaşık " + t.playableCeiling + " ms'ye kadar oynanabilir" + current + "</p></div>";
  }).join("");
}
function fixesHtml(result) {
  return result.fixes.map(function (f, i) {
    var n = String(i + 1).padStart(2, "0");
    return '<li><span class="step-number">' + n + '</span><h3 class="step-title">' + esc(f.title) + '</h3><p class="step-text">' + esc(f.body) + '</p><p class="step-text"><strong>Beklenen kazanç:</strong> ' + esc(f.gain) + "</p></li>";
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
    if (label) label.textContent = result.headline + " · Özet";
    if (text) text.textContent = result.region.label + " bölgesinde, " + result.connection.label.toLowerCase() + " hat üzerinde not " + result.grade + " (" + result.score + "/100): ping " + state.ping + " ms, hedef " + result.pingTarget + " ms; jitter " + state.jitter + " ms, kayıp %" + state.loss + ", indirme " + state.down + " Mbps, yükleme " + state.up + " Mbps. " + result.verdict;
    if (verdictEl) verdictEl.textContent = "Not " + result.grade + " — " + result.score + "/100";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var shortAnswer = $("[data-short-answer]");
  if (shortAnswer) {
    shortAnswer.innerHTML = "GTA 6 çevrimiçi oyunu rahat oynamak için yaklaşık <strong>25 Mbps indirme ve 5 Mbps yükleme</strong> ister ve <strong>10 Mbps indirme</strong> ile çalışır. Asıl belirleyici gecikmedir: <strong>" + esc(result.region.label) + "</strong> bölgesinde kablolu bir <strong>" + esc(result.connection.label.toLowerCase()) + "</strong> hattın <strong>" + esc(result.region.edge) + "</strong> noktasına yaklaşık <strong>" + result.pingTarget + " ms</strong> ile ulaşması gerekir; jitter <strong>10 ms</strong> altında ve paket kaybı <strong>%0,5</strong> altında olmalı. Kendi beş değerinizi aşağıda notlandırın.";
  }

  var checkPanel = $("[data-tab-panel=\"check\"]");
  if (checkPanel) {
    var worst = result.axes.find(function (a) { return a.status === "fail"; }) || result.axes.find(function (a) { return a.status === "marginal"; });
    var worstText = worst ? worst.label + " (" + STATUS_LABEL[worst.status].toLowerCase() + ")" : "Yok — tüm eksenler geçti";
    var pingPct = Math.min(100, Math.round((state.ping / 60) * 100));
    checkPanel.innerHTML =
      '<div class="verdict-body">' + iconFor(tone).replace("icon-lg", "verdict-icon tone-" + tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + esc(result.headline) + '</p>' +
      '<h3 class="verdict-title">' + esc(result.grade) + '<span class="unit"> · ' + result.score + '/100</span></h3>' +
      '<p class="verdict-desc">' + esc(result.verdict) + "</p></div></div>" +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Genel puan</span><span class="val">' + result.score + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + result.score + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">Ping: ' + result.pingTarget + ' ms hedefi</span><span class="val">' + esc(state.ping) + ' ms</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + pingPct + '%"></div></div></div>' +
      "</div>" +
      '<div data-axes-list>' + axesHtml(result) + "</div>" +
      '<dl class="stat-grid">' +
      "<div><dt>Not</dt><dd>" + esc(result.grade) + "</dd></div>" +
      "<div><dt>Puan</dt><dd>" + result.score + "/100</dd></div>" +
      "<div><dt>Kablolu ping hedefi</dt><dd>" + result.pingTarget + " ms</dd></div>" +
      "<div><dt>En zayıf eksen</dt><dd>" + esc(worstText) + "</dd></div>" +
      "</dl>" +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı X\'te paylaş" href="' + xUrl(result) + '">X\'te paylaş</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı Reddit\'te paylaş" href="' + redditUrl(result) + '">Reddit</a>' +
      "</div>";
    var copyBtn = $("[data-copy-verdict]", checkPanel);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(result) + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var targetsPanel = $("[data-tab-panel=\"targets\"]");
  if (targetsPanel) {
    var intro = $(".verdict-desc", targetsPanel);
    if (intro) intro.textContent = result.connection.label.toLowerCase() + " hattında gecikme tabanları. Her bölgeye uygulanan cezayı aynı anda görmek için hat türünü değiştirin.";
    var list = $("[data-targets-list]", targetsPanel);
    if (list) list.innerHTML = targetsHtml(result);
  }

  var fixesPanel = $("[data-tab-panel=\"fixes\"]");
  if (fixesPanel) {
    var fixList = $("[data-fixes-list]", fixesPanel);
    if (fixList) fixList.innerHTML = fixesHtml(result);
  }

  var deviceTitle = $("[data-device-title]");
  if (deviceTitle) deviceTitle.textContent = result.device.label + " üzerinde bağlantınızı nasıl ölçersiniz";
  var steps = $("[data-device-steps]");
  if (steps) steps.innerHTML = stepsHtml(result.device);
  var caveat = $("[data-device-caveat]");
  if (caveat) caveat.innerHTML = "<strong>Bu cihaz için uyarı:</strong> " + esc(result.device.caveat);

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = $("[data-share-x]");
  if (xLink) xLink.href = xUrl(result);
  var redditLink = $("[data-share-reddit]");
  if (redditLink) redditLink.href = redditUrl(result);

  var live = $("[data-live-region]");
  if (live) live.textContent = "Not " + result.grade + ", 100 üzerinden " + result.score + ". " + result.headline + ". " + result.verdict;
  syncUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Kopyala";
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
    try { document.execCommand("copy"); done("Kopyalandı!"); } catch (e) { done("Kopyalama başarısız"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Kopyalandı!"); }, fallback);
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
