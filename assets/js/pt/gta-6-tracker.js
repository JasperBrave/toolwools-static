// gta-6-tracker.js — Rastreador de Lançamento do GTA 6 page logic.
// The launch instant (19 de nov de 2026 05:00 UTC) has passed, so the countdown
// renders once in its launched state; there is no ticking timer anymore. The timezone picker (?tz=) shows the launch
// moment in local time; the choice is stored in the URL so a shared link opens
// with the same timezone. There is no live feed behind this page: the status
// card tracks the confirmed milestones listed in the page, and every
// unconfirmed date on the page is labelled expected.
import { LAUNCH_UTC, REGIONS, computeCountdown, formatInTz } from "/assets/js/engines/pt/calendar-engine.js";

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function pad(n) { return String(n).padStart(2, "0"); }

var TZ_VALUES = ["UTC"].concat(REGIONS.map(function (r) { return r.tz; }));
var DEFAULT_TZ = "UTC";

function guessTz() {
  try {
    var tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz && TZ_VALUES.indexOf(tz) !== -1) return tz;
  } catch (e) { /* fall through to UTC */ }
  return DEFAULT_TZ;
}

function readTz() {
  var q = new URLSearchParams(window.location.search);
  var tz = q.get("tz");
  if (tz && TZ_VALUES.indexOf(tz) !== -1) return tz;
  return guessTz();
}

var tz = readTz();
var tzSelect = $("[data-tz-select]");
if (tzSelect) {
  var utcOpt = document.createElement("option");
  utcOpt.value = "UTC";
  utcOpt.textContent = "UTC — Coordinated Universal Time";
  tzSelect.appendChild(utcOpt);
  REGIONS.forEach(function (r) {
    var opt = document.createElement("option");
    opt.value = r.tz;
    opt.textContent = r.city + ", " + r.country;
    tzSelect.appendChild(opt);
  });
  tzSelect.value = tz;
}

function shareUrl() {
  var base = window.location.origin + window.location.pathname;
  return tz === DEFAULT_TZ ? base : base + "?tz=" + encodeURIComponent(tz);
}

function syncUrl() {
  var qs = tz === DEFAULT_TZ ? "" : "?tz=" + encodeURIComponent(tz);
  window.history.replaceState(null, "", window.location.pathname + qs);
}

function regionLabel(value) {
  if (value === "UTC") return "UTC";
  var found = null;
  REGIONS.forEach(function (r) { if (r.tz === value) found = r; });
  return found ? found.city + ", " + found.country : value;
}

function renderLaunchLocal() {
  var el = $("[data-launch-local]");
  if (!el) return;
  var local = tz === "UTC"
    ? "19 de nov de 2026, 05:00 UTC"
    : formatInTz(LAUNCH_UTC, tz);
  el.textContent = "Launch: 19 de nov de 2026, 05:00 UTC — " + local + " in " + regionLabel(tz) + ".";
}

var lastAnnouncedMinute = null;

function renderCountdown() {
  var c = computeCountdown(new Date(), LAUNCH_UTC);
  var daysEl = $("[data-cd-days]");
  var hoursEl = $("[data-cd-hours]");
  var minsEl = $("[data-cd-minutes]");
  var secsEl = $("[data-cd-seconds]");
  if (daysEl) daysEl.textContent = pad(c.days);
  if (hoursEl) hoursEl.textContent = pad(c.hours);
  if (minsEl) minsEl.textContent = pad(c.minutes);
  if (secsEl) secsEl.textContent = pad(c.seconds);

  var label = $("[data-countdown-label]");
  if (label) label.textContent = c.passed ? "GTA 6 foi lançado" : "Contagem regressiva de desbloqueio mundial";

  // Announce only when the minute changes, not every tick.
  if (lastAnnouncedMinute !== c.minutes || c.passed) {
    lastAnnouncedMinute = c.minutes;
    var sentence = c.passed
      ? "GTA 6 foi lançado. 19 de nov de 2026 às 05:00 UTC já passou."
      : "Faltam " + c.days + " dias, " + c.hours + " horas, " + c.minutes + " minutos para o lançamento do GTA 6.";
    var live = $("[data-live-region]");
    if (live) live.textContent = sentence;
    var tldrText = $("[data-tldr-text]");
    if (tldrText && !c.passed) {
      tldrText.textContent = "O GTA 6 lançou em 19 nov 2026 às 05:00 UTC. O pré-carregamento ocorreu 48-72 horas antes do lançamento.";
    }
    var tldrLabel = $("[data-tldr-label]");
    if (tldrLabel) {
      tldrLabel.textContent = c.passed ? "Lançado · Resumo" : "Lançamento em " + c.days + " dias · Resumo";
    }
  }
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
    try { document.execCommand("copy"); done("Copiado!"); } catch (e) { done("Não foi possível copiar"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copiado!"); }, fallback);
  } else {
    fallback();
  }
}

function refreshShareLinks() {
  var url = shareUrl();
  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = url;
  var xLink = $("[data-share-x]");
  if (xLink) {
    xLink.href = "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent("O GTA 6 lançou em 19 de nov de 2026 às 05:00 UTC. Marcos de lançamento e janelas de pré-carregamento concluídas no ToolWools.") +
      "&url=" + encodeURIComponent(url);
  }
  var redditLink = $("[data-share-reddit]");
  if (redditLink) {
    redditLink.href = "https://www.reddit.com/submit?title=" +
      encodeURIComponent("Marcos do lançamento do GTA 6 — 19 de nov de 2026") +
      "&url=" + encodeURIComponent(url);
  }
}

if (tzSelect) {
  tzSelect.addEventListener("change", function () {
    tz = tzSelect.value;
    renderLaunchLocal();
    refreshShareLinks();
    syncUrl();
  });
}

$all("[data-copy-link]").forEach(function (btn) {
  btn.addEventListener("click", function () { copyText(shareUrl(), btn, "[data-copy-link-label]"); });
});


renderLaunchLocal();
refreshShareLinks();
renderCountdown();
