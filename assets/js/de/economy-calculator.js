// economy-calculator.js — GTA 6 Money & Business ROI Calculator page logic.
// Uses the ported economy engine (assets/js/engines/economy-engine.js).
// AUDIT FIX M15: projected payouts round to compact figures in the UI
// (about 2.4M GTA$) and every result carries a "projected, not datamined"
// label, not only the methodology section.
// State lives in the URL (?mode=&method=&goal=&balance=&session=&horizon=)
// so results are shareable.
import { METHODS, BUSINESSES, SHARK_CARDS, findMethod as findMethodEn, rateFor as rateForEn, rankedMethods as rankedMethodsEn, rankedBusinesses as rankedBusinessesEn, planGrind, valueTable as valueTableEn, money, compactMoney } from "../engines/de/economy-engine.js";

var METHOD_LABEL = { "flagship-heist": "Flaggschiff-Heist-Finale (schwer) (GTA Online)", "flagship-heist-solo": "Flaggschiff-Heist-Finale (solo, normal) (GTA Online)", "cargo-sell": "Lager-Frachtverkauf (volle Kistenladung) (GTA Online)", "counterfeit-sell": "Falschgeld-Labor-Verkaufsrunde (GTA Online)", "vehicle-export": "Fahrzeugexport (Top-Klasse) (GTA Online)", "contract-mission": "Vertrags-Missionskette (GTA Online)", "payphone-hit": "Münztelefon-Hit (Bonus-Ziel) (GTA Online)", "freeroam-event": "Freeroam-Event / Bonus-Woche (GTA Online)", "daily-objectives": "Tägliche Ziele (3/3) (GTA Online)" };
var METHOD_NOTE = { "flagship-heist": "Setup-Board plus Finale. Schwer-Bonus einmal pro Ingame-Tag.", "flagship-heist-solo": "Solo-Route: geringere Beute, keine Aufteilung, längere Setup-Kette.", "cargo-sell": "Der Kaufpreis ist die echte Bremse, der gezeigte Profit ist netto nach Kistenkauf.", "counterfeit-sell": "Passives Ansammeln, während du etwas anderes spielst, dann eine Verkaufsmission.", "vehicle-export": "Stehlen, reparieren, sauber liefern. Skaliert schlecht mit Schaden.", "contract-mission": "Kein Buy-in. Das zuverlässigste Einkommen für neue Accounts.", "payphone-hit": "Kurzer Cooldown, Bonus-Ziel verdoppelt etwa die Basis-Beute.", "freeroam-event": "Niedrige Obergrenze, null Risiko. Guter Füller, während ein Business läuft.", "daily-objectives": "Stapelt einen monatlichen Abschluss-Bonus obendrauf, wenn du keinen Tag verpasst." };
function mapMethod(m) { if (!m) return m; var c = Object.assign({}, m); c.label = METHOD_LABEL[m.id] || m.label; c.note = METHOD_NOTE[m.id] || m.note; return c; }
var BUSINESS_LABEL = { "counterfeit-lab": "Falschgeld-Labor", "cargo-warehouse": "Großes Frachtlager", "nightclub": "Nachtclub + Lageretage", "vehicle-workshop": "Fahrzeugexport-Werkstatt", "salvage-yard": "Schrottplatz", "arcade-base": "Arcade / Heist-Basis" };
var BUSINESS_NOTE = { "counterfeit-lab": "Günstigster Einstieg in passives Einkommen. Kurze Verkaufsrunden, geringes Risiko.", "cargo-warehouse": "Höchste Obergrenze, aber Kistenkauf ist selbst ein aktiver Job.", "nightclub": "Bestes Passiv-zu-Aktiv-Verhältnis. Sammelt sich, während du andere Inhalte spielst.", "vehicle-workshop": "Vollständig aktives Einkommen. Zahlt gut pro Stunde, nie passiv.", "salvage-yard": "Drei beanspruchbare Fahrzeuge pro Ingame-Tag, dann eine Raub-Route.", "arcade-base": "Allein schwach, kaufe sie für das Heist-Board, nicht für das Tropfen-Einkommen." };
function mapBusiness(b) { if (!b) return b; var c = Object.assign({}, b); c.label = BUSINESS_LABEL[b.id] || b.label; c.note = BUSINESS_NOTE[b.id] || b.note; return c; }
var CARD_LABEL = { red: "Rot (klein)", tiger: "Tiger", bull: "Bulle", "great-white": "Weißer Hai", whale: "Wal", megalodon: "Megalodon" };
function findMethod(id) { return mapMethod(findMethodEn(id)); }
function rateFor(m) { var r = rateForEn(m); r.method = mapMethod(r.method); return r; }
function rankedMethods() { return rankedMethodsEn().map(function (r) { r.method = mapMethod(r.method); return r; }); }
function rankedBusinesses(h) { return rankedBusinessesEn(h).map(function (r) { r.business = mapBusiness(r.business); return r; }); }
function valueTable(g) { return valueTableEn(g).map(function (r) { var c = Object.assign({}, r.card); c.label = CARD_LABEL[r.card.id] || r.card.label; r.card = c; return r; }); }

var DEFAULTS = { mode: "grind", method: "contract-mission", goal: 5000000, balance: 0, session: 2, horizon: 60 };
var MODES = ["grind", "business", "cards"];
var MODE_META = {
  grind: { label: "Geld pro Stunde", hint: "Methoden ranken und ein Sparziel timen" },
  business: { label: "Business-ROI", hint: "Payback-Stunden und Profit-Horizont" },
  cards: { label: "Shark-Card-Wert", hint: "GTA$ pro Dollar vs Grind-Stunden" }
};
var PROJ_BADGE = '<span class="proj-badge">Projiziert, nicht datamined</span>';

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var modeRaw = q.get("mode");
  var state = {
    mode: MODES.indexOf(modeRaw) !== -1 ? modeRaw : DEFAULTS.mode,
    method: q.get("method") || DEFAULTS.method,
    goal: numOr(q.get("goal"), DEFAULTS.goal),
    balance: numOr(q.get("balance"), DEFAULTS.balance),
    session: numOr(q.get("session"), DEFAULTS.session),
    horizon: numOr(q.get("horizon"), DEFAULTS.horizon)
  };
  function numOr(raw, fallback) {
    if (raw === null || raw === "") return fallback;
    var n = Number(raw);
    return Number.isFinite(n) ? n : fallback;
  }
  state.goal = Math.max(0, state.goal);
  state.balance = Math.max(0, state.balance);
  if (state.session < 0.5 || state.session > 6) state.session = DEFAULTS.session;
  if (state.horizon < 10 || state.horizon > 300) state.horizon = DEFAULTS.horizon;
  var bad = [];
  if (modeRaw !== null && MODES.indexOf(modeRaw) === -1) bad.push("mode");
  if (!findMethod(state.method)) { bad.push("money method"); state.method = DEFAULTS.method; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Unbekannte " + parsed.bad.join(" und ") + " im Link, also hat diese Seite auf die Defaults zurückgesetzt. Wähle unten deine Methode.";
  notice.classList.add("show");
}

var modeButtons = $all("[data-mode-button]");
var methodSel = $("[data-method-select]");
var methodNote = $("[data-method-note]");
var goalInput = $("[data-goal-input]");
var balanceInput = $("[data-balance-input]");
var sessionInput = $("[data-session-input]");
var sessionLabel = $("[data-session-label]");
var horizonInput = $("[data-horizon-input]");
var horizonLabel = $("[data-horizon-label]");
var modeHint = $("[data-mode-hint]");
var grindRateEl = $("[data-grind-rate]");
var fieldWraps = $all("[data-field]");

function shareUrl() {
  var p = new URLSearchParams({ mode: state.mode, method: state.method, goal: String(state.goal), balance: String(state.balance), session: String(state.session), horizon: String(state.horizon) });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ mode: state.mode, method: state.method, goal: String(state.goal), balance: String(state.balance), session: String(state.session), horizon: String(state.horizon) });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function shareLinks(text, title) {
  var url = shareUrl();
  var x = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(text) + "&url=" + encodeURIComponent(url);
  var r = "https://www.reddit.com/submit?title=" + encodeURIComponent(title) + "&url=" + encodeURIComponent(url);
  return '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Urteil kopieren</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf X teilen" href="' + x + '">Auf X teilen</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Urteil auf Reddit teilen" href="' + r + '">Reddit</a>'
    + "</div>";
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

function methodTableHtml(rows, activeId) {
  var body = rows.map(function (r) {
    var hl = r.method.id === activeId ? ' class="hl-row"' : "";
    return "<tr" + hl + "><th scope=\"row\">" + r.method.label + "</th>"
      + "<td class=\"mono\">etwa " + compactMoney(r.method.payout) + "</td>"
      + "<td class=\"mono\">" + money(r.perHour) + "</td>"
      + "<td class=\"muted\">" + r.method.minutes + " Min.</td>"
      + "<td class=\"muted\">" + compactMoney(r.method.cost) + "</td>"
      + "<td class=\"mono\">" + money(r.perHourPerPlayer) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="method-table">\n      <h2 id="method-table">Jede GTA-6-Geldmethode, gerankt nach Netto-GTA$ pro Stunde</h2>\n'
    + '      <p class="section-dek">Netto-Rate ist Auszahlung minus Buy-in, geteilt durch die volle Zykluszeit. Auszahlungen sind Projektionen, gerundet gezeigt. Alle neun Methoden sind GTA-Online-Methoden, gezeigt als die nächstliegenden verfügbaren Analoga.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Jede GTA-6-Geldmethode, gerankt nach Netto-GTA$ pro Stunde, scrollbare Tabelle">\n'
    + '      <table class="data-table" id="method-table">\n        <caption class="sr-only">Projizierte GTA-6-Geldmethoden, gerankt nach Netto-GTA-Dollar pro Stunde, mit Auszahlung, Zykluszeit, Buy-in und Pro-Spieler-Rate.</caption>\n'
    + '        <thead><tr><th scope="col">Methode</th><th scope="col">Auszahlung</th><th scope="col">Netto / Std.</th><th scope="col">Zyklus</th><th scope="col">Buy-in</th><th scope="col">Pro Spieler</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Auszahlungen sind Projektionen, keine datamined Werte. Netto pro Stunde ist Auszahlung minus Buy-in, geteilt durch die Minuten eines vollen Zyklus.</p>\n    </section>';
}
function businessTableHtml(rows, horizon) {
  var body = rows.map(function (r) {
    return "<tr><th scope=\"row\">" + r.business.label + "<span class=\"field-hint\">" + r.business.note + "</span></th>"
      + "<td class=\"muted\">" + compactMoney(r.business.price) + "</td>"
      + "<td class=\"mono\">" + money(r.netPerHour) + "</td>"
      + "<td class=\"mono\">" + r.paybackHours + " Std.</td>"
      + "<td class=\"mono\">" + compactMoney(r.profitAtHorizon) + "</td>"
      + "<td class=\"muted\">" + r.activeShare + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="business-table">\n      <h2 id="business-table">Welches GTA-6-Business zahlt sich zuerst selbst</h2>\n'
    + '      <p class="section-dek">Payback-Stunden bei der eigenen Netto-Rate jedes Business, plus Profit nach ' + horizon + ' Spielstunden, sobald der Kaufpreis zurückgezahlt ist.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Welches GTA-6-Business zahlt sich zuerst selbst, scrollbare Tabelle">\n'
    + '      <table class="data-table" id="business-table">\n        <caption class="sr-only">Projizierte GTA-6-Business-Kaufpreise, Netto-Stundenproduktion, Payback-Stunden und Profit beim gewählten Horizont.</caption>\n'
    + '        <thead><tr><th scope="col">Business</th><th scope="col">Preis</th><th scope="col">Netto / Std.</th><th scope="col">Payback</th><th scope="col">Profit bei ' + horizon + ' Std.</th><th scope="col">Aktiv</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Business-Raten sind Projektionen, keine datamined Werte.</p>\n    </section>';
}
function cardsTableHtml(rows) {
  var body = rows.map(function (r) {
    var best = r.best ? ' class="hl-row"' : "";
    var tag = r.best ? ' <span class="proj-badge">Bester Wert</span>' : "";
    return "<tr" + best + "><th scope=\"row\">" + r.card.label + tag + "</th>"
      + "<td class=\"muted\">" + compactMoney(r.card.gtaDollars) + "</td>"
      + "<td class=\"muted\">$" + r.card.usd.toFixed(2) + "</td>"
      + "<td class=\"mono\">" + money(r.perUsd) + "</td>"
      + "<td class=\"mono\">" + r.hoursSaved + " Std.</td>"
      + "<td class=\"mono\">$" + r.impliedWage.toFixed(2) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="cards-table">\n      <h2 id="cards-table">Shark-Card-Wert pro echtem Dollar, und die Stunden, die er zurückkauft</h2>\n'
    + '      <p class="section-dek">Größere Packs kaufen immer mehr GTA$ pro Dollar. Die Implied-Wage-Spalte macht daraus eine Entscheidung, die du wirklich treffen kannst.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Shark-Card-Wert pro echtem Dollar, scrollbare Tabelle">\n'
    + '      <table class="data-table" id="cards-table">\n        <caption class="sr-only">Shark-Card-Packs mit GTA-Dollar pro US-Dollar, ersetzten Grind-Stunden und impliziertem realem Stundenlohn.</caption>\n'
    + '        <thead><tr><th scope="col">Pack</th><th scope="col">GTA$</th><th scope="col">US$</th><th scope="col">GTA$ / $1</th><th scope="col">Gesparte Stunden</th><th scope="col">Implizierter Lohn</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Kartenpreise folgen dem aktuellen US-Store. Gesparte Stunden hängen von deiner Grind-Rate oben ab.</p>\n    </section>';
}

var lastShareText = "";
var lastShareTitle = "";

function render() {
  var method = findMethod(state.method) || mapMethod(METHODS[5]);
  var rate = rateFor(method);
  var plan = planGrind(method, state.goal, state.balance, state.session);
  var ranked = rankedMethods();
  var bizRanked = rankedBusinesses(state.horizon);
  var cards = valueTable(rate.perHour);
  var bestCard = null;
  cards.forEach(function (c) { if (c.best) bestCard = c; });

  modeButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.modeButton === state.mode)); });
  if (modeHint) modeHint.textContent = MODE_META[state.mode].hint;
  if (methodSel) methodSel.value = state.method;
  if (methodNote) methodNote.textContent = method.note;
  if (goalInput && document.activeElement !== goalInput) goalInput.value = String(state.goal);
  if (balanceInput && document.activeElement !== balanceInput) balanceInput.value = String(state.balance);
  if (sessionInput) sessionInput.value = String(state.session);
  if (sessionLabel) sessionLabel.textContent = "Typische Session-Länge: " + state.session + " Std.";
  if (horizonInput) horizonInput.value = String(state.horizon);
  if (horizonLabel) horizonLabel.textContent = "Spiel-Horizont: " + state.horizon + " Stunden";
  if (grindRateEl) grindRateEl.textContent = money(rate.perHour);
  fieldWraps.forEach(function (w) {
    var f = w.dataset.field;
    var show = (f === "grind" && state.mode === "grind")
      || (f === "business" && state.mode === "business")
      || (f === "cards" && state.mode === "cards")
      || (f === "method" && state.mode !== "business");
    w.hidden = !show;
  });

  var tldr = "";
  var verdictLine = "";
  var outHtml = "";
  var tableHtml = "";
  var outputLabel = $(".output-panel-label");
  if (state.mode === "business") {
    var top = bizRanked[0];
    tldr = "Schnellster Payback: " + top.business.label + " zahlt " + money(top.business.price) + " in etwa " + top.paybackHours + " Spielstunden zurück, dann netto " + money(top.netPerHour) + " pro Stunde.";
    verdictLine = top.business.label + " · " + top.paybackHours + " Std. Payback";
    lastShareText = "Schnellster GTA-6-Business-Payback: " + top.business.label + " zahlt " + money(top.business.price) + " in etwa " + top.paybackHours + " Stunden zurück, dann netto " + money(top.netPerHour) + "/Std.";
    lastShareTitle = "Schnellster GTA-6-Business-Payback: " + top.business.label;
    if (outputLabel) outputLabel.textContent = MODE_META.business.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Schnellster Payback</dt><dd>" + top.business.label + "</dd></div>"
      + "<div><dt>Payback</dt><dd>" + top.paybackHours + " Std.</dd></div>"
      + "<div><dt>Netto pro Stunde</dt><dd>" + money(top.netPerHour) + "</dd></div>"
      + "<div><dt>Profit bei " + state.horizon + " Std.</dt><dd>" + compactMoney(top.profitAtHorizon) + "</dd></div>"
      + "<div><dt>Aktiver Anteil</dt><dd>" + top.activeShare + " %</dd></div>"
      + "<div><dt>Preis</dt><dd>" + compactMoney(top.business.price) + "</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Business-Raten sind Projektionen, keine datamined Werte.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = businessTableHtml(bizRanked, state.horizon);
  } else if (state.mode === "cards") {
    var maxPerUsd = Math.max.apply(null, cards.map(function (c) { return c.perUsd; }));
    tldr = "Das Pack mit dem besten Wert kauft " + money(maxPerUsd) + " GTA$ pro echtem Dollar, etwa " + bestCard.hoursSaved + " Grind-Stunden weniger bei deiner aktuellen Rate von " + money(rate.perHour) + "/Stunde.";
    verdictLine = bestCard.card.label + " · " + money(maxPerUsd) + " GTA$ pro $1";
    lastShareText = "Bester Shark-Card-Wert: " + money(maxPerUsd) + " GTA$ pro $1, etwa " + bestCard.hoursSaved + " Grind-Stunden weniger.";
    lastShareTitle = "Bester Shark-Card-Wert: " + bestCard.card.label;
    if (outputLabel) outputLabel.textContent = MODE_META.cards.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Pack mit bestem Wert</dt><dd>" + bestCard.card.label + "</dd></div>"
      + "<div><dt>GTA$ pro US$1</dt><dd>" + money(maxPerUsd) + "</dd></div>"
      + "<div><dt>Deine Grind-Rate</dt><dd>" + money(rate.perHour) + "/Std.</dd></div>"
      + "<div><dt>Implizierter Lohn</dt><dd>$" + bestCard.impliedWage.toFixed(2) + "/Std.</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Kartenpreise folgen dem aktuellen US-Store. Gesparte Stunden hängen von deiner Grind-Rate oben ab.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = cardsTableHtml(cards);
  } else {
    tldr = method.label + " bringt netto " + money(rate.perHour) + " pro Stunde. Um " + compactMoney(state.goal) + " von " + compactMoney(state.balance) + " zu erreichen, braucht es " + plan.cycles + " Zyklen, etwa " + plan.hours + " Stunden oder " + plan.sessionsNeeded + " Sessions à " + state.session + " Std.";
    verdictLine = method.label + " · " + money(rate.perHour) + " pro Stunde";
    lastShareText = method.label + " bringt netto " + money(rate.perHour) + "/Std. in GTA 6. " + plan.cycles + " Zyklen bis " + compactMoney(state.goal) + ", etwa " + plan.hours + " Stunden. GTA-6-Geldplan auf ToolWools.";
    lastShareTitle = method.label + " bringt netto " + money(rate.perHour) + "/Std. (GTA 6)";
    if (outputLabel) outputLabel.textContent = MODE_META.grind.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Netto pro Stunde</dt><dd>" + money(rate.perHour) + "</dd></div>"
      + "<div><dt>Pro Zyklus</dt><dd>" + money(rate.netPerCycle) + "</dd></div>"
      + "<div><dt>Zyklen bis zum Ziel</dt><dd>" + plan.cycles + "</dd></div>"
      + "<div><dt>Stunden bis zum Ziel</dt><dd>" + plan.hours + " Std.</dd></div>"
      + "<div><dt>Sessions</dt><dd>" + plan.sessionsNeeded + " x " + state.session + " Std.</dd></div>"
      + "<div><dt>Pro Spieler</dt><dd>" + money(rate.perHourPerPlayer) + "/Std.</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Payouts are projections, not datamined values.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = methodTableHtml(ranked, state.method);
  }

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Geldplan · Kurzfassung";
    if (text) text.textContent = tldr;
    if (verdictEl) verdictEl.textContent = verdictLine;
  }
  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML = outHtml;
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(lastShareText + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }
  var slot = $("[data-table-slot]");
  if (slot) slot.innerHTML = tableHtml;

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = document.querySelector('.share-panel a[aria-label="Dieses Ergebnis auf X teilen"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Dieses Ergebnis auf Reddit teilen"]');
  if (xLink) xLink.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(lastShareText) + "&url=" + encodeURIComponent(shareUrl());
  if (rLink) rLink.href = "https://www.reddit.com/submit?title=" + encodeURIComponent(lastShareTitle) + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = tldr;
  syncUrl();
}

modeButtons.forEach(function (b) { b.addEventListener("click", function () { state.mode = b.dataset.modeButton; render(); }); });
if (methodSel) methodSel.addEventListener("change", function () { state.method = methodSel.value; render(); });
if (goalInput) goalInput.addEventListener("change", function () { var n = Number(goalInput.value); state.goal = Number.isFinite(n) ? Math.max(0, n) : DEFAULTS.goal; render(); });
if (balanceInput) balanceInput.addEventListener("change", function () { var n = Number(balanceInput.value); state.balance = Number.isFinite(n) ? Math.max(0, n) : DEFAULTS.balance; render(); });
if (sessionInput) sessionInput.addEventListener("input", function () { state.session = Number(sessionInput.value); render(); });
if (horizonInput) horizonInput.addEventListener("input", function () { state.horizon = Number(horizonInput.value); render(); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
