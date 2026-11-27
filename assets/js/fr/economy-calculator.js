// economy-calculator.js — GTA 6 Money & Business ROI Calculator page logic.
// Uses the ported economy engine (assets/js/engines/economy-engine.js).
// AUDIT FIX M15: projected payouts round to compact figures in the UI
// (about 2.4M GTA$) and every result carries a "projected, not datamined"
// label, not only the methodology section.
// State lives in the URL (?mode=&method=&goal=&balance=&session=&horizon=)
// so results are shareable.
import { METHODS, BUSINESSES, SHARK_CARDS, findMethod as findMethodEn, rateFor as rateForEn, rankedMethods as rankedMethodsEn, rankedBusinesses as rankedBusinessesEn, planGrind, valueTable as valueTableEn, money, compactMoney } from "../engines/fr/economy-engine.js";

var METHOD_LABEL = { "flagship-heist": "Finale de braquage phare (difficile) (GTA Online)", "flagship-heist-solo": "Finale de braquage phare (solo, normal) (GTA Online)", "cargo-sell": "Vente de cargaison d'entrepôt (chargement complet) (GTA Online)", "counterfeit-sell": "Tour de vente du laboratoire de contrefaçon (GTA Online)", "vehicle-export": "Export de véhicule (classe supérieure) (GTA Online)", "contract-mission": "Chaîne de missions de contrat (GTA Online)", "payphone-hit": "Contrat de cabine téléphonique (cible bonus) (GTA Online)", "freeroam-event": "Événement en monde libre / semaine bonus (GTA Online)", "daily-objectives": "Objectifs quotidiens (3/3) (GTA Online)" };
var METHOD_NOTE = { "flagship-heist": "Tableau de préparation plus finale. Bonus difficile une fois par jour de jeu.", "flagship-heist-solo": "Itinéraire solo : butin plus faible, pas de partage, chaîne de préparation plus longue.", "cargo-sell": "Le prix d'achat est le vrai frein, le profit affiché est net après l'achat des caisses.", "counterfeit-sell": "Accumulation passive pendant que vous jouez à autre chose, puis une mission de vente.", "vehicle-export": "Voler, réparer, livrer proprement. Évolue mal avec les dégâts.", "contract-mission": "Pas d'investissement initial. Le revenu le plus fiable pour les nouveaux comptes.", "payphone-hit": "Court temps de recharge, la cible bonus double à peu près le butin de base.", "freeroam-event": "Plafond bas, zéro risque. Bon complément pendant qu'une entreprise tourne.", "daily-objectives": "Ajoute un bonus mensuel de complétion si vous ne manquez aucun jour." };
function mapMethod(m) { if (!m) return m; var c = Object.assign({}, m); c.label = METHOD_LABEL[m.id] || m.label; c.note = METHOD_NOTE[m.id] || m.note; return c; }
var BUSINESS_LABEL = { "counterfeit-lab": "Laboratoire de contrefaçon", "cargo-warehouse": "Grand entrepôt de cargaison", "nightclub": "Boîte de nuit + étage de stockage", "vehicle-workshop": "Atelier d'export de véhicules", "salvage-yard": "Casse automobile", "arcade-base": "Salle d'arcade / base de braquage" };
var BUSINESS_NOTE = { "counterfeit-lab": "L'entrée la moins chère dans le revenu passif. Courtes tournées de vente, faible risque.", "cargo-warehouse": "Plafond le plus élevé, mais l'achat des caisses est lui-même un travail actif.", "nightclub": "Meilleur ratio passif/actif. S'accumule pendant que vous jouez à d'autres contenus.", "vehicle-workshop": "Revenu entièrement actif. Paie bien par heure, jamais passif.", "salvage-yard": "Trois véhicules réclamables par jour de jeu, puis un itinéraire de vol.", "arcade-base": "Faible seule, achetez-la pour le tableau de braquage, pas pour le revenu au goutte-à-goutte." };
function mapBusiness(b) { if (!b) return b; var c = Object.assign({}, b); c.label = BUSINESS_LABEL[b.id] || b.label; c.note = BUSINESS_NOTE[b.id] || b.note; return c; }
var CARD_LABEL = { red: "Rouge (petit)", tiger: "Tigre", bull: "Taureau", "great-white": "Grand requin blanc", whale: "Baleine", megalodon: "Mégalodon" };
function findMethod(id) { return mapMethod(findMethodEn(id)); }
function rateFor(m) { var r = rateForEn(m); r.method = mapMethod(r.method); return r; }
function rankedMethods() { return rankedMethodsEn().map(function (r) { r.method = mapMethod(r.method); return r; }); }
function rankedBusinesses(h) { return rankedBusinessesEn(h).map(function (r) { r.business = mapBusiness(r.business); return r; }); }
function valueTable(g) { return valueTableEn(g).map(function (r) { var c = Object.assign({}, r.card); c.label = CARD_LABEL[r.card.id] || r.card.label; r.card = c; return r; }); }

var DEFAULTS = { mode: "grind", method: "contract-mission", goal: 5000000, balance: 0, session: 2, horizon: 60 };
var MODES = ["grind", "business", "cards"];
var MODE_META = {
  grind: { label: "Argent par heure", hint: "Classer les méthodes et planifier un objectif d'épargne" },
  business: { label: "ROI d'entreprise", hint: "Heures de remboursement et horizon de profit" },
  cards: { label: "Valeur des cartes Shark", hint: "GTA$ par dollar contre heures de collecte" }
};
var PROJ_BADGE = '<span class="proj-badge">Projeté, pas dataminé</span>';

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
  notice.textContent = "Inconnu " + parsed.bad.join(" et ") + " dans le lien, donc cette page est revenue aux valeurs par défaut. Choisissez votre méthode ci-dessous.";
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
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + x + '">Partager sur X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + r + '">Reddit</a>'
    + "</div>";
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

function methodTableHtml(rows, activeId) {
  var body = rows.map(function (r) {
    var hl = r.method.id === activeId ? ' class="hl-row"' : "";
    return "<tr" + hl + "><th scope=\"row\">" + r.method.label + "</th>"
      + "<td class=\"mono\">environ " + compactMoney(r.method.payout) + "</td>"
      + "<td class=\"mono\">" + money(r.perHour) + "</td>"
      + "<td class=\"muted\">" + r.method.minutes + " min</td>"
      + "<td class=\"muted\">" + compactMoney(r.method.cost) + "</td>"
      + "<td class=\"mono\">" + money(r.perHourPerPlayer) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="method-table">\n      <h2 id="method-table">Toutes les méthodes pour gagner des GTA$ dans GTA 6, classées par GTA$ nets par heure</h2>\n'
    + '      <p class="section-dek">Le taux net est le gain moins la mise de départ, divisé par la durée totale du cycle. Les gains sont des projections, affichées arrondies. Les neuf méthodes sont des méthodes GTA Online, présentées comme les analogues disponibles les plus proches.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Toutes les méthodes pour gagner des GTA$ dans GTA 6, classées par GTA$ nets par heure, tableau défilant">\n'
    + '      <table class="data-table" id="method-table-data">\n        <caption class="sr-only">Méthodes projetées pour gagner des GTA$ dans GTA 6, classées par dollars GTA nets par heure, avec gain, durée de cycle, investissement initial et taux par joueur.</caption>\n'
    + '        <thead><tr><th scope="col">Méthode</th><th scope="col">Gain</th><th scope="col">Net / h</th><th scope="col">Cycle</th><th scope="col">Investissement</th><th scope="col">Par joueur</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Les gains sont des projections, pas des valeurs dataminées. Le net par heure est le gain moins la mise de départ, divisé par les minutes que prend un cycle complet.</p>\n    </section>';
}
function businessTableHtml(rows, horizon) {
  var body = rows.map(function (r) {
    return "<tr><th scope=\"row\">" + r.business.label + "<span class=\"field-hint\">" + r.business.note + "</span></th>"
      + "<td class=\"muted\">" + compactMoney(r.business.price) + "</td>"
      + "<td class=\"mono\">" + money(r.netPerHour) + "</td>"
      + "<td class=\"mono\">" + r.paybackHours + " h</td>"
      + "<td class=\"mono\">" + compactMoney(r.profitAtHorizon) + "</td>"
      + "<td class=\"muted\">" + r.activeShare + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="business-table">\n      <h2 id="business-table">Quelle entreprise de GTA 6 se rembourse en premier</h2>\n'
    + '      <p class="section-dek">Heures de remboursement au taux net propre à chaque entreprise, plus le profit après ' + horizon + ' heures de jeu une fois le prix initial remboursé.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Quelle entreprise de GTA 6 se rembourse en premier, tableau défilant">\n'
    + '      <table class="data-table" id="business-table">\n        <caption class="sr-only">Prix projetés des entreprises de GTA 6, production nette horaire, heures de remboursement et profit sur la période choisie.</caption>\n'
    + '        <thead><tr><th scope="col">Entreprise</th><th scope="col">Prix</th><th scope="col">Net / h</th><th scope="col">Remboursement</th><th scope="col">Profit à ' + horizon + ' h</th><th scope="col">Actif</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Les taux des entreprises sont des projections, pas des valeurs dataminées.</p>\n    </section>';
}
function cardsTableHtml(rows) {
  var body = rows.map(function (r) {
    var best = r.best ? ' class="hl-row"' : "";
    var tag = r.best ? ' <span class="proj-badge">Meilleur rapport qualité-prix</span>' : "";
    return "<tr" + best + "><th scope=\"row\">" + r.card.label + tag + "</th>"
      + "<td class=\"muted\">" + compactMoney(r.card.gtaDollars) + "</td>"
      + "<td class=\"muted\">$" + r.card.usd.toFixed(2) + "</td>"
      + "<td class=\"mono\">" + money(r.perUsd) + "</td>"
      + "<td class=\"mono\">" + r.hoursSaved + " h</td>"
      + "<td class=\"mono\">$" + r.impliedWage.toFixed(2) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="cards-table">\n      <h2 id="cards-table">Valeur des cartes Shark par dollar réel, et les heures gagnées grâce à elles</h2>\n'
    + '      <p class="section-dek">Les packs plus gros achètent toujours plus de GTA$ par dollar. La colonne du salaire implicite transforme cela en une décision que vous pouvez vraiment prendre.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Valeur des cartes Shark par dollar réel, tableau défilant">\n'
    + '      <table class="data-table" id="cards-table">\n        <caption class="sr-only">Packs de cartes Shark avec dollars GTA par dollar US, heures de collecte remplacées, et salaire horaire implicite dans le monde réel.</caption>\n'
    + '        <thead><tr><th scope="col">Pack</th><th scope="col">GTA$</th><th scope="col">US$</th><th scope="col">GTA$ / 1 $</th><th scope="col">Heures gagnées</th><th scope="col">Salaire implicite</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Les prix des cartes suivent la boutique américaine actuelle. Les heures gagnées dépendent de votre taux de collecte ci-dessus.</p>\n    </section>';
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
  if (sessionLabel) sessionLabel.textContent = "Durée typique d'une session : " + state.session + " h";
  if (horizonInput) horizonInput.value = String(state.horizon);
  if (horizonLabel) horizonLabel.textContent = "Horizon de jeu : " + state.horizon + " heures";
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
    tldr = "Remboursement le plus rapide : " + top.business.label + " rembourse " + money(top.business.price) + " en environ " + top.paybackHours + " heures de jeu, puis rapporte " + money(top.netPerHour) + " net par heure.";
    verdictLine = top.business.label + " · " + top.paybackHours + " h de remboursement";
    lastShareText = "Remboursement d'entreprise le plus rapide dans GTA 6 : " + top.business.label + " rembourse " + money(top.business.price) + " en environ " + top.paybackHours + " heures, puis rapporte " + money(top.netPerHour) + " net/h.";
    lastShareTitle = "Remboursement d'entreprise le plus rapide dans GTA 6 : " + top.business.label;
    if (outputLabel) outputLabel.textContent = MODE_META.business.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Remboursement le plus rapide</dt><dd>" + top.business.label + "</dd></div>"
      + "<div><dt>Remboursement</dt><dd>" + top.paybackHours + " h</dd></div>"
      + "<div><dt>Net par heure</dt><dd>" + money(top.netPerHour) + "</dd></div>"
      + "<div><dt>Profit à " + state.horizon + " h</dt><dd>" + compactMoney(top.profitAtHorizon) + "</dd></div>"
      + "<div><dt>Part active</dt><dd>" + top.activeShare + " %</dd></div>"
      + "<div><dt>Prix</dt><dd>" + compactMoney(top.business.price) + "</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Les taux des entreprises sont des projections, pas des valeurs dataminées.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = businessTableHtml(bizRanked, state.horizon);
  } else if (state.mode === "cards") {
    var maxPerUsd = Math.max.apply(null, cards.map(function (c) { return c.perUsd; }));
    tldr = "Le pack au meilleur rapport achète " + money(maxPerUsd) + " GTA$ par dollar réel, soit environ " + bestCard.hoursSaved + " heures de collecte en moins à votre taux actuel de " + money(rate.perHour) + "/heure.";
    verdictLine = bestCard.card.label + " · " + money(maxPerUsd) + " GTA$ par 1 $";
    lastShareText = "Meilleure valeur de carte Shark : " + money(maxPerUsd) + " GTA$ par 1 $, environ " + bestCard.hoursSaved + " heures de collecte en moins.";
    lastShareTitle = "Meilleure valeur de carte Shark : " + bestCard.card.label;
    if (outputLabel) outputLabel.textContent = MODE_META.cards.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Pack au meilleur rapport</dt><dd>" + bestCard.card.label + "</dd></div>"
      + "<div><dt>GTA$ par 1 US$</dt><dd>" + money(maxPerUsd) + "</dd></div>"
      + "<div><dt>Votre taux de collecte</dt><dd>" + money(rate.perHour) + "/h</dd></div>"
      + "<div><dt>Salaire implicite</dt><dd>$" + bestCard.impliedWage.toFixed(2) + "/h</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Les prix des cartes suivent la boutique américaine actuelle. Les heures gagnées dépendent de votre taux de collecte ci-dessus.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = cardsTableHtml(cards);
  } else {
    tldr = method.label + " rapporte " + money(rate.perHour) + " net par heure. Atteindre " + compactMoney(state.goal) + " depuis " + compactMoney(state.balance) + " prend " + plan.cycles + " cycles, environ " + plan.hours + " heures, ou " + plan.sessionsNeeded + " sessions de " + state.session + " h.";
    verdictLine = method.label + " · " + money(rate.perHour) + " net par heure";
    lastShareText = method.label + " rapporte " + money(rate.perHour) + " net/h dans GTA 6. " + plan.cycles + " cycles jusqu'à " + compactMoney(state.goal) + ", environ " + plan.hours + " heures. Plan d'argent GTA 6 sur ToolWools.";
    lastShareTitle = method.label + " rapporte " + money(rate.perHour) + " net/h (GTA 6)";
    if (outputLabel) outputLabel.textContent = MODE_META.grind.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Net par heure</dt><dd>" + money(rate.perHour) + "</dd></div>"
      + "<div><dt>Par cycle</dt><dd>" + money(rate.netPerCycle) + "</dd></div>"
      + "<div><dt>Cycles jusqu'à l'objectif</dt><dd>" + plan.cycles + "</dd></div>"
      + "<div><dt>Heures jusqu'à l'objectif</dt><dd>" + plan.hours + " h</dd></div>"
      + "<div><dt>Sessions</dt><dd>" + plan.sessionsNeeded + " x " + state.session + " h</dd></div>"
      + "<div><dt>Par joueur</dt><dd>" + money(rate.perHourPerPlayer) + "/h</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Les gains sont des projections, pas des valeurs dataminées.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = methodTableHtml(ranked, state.method);
  }

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Plan d'argent · En bref";
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
  var xLink = document.querySelector('.share-panel a[href*="twitter.com"]');
  var rLink = document.querySelector('.share-panel a[href*="reddit.com"]');
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
