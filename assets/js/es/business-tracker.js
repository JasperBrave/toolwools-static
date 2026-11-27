// business-tracker.js — lógica de la página Seguimiento de negocios de GTA 6.
// Simulador solo con entradas del usuario: la herramienta calcula a partir de los números que el usuario introduce
// (fórmulas del plan §4.1). Nunca inventa un precio, pago o tasa de GTA 6.
// Los valores por defecto usan las cifras de referencia de GTA Online de Acid Lab / Agency como
// ejemplo únicamente, y así se etiquetan en la página.
// El estado vive en la URL (?biz=&price=&rate=&hours=&upkeep=&goal= más los
// equivalentes del Negocio B) para que los resultados se puedan compartir. El enlace nunca lleva
// un registro personal.
// Las cadenas de la interfaz son constantes al inicio para que la traducción sea mecánica.

var STR = {
  yourAssumption: "tu suposición",
  never: "nunca",
  breakEvenDays: "punto de equilibrio",
  netAt30: "neto a 30 h",
  netAt40: "neto a 40 h",
  roiAt40: "ROI a 40 h",
  timeToGoal: "tiempo hasta la meta",
  crossover: "Cruce",
  overtakes: "supera a",
  showYourWork: "Muestra el trabajo",
  defaultBizA: "Acid Lab (ejemplo)",
  defaultBizB: "Agency (ejemplo)",
  unknownParam: "Un ajuste desconocido del simulador en el enlace, así que esta página volvió a los valores por defecto. Elige tus números abajo."
};

var DEFAULTS = {
  biz: STR.defaultBizA, price: 750000, rate: 56000, upkeep: 0,
  biz2: STR.defaultBizB, price2: 2830000, rate2: 85000, upkeep2: 0,
  hours: 2, goal: 2000000
};

function $(sel, root) { return (root || document).querySelector(sel); }

function money(n) {
  if (!Number.isFinite(n)) return "—";
  var neg = n < 0;
  var abs = Math.abs(Math.round(n));
  return (neg ? "-$" : "$") + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
function money1(n) {
  if (!Number.isFinite(n)) return "—";
  return "$" + Math.abs(n).toLocaleString("en-US", { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}
function hoursFmt(n) {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 10) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " horas";
}
function daysFmt(n) {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 10) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " días";
}
function pctFmt(n) {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 1000) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 }) + "%";
}

function numOr(raw, fallback) {
  if (raw === null || raw === "") return fallback;
  var n = Number(raw);
  return Number.isFinite(n) ? n : fallback;
}
function strOr(raw, fallback) {
  if (raw === null || raw === "") return fallback;
  return String(raw).slice(0, 60);
}

function readState() {
  var q = new URLSearchParams(window.location.search);
  var state = {
    biz: strOr(q.get("biz"), DEFAULTS.biz),
    price: Math.max(0, numOr(q.get("price"), DEFAULTS.price)),
    rate: Math.max(0, numOr(q.get("rate"), DEFAULTS.rate)),
    upkeep: Math.max(0, numOr(q.get("upkeep"), DEFAULTS.upkeep)),
    biz2: strOr(q.get("biz2"), DEFAULTS.biz2),
    price2: Math.max(0, numOr(q.get("price2"), DEFAULTS.price2)),
    rate2: Math.max(0, numOr(q.get("rate2"), DEFAULTS.rate2)),
    upkeep2: Math.max(0, numOr(q.get("upkeep2"), DEFAULTS.upkeep2)),
    hours: numOr(q.get("hours"), DEFAULTS.hours),
    goal: Math.max(0, numOr(q.get("goal"), DEFAULTS.goal))
  };
  var bad = [];
  if (state.hours < 0.5 || state.hours > 24) { bad.push("horas al día"); state.hours = DEFAULTS.hours; }
  ["price", "rate", "upkeep", "price2", "rate2", "upkeep2", "goal"].forEach(function (k) {
    var raw = q.get(k);
    if (raw !== null && raw !== "" && !Number.isFinite(Number(raw))) bad.push(k);
  });
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = STR.unknownParam;
  notice.classList.add("show");
}

// Motor (plan §4.1). eff = $/h netos efectivos tras repartir el mantenimiento entre las
// horas jugadas al día. profit(H) = p*H − u*(H/h) − C.
function computeEntry(price, rate, upkeep, hours, goal) {
  var eff = rate - (hours > 0 ? upkeep / hours : 0);
  var dailyNet = rate * hours - upkeep;
  var beDays = dailyNet > 0 ? price / dailyNet : null;
  var beHours = beDays === null ? null : beDays * hours;
  function profitAt(H) { return rate * H - upkeep * (H / hours) - price; }
  var net30 = profitAt(30);
  var net40 = profitAt(40);
  var roi40 = price > 0 ? net40 / price : null;
  var timeToGoal = eff > 0 && goal > 0 ? goal / eff : (goal === 0 ? 0 : null);
  return {
    eff: eff, dailyNet: dailyNet, beDays: beDays, beHours: beHours,
    net30: net30, net40: net40, roi40: roi40, timeToGoal: timeToGoal,
    profitAt: profitAt
  };
}

function crossover(a, b) {
  // t* = (C_A − C_B) ÷ (eff_A − eff_B). Nulo cuando las tasas son iguales
  // (las líneas nunca se cruzan) o cuando el cruce queda en el pasado (t* < 0).
  if (a.eff === b.eff) return null;
  var t = (a.price - b.price) / (a.eff - b.eff);
  return t >= 0 ? t : null;
}

function shareUrl() {
  var p = new URLSearchParams({
    biz: state.biz, price: String(state.price), rate: String(state.rate),
    hours: String(state.hours), upkeep: String(state.upkeep), goal: String(state.goal),
    biz2: state.biz2, price2: String(state.price2), rate2: String(state.rate2),
    upkeep2: String(state.upkeep2)
  });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({
    biz: state.biz, price: String(state.price), rate: String(state.rate),
    hours: String(state.hours), upkeep: String(state.upkeep), goal: String(state.goal),
    biz2: state.biz2, price2: String(state.price2), rate2: String(state.rate2),
    upkeep2: String(state.upkeep2)
  });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
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
    try { document.execCommand("copy"); done("¡Copiado!"); } catch (e) { done("Error al copiar"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("¡Copiado!"); }, fallback);
  } else {
    fallback();
  }
}

var bizInput = $("[data-biz-input]");
var priceInput = $("[data-price-input]");
var rateInput = $("[data-rate-input]");
var upkeepInput = $("[data-upkeep-input]");
var biz2Input = $("[data-biz2-input]");
var price2Input = $("[data-price2-input]");
var rate2Input = $("[data-rate2-input]");
var upkeep2Input = $("[data-upkeep2-input]");
var hoursInput = $("[data-hours-input]");
var goalInput = $("[data-goal-input]");

function render() {
  var A = computeEntry(state.price, state.rate, state.upkeep, state.hours, state.goal);
  var B = computeEntry(state.price2, state.rate2, state.upkeep2, state.hours, state.goal);
  A.price = state.price; A.eff = A.eff; B.price = state.price2;
  var tStar = crossover({ price: state.price, eff: A.eff }, { price: state.price2, eff: B.eff });

  if (bizInput && document.activeElement !== bizInput) bizInput.value = state.biz;
  if (priceInput && document.activeElement !== priceInput) priceInput.value = String(state.price);
  if (rateInput && document.activeElement !== rateInput) rateInput.value = String(state.rate);
  if (upkeepInput && document.activeElement !== upkeepInput) upkeepInput.value = String(state.upkeep);
  if (biz2Input && document.activeElement !== biz2Input) biz2Input.value = state.biz2;
  if (price2Input && document.activeElement !== price2Input) price2Input.value = String(state.price2);
  if (rate2Input && document.activeElement !== rate2Input) rate2Input.value = String(state.rate2);
  if (upkeep2Input && document.activeElement !== upkeep2Input) upkeep2Input.value = String(state.upkeep2);
  if (hoursInput && document.activeElement !== hoursInput) hoursInput.value = String(state.hours);
  if (goalInput && document.activeElement !== goalInput) goalInput.value = String(state.goal);

  var beA = A.beDays === null ? STR.never : daysFmt(A.beDays) + " · " + hoursFmt(A.beHours);
  var beB = B.beDays === null ? STR.never : daysFmt(B.beDays) + " · " + hoursFmt(B.beHours);
  var ttgA = A.timeToGoal === null ? STR.never : hoursFmt(A.timeToGoal);
  var ttgB = B.timeToGoal === null ? STR.never : hoursFmt(B.timeToGoal);
  var roiA = A.roi40 === null ? "—" : pctFmt(A.roi40 * 100);
  var roiB = B.roi40 === null ? "—" : pctFmt(B.roi40 * 100);
  var crossText;
  if (tStar === null) {
    crossText = STR.never + ", las dos entradas ganan a la misma tasa efectiva, o la entrada de mayor tasa ya va por delante.";
  } else {
    var leader = A.eff > B.eff ? state.biz : state.biz2;
    var trailer = A.eff > B.eff ? state.biz2 : state.biz;
    crossText = hoursFmt(tStar) + ": " + leader + " " + STR.overtakes + " " + trailer;
  }

  var work = STR.showYourWork + ": " + state.biz + ": neto diario = " + money(state.rate) + " × " + state.hours + " − " + money(state.upkeep)
    + " = " + money(A.dailyNet) + "/día; punto de equilibrio = " + money(state.price) + " ÷ " + money(A.dailyNet)
    + (A.beDays === null ? ", el neto diario es cero o negativo, así que " + STR.never : " = " + daysFmt(A.beDays) + " (" + hoursFmt(A.beHours) + ")")
    + "; neto a 40 h = " + money(state.rate) + " × 40 − " + money(state.upkeep) + " × (40 ÷ " + state.hours + ") − " + money(state.price)
    + " = " + money(A.net40) + "; ROI a 40 h = " + money(A.net40) + " ÷ " + money(state.price) + " = " + roiA
    + "; tiempo hasta la meta = " + money(state.goal) + " ÷ " + money(Math.round(A.eff)) + " = " + ttgA
    + ". " + STR.crossover + ": (" + money(state.price2) + " − " + money(state.price) + ") ÷ (" + money(Math.round(B.eff)) + " − " + money(Math.round(A.eff)) + ")"
    + (tStar === null ? ", sin cruce" : " = " + hoursFmt(tStar))
    + ". Todas las entradas son " + STR.yourAssumption + ".";

  var tldr = state.biz + " alcanza el punto de equilibrio en " + (A.beDays === null ? STR.never : hoursFmt(A.beHours))
    + " y genera " + money(A.net40) + " netos a las 40 horas. " + state.biz2 + " genera " + money(B.net40)
    + " netos a las 40 horas. Cruce: " + crossText + ".";

  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML = '<dl class="stat-grid">'
      + "<div><dt>" + escapeHtml(state.biz) + ": punto de equilibrio</dt><dd>" + beA + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + ": neto a 30 h</dt><dd>" + money(A.net30) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + ": neto a 40 h</dt><dd>" + money(A.net40) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + ": ROI a 40 h</dt><dd>" + roiA + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + ": tiempo hasta la meta de " + money(state.goal) + "</dt><dd>" + ttgA + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + ": punto de equilibrio</dt><dd>" + beB + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + ": neto a 30 h</dt><dd>" + money(B.net30) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + ": neto a 40 h</dt><dd>" + money(B.net40) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + ": ROI a 40 h</dt><dd>" + roiB + "</dd></div>"
      + "<div><dt>" + STR.crossover + " (" + escapeHtml(state.biz2) + " " + STR.overtakes + " " + escapeHtml(state.biz) + ")</dt><dd>" + crossText + "</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + escapeHtml(work) + "</p>"
      + '<p class="verdict-desc">Todas las entradas son ' + STR.yourAssumption + ', no se usa ningún precio, pago ni tasa de GTA 6.</p>';
  }

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (text) text.textContent = tldr;
    if (verdictEl) verdictEl.textContent = state.biz + " · " + money(A.net40) + " a 40 h";
  }
  var live = $("[data-live-region]");
  if (live) live.textContent = tldr;

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = document.querySelector('.share-panel a[data-share-x]');
  var rLink = document.querySelector('.share-panel a[data-share-reddit]');
  var shareText = state.biz + " alcanza el punto de equilibrio en " + (A.beDays === null ? STR.never : hoursFmt(A.beHours))
    + " y genera " + money(A.net40) + " netos a las 40 horas (Seguimiento de negocios de GTA 6 — tu suposición, valores de referencia de GTA Online por defecto).";
  var shareTitle = state.biz + " alcanza el punto de equilibrio en " + (A.beDays === null ? STR.never : hoursFmt(A.beHours)) + " (Seguimiento de negocios de GTA 6)";
  if (xLink) xLink.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareText) + "&url=" + encodeURIComponent(shareUrl());
  if (rLink) rLink.href = "https://www.reddit.com/submit?title=" + encodeURIComponent(shareTitle) + "&url=" + encodeURIComponent(shareUrl());
  syncUrl();
}

function escapeHtml(s) {
  return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function bindNum(input, key) {
  if (!input) return;
  var update = function () {
    var n = Number(input.value);
    state[key] = Number.isFinite(n) ? Math.max(0, n) : DEFAULTS[key];
    if (key === "hours" && (state.hours < 0.5 || state.hours > 24)) state.hours = DEFAULTS.hours;
    render();
  };
  input.addEventListener("input", update);
  input.addEventListener("change", update);
}
function bindStr(input, key) {
  if (!input) return;
  var update = function () {
    state[key] = input.value ? input.value.slice(0, 60) : DEFAULTS[key];
    render();
  };
  input.addEventListener("input", update);
  input.addEventListener("change", update);
}
bindStr(bizInput, "biz");
bindNum(priceInput, "price");
bindNum(rateInput, "rate");
bindNum(upkeepInput, "upkeep");
bindStr(biz2Input, "biz2");
bindNum(price2Input, "price2");
bindNum(rate2Input, "rate2");
bindNum(upkeep2Input, "upkeep2");
bindNum(hoursInput, "hours");
bindNum(goalInput, "goal");

var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
