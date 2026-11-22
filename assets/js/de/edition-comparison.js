// edition-comparison.js — GTA 6 Edition Picker page logic.
// Uses the ported edition engine (assets/js/engines/edition-engine.js).
// AUDIT FIX H3: Ultimate uplift is 25.0% (99.99 / 79.99), never 42%.
// State lives in the URL (?platform=&profile=&uplift=&p=&view=) so results
// are shareable. Defaults match the source route loaderDeps:
// PlayStation 5, story plus casual online, 30% uplift ceiling.
import { EDITIONS, BONUSES, PROFILES, CATEGORY_LABEL as CATEGORY_LABEL_EN, CONFIDENCE_LABEL as CONFIDENCE_LABEL_EN, PLATFORM_LABEL, evaluateEditions as evaluateEditionsEn, profileById, platformById } from "../engines/de/edition-engine.js";

var CATEGORY_LABEL = { cash: "Ingame-Währung", vehicles: "Fahrzeuge und Immobilien", cosmetics: "Kosmetik und Anpassung", earlyAccess: "Early Access und Vorsprung", storyExtras: "Story-Modus-Extras" };
var CONFIDENCE_LABEL = { confirmed: "Von Rockstar bestätigt", reported: "Gemeldet / gelistet, nicht vollständig detailliert", precedent: "Präzedenz aus GTA-V- und RDR2-Editionen" };
var EDITION_LABEL = { standard: "Standard Edition", ultimate: "Ultimate Edition" };
var EDITION_NOTE = { standard: "Das ganze Spiel: volle Story-Kampagne und voller Zugang zum Online-Modus. Jede höhere Stufe sind Boni obendrauf, nie extra Story.", ultimate: "Der größte digitale Stack: eine größere Währungs-Grant, extra Immobilien- oder Fahrzeug-Unlocks und die frühesten Zugangs-Perks, wenn eine Stufe sie bietet." };
var BONUS_LABEL = { "full-story": "Volle Story-Kampagne", "full-online": "Voller Online-Zugang", "cash-mid": "Online-Geldspritze", "cash-large": "Größere Währungs-Grant", "starter-vehicle": "Starter-Fahrzeug-Pack", "property-unlock": "Immobilien- oder Business-Vorsprung", "cosmetic-pack": "Outfit- und Livery-Pack", "cosmetic-exclusive": "Stufenexklusives Kosmetik-Set", "early-access": "Early-Access-Fenster", "bonus-week": "Bonus-Belohnungs-Wochen" };
var BONUS_DETAIL = { "full-story": "Jede Edition enthält die komplette Singleplayer-Kampagne. Keine Edition sperrt Story-Missionen, Charaktere oder Enden, das ist das Wichtigste, was du vor dem Mehrzahlen wissen musst.", "full-online": "Der Online-Modus ist im Basis-Spiel auf jeder Plattform enthalten. Höhere Stufen beschleunigen deinen Start; sie schalten keine Inhalte frei, die Standard-Spieler durch Spielen nicht erreichen können.", "cash-mid": "Eine einmalige Ingame-Währungs-Grant für den Online-Charakter. Echt am ersten Tag, irrelevant innerhalb von Wochen für jeden, der regelmäßig spielt, und im Story-Modus gar nichts wert.", "cash-large": "Die Währungs-Grant der obersten Stufe ist der Hauptgrund, warum Grinder hochkaufen. Vergleiche sie mit dem, was derselbe Aufpreis später als Währungs-Pack kauft, denn die Ingame-Economy ist der Ort, wo sie ausgegeben wird.", "starter-vehicle": "Ein Auto oder zwei, die beim ersten Login in die Online-Garage gegeben werden. GTA V und RDR2 machten beide das. Ehrlich nützlich für die ersten zehn Stunden Online-Spiel, danach kosmetisch.", "property-unlock": "Top-Stufen enthielten historisch eine Immobilie oder ein Business, das sonst mehrere Sessions zum Leisten brauchen würde. Das ist der Bonus mit der längsten Nutzungsdauer für Online-Spieler.", "cosmetic-pack": "Kleidung, Tattoos und Fahrzeug-Liveries exklusiv für die bezahlten Stufen. Kein Gameplay-Effekt. Der Wert hier hängt ganz davon ab, ob dir wichtig ist, wie dein Charakter aussieht.", "cosmetic-exclusive": "Items, die danach nicht Ingame verkauft werden. Die einzige Bonus-Kategorie, die später wirklich unerreichbar bleibt, weshalb Käufer, denen Exklusivität wichtig ist, sie hoch gewichten.", "early-access": "Manche Top-Stufen von Rockstar haben vor dem Standard-Release freigeschaltet. Rockstar hat nicht gesagt, ob GTA 6 das tut; betrachte es als möglich, nicht als versprochen.", "bonus-week": "Ein temporärer Boost für Online-Einnahmen oder Belohnungen in den ersten Wochen. Zeitlich begrenzt per Design, also zahlt es sich nur aus, wenn du zum Launch viel spielst." };
var PROFILE_LABEL = { "story-only": "Nur Story-Modus", "online-casual": "Story plus Casual-Online", "online-grinder": "Online ab Tag eins", "undecided": "Noch nicht sicher" };
var PROFILE_NOTE = { "story-only": "Du willst die Kampagne und wirst Online wahrscheinlich nie anfassen.", "online-casual": "Kampagne zuerst, dann etwas Online mit Freunden in deinem Tempo.", "online-grinder": "Du wirst in der Launch-Woche die Online-Economy grinden.", "undecided": "Du willst einen vertretbaren Default, ohne dich zu sehr festzulegen." };
function mapEdition(e) { var c = Object.assign({}, e); c.label = EDITION_LABEL[e.id] || e.label; c.note = EDITION_NOTE[e.id] || e.note; return c; }
function mapBonus(b) { var c = Object.assign({}, b); c.label = BONUS_LABEL[b.id] || b.label; c.detail = BONUS_DETAIL[b.id] || b.detail; return c; }
function mapProfile(p) { var c = Object.assign({}, p); c.label = PROFILE_LABEL[p.id] || p.label; c.note = PROFILE_NOTE[p.id] || p.note; return c; }
function evaluateEditions(input) { var r = evaluateEditionsEn(input); r.profile = mapProfile(r.profile); r.ranked = r.ranked.map(function (s) { var c = Object.assign({}, s); c.edition = mapEdition(s.edition); c.bonuses = s.bonuses.map(mapBonus); c.addedOverPrevious = s.addedOverPrevious.map(mapBonus); return c; }); r.best = r.ranked[0]; if (r.best.edition.id === "standard") r.reason = "Für einen " + buyerPhrase(r.profile) + ", fügt nichts über Standard genug nutzbaren Wert hinzu, um den Aufpreis bei deiner " + r.upliftTolerance + "%-Obergrenze zu rechtfertigen, und Standard enthält bereits die gesamte Story und den ganzen Online-Modus."; else r.reason = "Sie fügt etwa " + r.best.utilityDelta + " Punkte gewichteten Nutzens über Standard hinzu für einen " + r.best.edition.upliftPercent + "%-Aufpreis, etwa " + r.best.utilityPerUpliftPoint + " Punkte pro 10 %, die du ausgibst, was die beste Rendite aller Stufen ist, die auf " + r.platformLabel + " innerhalb deiner " + r.upliftTolerance + "%-Obergrenze verfügbar sind."; r.upgradeMath = r.upgradeMath.map(function (m) { var mm, tm; if (m.title === "Buying up from Standard to Ultimate") { mm = m.body.match(/costs about ([\d.]+)% more than Standard and adds roughly ([\d.]+) points/); return { title: "Von Standard auf Ultimate hochkaufen", body: mm ? "Ultimate kostet etwa " + mm[1] + " % mehr als Standard und fügt etwa " + mm[2] + " Punkte gewichteten Nutzens hinzu für deine Spielweise. Wenn diese Zahl unter 3 liegt, ist der Schritt für dich kosmetisch; über 6 ist er der günstigste Nutzen auf der Seite." : m.body }; } if (m.title === "Standard now, upgrade later") return { title: "Standard jetzt, später upgraden", body: "Digitale Stufen-Upgrades auf Konsole werden normalerweise als In-Store-Upgrade zum Preisunterschied verkauft, also kostet Standard kaufen und später aufsteigen meist denselben Gesamtbetrag, mit einem Caveat: Launch-Fenster-Bonuswochen und jeder Early-Access-Perk verfallen, und du kannst sie nicht nachträglich beanspruchen." }; if (m.title === "Buying currency instead of a tier") return { title: "Währung kaufen statt einer Stufe", body: "Der ehrliche Vergleich für einen Grinder ist nicht ein Stufen-Aufpreis versus Standard, sondern ein Stufen-Aufpreis versus der Kauf derselben Menge Ingame-Währung nach dem Launch, sobald du die tatsächlichen Ingame-Preise kennst. Wenn Währung der einzige Grund für dein Upgrade ist, warte." }; if (m.title === "Your stated ceiling") { tm = m.body.match(/go to ([\d.]+)% over Standard/); return { title: "Deine genannte Obergrenze", body: tm ? "Du hast gesagt, du würdest bis zu " + tm[1] + " % über Standard gehen. Alles darüber ist in der Tabelle markiert statt versteckt, damit du sehen kannst, was du nicht kaufen willst." : m.body }; } return m; }); return r; }

var DEFAULTS = { platform: "ps5", profile: "online-casual", uplift: 30, p: [], view: "verdict" };
var PLATFORMS = ["ps5", "xbox"];
var VIEWS = ["verdict", "matrix", "upgrade"];
var VIEW_LABEL = { verdict: "Was kaufen", matrix: "Bonus-Matrix", upgrade: "Upgrade-Mathe" };
var CATEGORIES = Object.keys(CATEGORY_LABEL);
var CONF_SHORT = { confirmed: "Bestätigt", reported: "Gemeldet", precedent: "Präzedenz" };

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var upliftParam = q.get("uplift");
  var upliftRaw = upliftParam === null ? NaN : Number(upliftParam);
  var pRaw = q.get("p") || "";
  var state = {
    platform: PLATFORMS.indexOf(q.get("platform")) !== -1 ? q.get("platform") : DEFAULTS.platform,
    profile: profileById(q.get("profile")) ? q.get("profile") : DEFAULTS.profile,
    uplift: Number.isFinite(upliftRaw) ? Math.max(0, Math.min(200, Math.round(upliftRaw))) : DEFAULTS.uplift,
    p: pRaw.split(",").map(function (s) { return s.trim(); }).filter(function (s) { return CATEGORIES.indexOf(s) !== -1; }),
    view: VIEWS.indexOf(q.get("view")) !== -1 ? q.get("view") : DEFAULTS.view
  };
  var bad = [];
  if (q.get("platform") && PLATFORMS.indexOf(q.get("platform")) === -1) bad.push("platform");
  if (q.get("profile") && !profileById(q.get("profile"))) bad.push("profile");
  if (q.get("uplift") !== null && !Number.isFinite(Number(q.get("uplift")))) bad.push("uplift ceiling");
  if (q.get("view") && VIEWS.indexOf(q.get("view")) === -1) bad.push("view");
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Unbekannte " + parsed.bad.join(", ") + " im Link, also hat diese Seite auf das Default-Setup zurückgesetzt. Wähle unten deine Optionen.";
  notice.classList.add("show");
}

var platformSel = $("[data-platform-select]");
var profileSel = $("[data-profile-select]");
var profileNote = $("[data-profile-note]");
var upliftInput = $("[data-uplift-input]");
var upliftValue = $("[data-uplift-value]");
var priorityBtns = $all("[data-priority]");
var viewBtns = $all("[data-view-button]");

function shareUrl() {
  var p = new URLSearchParams({ platform: state.platform, profile: state.profile, uplift: String(state.uplift) });
  if (state.p.length) p.set("p", state.p.join(","));
  if (state.view !== "verdict") p.set("view", state.view);
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ platform: state.platform, profile: state.profile, uplift: String(state.uplift) });
  if (state.p.length) p.set("p", state.p.join(","));
  if (state.view !== "verdict") p.set("view", state.view);
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
var BUYER_PHRASE = {
  "story-only": "Spieler, der nur die Story spielt",
  "online-casual": "Spieler, der Story und gelegentlich online spielt",
  "online-grinder": "Spieler, der ab Tag eins online grindet",
  "undecided": "Käufer, der sich noch nicht sicher ist"
};
function buyerPhrase(profile) {
  return BUYER_PHRASE[profile.id] || profile.label.toLowerCase();
}
function shareTitle(result) {
  return "Beste GTA-6-Edition für einen " + buyerPhrase(result.profile) + ": " + result.best.edition.label + " (" + result.best.score + "/100). GTA-6-Editions-Picker auf ToolWools.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareTitle(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent(result.best.edition.label + " - beste GTA-6-Edition für einen " + buyerPhrase(result.profile) + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());
}

function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function toneOf(result) {
  if (result.best.score >= 85) return "ready";
  if (result.best.score >= 60) return "borderline";
  return "upgrade";
}

function verdictHtml(result) {
  var items = result.ranked.map(function (e, i) {
    var desc;
    if (e.edition.upliftPercent === 0) {
      desc = "Basis-Preis. Komplettes Spiel.";
    } else {
      desc = "+" + e.edition.upliftPercent + " % über Standard · fügt " + e.utilityDelta + " gewichtete Punkte hinzu (" + e.utilityPerUpliftPoint + " pro 10 % ausgegeben).";
    }
    if (!e.available) desc += " Nicht verkauft auf " + result.platformLabel + ".";
    else if (e.overBudget) desc += " Über der Obergrenze, die du gesetzt hast.";
    desc += " Konfidenz: " + CONFIDENCE_LABEL[e.confidence] + ".";
    return "<li><strong>" + (i + 1) + ". " + esc(e.edition.label) + " | " + e.score + "/100</strong> | " + esc(desc) + "</li>";
  }).join("");
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">Bester Wert · ' + result.best.score + "/100</p>"
    + '<h3 class="verdict-title">' + esc(result.best.edition.label) + "</h3>"
    + '<p class="verdict-desc">' + esc(result.best.edition.note) + "</p></div></div>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">Gerankte Editionen</p><ul>' + items + "</ul></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Wert-Score</dt><dd>" + result.best.score + "/100</dd></div>"
    + "<div><dt>Aufpreis über Standard</dt><dd>+" + result.best.edition.upliftPercent + " %</dd></div>"
    + "<div><dt>Hinzugefügter Nutzen</dt><dd>+" + result.best.utilityDelta + " Pkt.</dd></div>"
    + "<div><dt>Deine Obergrenze</dt><dd>" + result.upliftTolerance + " %</dd></div></dl>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="' + xUrl(result) + '">Auf X teilen</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function matrixHtml(result) {
  var items = result.best.bonuses.map(function (b) {
    return "<li><strong>" + esc(b.label) + " | " + b.utility + " Pkt.</strong> | " + esc(CATEGORY_LABEL[b.category]) + " · " + esc(CONFIDENCE_LABEL[b.confidence]) + ". " + esc(b.detail) + "</li>";
  }).join("");
  var added = result.best.addedOverPrevious.length
    ? '<p class="verdict-desc">Neu in dieser Stufe: ' + esc(result.best.addedOverPrevious.map(function (b) { return b.label; }).join(", ")) + ".</p>"
    : "";
  return '<p class="verdict-desc">Was ' + esc(result.best.edition.label) + " gewährt, geordnet danach, wie viel es für einen " + esc(buyerPhrase(result.profile)) + ", wert ist. Konfidenz ist bei jedem Bonus gelabelt.</p>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">' + esc(result.best.edition.label) + " Boni</p><ul>" + items + "</ul></div>" + added
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="' + xUrl(result) + '">Auf X teilen</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function upgradeHtml(result) {
  var items = result.upgradeMath.map(function (m) {
    return "<li><strong>" + esc(m.title) + "</strong> \u2014 " + esc(m.body) + "</li>";
  }).join("");
  return '<div class="upgrade-box"><p class="eyebrow-muted">Upgrade-Mathe</p><ul>' + items + "</ul></div>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="' + xUrl(result) + '">Auf X teilen</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function render() {
  var result = evaluateEditions({ platform: state.platform, profile: state.profile, upliftTolerance: state.uplift, priorities: state.p });
  var tone = toneOf(result);

  if (platformSel) platformSel.value = state.platform;
  if (profileSel) profileSel.value = state.profile;
  if (profileNote) profileNote.textContent = result.profile.note;
  if (upliftInput) upliftInput.value = String(state.uplift);
  if (upliftValue) upliftValue.textContent = state.uplift + "%";
  priorityBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(state.p.indexOf(b.dataset.priority) !== -1)); });
  viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.viewButton === state.view)); });

  var label = $("[data-output-label]");
  if (label) label.textContent = "Editionen auf " + result.platformLabel;

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var tLabel = $("[data-tldr-label]", tldr);
    var tText = $("[data-tldr-text]", tldr);
    var tVerdict = $("[data-tldr-verdict]", tldr);
    var tIcon = $("[data-tldr-icon]", tldr);
    if (tLabel) tLabel.textContent = result.best.edition.label + " · Kurzfassung";
    if (tText) tText.textContent = result.best.edition.label + " ist der beste Wert für einen " + buyerPhrase(result.profile) + ", auf " + result.platformLabel + " bei einer " + result.upliftTolerance + "%-Obergrenze: " + result.best.score + "/100, fügt " + result.best.utilityDelta + " gewichtete Punkte über Standard hinzu für einen " + result.best.edition.upliftPercent + "%-Aufpreis.";
    if (tVerdict) tVerdict.textContent = result.best.edition.label + " | " + result.best.score + "/100 Wert für Aufpreis";
    if (tIcon) tIcon.innerHTML = iconFor(tone);
  }

  var shortEl = $("[data-short-answer-text]");
  if (shortEl) {
    shortEl.innerHTML = "Jede GTA-6-Edition enthält die volle Story-Kampagne und den vollen Online-Modus, das Spiel ist am 19. November 2026 um 05:00 UTC erschienen und keine Stufe verkauft extra Story. Auf " + esc(result.platformLabel) + ", für einen " + esc(buyerPhrase(result.profile)) + ", mit einer " + result.upliftTolerance + "%-Obergrenze über Standard, ist der beste Wert <strong>" + esc(result.best.edition.label) + "</strong>. " + esc(result.reason);
  }

  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML = state.view === "matrix" ? matrixHtml(result) : state.view === "upgrade" ? upgradeHtml(result) : verdictHtml(result);
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(result), copyBtn, "[data-copy-verdict-label]"); });
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var shareLinks = $all(".share-panel .share-row a");
  if (shareLinks[0]) shareLinks[0].href = xUrl(result);
  if (shareLinks[1]) shareLinks[1].href = redditUrl(result);

  var live = $("[data-live-region]");
  if (live) live.textContent = "Bester Wert: " + result.best.edition.label + ", " + result.best.score + " von 100, für einen " + buyerPhrase(result.profile) + ", auf " + result.platformLabel + " bei einer " + result.upliftTolerance + "-prozentigen Obergrenze über Standard.";
  syncUrl();
}

function shareText(result) {
  return shareTitle(result) + " " + shareUrl();
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
if (profileSel) profileSel.addEventListener("change", function () { state.profile = profileSel.value; render(); });
if (upliftInput) upliftInput.addEventListener("input", function () { state.uplift = Number(upliftInput.value); render(); });
priorityBtns.forEach(function (b) {
  b.addEventListener("click", function () {
    var c = b.dataset.priority;
    var i = state.p.indexOf(c);
    if (i === -1) state.p.push(c); else state.p.splice(i, 1);
    render();
  });
});
viewBtns.forEach(function (b) {
  b.addEventListener("click", function () { state.view = b.dataset.viewButton; render(); });
});
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
