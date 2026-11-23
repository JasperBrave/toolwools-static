// internet-speed-check.js — GTA 6 Internet Speed Advisor page logic.
// Uses the ported speed engine (assets/js/engines/speed-engine.js).
// State lives in the URL (?region=&connection=&device=&tab=&down=&up=&ping=&jitter=&loss=)
// so graded results are shareable. Defaults match the source route's
// loaderDeps: Europe — West, fibre, PC, 100 down / 10 up / 24 ping / 6 jitter / 0.1 loss.
// When no region is in the URL, the region is guessed from the browser
// language, exactly as the source route does after hydration.
import { gradeConnection as gradeConnectionEn, regionTargets as regionTargetsEn, regionById, connectionById, deviceById, guessRegion } from "../engines/de/speed-engine.js";

var REGION_LABEL = { "na-east": "Nordamerika · Ost", "na-west": "Nordamerika · West", "eu-west": "Europa · West", "eu-central": "Europa · Mitte und Ost", "uk": "Vereinigtes Königreich und Irland", "latam": "Lateinamerika", "mena": "Naher Osten und Nordafrika", "india": "Indien und Südasien", "sea": "Südostasien", "anz": "Australien und Neuseeland", "japan": "Japan und Korea" };
var REGION_EDGE = { "na-east": "Ashburn / New York", "na-west": "Los Angeles / Seattle", "eu-west": "Amsterdam / Paris", "eu-central": "Frankfurt / Warschau", "uk": "London", "latam": "São Paulo / Santiago", "mena": "Dubai / Bahrain", "india": "Mumbai / Chennai", "sea": "Singapur", "anz": "Sydney", "japan": "Tokio / Seoul" };
var CONN_LABEL = { fibre: "Glasfaser bis ins Haus (FTTP)", cable: "Kabel / Koax (DOCSIS)", dsl: "DSL / VDSL / FTTC", "fixed-5g": "5G-Heim-Breitband", hotspot: "Handy-Hotspot / mobile Daten", satellite: "Satellit (LEO oder geostationär)" };
function connLower(c) { return CONN_LABEL[c.id] || c.label; }
var CONN_NOTE = { hotspot: "Für Downloads brauchbar, für Lobbys feindlich. Erwarte NAT-Probleme zusätzlich zum Jitter.", satellite: "LEO ist bei etwa 50 ms zusätzlich spielbar; geostationär ist es nicht, bei etwa 600 ms Round-Trip." };
var DEVICE_LABEL = { pc: "PC (Windows)", ps5: "PlayStation 5", xbox: "Xbox Series X|S", cloud: "Cloud / Handheld-Streaming" };
var DEVICE_STEPS = { pc: ["Stecke wenn möglich ein Ethernet-Kabel ein, dann schließe Steam, Rockstar Launcher, Browser und alles, was synchronisiert.", "Führe einen Browser-Speed-Test auf einem Server in deiner eigenen Region aus und notiere Download, Upload und Ping.", "Öffne die Eingabeaufforderung und führe ping -n 50 1.1.1.1 aus, lies den Durchschnitt für Latenz und die Max-minus-Min-Spanne als deinen Jitter.", "Lies in derselben Ausgabe den Verlust-Prozentsatz. Alles über 0 % auf einer Wired-Leitung ist ein Fehler, kein Rauschen.", "Wiederhole einmal am Abend-Peak. Die Peak-Zahl entscheidet, ob sich GTA Online gut anfühlt."], ps5: ["Einstellungen → Netzwerk → Verbindungsstatus → Internetverbindung testen.", "Notiere Download, Upload und NAT-Typ. NAT-Typ 1 oder 2 ist in Ordnung; Typ 3 verursacht Matchmaking-Fehler.", "Die Konsole meldet weder Jitter noch Verlust, nimm diese von einem PC oder Handy im selben Netzwerk.", "Wenn du über WLAN spielst, notiere das Band: nur 5 GHz oder 6 GHz, nie 2,4 GHz für Online-Play."], xbox: ["Einstellungen → Allgemein → Netzwerkeinstellungen → Netzwerkgeschwindigkeit und -statistiken testen.", "Lies Download, Upload, Latenz, Paketverlust und WLAN-Stärke, Xbox meldet alles davon.", "Prüfe die NAT-Zeile auf demselben Bildschirm: Open ist, was du willst, Strict bricht Invites.", "Führe ihn einmal mit einem Kabel erneut aus, wenn die WLAN-Zahl enttäuscht. Dieser eine Test beendet die meisten Lag-Diskussionen."], cloud: ["Teste auf dem genauen Gerät und Netzwerk, von dem du streamen wirst, nicht auf dem Desktop daneben.", "Notiere zuerst Ping und Jitter, Streaming scheitert lange vor Bandbreite an Latenz.", "Bestätige anhaltenden Download von mindestens 25 Mbps für 1080p60 und 40 Mbps für 4K.", "Achte auf eine steigende Jitter-Zahl über einen fünfminütigen Stream; das ist ein WLAN-Problem, kein ISP-Problem."] };
var DEVICE_CAVEAT = { pc: "Windows meldet den Weg zu einem öffentlichen DNS-Resolver, nicht zu einer Rockstar-Lobby, also behandle die Zahl als Untergrenze, nicht als exakte Übereinstimmung.", ps5: "Der PS5-Test misst gegen Sonys Server und liest konsequent niedriger als der echte Game-Durchsatz.", xbox: "Xbox ist die einzige Plattform, die Verlust und Latenz nativ meldet, was sie zum besten Messgerät im Haus macht.", cloud: "Streaming fügt Encode- und Decode-Latenz zur Netzwerk-Latenz hinzu, also ist ein guter Netzwerk-Score nötig, aber nicht ausreichend." };
var AXIS_LABEL_DE = { ping: "Latenz bis zu deinem Regions-Edge", jitter: "Jitter (Latenz-Stabilität)", loss: "Paketverlust", down: "Download-Geschwindigkeit", up: "Upload-Geschwindigkeit" };
var HEADLINE_DE = { ready: "Bereit für GTA 6 und GTA Online", work: "Vor dem Launch noch Arbeit nötig", weak: "Gut genug, mit einer schwachen Achse" };
function mapRegion(r) { return { id: r.id, label: REGION_LABEL[r.id] || r.label, edge: REGION_EDGE[r.id] || r.edge, baselinePing: r.baselinePing, note: r.note }; }
function mapConn(c) { return { id: c.id, label: CONN_LABEL[c.id] || c.label, addedPing: c.addedPing, typicalJitter: c.typicalJitter, typicalLoss: c.typicalLoss, note: CONN_NOTE[c.id] || c.note }; }
function mapDevice(d) { return { id: d.id, label: DEVICE_LABEL[d.id] || d.label, steps: DEVICE_STEPS[d.id] || d.steps, caveat: DEVICE_CAVEAT[d.id] || d.caveat }; }
function gradeConnection(input) { var r = gradeConnectionEn(input); var region = mapRegion(r.region); var conn = mapConn(r.connection); var device = mapDevice(r.device); var axes = r.axes.map(function (a) { return mapAxis(a, region, conn); }); var worst = axes.find(function (a) { return a.status === "fail"; }) || axes.find(function (a) { return a.status === "marginal"; }) || null; var headline = !worst ? HEADLINE_DE.ready : r.blocking ? HEADLINE_DE.work : HEADLINE_DE.weak; var verdict = !worst ? "Deine Verbindung erfüllt jedes Ziel für " + region.label + ". Nichts hier wird GTA 6 bremsen." : r.blocking ? worst.label + " ist der Blocker. Fixe das zuerst, die anderen Zahlen zählen kaum, bis es frei ist." : "Überall spielbar, mit " + AXIS_LABEL_DE[worst.id] + " knapp außerhalb des komfortablen Bands."; return { region: region, connection: conn, device: device, pingTarget: r.pingTarget, axes: axes, score: r.score, grade: r.grade, verdict: verdict, headline: headline, fixes: r.fixes.map(function (f) { return mapFix(f, device, conn); }), blocking: r.blocking }; }
function regionTargets(connection) { return regionTargetsEn(connection).map(function (t) { return { region: mapRegion(t.region), wiredTarget: t.wiredTarget, playableCeiling: t.playableCeiling, note: t.region.note }; }); }

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
  notice.textContent = "Unbekannte " + parsed.bad.map(function (b) { return b === "region" ? "Region" : b === "line type" ? "Leitungstyp" : "Gerät"; }).join(" und ") + " im Link, also hat diese Seite auf die Standard-Verbindung zurückgesetzt. Wähle unten deine Einstellungen.";
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
  return "GTA-6-Verbindungs-Note " + result.grade + " in " + result.region.label + ": " + result.pingTarget + " ms Wired-Latenz-Ziel, " + result.score + "/100. Bewerte deine Verbindung auf ToolWools.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent("GTA-6-Verbindungs-Note " + result.grade + " in " + result.region.label + " (" + result.score + "/100)") + "&url=" + encodeURIComponent(shareUrl());
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
var STATUS_LABEL = { pass: "Bestanden", marginal: "Grenzwertig", fail: "Nicht bestanden" };
function mapAxis(a, region, conn) {
  var d;
  if (a.id === "ping") {
    if (a.value <= 0) d = "Gib eine gemessene Latenz ein. Eine Wired-Leitung in " + region.label + " nach " + region.edge + " sollte etwa " + a.target + " ms erreichen.";
    else if (a.status === "pass") d = "Am oder nahe dem " + a.target + "-ms-Floor für " + region.edge + " über " + connLower(conn) + ".";
    else if (a.status === "marginal") d = "Spielbar, aber etwa " + Math.round(a.value - a.target) + " ms über dem " + a.target + "-ms-Floor für " + region.edge + ".";
    else d = "Deutlich über dem " + a.target + "-ms-Floor für " + region.edge + ", erwarte Rubber-Banding in vollen Lobbys.";
  } else if (a.id === "jitter") {
    if (a.status === "pass") d = "Stabil genug, dass der Netcode dein nächstes Paket vorhersagen kann.";
    else if (a.status === "marginal") d = "Über dem 10-ms-Ziel. Typisch für " + connLower(conn) + ", am Router behebbar.";
    else d = "Das ist die Zahl, die Shootouts unfair wirken lässt. Fixe sie, bevor du rohe Geschwindigkeit jagst.";
  } else if (a.id === "loss") {
    if (a.status === "pass") d = "Verlust liegt in dem Bereich, den das Spiel mit Interpolation verstecken kann.";
    else if (a.status === "marginal") d = "Gelegentlich teleportierende Fahrzeuge und verzögerte Hit-Registrierung.";
    else d = "So hoher Verlust verursacht Disconnects und fehlgeschlagene Session-Joins, nicht nur Lag.";
  } else if (a.id === "down") {
    if (a.status === "pass") d = "Komfortabel für Online-Play plus Hintergrund-Patching.";
    else if (a.status === "marginal") d = "Reicht zum Spielen, knapp am Patch-Day. 25 Mbps ist die komfortable Linie.";
    else d = "Unter dem 10-Mbps-Floor, Asset-Streaming in eine volle Session wird stottern.";
  } else {
    if (a.status === "pass") d = "Genug Headroom, um eine Session zu hosten und gleichzeitig Voice-Chat zu nutzen.";
    else if (a.status === "marginal") d = "Als Client in Ordnung, dünn, wenn Matchmaking dich zum Session-Host macht.";
    else d = "Zu niedrig zum Hosten, und Voice-Chat kollidiert mit dem Game-Traffic.";
  }
  return { id: a.id, label: AXIS_LABEL_DE[a.id] || a.label, value: a.value, unit: a.unit, target: a.target, status: a.status, detail: d };
}
function mapFix(f, device, conn) {
  if (f.title === "Run a cable to the console or PC") return { title: "Ziehe ein Kabel zur Konsole oder zum PC", body: "WLAN ist die größte einzelne Quelle für Jitter und Verlust in einem Heimnetzwerk, und es wird genau dann schlechter, wenn das Haus voll wird. Ein flaches Cat-6-Kabel unter einem Türrahmen kostet weniger als einen Monat des Services, für den du ohnehin schon zahlst.", gain: "Typischerweise 10–25 ms Latenz und der meiste Jitter" };
  if (f.title === "Move to 5 GHz or 6 GHz if you must stay wireless") return { title: "Wechsle auf 5 GHz oder 6 GHz, wenn du drahtlos bleiben musst", body: "Das 2,4-GHz-Band wird mit jeder Mikrowelle, Türklingel und jedem Nachbarn auf deiner Straße geteilt. Trenne die SSIDs an deinem Router, damit das Gaming-Gerät nicht still auf das langsame Band zurückfallen kann.", gain: "Halbiert den Jitter auf einem überlasteten Band" };
  if (f.title === "Enable QoS or Smart Queue on the router") return { title: "Aktiviere QoS oder Smart Queue am Router", body: "Bufferbloat ist der Grund, warum dein Ping sich verdreifacht, sobald jemand einen 4K-Stream startet. Cake- oder fq_codel-Queueing begrenzt den Buffer, statt den schnellsten Download die Leitung besitzen zu lassen.", gain: "Entfernt die 100-ms+-Spikes unter Last" };
  if (f.title === "Check the physical line before blaming the game") return { title: "Prüfe die physische Leitung, bevor du das Spiel beschuldigst", body: "Tausche den Koax- oder DSL-Splitter, setze beide Kabelenden neu ein und führe den Verlust-Test erneut vom Router aus aus. Verlust, der am Router bestehen bleibt, ist ein ISP-Fehler, der ein Support-Ticket wert ist.", gain: "Verlust sollte unter 0,1 % zurückkehren" };
  if (f.title === "Open your NAT type") return { title: "Öffne deinen NAT-Typ", body: "Auf " + device.label + " bricht ein strikter oder Typ-3-NAT Invites und Matchmaking, selbst auf einer schnellen Leitung. Aktiviere UPnP oder leite die Ports weiter, die deine Plattform dokumentiert, und führe den eingebauten Netzwerk-Test erneut aus.", gain: "Behebt fehlgeschlagene Session-Joins direkt" };
  if (f.title === "Schedule downloads away from play sessions") return { title: "Plane Downloads außerhalb der Spiel-Sessions", body: "Pausiere Hintergrund-Patching, Cloud-Backups und Konsolen-Updates im Ruhemodus, während du spielst. Auf einer dünnen Leitung ist ein pausierter Download mehr wert als jede Router-Einstellung.", gain: "Gibt die ganze Leitung während der Sessions frei" };
  if (f.title.indexOf("Treat ") === 0) return { title: connLower(conn) + " als reine Download-Leitung behandeln", body: CONN_NOTE[conn.id] || f.body, gain: "Setzt eine realistische Erwartung, statt Einstellungen zu jagen" };
  if (f.title === "Retest during your actual play hours") return { title: "Teste erneut während deiner echten Spielzeiten", body: "Ein Test um 14 Uhr in einem leeren Netzwerk schmeichelt jeder Verbindung. Die Zahl, die zählt, ist die von 21 Uhr an einem Wochentag, wenn der Rest des Haushalts online ist.", gain: "Zeigt die Überlastung, durch die du wirklich spielst" };
  return f;
}
var CREDIT = { pass: 100, marginal: 55, fail: 8 };
var OP = { ping: "≤", jitter: "≤", loss: "≤", down: "≥", up: "≥" };

function axesHtml(result) {
  return result.axes.map(function (a) {
    return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + CREDIT[a.status] + '%"></span></span><span class="axis-score">' + esc(a.value) + " " + esc(a.unit) + '</span></div>' +
      '<p class="verdict-desc"><span class="axis-status" data-status="' + a.status + '">' + STATUS_LABEL[a.status] + "</span> · Ziel " + OP[a.id] + " " + esc(a.target) + " " + esc(a.unit) + ". " + esc(a.detail) + "</p></div>";
  }).join("");
}
function targetsHtml(result) {
  return regionTargets(result.connection.id).map(function (t) {
    var pct = Math.min(100, Math.round((t.wiredTarget / 60) * 100));
    var current = t.region.id === result.region.id ? " <strong>(deine Region)</strong>" : "";
    return '<div><div class="axis-row"><span class="axis-label">' + esc(t.region.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + pct + '%"></span></span><span class="axis-score">' + t.wiredTarget + " ms</span></div>" +
      '<p class="verdict-desc">' + esc(t.region.edge) + " · spielbar bis etwa " + t.playableCeiling + " ms" + current + "</p></div>";
  }).join("");
}
function fixesHtml(result) {
  return result.fixes.map(function (f, i) {
    var n = String(i + 1).padStart(2, "0");
    return '<li><span class="step-number">' + n + '</span><h3 class="step-title">' + esc(f.title) + '</h3><p class="step-text">' + esc(f.body) + '</p><p class="step-text"><strong>Erwarteter Gewinn:</strong> ' + esc(f.gain) + "</p></li>";
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
    if (label) label.textContent = result.headline + " · Kurzfassung";
    if (text) text.textContent = "Note " + result.grade + " (" + result.score + "/100) in " + result.region.label + " auf einer " + connLower(result.connection) + "-Leitung: Ping " + state.ping + " ms gegen ein " + result.pingTarget + "-ms-Ziel, mit Jitter " + state.jitter + " ms, Verlust " + state.loss + " %, " + state.down + " Mbps Down und " + state.up + " Mbps Up. " + result.verdict;
    if (verdictEl) verdictEl.textContent = "Note " + result.grade + " | " + result.score + "/100";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var shortAnswer = $("[data-short-answer]");
  if (shortAnswer) {
    shortAnswer.innerHTML = "GTA-6-Online-Play braucht etwa <strong>25 Mbps Down und 5 Mbps Up</strong>, um komfortabel zu sein, und es läuft mit <strong>10 Mbps Down</strong>. Was wirklich entscheidet, ob es sich gut anfühlt, ist die Latenz: in <strong>" + esc(result.region.label) + "</strong> sollte eine Wired-<strong>" + esc(connLower(result.connection)) + "</strong>-Leitung etwa <strong>" + result.pingTarget + " ms</strong> bis <strong>" + esc(result.region.edge) + "</strong> erreichen, mit Jitter unter <strong>10 ms</strong> und Paketverlust unter <strong>0,5 %</strong>. Bewerte unten deine eigenen fünf Zahlen.";
  }

  var checkPanel = $("[data-tab-panel=\"check\"]");
  if (checkPanel) {
    var worst = result.axes.find(function (a) { return a.status === "fail"; }) || result.axes.find(function (a) { return a.status === "marginal"; });
    var worstText = worst ? worst.label + " (" + STATUS_LABEL[worst.status].toLowerCase() + ")" : "Keine, alle Achsen bestehen";
    var pingPct = Math.min(100, Math.round((state.ping / 60) * 100));
    checkPanel.innerHTML =
      '<div class="verdict-body">' + iconFor(tone).replace("icon-lg", "verdict-icon tone-" + tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + esc(result.headline) + '</p>' +
      '<h3 class="verdict-title">' + esc(result.grade) + '<span class="unit"> · ' + result.score + '/100</span></h3>' +
      '<p class="verdict-desc">' + esc(result.verdict) + "</p></div></div>" +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Gesamt-Score</span><span class="val">' + result.score + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + result.score + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">Ping vs. ' + result.pingTarget + '-ms-Ziel</span><span class="val">' + esc(state.ping) + ' ms</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + pingPct + '%"></div></div></div>' +
      "</div>" +
      '<div data-axes-list>' + axesHtml(result) + "</div>" +
      '<dl class="stat-grid">' +
      "<div><dt>Note</dt><dd>" + esc(result.grade) + "</dd></div>" +
      "<div><dt>Score</dt><dd>" + result.score + "/100</dd></div>" +
      "<div><dt>Wired-Ping-Ziel</dt><dd>" + result.pingTarget + " ms</dd></div>" +
      "<div><dt>Schwächste Achse</dt><dd>" + esc(worstText) + "</dd></div>" +
      "</dl>" +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="' + xUrl(result) + '">Auf X teilen</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="' + redditUrl(result) + '">Reddit</a>' +
      "</div>";
    var copyBtn = $("[data-copy-verdict]", checkPanel);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(result) + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var targetsPanel = $("[data-tab-panel=\"targets\"]");
  if (targetsPanel) {
    var intro = $(".verdict-desc", targetsPanel);
    if (intro) intro.textContent = "Latenz-Untergrenzen über " + connLower(result.connection) + ". Ändere den Leitungstyp, um die Strafe auf alle Regionen auf einmal angewendet zu sehen.";
    var list = $("[data-targets-list]", targetsPanel);
    if (list) list.innerHTML = targetsHtml(result);
  }

  var fixesPanel = $("[data-tab-panel=\"fixes\"]");
  if (fixesPanel) {
    var fixList = $("[data-fixes-list]", fixesPanel);
    if (fixList) fixList.innerHTML = fixesHtml(result);
  }

  var deviceTitle = $("[data-device-title]");
  if (deviceTitle) deviceTitle.textContent = "So misst du deine Verbindung auf " + result.device.label;
  var steps = $("[data-device-steps]");
  if (steps) steps.innerHTML = stepsHtml(result.device);
  var caveat = $("[data-device-caveat]");
  if (caveat) caveat.innerHTML = "<strong>Vorbehalt für dieses Gerät:</strong> " + esc(result.device.caveat);

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = $("[data-share-x]");
  if (xLink) xLink.href = xUrl(result);
  var redditLink = $("[data-share-reddit]");
  if (redditLink) redditLink.href = redditUrl(result);

  var live = $("[data-live-region]");
  if (live) live.textContent = "Note " + result.grade + ", " + result.score + " von 100. " + result.headline + ". " + result.verdict;
  syncUrl();
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
