// gta-6-tracker.js — GTA 6 Launch Tracker page logic.
// The countdown ticks from the shared launch instant (Nov 19, 2026 05:00 UTC)
// via the ported calendar engine. The timezone picker (?tz=) shows the launch
// moment in local time; the choice is stored in the URL so a shared link opens
// with the same timezone. There is no live feed behind this page: the status
// card tracks the confirmed milestones listed in the page, and every
// unconfirmed date on the page is labelled expected.
import { LAUNCH_UTC, REGIONS, computeCountdown, formatInTz as formatInTzEn } from "../engines/de/calendar-engine.js";

var CITY = { "America/Los_Angeles": "Los Angeles", "America/New_York": "New York", "America/Sao_Paulo": "São Paulo", "Europe/London": "London", "Europe/Berlin": "Berlin", "Europe/Istanbul": "Istanbul", "Asia/Dubai": "Dubai", "Asia/Karachi": "Karachi", "Asia/Kolkata": "Neu-Delhi", "Asia/Jakarta": "Jakarta", "Asia/Singapore": "Singapur", "Asia/Tokyo": "Tokio", "Australia/Sydney": "Sydney", "Pacific/Auckland": "Auckland" };
var COUNTRY = { "America/Los_Angeles": "USA", "America/New_York": "USA", "America/Sao_Paulo": "Brasilien", "Europe/London": "UK", "Europe/Berlin": "Deutschland", "Europe/Istanbul": "Türkei", "Asia/Dubai": "VAE", "Asia/Karachi": "Pakistan", "Asia/Kolkata": "Indien", "Asia/Jakarta": "Indonesien", "Asia/Singapore": "Singapur", "Asia/Tokyo": "Japan", "Australia/Sydney": "Australien", "Pacific/Auckland": "Neuseeland" };
function locCity(r) { return CITY[r.tz] || r.city; }
function locCountry(r) { return COUNTRY[r.tz] || r.country; }
function formatInTz(isoUtc, tz) { var d = new Date(isoUtc); return new Intl.DateTimeFormat("de-DE", { timeZone: tz, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(d); }

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
  utcOpt.textContent = "UTC, koordinierte Weltzeit";
  tzSelect.appendChild(utcOpt);
  REGIONS.forEach(function (r) {
    var opt = document.createElement("option");
    opt.value = r.tz;
    opt.textContent = locCity(r) + ", " + locCountry(r);
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
  return found ? locCity(found) + ", " + locCountry(found) : value;
}

function renderLaunchLocal() {
  var el = $("[data-launch-local]");
  if (!el) return;
  var local = tz === "UTC"
    ? "19. Nov. 2026, 05:00 Uhr UTC"
    : formatInTz(LAUNCH_UTC, tz);
  el.textContent = "Launch: 19. Nov. 2026, 05:00 Uhr UTC, " + local + " in " + regionLabel(tz) + ".";
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
  if (label) label.textContent = c.passed ? "GTA 6 ist gestartet" : "Weltweiter Unlock-Countdown";

  // Announce only when the minute changes, not every tick.
  if (lastAnnouncedMinute !== c.minutes || c.passed) {
    lastAnnouncedMinute = c.minutes;
    var sentence = c.passed
      ? "GTA 6 ist gestartet. 19. Nov. 2026 um 05:00 Uhr UTC ist vorbei."
      : "GTA 6 startet in " + c.days + " Tagen, " + c.hours + " Stunden, " + c.minutes + " Minuten.";
    var live = $("[data-live-region]");
    if (live) live.textContent = sentence;
    var tldrText = $("[data-tldr-text]");
    if (tldrText && !c.passed) {
      tldrText.textContent = "GTA 6 startete am 19. Nov. 2026 um 05:00 Uhr UTC. Der Preload lief am 16.–17. Nov. 2026, 48–72 Stunden vor Launch.";
    }
    var tldrLabel = $("[data-tldr-label]");
    if (tldrLabel) {
      tldrLabel.textContent = c.passed ? "Gestartet · Kurzfassung" : "Launch in " + c.days + " Tagen · Kurzfassung";
    }
  }
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

function refreshShareLinks() {
  var url = shareUrl();
  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = url;
  var xLink = $("[data-share-x]");
  if (xLink) {
    xLink.href = "https://twitter.com/intent/tweet?text=" +
      encodeURIComponent("GTA 6 startete am 19. Nov. 2026 um 05:00 Uhr UTC. Verfolge den Launch und die Preload-Meilensteine auf ToolWools.") +
      "&url=" + encodeURIComponent(url);
  }
  var redditLink = $("[data-share-reddit]");
  if (redditLink) {
    redditLink.href = "https://www.reddit.com/submit?title=" +
      encodeURIComponent("GTA-6-Launch-Tracker, 19. Nov. 2026") +
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
window.setInterval(renderCountdown, 1000);
