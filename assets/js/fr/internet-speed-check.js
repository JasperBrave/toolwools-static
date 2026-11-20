// internet-speed-check.js — GTA 6 Internet Speed Advisor page logic.
// Uses the ported speed engine (assets/js/engines/speed-engine.js).
// State lives in the URL (?region=&connection=&device=&tab=&down=&up=&ping=&jitter=&loss=)
// so graded results are shareable. Defaults match the source route's
// loaderDeps: Europe — West, fibre, PC, 100 down / 10 up / 24 ping / 6 jitter / 0.1 loss.
// When no region is in the URL, the region is guessed from the browser
// language, exactly as the source route does after hydration.
import { gradeConnection as gradeConnectionEn, regionTargets as regionTargetsEn, regionById, connectionById, deviceById, guessRegion } from "../engines/fr/speed-engine.js";

var REGION_LABEL = { "na-east": "Amérique du Nord · Est", "na-west": "Amérique du Nord · Ouest", "eu-west": "Europe · Ouest", "eu-central": "Europe · Centre et Est", "uk": "Royaume-Uni et Irlande", "latam": "Amérique latine", "mena": "Moyen-Orient et Afrique du Nord", "india": "Inde et Asie du Sud", "sea": "Asie du Sud-Est", "anz": "Australie et Nouvelle-Zélande", "japan": "Japon et Corée" };
var REGION_EDGE = { "na-east": "Ashburn / New York", "na-west": "Los Angeles / Seattle", "eu-west": "Amsterdam / Paris", "eu-central": "Frankfurt / Warschau", "uk": "London", "latam": "São Paulo / Santiago", "mena": "Dubai / Bahrain", "india": "Mumbai / Chennai", "sea": "Singapur", "anz": "Sydney", "japan": "Tokio / Seoul" };
var CONN_LABEL = { fibre: "Fibre jusqu'au domicile (FTTP)", cable: "Câble / coaxial (DOCSIS)", dsl: "DSL / VDSL / FTTC", "fixed-5g": "Haut débit 5G fixe", hotspot: "Hotspot mobile / données mobiles", satellite: "Satellite (LEO ou géostationnaire)" };
function connLower(c) { return CONN_LABEL[c.id] || c.label; }
var CONN_NOTE = { hotspot: "Utilisable pour les téléchargements, hostile pour les lobbys. Attendez-vous à des problèmes de NAT en plus du jitter.", satellite: "Le LEO est jouable à environ 50 ms supplémentaires ; le géostationnaire ne l'est pas, à environ 600 ms aller-retour." };
var DEVICE_LABEL = { pc: "PC (Windows)", ps5: "PlayStation 5", xbox: "Xbox Series X|S", cloud: "Cloud / streaming portable" };
var DEVICE_STEPS = { pc: ["Branchez un câble Ethernet si possible, puis fermez Steam, Rockstar Launcher, le navigateur et tout ce qui se synchronise.", "Lancez un test de vitesse dans le navigateur sur un serveur de votre propre région et notez le débit descendant, le débit montant et le ping.", "Ouvrez l'invite de commandes et exécutez ping -n 50 1.1.1.1, lisez la moyenne pour la latence et l'écart max-min comme votre jitter.", "Lisez le pourcentage de perte dans la même sortie. Tout ce qui dépasse 0 % sur une ligne filaire est une erreur, pas du bruit.", "Répétez une fois au pic du soir. Le chiffre du pic décide si GTA Online est agréable."], ps5: ["Paramètres → Réseau → État de la connexion → Tester la connexion Internet.", "Notez le débit descendant, le débit montant et le type de NAT. Les types NAT 1 ou 2 sont corrects ; le type 3 provoque des erreurs de matchmaking.", "La console ne signale ni jitter ni perte, prenez-les depuis un PC ou un téléphone sur le même réseau.", "Si vous jouez en Wi-Fi, notez la bande : 5 GHz ou 6 GHz uniquement, jamais 2,4 GHz pour le jeu en ligne."], xbox: ["Paramètres → Général → Paramètres réseau → Tester la vitesse et les statistiques du réseau.", "Lisez le débit descendant, le débit montant, la latence, la perte de paquets et la force du Wi-Fi, la Xbox signale tout cela.", "Vérifiez la ligne NAT sur le même écran : Ouvert est ce que vous voulez, Strict casse les invitations.", "Refaites-le une fois avec un câble si le chiffre Wi-Fi déçoit. Ce seul test met fin à la plupart des discussions sur le lag."], cloud: ["Testez sur l'appareil et le réseau exacts depuis lesquels vous allez streamer, pas sur le bureau à côté.", "Notez d'abord le ping et le jitter, le streaming échoue sur la latence bien avant la bande passante.", "Confirmez un débit descendant soutenu d'au moins 25 Mbps pour le 1080p60 et 40 Mbps pour la 4K.", "Surveillez un jitter croissant sur un stream de cinq minutes ; c'est un problème Wi-Fi, pas un problème de FAI."] };
var DEVICE_CAVEAT = { pc: "Windows signale le chemin vers un résolveur DNS public, pas vers un lobby Rockstar, donc traitez le chiffre comme une limite inférieure, pas comme une correspondance exacte.", ps5: "Le test PS5 mesure contre les serveurs de Sony et lit systématiquement moins que le débit réel en jeu.", xbox: "La Xbox est la seule plateforme qui signale nativement la perte et la latence, ce qui en fait le meilleur instrument de mesure de la maison.", cloud: "Le streaming ajoute la latence d'encodage et de décodage à la latence réseau, donc un bon score réseau est nécessaire mais pas suffisant." };
var AXIS_LABEL_FR = { ping: "Latence jusqu'à l'edge de votre région", jitter: "Jitter (stabilité de la latence)", loss: "Perte de paquets", down: "Vitesse de téléchargement", up: "Vitesse de téléversement" };
var HEADLINE_FR = { ready: "Prêt pour GTA 6 et GTA Online", work: "Encore du travail avant le lancement", weak: "Assez bon, avec un axe faible" };
function mapRegion(r) { return { id: r.id, label: REGION_LABEL[r.id] || r.label, edge: REGION_EDGE[r.id] || r.edge, baselinePing: r.baselinePing, note: r.note }; }
function mapConn(c) { return { id: c.id, label: CONN_LABEL[c.id] || c.label, addedPing: c.addedPing, typicalJitter: c.typicalJitter, typicalLoss: c.typicalLoss, note: CONN_NOTE[c.id] || c.note }; }
function mapDevice(d) { return { id: d.id, label: DEVICE_LABEL[d.id] || d.label, steps: DEVICE_STEPS[d.id] || d.steps, caveat: DEVICE_CAVEAT[d.id] || d.caveat }; }
function gradeConnection(input) { var r = gradeConnectionEn(input); var region = mapRegion(r.region); var conn = mapConn(r.connection); var device = mapDevice(r.device); var axes = r.axes.map(function (a) { return mapAxis(a, region, conn); }); var worst = axes.find(function (a) { return a.status === "fail"; }) || axes.find(function (a) { return a.status === "marginal"; }) || null; var headline = !worst ? HEADLINE_FR.ready : r.blocking ? HEADLINE_FR.work : HEADLINE_FR.weak; var verdict = !worst ? "Votre connexion atteint chaque objectif pour " + region.label + ". Rien ici ne freinera GTA 6." : r.blocking ? worst.label + " est le bloqueur. Corrigez cela d'abord, les autres chiffres comptent à peine tant que ce n'est pas résolu." : "Jouable partout, avec " + AXIS_LABEL_FR[worst.id] + " légèrement en dehors de la bande confortable."; return { region: region, connection: conn, device: device, pingTarget: r.pingTarget, axes: axes, score: r.score, grade: r.grade, verdict: verdict, headline: headline, fixes: r.fixes.map(function (f) { return mapFix(f, device, conn); }), blocking: r.blocking }; }
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
  notice.textContent = "Inconnu " + parsed.bad.map(function (b) { return b === "region" ? "Région" : b === "line type" ? "Type de ligne" : "Appareil"; }).join(" et ") + " dans le lien, donc cette page est revenue à la connexion par défaut. Choisissez vos réglages ci-dessous.";
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
  return "Note de connexion GTA 6 " + result.grade + " en " + result.region.label + " : " + result.pingTarget + " ms d'objectif de latence filaire, " + result.score + "/100. Évaluez votre connexion sur ToolWools.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent("Note de connexion GTA 6 " + result.grade + " en " + result.region.label + " (" + result.score + "/100)") + "&url=" + encodeURIComponent(shareUrl());
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
var STATUS_LABEL = { pass: "Réussi", marginal: "Limite", fail: "Échoué" };
function mapAxis(a, region, conn) {
  var d;
  if (a.id === "ping") {
    if (a.value <= 0) d = "Saisissez une latence mesurée. Une ligne filaire en " + region.label + " vers " + region.edge + " devrait atteindre environ " + a.target + " ms.";
    else if (a.status === "pass") d = "À ou près du plancher de " + a.target + " ms pour " + region.edge + " via " + connLower(conn) + ".";
    else if (a.status === "marginal") d = "Jouable, mais environ " + Math.round(a.value - a.target) + " ms au-dessus du plancher de " + a.target + " ms pour " + region.edge + ".";
    else d = "Nettement au-dessus du plancher de " + a.target + " ms pour " + region.edge + ", attendez-vous à du rubber-banding dans les lobbys pleins.";
  } else if (a.id === "jitter") {
    if (a.status === "pass") d = "Assez stable pour que le netcode puisse prédire votre prochain paquet.";
    else if (a.status === "marginal") d = "Au-dessus de l'objectif de 10 ms. Typique pour " + connLower(conn) + ", réparable au niveau du routeur.";
    else d = "C'est le chiffre qui rend les fusillades injustes. Corrigez-le avant de chasser la vitesse brute.";
  } else if (a.id === "loss") {
    if (a.status === "pass") d = "La perte est dans la plage que le jeu peut masquer par interpolation.";
    else if (a.status === "marginal") d = "Des véhicules qui se téléportent occasionnellement et un enregistrement des tirs retardé.";
    else d = "Une perte aussi élevée provoque des déconnexions et des échecs de connexion aux sessions, pas seulement du lag.";
  } else if (a.id === "down") {
    if (a.status === "pass") d = "Confortable pour le jeu en ligne plus le patching en arrière-plan.";
    else if (a.status === "marginal") d = "Assez pour jouer, limite le jour du patch. 25 Mbps est la ligne confortable.";
    else d = "En dessous du plancher de 10 Mbps, le streaming des ressources dans une session pleine va saccader.";
  } else {
    if (a.status === "pass") d = "Assez de marge pour héberger une session tout en utilisant le chat vocal.";
    else if (a.status === "marginal") d = "Correct en tant que client, limite si le matchmaking vous fait héberger la session.";
    else d = "Trop faible pour héberger, et le chat vocal entre en conflit avec le trafic du jeu.";
  }
  return { id: a.id, label: AXIS_LABEL_FR[a.id] || a.label, value: a.value, unit: a.unit, target: a.target, status: a.status, detail: d };
}
function mapFix(f, device, conn) {
  if (f.title === "Run a cable to the console or PC") return { title: "Tirez un câble jusqu'à la console ou au PC", body: "Le Wi-Fi est la plus grande source unique de jitter et de perte dans un réseau domestique, et il empire exactement quand la maison se remplit. Un câble Cat-6 plat sous un cadre de porte coûte moins qu'un mois du service que vous payez déjà.", gain: "Typiquement 10–25 ms de latence en moins et la plupart du jitter" };
  if (f.title === "Move to 5 GHz or 6 GHz if you must stay wireless") return { title: "Passez au 5 GHz ou 6 GHz si vous devez rester sans fil", body: "La bande 2,4 GHz est partagée avec chaque micro-ondes, chaque sonnette et chaque voisin de votre rue. Séparez les SSID sur votre routeur pour que l'appareil de jeu ne puisse pas retomber silencieusement sur la bande lente.", gain: "Divise par deux le jitter sur une bande surchargée" };
  if (f.title === "Enable QoS or Smart Queue on the router") return { title: "Activez la QoS ou la file intelligente sur le routeur", body: "Le bufferbloat est la raison pour laquelle votre ping triple dès que quelqu'un lance un stream 4K. La mise en file Cake ou fq_codel limite le tampon, au lieu de laisser le téléchargement le plus rapide posséder la ligne.", gain: "Supprime les pics de 100 ms+ sous charge" };
  if (f.title === "Check the physical line before blaming the game") return { title: "Vérifiez la ligne physique avant de blâmer le jeu", body: "Remplacez le répartiteur coaxial ou DSL, réinsérez les deux extrémités des câbles et refaites le test de perte depuis le routeur. Une perte qui persiste au routeur est une erreur du FAI qui vaut un ticket de support.", gain: "La perte devrait revenir sous 0,1 %" };
  if (f.title === "Open your NAT type") return { title: "Ouvrez votre type de NAT", body: "Sur " + device.label + ", un NAT strict ou de type 3 casse les invitations et le matchmaking, même sur une ligne rapide. Activez l'UPnP ou redirigez les ports que votre plateforme documente, puis refaites le test réseau intégré.", gain: "Corrige directement les échecs de connexion aux sessions" };
  if (f.title === "Schedule downloads away from play sessions") return { title: "Planifiez les téléchargements en dehors des sessions de jeu", body: "Mettez en pause le patching en arrière-plan, les sauvegardes cloud et les mises à jour de la console en mode repos pendant que vous jouez. Sur une ligne fine, un téléchargement en pause vaut plus que n'importe quel réglage de routeur.", gain: "Libère toute la ligne pendant les sessions" };
  if (f.title.indexOf("Treat ") === 0) return { title: connLower(conn) + " à traiter comme une ligne de téléchargement uniquement", body: CONN_NOTE[conn.id] || f.body, gain: "Fixe une attente réaliste au lieu de chasser les réglages" };
  if (f.title === "Retest during your actual play hours") return { title: "Retestez pendant vos heures de jeu réelles", body: "Un test à 14 h sur un réseau vide flatte chaque connexion. Le chiffre qui compte est celui de 21 h un soir de semaine, quand le reste du foyer est en ligne.", gain: "Montre la congestion avec laquelle vous jouez vraiment" };
  return f;
}
var CREDIT = { pass: 100, marginal: 55, fail: 8 };
var OP = { ping: "≤", jitter: "≤", loss: "≤", down: "≥", up: "≥" };

function axesHtml(result) {
  return result.axes.map(function (a) {
    return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + CREDIT[a.status] + '%"></span></span><span class="axis-score">' + esc(a.value) + " " + esc(a.unit) + '</span></div>' +
      '<p class="verdict-desc"><span class="axis-status" data-status="' + a.status + '">' + STATUS_LABEL[a.status] + "</span> · Objectif " + OP[a.id] + " " + esc(a.target) + " " + esc(a.unit) + ". " + esc(a.detail) + "</p></div>";
  }).join("");
}
function targetsHtml(result) {
  return regionTargets(result.connection.id).map(function (t) {
    var pct = Math.min(100, Math.round((t.wiredTarget / 60) * 100));
    var current = t.region.id === result.region.id ? " <strong>(votre région)</strong>" : "";
    return '<div><div class="axis-row"><span class="axis-label">' + esc(t.region.label) + '</span><span class="axis-track"><span class="axis-fill" style="width:' + pct + '%"></span></span><span class="axis-score">' + t.wiredTarget + " ms</span></div>" +
      '<p class="verdict-desc">' + esc(t.region.edge) + " · jouable jusqu'à environ " + t.playableCeiling + " ms" + current + "</p></div>";
  }).join("");
}
function fixesHtml(result) {
  return result.fixes.map(function (f, i) {
    var n = String(i + 1).padStart(2, "0");
    return '<li><span class="step-number">' + n + '</span><h3 class="step-title">' + esc(f.title) + '</h3><p class="step-text">' + esc(f.body) + '</p><p class="step-text"><strong>Gain attendu :</strong> ' + esc(f.gain) + "</p></li>";
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
    if (label) label.textContent = result.headline + " · En bref";
    if (text) text.textContent = "Note " + result.grade + " (" + result.score + "/100) en " + result.region.label + " sur une ligne " + connLower(result.connection) + " : ping " + state.ping + " ms contre un objectif de " + result.pingTarget + " ms, avec un jitter de " + state.jitter + " ms, une perte de " + state.loss + " %, " + state.down + " Mbps en descendant et " + state.up + " Mbps en montant. " + result.verdict;
    if (verdictEl) verdictEl.textContent = "Note " + result.grade + " | " + result.score + "/100";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var shortAnswer = $("[data-short-answer]");
  if (shortAnswer) {
    shortAnswer.innerHTML = "Le jeu en ligne de GTA 6 a besoin d'environ <strong>25 Mbps en descendant et 5 Mbps en montant</strong> pour être confortable, et il tourne avec <strong>10 Mbps en descendant</strong>. Ce qui décide vraiment si c'est agréable, c'est la latence : en <strong>" + esc(result.region.label) + "</strong>, une ligne <strong>" + esc(connLower(result.connection)) + "</strong> filaire devrait atteindre environ <strong>" + result.pingTarget + " ms</strong> jusqu'à <strong>" + esc(result.region.edge) + "</strong>, avec un jitter de moins de <strong>10 ms</strong> et une perte de paquets de moins de <strong>0,5 %</strong>. Évaluez vos propres cinq chiffres ci-dessous.";
  }

  var checkPanel = $("[data-tab-panel=\"check\"]");
  if (checkPanel) {
    var worst = result.axes.find(function (a) { return a.status === "fail"; }) || result.axes.find(function (a) { return a.status === "marginal"; });
    var worstText = worst ? worst.label + " (" + STATUS_LABEL[worst.status].toLowerCase() + ")" : "Aucun, tous les axes réussissent";
    var pingPct = Math.min(100, Math.round((state.ping / 60) * 100));
    checkPanel.innerHTML =
      '<div class="verdict-body">' + iconFor(tone).replace("icon-lg", "verdict-icon tone-" + tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">' + esc(result.headline) + '</p>' +
      '<h3 class="verdict-title">' + esc(result.grade) + '<span class="unit"> · ' + result.score + '/100</span></h3>' +
      '<p class="verdict-desc">' + esc(result.verdict) + "</p></div></div>" +
      '<div class="balance-bars">' +
      '<div><div class="balance-bar-head"><span class="lbl">Score global</span><span class="val">' + result.score + '</span></div><div class="balance-bar-track"><div class="balance-bar-fill blue" style="width:' + result.score + '%"></div></div></div>' +
      '<div><div class="balance-bar-head"><span class="lbl">Ping contre objectif de ' + result.pingTarget + ' ms</span><span class="val">' + esc(state.ping) + ' ms</span></div><div class="balance-bar-track"><div class="balance-bar-fill purple" style="width:' + pingPct + '%"></div></div></div>' +
      "</div>" +
      '<div data-axes-list>' + axesHtml(result) + "</div>" +
      '<dl class="stat-grid">' +
      "<div><dt>Note</dt><dd>" + esc(result.grade) + "</dd></div>" +
      "<div><dt>Score</dt><dd>" + result.score + "/100</dd></div>" +
      "<div><dt>Objectif de ping filaire</dt><dd>" + result.pingTarget + " ms</dd></div>" +
      "<div><dt>Axe le plus faible</dt><dd>" + esc(worstText) + "</dd></div>" +
      "</dl>" +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur X" href="' + xUrl(result) + '">Partager sur X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur Reddit" href="' + redditUrl(result) + '">Reddit</a>' +
      "</div>";
    var copyBtn = $("[data-copy-verdict]", checkPanel);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(result) + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var targetsPanel = $("[data-tab-panel=\"targets\"]");
  if (targetsPanel) {
    var intro = $(".verdict-desc", targetsPanel);
    if (intro) intro.textContent = "Planchers de latence pour " + connLower(result.connection) + ". Changez le type de ligne pour voir la pénalité appliquée à chaque région à la fois.";
    var list = $("[data-targets-list]", targetsPanel);
    if (list) list.innerHTML = targetsHtml(result);
  }

  var fixesPanel = $("[data-tab-panel=\"fixes\"]");
  if (fixesPanel) {
    var fixList = $("[data-fixes-list]", fixesPanel);
    if (fixList) fixList.innerHTML = fixesHtml(result);
  }

  var deviceTitle = $("[data-device-title]");
  if (deviceTitle) deviceTitle.textContent = "Comment mesurer votre connexion sur " + result.device.label;
  var steps = $("[data-device-steps]");
  if (steps) steps.innerHTML = stepsHtml(result.device);
  var caveat = $("[data-device-caveat]");
  if (caveat) caveat.innerHTML = "<strong>Avertissement pour cet appareil :</strong> " + esc(result.device.caveat);

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = $("[data-share-x]");
  if (xLink) xLink.href = xUrl(result);
  var redditLink = $("[data-share-reddit]");
  if (redditLink) redditLink.href = redditUrl(result);

  var live = $("[data-live-region]");
  if (live) live.textContent = "Note " + result.grade + ", " + result.score + " sur 100. " + result.headline + ". " + result.verdict;
  syncUrl();
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
