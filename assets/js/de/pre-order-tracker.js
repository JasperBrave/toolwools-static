// pre-order-tracker.js — GTA 6 Pre-Order Decision Desk page logic.
// Uses the ported preorder engine (assets/js/engines/preorder-engine.js),
// imported by absolute path so the module resolves the same at any depth.
// State lives in the URL (?platform=&region=&edition=&tab=&preload=&cancel=&resale=)
// so results are shareable.
// AUDIT FIX H7: the 25 June 2026 opening is expected, not confirmed by Rockstar.
// The engine timeline entry for it is never rendered as a confirmed milestone.
// The launch countdown is rendered by the shared countdown.js from
// window.TOOLWOOLS_LAUNCH_UTC (Nov 19, 2026 05:00 UTC); this file does not
// own the timer.
import { PLATFORMS, REGIONS, EDITIONS, CHANNELS, AXIS_LABELS, AXIS_DETAIL, CONFIDENCE_LABEL as CONFIDENCE_LABEL_EN, rankChannels as rankChannelsEn, platformById, regionById, editionById } from "../engines/de/preorder-engine.js";

var CONFIDENCE_LABEL = { confirmed: "Bestätigt", "platform-norm": "Plattform-Norm", "publisher-norm": "Publisher-Norm", estimated: "Geschätzt" };
var REGION_LABEL = { us: "Vereinigte Staaten", ca: "Kanada", uk: "Vereinigtes Königreich", eu: "Europäische Union", au: "Australien und Neuseeland", "in": "Indien", br: "Brasilien" };
var REGION_NOTE = { us: "Store-Richtlinie regiert, nicht das Gesetz. Xbox ist die nachsichtigste der drei Plattformen.", ca: "Spiegelt die US-Store-Richtlinie; Provinz-Regeln erreichen digitale Vorbestellungen selten.", uk: "Die Consumer Contracts Regulations geben ein 14-tägiges Stornierungsrecht bei nicht heruntergeladenen digitalen Käufen.", eu: "Das 14-tägige Fernabsatz-Widerrufsrecht ist die stärkste Stornierungs-Position in dieser Tabelle.", au: "Verbraucher-Garantien sind stark, aber Vorbestell-Meinungsänderung stützt sich trotzdem auf die Store-Richtlinie.", "in": "Storefront-Richtlinie regiert. Physischer Bestand ist dünn, also ist digital normalerweise der einzige Kanal.", br: "Der Consumer Defence Code gewährt ein 7-tägiges Widerrufsrecht bei Fernkäufen." };
var PLATFORM_PRELOAD_NOTE = { ps5: "PlayStation öffnet den Pre-Load normalerweise 48 Stunden vor dem Release, und eine digitale Vorbestellung wird in dem Moment nicht erstattungsfähig, in dem dieser Download startet.", xbox: "Xbox öffnet Pre-Loads früh, oft 7 bis 10 Tage vorher, und hält ihren Self-Service-Erstattungs-Flow für ungespielte Vorbestellungen bis zum Release-Tag verfügbar.", pc: "PC-Storefronts stufen den Download ein paar Tage vorher ein. Rockstars eigener Launcher und Steam laden beide vor; ein physischer PC-Release wird nicht erwartet." };
var EDITION_NOTE = { standard: "Nur das Basis-Spiel. Nichts zu verlieren, wenn du später den Kanal wechselst.", deluxe: "Mittlere Stufe: Ingame-Währung und Kosmetik-Bundles, die an den Account gebunden sind, der sie gekauft hat.", ultimate: "Größter Bonus-Stack, also kosten kanalgebundene Belohnungen am meisten, wenn du sie aufgibst." };
var CHANNEL_LABEL = { "platform-digital": "Plattform-Store (PS Store / Xbox Store)", "publisher-direct": "Publisher direkt (Rockstar Store)", "retailer-code": "Händler-Digital-Code (Amazon, GameStop, Best Buy)", "retailer-disc": "Händler-Disc, versandt", "bigbox-disc": "Abholung im Großmarkt", "marketplace-key": "Grey-Market-Key-Händler" };
var CHANNEL_SHORT = { "platform-digital": "Plattform digital", "publisher-direct": "Publisher direkt", "retailer-code": "Händler-Code", "retailer-disc": "Disc, versandt", "bigbox-disc": "Abholung im Laden", "marketplace-key": "Grey-Market-Key" };
var CHANNEL_NOTE = { "platform-digital": "Der Standard-Weg. Schnellster Pre-Load, null Wiederverkaufswert, und das Erstattungs-Fenster schließt in dem Moment, in dem der Download beginnt.", "publisher-direct": "Boni werden hier am zuverlässigsten gewährt, weil der Publisher die Berechtigung besitzt und Support-Eskalationen keine Mittelpartei überspringen.", "retailer-code": "Bestes Gleichgewicht aus Preisschutz und Stornierbarkeit, auf Kosten des Pre-Load-Timings, der Code kommt oft erst kurz vor dem Release.", "retailer-disc": "Storniere, bis sie versandt wird, behalte die Preisgarantie und verkaufe oder verleihe sie danach. Du wartest auf die Lieferung und installierst trotzdem von der Disc.", "bigbox-disc": "Die sicherste Stornierungs-Position von allen, du hast bei vielen Ketten bis zur Abholung nicht bezahlt, plus Mitternachts-Launch-Zugang und vollem Wiederverkaufswert.", "marketplace-key": "Billigster Aufkleber-Preis, schlechteste Bedingungen. Regionsgesperrte Keys, Widerrufs-Risiko und kein Publisher-Support, wenn die Berechtigung gezogen wird." };
var CHANNEL_TERMS = { "platform-digital": ["Die Erstattungs-Berechtigung endet, wenn der Pre-Load zu downloaden beginnt, nicht am Release-Tag.", "Vorbestell-Boni landen auf dem Account, der die Bestellung platziert hat, und können nicht verschoben werden.", "Store-Preissenkungen vor dem Release werden dir nicht automatisch erstattet."], "publisher-direct": ["Die Berechtigung ist an deinen Rockstar-Account gebunden, wo auch der Online-Charakter lebt.", "Publisher-Stores honorieren Stornierungen vor dem Release historisch bereitwilliger als Konsolen-Stores.", "Du kaufst keinen handelbaren Key, also gibt es keine Wiederverkaufs-Route."], "retailer-code": ["Codes werden häufig 24–72 Stunden vor dem Launch ausgegeben, was deinen Pre-Load über das Plattform-Fenster hinaus schieben kann.", "Die meisten großen Händler wenden Vorbestell-Preisgarantien an: du zahlst den niedrigsten Preis, der vor dem Release gesehen wurde.", "Händler-exklusive Boni sind getrennt von Plattform-Boni und stapeln sich möglicherweise nicht."], "retailer-disc": ["Stornierbar ohne Strafe, bis das Paket versandt wird, normalerweise 2–4 Tage vor dem Release.", "Disc-Installationen laden trotzdem einen Day-One-Patch herunter, also plane die Bandbreite trotzdem ein.", "Eine Lieferung, die über den Launch-Tag hinaus rutscht, ist das echte Risiko, nicht das Geld."], "bigbox-disc": ["Reservierungen sind typischerweise nur Anzahlung oder gratis, und Weggehen-Stornierung ist die Norm.", "Du installierst am Launch-Tag von der Disc, also lädt nichts im Voraus vor.", "Store-exklusive Steelbooks oder Bonus-Items sind der übliche Grund, diesen Kanal zu wählen."], "marketplace-key": ["Keys können regionsgesperrt oder widerrufen werden, und ein widerrufener Key bedeutet normalerweise keine Erstattung und kein Spiel.", "Vorbestell-Boni fehlen bei Drittanbieter-Keys häufig.", "Der Publisher-Support hilft nicht bei einer Berechtigung, die er nicht verkauft hat."] };
var AXIS_LABELS_DE = { cancel: "Stornierbarkeit", priceProtection: "Preis-Senkungs-Schutz", preload: "Pre-Load-Bereitschaft", bonus: "Bonus-Erhalt", resale: "Wiederverkaufs-Wert" };
var AXIS_DETAIL_DE = { cancel: "Wie leicht du vor dem Release zurücktreten kannst, ohne Geld zu verlieren.", priceProtection: "Ob eine Preissenkung vor dem Release dir erstattet oder angerechnet wird.", preload: "Wie früh der Download eingestuft werden kann, damit du beim Unlock spielst.", bonus: "Wie zuverlässig Vorbestell- und Editions-Belohnungen auf deinem Account landen.", resale: "Ob du die Kopie nach dem Launch verleihen, tauschen oder verkaufen kannst." };
function fmtDE(d) { return d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); }
function mapPlatform(p) { return { id: p.id, label: p.label, preloadLeadDays: p.preloadLeadDays, preloadNote: PLATFORM_PRELOAD_NOTE[p.id] || p.preloadNote, discAvailable: p.discAvailable }; }
function mapRegion(r) { return { id: r.id, label: REGION_LABEL[r.id] || r.label, consumerLaw: r.consumerLaw, note: REGION_NOTE[r.id] || r.note }; }
function mapEdition(e) { return { id: e.id, label: e.label, bonusWeight: e.bonusWeight, note: EDITION_NOTE[e.id] || e.note }; }
function mapChannel(c) { return { id: c.id, label: CHANNEL_LABEL[c.id] || c.label, short: CHANNEL_SHORT[c.id] || c.short, platforms: c.platforms, physical: c.physical, axes: c.axes, confidence: c.confidence, sourceType: c.sourceType, note: CHANNEL_NOTE[c.id] || c.note, terms: CHANNEL_TERMS[c.id] || c.terms }; }
function mapRanked(e) { var channel = mapChannel(e.channel); var axes = e.axes.map(function (a) { return { id: a.id, label: AXIS_LABELS_DE[a.id] || a.label, raw: a.raw, weight: a.weight, detail: AXIS_DETAIL_DE[a.id] || a.detail }; }); var sorted = axes.slice().sort(function (a, b) { return b.raw - a.raw; }); return { channel: channel, score: e.score, axes: axes, strengths: sorted.slice(0, 2).filter(function (a) { return a.raw >= 6; }).map(function (a) { return a.label; }), risks: sorted.slice(-2).filter(function (a) { return a.raw <= 4; }).map(function (a) { return a.label; }), confidence: e.confidence }; }
function mapTimeline(platform, region) { var launch = new Date("2026-11-19T05:00:00Z"); var preload = new Date(launch.getTime() - platform.preloadLeadDays * 86400000); var days = platform.preloadLeadDays === 1 ? "Tag" : "Tage"; return [ { id: "open", label: "Vorbestellungen geöffnet", when: "25. Juni 2026", iso: "2026-06-25", detail: "Rockstar hat die Vorbestellungen für Grand Theft Auto VI über Plattform-Stores und Handelspartner geöffnet. Jeder Kanal auf dieser Seite ist bereits live.", confidence: "confirmed" }, { id: "price-watch", label: "Preis-Schutz-Fenster", when: "Jetzt bis " + fmtDE(launch), detail: "Händler-Vorbestell-Preisgarantien laufen bis zum Release. Wenn der Preis in diesem Fenster einmal fällt, erstattet ein garantierter Kanal die Differenz, ein Plattform-Store in der Regel nicht.", confidence: "platform-norm" }, { id: "preload", label: platform.label + "-Pre-Load soll freigeschaltet werden", when: fmtDE(preload) + " (etwa " + platform.preloadLeadDays + " " + days + " vorher)", iso: preload.toISOString().slice(0, 10), detail: PLATFORM_PRELOAD_NOTE[platform.id] || "", confidence: "platform-norm" }, { id: "cancel-cutoff", label: "Praktischer Stornierungs-Stichtag", when: fmtDE(preload) + " für digital, Versanddatum für physisch", iso: preload.toISOString().slice(0, 10), detail: "Digitale Vorbestellungen sind nicht mehr erstattungsfähig, sobald der Pre-Load startet. " + (REGION_NOTE[region.id] || ""), confidence: "estimated" }, { id: "launch", label: "Release", when: "19. November 2026, Mitternacht ET", iso: "2026-11-19", detail: "Der Unlock ist weltweit gleichzeitig um 00:00 ET, also spielt eine vorab geladene Kopie Stunden vor einer Disc, die am Launch-Morgen in den meisten Teilen Europas und Asiens abgeholt wird.", confidence: "confirmed" } ]; }
function mapRiskFlags(flags, platform, region, edition) { return flags.map(function (f) { if (f.title === "Your refund window closes at preload, not at launch") return { title: "Dein Erstattungs-Fenster schließt beim Pre-Load, nicht beim Launch", body: "Auf " + platform.label + " ist eine digitale Vorbestellung ab dem Moment, in dem der Download beginnt, nicht mehr erstattungsfähig, etwa " + platform.preloadLeadDays + " " + (platform.preloadLeadDays === 1 ? "Tag" : "Tage") + " vor dem Release. Wenn die Option, wegzugehen, wichtiger ist als beim Unlock zu spielen, starte den Pre-Load nicht.", severity: f.severity }; if (f.title === "A late code can cost you the preload") return { title: "Ein später Code kann dich den Pre-Load kosten", body: "Händler-Digital-Codes werden üblicherweise 24 bis 72 Stunden vor dem Release geliefert. Das liegt innerhalb des Pre-Load-Fensters auf Xbox und kann auf PlayStation knapp werden, also lädst du vielleicht am Launch-Tag herunter.", severity: f.severity }; if (f.title === "Discs still download a day-one patch") return { title: "Discs laden trotzdem einen Day-One-Patch herunter", body: "Eine Disc entfernt den Basis-Download, aber nicht den Launch-Patch. Plane trotzdem Bandbreite ein und erwarte, eine Weile zu installieren, bevor du spielst.", severity: f.severity }; if (f.title === "Grey-market keys carry revocation risk") return { title: "Grey-Market-Keys bergen Widerrufs-Risiko", body: "Ein widerrufener Key bedeutet normalerweise kein Spiel und keine Erstattung, und der Publisher-Support greift bei einer Berechtigung, die er nicht verkauft hat, nicht ein. Die Ersparnis ist bei einem Launch-Day-Titel die Exposure selten wert.", severity: f.severity }; if (f.title.indexOf(" bonuses lock to the buying account") !== -1) return { title: edition.label + "-Boni binden sich an den kaufenden Account", body: (EDITION_NOTE[edition.id] || "") + " Ein Wechsel von Kanal oder Plattform nach der Bestellung bedeutet, den Bonus-Stack neu zu kaufen, also entscheide die Plattform vor der Edition.", severity: f.severity }; if (f.title === "You have a statutory cancellation right — use it before downloading") return { title: "Du hast ein gesetzliches Widerrufsrecht, nutze es vor dem Download", body: (REGION_NOTE[region.id] || "") + " Dieses Recht überlebt normalerweise nur, solange der digitale Inhalt nicht heruntergeladen ist, derselbe Stichtag, den der Store anwendet.", severity: f.severity }; return f; }); }
function rankChannels(input) { var r = rankChannelsEn(input); var platform = mapPlatform(r.platform); var region = mapRegion(r.region); var edition = mapEdition(r.edition); var ranked = r.ranked.map(function (e) { return mapRanked(e); }); var best = ranked[0]; var runnerUp = ranked[1] || null; var wanted = []; if (input.prefs.wantsPreload) wanted.push("sofort beim Unlock spielen"); if (input.prefs.wantsCancel) wanted.push("die Option zum Stornieren behalten"); if (input.prefs.wantsResale) wanted.push("Wiederverkaufs- oder Leihwert"); var priorities = wanted.length === 0 ? "keine starke Präferenz außer Wert" : wanted.length === 1 ? wanted[0] : wanted.slice(0, -1).join(", ") + " und " + wanted[wanted.length - 1]; var headline = best.channel.short + " auf " + platform.label; var reason = "Weil du uns gesagt hast, dass " + priorities + " zählt, erzielt " + best.channel.label + " " + best.score + " von 100 für eine " + edition.label + "-Bestellung in " + region.label + ", führend bei " + (best.strengths.join(" und ") || "Gesamt-Balance") + (runnerUp ? ", vor " + runnerUp.channel.short + " mit " + runnerUp.score : "") + "."; return { platform: platform, region: region, edition: edition, prefs: r.prefs, weights: r.weights, ranked: ranked, best: best, runnerUp: runnerUp, headline: headline, reason: reason, riskFlags: mapRiskFlags(r.riskFlags, platform, region, edition), timeline: mapTimeline(platform, region) }; }

var DEFAULTS = { platform: "ps5", region: "us", edition: "standard", tab: "ranking", preload: false, cancel: false, resale: false };
var TABS = ["ranking", "terms", "timeline"];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var bad = [];
  var state = {
    platform: q.get("platform") || DEFAULTS.platform,
    region: q.get("region") || DEFAULTS.region,
    edition: q.get("edition") || DEFAULTS.edition,
    tab: q.get("tab") || DEFAULTS.tab,
    preload: q.get("preload") === "1",
    cancel: q.get("cancel") === "1",
    resale: q.get("resale") === "1"
  };
  if (!platformById(state.platform)) { bad.push("platform"); state.platform = DEFAULTS.platform; }
  if (!regionById(state.region)) { bad.push("region"); state.region = DEFAULTS.region; }
  if (!editionById(state.edition)) { bad.push("edition"); state.edition = DEFAULTS.edition; }
  if (TABS.indexOf(state.tab) === -1) state.tab = DEFAULTS.tab;
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Unbekannte " + parsed.bad.map(function (b) { return b === "platform" ? "Plattform" : b === "region" ? "Region" : "Edition"; }).join(", ") + " im Link, also hat diese Seite auf die Standards zurückgesetzt. Wähle unten deinen Kauf.";
  notice.classList.add("show");
}

var platformSel = $("[data-platform-select]");
var regionSel = $("[data-region-select]");
var editionSel = $("[data-edition-select]");
var tabButtons = $all("[data-tab-button]");
function fillSelect(select, items, value) {
  if (!select) return;
  select.innerHTML = "";
  items.forEach(function (it) {
    var opt = document.createElement("option");
    opt.value = it.id;
    opt.textContent = it.label;
    select.appendChild(opt);
  });
  select.value = value;
}
fillSelect(platformSel, PLATFORMS.map(mapPlatform), state.platform);
fillSelect(regionSel, REGIONS.map(mapRegion), state.region);
fillSelect(editionSel, EDITIONS.map(mapEdition), state.edition);
["preload", "cancel", "resale"].forEach(function (k) {
  var cb = document.getElementById("po-" + k);
  if (cb) cb.checked = state[k];
});

function shareUrl() {
  var p = new URLSearchParams({ platform: state.platform, region: state.region, edition: state.edition, tab: state.tab });
  if (state.preload) p.set("preload", "1");
  if (state.cancel) p.set("cancel", "1");
  if (state.resale) p.set("resale", "1");
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ platform: state.platform, region: state.region, edition: state.edition, tab: state.tab });
  if (state.preload) p.set("preload", "1");
  if (state.cancel) p.set("cancel", "1");
  if (state.resale) p.set("resale", "1");
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function render() {
  var result = rankChannels({
    platform: state.platform, region: state.region, edition: state.edition,
    prefs: { wantsPreload: state.preload, wantsCancel: state.cancel, wantsResale: state.resale }
  });
  if (platformSel) platformSel.value = state.platform;
  if (regionSel) regionSel.value = state.region;
  if (editionSel) editionSel.value = state.edition;
  tabButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tabButton === state.tab)); });
  ["preload", "cancel", "resale"].forEach(function (k) {
    var cb = document.getElementById("po-" + k);
    if (cb) cb.checked = state[k];
  });

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    if (label) label.textContent = "Bester Kanal · Kurzfassung";
    if (text) text.textContent = result.headline + " erzielt " + result.best.score + " von 100 für eine " + result.edition.label + "-Bestellung in " + result.region.label + ", führend bei " + (result.best.strengths.join(" und ") || "Gesamt-Balance") + ".";
    if (verdictEl) verdictEl.textContent = "Bester: " + result.best.channel.short + " | " + result.best.score + "/100";
  }

  var answer = $("[data-preorder-answer]");
  if (answer) {
    answer.innerHTML = "GTA-6-Vorbestellungen sollen voraussichtlich am <time datetime=\"2026-06-25\">25. Juni 2026</time> öffnen (von Rockstar unbestätigt) und das Spiel erscheint am <time datetime=\"2026-11-19\">19. November 2026</time>. Jeder Kanal berechnet dasselbe Spiel, also kaufe nach Bedingungen: die beste Wahl für deine Eingaben ist <strong>" + esc(result.headline) + "</strong>. " + esc(result.reason);
  }

  var outLabel = $("[data-output-label]");
  if (outLabel) outLabel.textContent = "Vorbestell-Kanäle für " + result.platform.label;
  var out = $("[data-output-panel]");
  if (out) {
    var html = "";
    if (state.tab === "ranking") {
      html += '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">Bester Kanal</p>' +
        '<h3 class="verdict-title">' + esc(result.best.channel.short) + '<span class="unit"> / ' + result.best.score + ' von 100</span></h3>' +
        '<p class="verdict-desc">' + esc(result.best.channel.note) + '</p></div></div>';
      // Ranked channels as milestone rows (styled in main.css); the winner
      // is first and already named in the verdict above.
      html += '<ol class="milestone-list">' + result.ranked.map(function (c, i) {
        var s = c.strengths.length ? "Stark bei " + c.strengths.join(" und ") + ". " : "";
        var r = c.risks.length ? "Schwach bei " + c.risks.join(" und ") + ". " : "";
        return '<li><div class="milestone-row"><span><strong>' + (i + 1) + '. ' + esc(c.channel.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(s + r) + 'Vertrauen: ' + esc(CONFIDENCE_LABEL[c.confidence]) + '.</span></span>' +
          '<span class="axis-score">' + c.score + '/100</span></div></li>';
      }).join("") + '</ol>';
    } else if (state.tab === "terms") {
      html += '<p class="verdict-desc">Die Klauseln hinter dem Gewinner-Score. Lies diese, nicht die Zahl.</p>';
      html += result.best.axes.map(function (a) {
        return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span>' +
          '<span class="axis-track"><span class="axis-fill" style="width:' + Math.round(a.raw * 10) + '%"></span></span>' +
          '<span class="axis-score">' + a.raw + '/10</span></div>' +
          '<p class="field-hint">' + esc(a.detail) + ' Gewichtung ' + a.weight + ' %.</p></div>';
      }).join("");
      html += '<ul class="sources-list">' + result.best.channel.terms.map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join("") + '</ul>';
    } else {
      // H7: the "open" milestone (25 June 2026) is dropped — expected, not confirmed.
      var entries = result.timeline.filter(function (e) { return e.id !== "open"; });
      html += '<p class="verdict-desc">Die Vorbestell-Eröffnung wird für den 25. Juni 2026 erwartet, von Rockstar unbestätigt, also wird sie nicht als bestätigter Meilenstein gezeigt.</p>';
      html += '<ol class="milestone-list">' + entries.map(function (e) {
        var badge = e.confidence === "confirmed"
          ? '<span class="badge badge-blue">Bestätigt</span>'
          : '<span class="badge badge-muted">' + esc(CONFIDENCE_LABEL[e.confidence]) + '</span>';
        var when = e.iso ? '<time datetime="' + e.iso + '">' + esc(e.when) + '</time>' : esc(e.when);
        return '<li><div class="milestone-row"><span><strong>' + esc(e.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(e.detail) + '</span></span>' +
          '<span>' + when + ' \u00b7 ' + badge + '</span></div></li>';
      }).join("") + '</ol>';
    }
    var shareText = "Bester GTA-6-Vorbestell-Kanal auf " + result.platform.label + ": " + result.best.channel.short;
    html += '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText + " (" + result.best.score + "/100)") + '&url=' + encodeURIComponent(shareUrl()) + '">Auf X teilen</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="https://www.reddit.com/submit?title=' + encodeURIComponent(shareText + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a></div>';
    out.innerHTML = html;
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText + ". " + result.reason + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var risks = $("[data-risk-flags]");
  if (risks) {
    if (result.riskFlags.length) {
      risks.hidden = false;
      risks.innerHTML = '<h2 class="eyebrow-muted" style="text-align:left">Was bei dieser Wahl schiefgehen könnte</h2>' +
        '<ul class="milestone-list">' + result.riskFlags.map(function (f) {
          var sev = { high: "Hoch", medium: "Mittel", low: "Niedrig" }[f.severity] || f.severity;
          var badge = f.severity === "high" ? '<span class="badge badge-pink">' + sev + '</span>' : '<span class="badge badge-muted">' + sev + '</span>';
          return '<li><div class="milestone-row"><span><strong>' + esc(f.title) + '</strong><br>' +
            '<span class="field-hint">' + esc(f.body) + '</span></span>' + badge + '</div></li>';
        }).join("") + '</ul>';
    } else {
      risks.hidden = true;
      risks.innerHTML = "";
    }
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var shareX = $("[data-share-x]");
  if (shareX) shareX.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Bester GTA-6-Vorbestell-Kanal auf " + result.platform.label + ": " + result.best.channel.short + " (" + result.best.score + "/100). GTA-6-Vorbestell-Entscheidungs-Desk auf ToolWools.") + "&url=" + encodeURIComponent(shareUrl());
  var shareR = $("[data-share-reddit]");
  if (shareR) shareR.href = "https://www.reddit.com/submit?title=" + encodeURIComponent("Bester GTA-6-Vorbestell-Kanal auf " + result.platform.label + ": " + result.best.channel.short + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = "Bester Vorbestell-Kanal: " + result.headline + ", " + result.best.score + " von 100. " + result.reason;
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

if (platformSel) platformSel.addEventListener("change", function () { state.platform = platformSel.value; render(); });
if (regionSel) regionSel.addEventListener("change", function () { state.region = regionSel.value; render(); });
if (editionSel) editionSel.addEventListener("change", function () { state.edition = editionSel.value; render(); });
tabButtons.forEach(function (b) { b.addEventListener("click", function () { state.tab = b.dataset.tabButton; render(); }); });
["preload", "cancel", "resale"].forEach(function (k) {
  var cb = document.getElementById("po-" + k);
  if (cb) cb.addEventListener("change", function () { state[k] = cb.checked; render(); });
});
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
