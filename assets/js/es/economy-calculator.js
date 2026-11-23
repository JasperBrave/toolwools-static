// economy-calculator.js — Calculadora de dinero y ROI de negocios de GTA 6 page logic.
// Uses the ported economy engine (assets/js/engines/economy-engine.js).
// AUDIT FIX M15: projected payouts round to compact figures in the UI
// (about 2.4M GTA$) and every result carries a "projected, not datamined"
// label, not only the methodology section.
// State lives in the URL (?mode=&method=&goal=&balance=&session=&horizon=)
// so results are shareable.
import { METHODS, BUSINESSES, SHARK_CARDS, findMethod, rateFor, rankedMethods, rankedBusinesses, planGrind, valueTable, money, compactMoney } from "../engines/es/economy-engine.js";

var DEFAULTS = { mode: "grind", method: "contract-mission", goal: 5000000, balance: 0, session: 2, horizon: 60 };
var MODES = ["grind", "business", "cards"];
var MODE_META = {
  grind: { label: "Dinero por hora", hint: "Clasifica métodos y calcula el tiempo de una meta de ahorro" },
  business: { label: "ROI de negocio", hint: "Retorno horas y horizonte de beneficio" },
  cards: { label: "Valor de Shark Card", hint: "GTA$ por dólar frente a horas de farmeo" }
};
var PROJ_BADGE = '<span class="proj-badge">Proyectado, no extraído de datos</span>';

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
  notice.textContent = "Desconocido " + parsed.bad.join(" y ") + " en el enlace, así que esta página se restableció a los valores predeterminados. Elige tu método abajo.";
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
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredicto</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en X" href="' + x + '">Compartir en X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartir veredicto en Reddit" href="' + r + '">Reddit</a>'
    + "</div>";
}
function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copiar";
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

function methodTableHtml(rows, activeId) {
  var body = rows.map(function (r) {
    var hl = r.method.id === activeId ? ' class="hl-row"' : "";
    return "<tr" + hl + "><th scope=\"row\">" + r.method.label + "</th>"
      + "<td class=\"mono\">unos " + compactMoney(r.method.payout) + "</td>"
      + "<td class=\"mono\">" + money(r.perHour) + "</td>"
      + "<td class=\"muted\">" + r.method.minutes + " min</td>"
      + "<td class=\"muted\">" + compactMoney(r.method.cost) + "</td>"
      + "<td class=\"mono\">" + money(r.perHourPerPlayer) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="method-table">\n      <h2 id="method-table">Cada método de dinero de GTA 6 clasificado por GTA$ netos por hora</h2>\n'
    + '      <p class="section-dek">La tasa neta es pago menos entrada, dividido por el tiempo total del ciclo. Los pagos son proyecciones, mostrados redondeados. Los nueve métodos son métodos de GTA Online, mostrados como los análogos disponibles más cercanos.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Cada método de dinero de GTA 6 clasificado por GTA$ netos por hora, tabla desplazable">\n'
    + '      <table class="data-table" id="method-table-data">\n        <caption class="sr-only">Métodos de dinero proyectados de GTA 6 clasificados por dólares GTA netos por hora, con pago, tiempo de ciclo, entrada y tasa por jugador.</caption>\n'
    + '        <thead><tr><th scope="col">Método</th><th scope="col">Pago</th><th scope="col">Neto / h</th><th scope="col">Ciclo</th><th scope="col">Entrada</th><th scope="col">Por jugador</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Los pagos son proyecciones, no valores extraídos de datos. El neto por hora es pago menos entrada, dividido por los minutos que toma un ciclo completo.</p>\n    </section>';
}
function businessTableHtml(rows, horizon) {
  var body = rows.map(function (r) {
    return "<tr><th scope=\"row\">" + r.business.label + "<span class=\"field-hint\">" + r.business.note + "</span></th>"
      + "<td class=\"muted\">" + compactMoney(r.business.price) + "</td>"
      + "<td class=\"mono\">" + money(r.netPerHour) + "</td>"
      + "<td class=\"mono\">" + r.paybackHours + "h</td>"
      + "<td class=\"mono\">" + compactMoney(r.profitAtHorizon) + "</td>"
      + "<td class=\"muted\">" + r.activeShare + "%</td></tr>";
  }).join("");
  return '<section aria-labelledby="business-table">\n      <h2 id="business-table">Qué negocio de GTA 6 se amortiza primero</h2>\n'
    + '      <p class="section-dek">Horas de retorno a la tasa neta propia de cada negocio, más beneficio después de ' + horizon + ' horas de juego una vez amortizado el precio de compra.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Qué negocio de GTA 6 se amortiza primero, tabla desplazable">\n'
    + '      <table class="data-table" id="business-table">\n        <caption class="sr-only">Precios de compra proyectados de negocios de GTA 6, producción neta por hora, retorno horas y beneficio en el horizonte seleccionado.</caption>\n'
    + '        <thead><tr><th scope="col">Negocio</th><th scope="col">Precio</th><th scope="col">Neto / h</th><th scope="col">Retorno</th><th scope="col">Beneficio a las ' + horizon + ' h</th><th scope="col">Activo</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Las tarifas de negocios son proyecciones, no valores extraídos de datos.</p>\n    </section>';
}
function cardsTableHtml(rows) {
  var body = rows.map(function (r) {
    var best = r.best ? ' class="hl-row"' : "";
    var tag = r.best ? ' <span class="proj-badge">Mejor valor</span>' : "";
    return "<tr" + best + "><th scope=\"row\">" + r.card.label + tag + "</th>"
      + "<td class=\"muted\">" + compactMoney(r.card.gtaDollars) + "</td>"
      + "<td class=\"muted\">$" + r.card.usd.toFixed(2) + "</td>"
      + "<td class=\"mono\">" + money(r.perUsd) + "</td>"
      + "<td class=\"mono\">" + r.hoursSaved + "h</td>"
      + "<td class=\"mono\">$" + r.impliedWage.toFixed(2) + "</td></tr>";
  }).join("");
  return '<section aria-labelledby="cards-table">\n      <h2 id="cards-table">Valor de Shark Card por dólar real, y las horas que te devuelve</h2>\n'
    + '      <p class="section-dek">Los paquetes más grandes siempre compran más GTA$ por dólar. La columna de salario implícito convierte eso en una decisión que realmente puedes tomar.</p>\n'
    + '      <div class="table-scroll" tabindex="0" role="region" aria-label="Valor de Shark Card por dólar real, tabla desplazable">\n'
    + '      <table class="data-table" id="cards-table">\n        <caption class="sr-only">Paquetes de Shark Card con dólares GTA por dólar estadounidense, horas de farmeo reemplazadas, y salario por hora implícito en el mundo real.</caption>\n'
    + '        <thead><tr><th scope="col">Pack</th><th scope="col">GTA$</th><th scope="col">US$</th><th scope="col">GTA$ / $1</th><th scope="col">Horas ahorradas</th><th scope="col">Salario implícito</th></tr></thead>\n'
    + "        <tbody>" + body + "</tbody>\n      </table>\n    </div>\n"
    + '      <p class="field-hint" style="margin-top:0.75rem">' + PROJ_BADGE + ' Los precios de las tarjetas siguen la tienda de EE. UU. actual. Las horas ahorradas dependen de tu ritmo de farmeo de arriba.</p>\n    </section>';
}

var lastShareText = "";
var lastShareTitle = "";

function render() {
  var method = findMethod(state.method) || METHODS[5];
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
  if (sessionLabel) sessionLabel.textContent = "Duración típica de sesión: " + state.session + " h";
  if (horizonInput) horizonInput.value = String(state.horizon);
  if (horizonLabel) horizonLabel.textContent = "Horizonte de juego: " + state.horizon + " horas";
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
    tldr = "Retorno más rápido: " + top.business.label + " devuelve " + money(top.business.price) + " en unas " + top.paybackHours + " horas de juego, y luego genera " + money(top.netPerHour) + " por hora.";
    verdictLine = top.business.label + " · " + top.paybackHours + " h de retorno";
    lastShareText = "Retorno más rápido de negocio de GTA 6: " + top.business.label + " devuelve " + money(top.business.price) + " en unas " + top.paybackHours + " horas, y luego genera " + money(top.netPerHour) + "/h.";
    lastShareTitle = "Retorno más rápido de negocio de GTA 6: " + top.business.label;
    if (outputLabel) outputLabel.textContent = MODE_META.business.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Retorno más rápido</dt><dd>" + top.business.label + "</dd></div>"
      + "<div><dt>Retorno</dt><dd>" + top.paybackHours + "h</dd></div>"
      + "<div><dt>Neto por hora</dt><dd>" + money(top.netPerHour) + "</dd></div>"
      + "<div><dt>Beneficio a las " + state.horizon + " h</dt><dd>" + compactMoney(top.profitAtHorizon) + "</dd></div>"
      + "<div><dt>Parte activa</dt><dd>" + top.activeShare + "%</dd></div>"
      + "<div><dt>Precio</dt><dd>" + compactMoney(top.business.price) + "</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Las tarifas de negocios son proyecciones, no valores extraídos de datos.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = businessTableHtml(bizRanked, state.horizon);
  } else if (state.mode === "cards") {
    var maxPerUsd = Math.max.apply(null, cards.map(function (c) { return c.perUsd; }));
    tldr = "El pack de mejor valor compra " + money(maxPerUsd) + " GTA$ por dólar real, unas " + bestCard.hoursSaved + " horas de farmeo eliminadas a tu ritmo actual de " + money(rate.perHour) + "/hora.";
    verdictLine = bestCard.card.label + " · " + money(maxPerUsd) + " GTA$ por $1";
    lastShareText = "Mejor valor de Shark Card: " + money(maxPerUsd) + " GTA$ por 1 $, unas " + bestCard.hoursSaved + " horas de farmeo eliminadas.";
    lastShareTitle = "Mejor valor de Shark Card: " + bestCard.card.label;
    if (outputLabel) outputLabel.textContent = MODE_META.cards.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Pack de mejor valor</dt><dd>" + bestCard.card.label + "</dd></div>"
      + "<div><dt>GTA$ por 1 US$</dt><dd>" + money(maxPerUsd) + "</dd></div>"
      + "<div><dt>Tu ritmo de farmeo</dt><dd>" + money(rate.perHour) + "/h</dd></div>"
      + "<div><dt>Salario implícito</dt><dd>$" + bestCard.impliedWage.toFixed(2) + "/h</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Los precios de las tarjetas siguen la tienda de EE. UU. actual. Las horas ahorradas dependen de tu ritmo de farmeo de arriba.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = cardsTableHtml(cards);
  } else {
    tldr = method.label + " rinde " + money(rate.perHour) + " netos por hora. Llegar a " + compactMoney(state.goal) + " desde " + compactMoney(state.balance) + " toma " + plan.cycles + " ciclos, unas " + plan.hours + " horas, o " + plan.sessionsNeeded + " sesiones de " + state.session + " h.";
    verdictLine = method.label + " · " + money(rate.perHour) + " por hora";
    lastShareText = method.label + " genera " + money(rate.perHour) + "/hora en GTA 6. " + plan.cycles + " ciclos hasta " + compactMoney(state.goal) + ", unas " + plan.hours + " horas. Plan de dinero de GTA 6 en ToolWools.";
    lastShareTitle = method.label + " genera " + money(rate.perHour) + "/hora (GTA 6)";
    if (outputLabel) outputLabel.textContent = MODE_META.grind.label;
    outHtml = '<dl class="stat-grid">'
      + "<div><dt>Neto por hora</dt><dd>" + money(rate.perHour) + "</dd></div>"
      + "<div><dt>Por ciclo</dt><dd>" + money(rate.netPerCycle) + "</dd></div>"
      + "<div><dt>Ciclos hasta la meta</dt><dd>" + plan.cycles + "</dd></div>"
      + "<div><dt>Horas hasta la meta</dt><dd>" + plan.hours + "h</dd></div>"
      + "<div><dt>Sesiones</dt><dd>" + plan.sessionsNeeded + " x " + state.session + "h</dd></div>"
      + "<div><dt>Por jugador</dt><dd>" + money(rate.perHourPerPlayer) + "/h</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + PROJ_BADGE + ' Los pagos son proyecciones, no valores extraídos de datos.</p>'
      + shareLinks(lastShareText, lastShareTitle);
    tableHtml = methodTableHtml(ranked, state.method);
  }

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    tldrCard.dataset.tone = "ready";
    var label = $("[data-tldr-label]", tldrCard);
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (label) label.textContent = "Plan de dinero · Resumen";
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
  var xLink = document.querySelector('.share-panel a[aria-label="Comparte este resultado en X"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Comparte este resultado en Reddit"]');
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
