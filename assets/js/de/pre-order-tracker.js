// pre-order-tracker.js — GTA 6 kaufen page logic.
// Uses the ported preorder engine (assets/js/engines/preorder-engine.js),
// imported by absolute path so the module resolves the same at any depth.
// State lives in the URL (?platform=&region=&edition=&tab=&preload=&cancel=)
// so results are shareable.
// Iteration 3 (2026-11-21): reframed as a buy-now desk for the released game
// (launched 19 Nov 2026, PS5 + Xbox only). The engine timeline no longer
// carries an "open" milestone; the timeline below shows the download window,
// the cancellation cutoff and the launch. Pre-order framing removed.
// The launch countdown is rendered by the shared countdown.js from
// window.TOOLWOOLS_LAUNCH_UTC (Nov 19, 2026 05:00 UTC); this file does not
// own the timer.
import { PLATFORMS, REGIONS, EDITIONS, CHANNELS, AXIS_LABELS, AXIS_DETAIL, CONFIDENCE_LABEL as CONFIDENCE_LABEL_EN, rankChannels as rankChannelsEn, platformById, regionById, editionById } from "../engines/de/preorder-engine.js";

var CONFIDENCE_LABEL = { confirmed: "Bestätigt", "platform-norm": "Plattform-Norm", "publisher-norm": "Publisher-Norm", estimated: "Geschätzt" };
var REGION_LABEL = { us: "Vereinigte Staaten", ca: "Kanada", uk: "Vereinigtes Königreich", eu: "Europäische Union", au: "Australien und Neuseeland", "in": "Indien", br: "Brasilien" };
var REGION_NOTE = { us: "Store-Richtlinie regiert, nicht das Gesetz. Xbox ist die nachsichtigste der zwei Plattformen.", ca: "Spiegelt die US-Store-Richtlinie; Provinz-Regeln erreichen digitale Vorbestellungen selten.", uk: "Die Consumer Contracts Regulations geben ein 14-tägiges Stornierungsrecht bei nicht heruntergeladenen digitalen Käufen.", eu: "Das 14-tägige Fernabsatz-Widerrufsrecht ist die stärkste Stornierungs-Position in dieser Tabelle.", au: "Verbraucher-Garantien sind stark, aber Vorbestell-Meinungsänderung stützt sich trotzdem auf die Store-Richtlinie.", "in": "Storefront-Richtlinie regiert. Physischer Bestand ist dünn, also ist digital normalerweise der einzige Kanal.", br: "Der Consumer Defence Code gewährt ein 7-tägiges Widerrufsrecht bei Fernkäufen." };
var PLATFORM_PRELOAD_NOTE = { ps5: "PlayStation hat den Download normalerweise etwa 48 Stunden vor dem Release bereitgestellt, und eine digitale Bestellung wird in dem Moment nicht erstattungsfähig, in dem dieser Download startet.", xbox: "Xbox stellte Downloads früh bereit, oft eine Woche oder mehr vor dem Release, und hält ihren Self-Service-Erstattungs-Flow für ungespielte Bestellungen bis zum Release-Tag verfügbar." };
var EDITION_NOTE = { standard: "Nur das Basis-Spiel. Nichts zu verlieren, wenn du später den Kanal wechselst.", ultimate: "Größter Bonus-Stack, also kosten kanalgebundene Belohnungen am meisten, wenn du sie aufgibst." };
var CHANNEL_LABEL = { "platform-digital": "Plattform-Store (PS Store / Xbox Store)", "retailer-code": "Händler-Digital-Code (Amazon, GameStop, Best Buy)", "retailer-code-in-box": "Händler-Code in einer Box (nur Standard)" };
var CHANNEL_SHORT = { "platform-digital": "Plattform digital", "retailer-code": "Händler-Code", "retailer-code-in-box": "Code in einer Box" };
var CHANNEL_NOTE = { "platform-digital": "Der Standard-Weg. Schnellster Weg, um zu spielen, null Wiederverkaufswert, und das Erstattungs-Fenster schließt in dem Moment, in dem der Download beginnt.", "retailer-code": "Bestes Gleichgewicht aus Preisschutz und Stornierbarkeit; prüfe, wann der Code ankommt — Lieferzeiten variieren.", "retailer-code-in-box": "Eine Standard-Kopie in der Box mit einem Download-Code darin — keine Disc. Storniere bis zum Versand und behalte die Preisgarantie, löse dann den Code ein und lade das volle Spiel herunter." };
var CHANNEL_TERMS = { "platform-digital": ["Die Erstattungs-Berechtigung endet, wenn der Download beginnt, nicht am Release-Tag.", "Editions-Boni landen auf dem Account, der die Bestellung platziert hat, und können nicht verschoben werden.", "Store-Preissenkungen vor dem Release werden dir nicht automatisch erstattet."], "retailer-code": ["Codes werden häufig kurz vor dem Launch ausgegeben, was zu wenig Zeit zum Herunterladen lassen kann, bevor du spielen willst.", "Die meisten großen Händler wenden Preisgarantien an: du zahlst den niedrigsten Preis, der vor dem Release gesehen wurde.", "Händler-exklusive Boni sind getrennt von Plattform-Boni und stapeln sich möglicherweise nicht."], "retailer-code-in-box": ["Stornierbar ohne Strafe, bis das Paket versandt wird.", "Die Box enthält einen Download-Code, keine Disc — löse ihn ein und lade dann das volle Spiel herunter.", "Dass die Lieferung sich über den Tag hinaus verzögert, an dem du spielen willst, ist das eigentliche Risiko, nicht das Geld."] };
var AXIS_LABELS_DE = { cancel: "Stornierbarkeit", priceProtection: "Preis-Senkungs-Schutz", preload: "Download-Bereitschaft", bonus: "Bonus-Erhalt", resale: "Wiederverkaufs-Wert" };
var AXIS_DETAIL_DE = { cancel: "Wie leicht du von einer Bestellung ohne Geldverlust zurücktreten kannst.", priceProtection: "Ob eine Preissenkung nach deiner Bestellung dir erstattet oder angerechnet wird.", preload: "Wie schnell du nach dem Kauf spielen kannst.", bonus: "Wie zuverlässig Vorbestell- und Editions-Belohnungen auf deinem Account landen.", resale: "Ob du die Kopie nach dem Launch verleihen, tauschen oder verkaufen kannst." };
function fmtDE(d) { return d.toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); }
function mapPlatform(p) { return { id: p.id, label: p.label, preloadLeadDays: p.preloadLeadDays, preloadNote: PLATFORM_PRELOAD_NOTE[p.id] || p.preloadNote, discAvailable: p.discAvailable }; }
function mapRegion(r) { return { id: r.id, label: REGION_LABEL[r.id] || r.label, consumerLaw: r.consumerLaw, note: REGION_NOTE[r.id] || r.note }; }
function mapEdition(e) { return { id: e.id, label: e.label, bonusWeight: e.bonusWeight, note: EDITION_NOTE[e.id] || e.note }; }
function mapChannel(c) { return { id: c.id, label: CHANNEL_LABEL[c.id] || c.label, short: CHANNEL_SHORT[c.id] || c.short, platforms: c.platforms, physical: c.physical, axes: c.axes, confidence: c.confidence, sourceType: c.sourceType, note: CHANNEL_NOTE[c.id] || c.note, terms: CHANNEL_TERMS[c.id] || c.terms }; }
function mapRanked(e) { var channel = mapChannel(e.channel); var axes = e.axes.map(function (a) { return { id: a.id, label: AXIS_LABELS_DE[a.id] || a.label, raw: a.raw, weight: a.weight, detail: AXIS_DETAIL_DE[a.id] || a.detail }; }); var sorted = axes.slice().sort(function (a, b) { return b.raw - a.raw; }); return { channel: channel, score: e.score, axes: axes, strengths: sorted.slice(0, 2).filter(function (a) { return a.raw >= 6; }).map(function (a) { return a.label; }), risks: sorted.slice(-2).filter(function (a) { return a.raw <= 4; }).map(function (a) { return a.label; }), confidence: e.confidence }; }
function mapTimeline(platform, region) { return [ { id: "preload", label: platform.label + "-Pre-Load, vor dem Launch abgeschlossen", when: "Etwa " + platform.preloadLeadDays + " Tage vor dem Launch bereitgestellt (Plattform-Norm)", iso: null, detail: PLATFORM_PRELOAD_NOTE[platform.id] || "", confidence: "platform-norm" }, { id: "cancel-cutoff", label: "Praktischer Stornierungs-Stichtag", when: "Download-Start für digital, Versanddatum für physisch", iso: null, detail: "Digitale Bestellungen sind nicht mehr erstattungsfähig, sobald der Download gestartet ist." + (REGION_NOTE[region.id] || ""), confidence: "estimated" }, { id: "launch", label: "Release", when: "19. November 2026, Mitternacht ET", iso: "2026-11-19", detail: "Der Unlock war weltweit gleichzeitig um 00:00 ET.", confidence: "confirmed" } ]; }
function mapRiskFlags(flags, platform, region, edition) { return flags.map(function (f) { if (f.title === "Your refund window closes when the download starts") return { title: "Dein Erstattungs-Fenster schließt sich, wenn der Download startet", body: "Auf " + platform.label + " ist eine digitale Bestellung ab dem Moment, in dem der Download beginnt, nicht mehr erstattungsfähig. Wenn die Option, wegzugehen, wichtiger ist als sofort zu spielen, starte den Download nicht.", severity: f.severity }; if (f.title === "A late code can cost you the instant download") return { title: "Ein später Code kann dich den sofortigen Download kosten", body: "Händler-Digital-Codes werden üblicherweise kurz vor dem Release geliefert. Das kann zu wenig Zeit zum Herunterladen lassen, bevor du spielen willst, also lädst du vielleicht am Launch-Tag herunter.", severity: f.severity }; if (f.title.indexOf(" bonuses lock to the buying account") !== -1) return { title: edition.label + "-Boni binden sich an den kaufenden Account", body: (EDITION_NOTE[edition.id] || "") + " Ein Wechsel von Kanal oder Plattform nach der Bestellung bedeutet, den Bonus-Stack neu zu kaufen, also entscheide die Plattform vor der Edition.", severity: f.severity }; if (f.title === "You have a statutory cancellation right — use it before downloading") return { title: "Du hast ein gesetzliches Widerrufsrecht, nutze es vor dem Download", body: (REGION_NOTE[region.id] || "") + " Dieses Recht überlebt normalerweise nur, solange der digitale Inhalt nicht heruntergeladen ist, derselbe Stichtag, den der Store anwendet.", severity: f.severity }; return f; }); }
function rankChannels(input) { var r = rankChannelsEn(input); var platform = mapPlatform(r.platform); var region = mapRegion(r.region); var edition = mapEdition(r.edition); var ranked = r.ranked.map(function (e) { return mapRanked(e); }); var best = ranked[0]; var runnerUp = ranked[1] || null; var wanted = []; if (input.prefs.wantsPreload) wanted.push("sofort beim Unlock spielen"); if (input.prefs.wantsCancel) wanted.push("die Option zum Stornieren behalten"); var priorities = wanted.length === 0 ? "keine starke Präferenz außer Wert" : wanted.length === 1 ? wanted[0] : wanted.slice(0, -1).join(", ") + " und " + wanted[wanted.length - 1]; var headline = best.channel.short + " auf " + platform.label; var reason = "Weil du uns gesagt hast, dass " + priorities + " zählt, erzielt " + best.channel.label + " " + best.score + " von 100 für eine " + edition.label + "-Bestellung in " + region.label + ", führend bei " + (best.strengths.join(" und ") || "Gesamt-Balance") + (runnerUp ? ", vor " + runnerUp.channel.short + " mit " + runnerUp.score : "") + "."; return { platform: platform, region: region, edition: edition, prefs: r.prefs, weights: r.weights, ranked: ranked, best: best, runnerUp: runnerUp, headline: headline, reason: reason, riskFlags: mapRiskFlags(r.riskFlags, platform, region, edition), timeline: mapTimeline(platform, region) }; }

var DEFAULTS = { platform: "ps5", region: "us", edition: "standard", tab: "ranking", preload: false, cancel: false };
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
    cancel: q.get("cancel") === "1"
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
["preload", "cancel"].forEach(function (k) {
  var cb = document.getElementById("po-" + k);
  if (cb) cb.checked = state[k];
});

function shareUrl() {
  var p = new URLSearchParams({ platform: state.platform, region: state.region, edition: state.edition, tab: state.tab });
  if (state.preload) p.set("preload", "1");
  if (state.cancel) p.set("cancel", "1");
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ platform: state.platform, region: state.region, edition: state.edition, tab: state.tab });
  if (state.preload) p.set("preload", "1");
  if (state.cancel) p.set("cancel", "1");
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function render() {
  var result = rankChannels({
    platform: state.platform, region: state.region, edition: state.edition,
    prefs: { wantsPreload: state.preload, wantsCancel: state.cancel }
  });
  if (platformSel) platformSel.value = state.platform;
  if (regionSel) regionSel.value = state.region;
  if (editionSel) editionSel.value = state.edition;
  tabButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tabButton === state.tab)); });
  ["preload", "cancel"].forEach(function (k) {
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
    answer.innerHTML = "GTA 6 erschien am <time datetime=\"2026-11-19\">19. November 2026</time> für PlayStation 5 und Xbox Series X|S. Jeder Kanal berechnet dasselbe Spiel, also kaufe nach Bedingungen: die beste Wahl für deine Eingaben ist <strong>" + esc(result.headline) + "</strong>. " + esc(result.reason);
  }

  var outLabel = $("[data-output-label]");
  if (outLabel) outLabel.textContent = "Kauf-Kanäle für " + result.platform.label;
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
      // The engine timeline no longer carries an "open" milestone.
      var entries = result.timeline.filter(function (e) { return e.id !== "open"; });
      html += '<p class="verdict-desc">Das Spiel erschien am 19. November 2026. Das sind die Meilensteine, die beim Kauf noch zählen.</p>';
      html += '<ol class="milestone-list">' + entries.map(function (e) {
        var badge = e.confidence === "confirmed"
          ? '<span class="badge badge-blue">Bestätigt</span>'
          : '<span class="badge badge-muted">' + esc(CONFIDENCE_LABEL[e.confidence]) + '</span>';
        var when = e.iso ? '<time datetime="' + e.iso + '">' + esc(e.when) + '</time>' : esc(e.when);
        return '<li><div class="milestone-row"><span><strong>' + esc(e.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(e.detail) + '</span></span>' +
          '<span>' + when + ' \u00b7 ' + badge + '</span></div></li>';
      }).join("") + '</ol>';
      html += '<p class="verdict-desc"><strong>Alle Meilensteine abgeschlossen.</strong> Vorbestellungen öffneten am 25. Juni 2026, Pre-Loads wurden in den Tagen vor dem Launch bereitgestellt — etwa 48 Stunden vorher auf PlayStation 5, etwa 10 Tage vorher auf Xbox — und GTA 6 erschien am 19. November 2026. Es gibt nichts mehr abzuwarten: Wer jetzt kauft, lädt das vollständige Spiel herunter, 212 GB plus Day-One-Patch, also prüfe zuerst den <a href="/de/tools/download-time">Download-Zeit-Rechner</a>.</p>';
    }
    var shareText = "Beste Kaufmöglichkeit für GTA 6 auf " + result.platform.label + ": " + result.best.channel.short;
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
  if (shareX) shareX.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Beste Kaufmöglichkeit für GTA 6 auf " + result.platform.label + ": " + result.best.channel.short + " (" + result.best.score + "/100). GTA 6 kaufen: Editionen und Kanäle im Vergleich auf ToolWools.") + "&url=" + encodeURIComponent(shareUrl());
  var shareR = $("[data-share-reddit]");
  if (shareR) shareR.href = "https://www.reddit.com/submit?title=" + encodeURIComponent("Beste Kaufmöglichkeit für GTA 6 auf " + result.platform.label + ": " + result.best.channel.short + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = "Bester Kauf-Kanal: " + result.headline + ", " + result.best.score + " von 100. " + result.reason;
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
["preload", "cancel"].forEach(function (k) {
  var cb = document.getElementById("po-" + k);
  if (cb) cb.addEventListener("change", function () { state[k] = cb.checked; render(); });
});
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
