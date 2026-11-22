// business-tracker.js — GTA 6 Business Tracker page logic.
// User-input simulator only: the tool computes from numbers the user enters
// (plan §4.1 formulas). It never invents a GTA 6 price, payout or rate.
// Defaults use the GTA Online Acid Lab / Agency yardstick figures as an
// example only, and are labelled as such on the page.
// State lives in the URL (?biz=&price=&rate=&hours=&upkeep=&goal= plus the
// Business B equivalents) so results are shareable. The link never carries
// a personal log.
// UI strings are constants at the top so translation is mechanical.

var STR = {
  yourAssumption: "deine Annahme",
  never: "nie",
  breakEvenDays: "Break-even",
  netAt30: "Netto nach 30 Std.",
  netAt40: "Netto nach 40 Std.",
  roiAt40: "ROI nach 40 Std.",
  timeToGoal: "Zeit bis zum Ziel",
  crossover: "Crossover",
  overtakes: "überholt",
  showYourWork: "Rechenweg anzeigen",
  defaultBizA: "Acid Lab (Beispiel)",
  defaultBizB: "Agency (Beispiel)",
  unknownParam: "Unbekannte Simulator-Einstellung im Link, daher wurde diese Seite auf die Standardeinstellungen zurückgesetzt. Wähle unten deine Zahlen."
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
  return (Math.round(n * 10) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " Stunden";
}
function daysFmt(n) {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 10) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " Tage";
}
function pctFmt(n) {
  if (!Number.isFinite(n)) return "—";
  return (Math.round(n * 1000) / 10).toLocaleString("en-US", { maximumFractionDigits: 1 }) + " %";
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
  if (state.hours < 0.5 || state.hours > 24) { bad.push("hours per day"); state.hours = DEFAULTS.hours; }
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

// Engine (plan §4.1). eff = effective net $/h after upkeep spread over the
// hours played per day. profit(H) = p*H − u*(H/h) − C.
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
  // t* = (C_A − C_B) ÷ (eff_A − eff_B). Null when the rates are equal
  // (lines never cross) or when the crossing is in the past (t* < 0).
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
    crossText = STR.never + ". Die beiden Einträge verdienen mit derselben effektiven Rate, oder der Eintrag mit der höheren Rate liegt bereits vorn.";
  } else {
    var leader = A.eff > B.eff ? state.biz : state.biz2;
    var trailer = A.eff > B.eff ? state.biz2 : state.biz;
    crossText = hoursFmt(tStar) + ": " + leader + " " + STR.overtakes + " " + trailer;
  }

  var work = STR.showYourWork + ": " + state.biz + ": Tagesnetto = " + money(state.rate) + " × " + state.hours + " − " + money(state.upkeep)
    + " = " + money(A.dailyNet) + "/Tag; Break-even = " + money(state.price) + " ÷ " + money(A.dailyNet)
    + (A.beDays === null ? ". Das Tagesnetto ist null oder negativ, also " + STR.never : " = " + daysFmt(A.beDays) + " (" + hoursFmt(A.beHours) + ")")
    + "; Netto nach 40 Std. = " + money(state.rate) + " × 40 − " + money(state.upkeep) + " × (40 ÷ " + state.hours + ") − " + money(state.price)
    + " = " + money(A.net40) + "; ROI nach 40 Std. = " + money(A.net40) + " ÷ " + money(state.price) + " = " + roiA
    + "; Zeit bis zum Ziel = " + money(state.goal) + " ÷ " + money(Math.round(A.eff)) + " = " + ttgA
    + ". " + STR.crossover + ": (" + money(state.price2) + " − " + money(state.price) + ") ÷ (" + money(Math.round(B.eff)) + " − " + money(Math.round(A.eff)) + ")"
    + (tStar === null ? ". Kein Crossover" : " = " + hoursFmt(tStar))
    + ". Alle Eingaben sind " + STR.yourAssumption + ".";

  var tldr = state.biz + " erreicht den Break-even in " + (A.beDays === null ? STR.never : hoursFmt(A.beHours))
    + " und erzielt netto " + money(A.net40) + " nach 40 Stunden. " + state.biz2 + " erzielt netto " + money(B.net40)
    + " nach 40 Stunden. Crossover: " + crossText + ".";

  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML = '<dl class="stat-grid">'
      + "<div><dt>" + escapeHtml(state.biz) + " Break-even</dt><dd>" + beA + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + " Netto nach 30 Std.</dt><dd>" + money(A.net30) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + " Netto nach 40 Std.</dt><dd>" + money(A.net40) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + " ROI nach 40 Std.</dt><dd>" + roiA + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz) + " Zeit bis zum Ziel von " + money(state.goal) + "</dt><dd>" + ttgA + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + " Break-even</dt><dd>" + beB + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + " Netto nach 30 Std.</dt><dd>" + money(B.net30) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + " Netto nach 40 Std.</dt><dd>" + money(B.net40) + "</dd></div>"
      + "<div><dt>" + escapeHtml(state.biz2) + " ROI nach 40 Std.</dt><dd>" + roiB + "</dd></div>"
      + "<div><dt>" + STR.crossover + " (" + escapeHtml(state.biz2) + " " + STR.overtakes + " " + escapeHtml(state.biz) + ")</dt><dd>" + crossText + "</dd></div>"
      + "</dl>"
      + '<p class="verdict-desc">' + escapeHtml(work) + "</p>"
      + '<p class="verdict-desc">Alle Eingaben sind ' + STR.yourAssumption + '. Es werden kein GTA-6-Preis, keine Auszahlung und keine Rate verwendet.</p>';
  }

  var tldrCard = $("[data-tldr-card]");
  if (tldrCard) {
    var text = $("[data-tldr-text]", tldrCard);
    var verdictEl = $("[data-tldr-verdict]", tldrCard);
    if (text) text.textContent = tldr;
    if (verdictEl) verdictEl.textContent = state.biz + " · " + money(A.net40) + " nach 40 Std.";
  }
  var live = $("[data-live-region]");
  if (live) live.textContent = tldr;

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var xLink = document.querySelector('.share-panel a[aria-label="Dieses Ergebnis auf X teilen"]');
  var rLink = document.querySelector('.share-panel a[aria-label="Dieses Ergebnis auf Reddit teilen"]');
  var shareText = state.biz + " erreicht den Break-even in " + (A.beDays === null ? STR.never : hoursFmt(A.beHours))
    + " und erzielt netto " + money(A.net40) + " nach 40 Stunden (GTA-6-Business-Tracker: deine Annahme, GTA-Online-Vergleichsmaßstab-Standards).";
  var shareTitle = state.biz + " erreicht den Break-even in " + (A.beDays === null ? STR.never : hoursFmt(A.beHours)) + " (GTA-6-Business-Tracker)";
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
