// add-to-calendar.js — GTA 6 Release Date Reminder page logic.
// Uses the ported calendar engine (assets/js/engines/calendar-engine.js).
// Launch instant comes from the shared constant (window.TOOLWOOLS_LAUNCH_UTC,
// set by assets/js/launch.js); the engine default is the same instant (M10).
// Static HTML ships precomputed countdown numbers so the first paint never
// shows "--" (AUDIT FIX H6); this script then ticks the timer live.
import { LAUNCH_UTC, REGIONS, buildIcs, computeCountdown, formatInTz, googleCalendarUrl, localClock, offsetLabel, outlookUrl, yahooUrl } from "./engines/calendar-engine.js";

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
function pad(n) { return String(n).padStart(2, "0"); }

var tzSel = $("[data-tz-select]");
var DEFAULT_TZ = "America/New_York";
function detectedTz() {
  try { return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TZ; } catch (e) { return DEFAULT_TZ; }
}
function readTz() {
  var q = new URLSearchParams(window.location.search);
  var tz = q.get("tz");
  if (tz) return tz;
  return detectedTz();
}
var tz = readTz();

if (tzSel) {
  tzSel.innerHTML = "";
  REGIONS.forEach(function (r) {
    var opt = document.createElement("option");
    opt.value = r.tz;
    opt.textContent = r.city + " \u00b7 " + r.tz + " (" + offsetLabel(r.offsetMin) + ")";
    tzSel.appendChild(opt);
  });
  if (!REGIONS.some(function (r) { return r.tz === tz; })) {
    var opt = document.createElement("option");
    opt.value = tz;
    opt.textContent = "Detected \u00b7 " + tz;
    tzSel.appendChild(opt);
  }
  tzSel.value = tz;
}

function shareUrl() {
  var p = new URLSearchParams({ tz: tz });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  window.history.replaceState(null, "", window.location.pathname + "?tz=" + encodeURIComponent(tz));
}

function renderLocal() {
  var local = $("[data-local-launch]");
  if (local) {
    try { local.textContent = formatInTz(LAUNCH_UTC, tz); }
    catch (e) { local.textContent = formatInTz(LAUNCH_UTC, DEFAULT_TZ); }
  }
  $all("[data-tz-row]").forEach(function (row) {
    if (row.dataset.tzRow === tz) { row.classList.add("hl-row"); row.setAttribute("aria-current", "true"); }
    else { row.classList.remove("hl-row"); row.removeAttribute("aria-current"); }
  });
  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var live = $("[data-live-region]");
  if (live) {
    var cd = computeCountdown(new Date(), LAUNCH_UTC);
    live.textContent = cd.passed
      ? "GTA 6 is live. Launch window opened."
      : "GTA 6 launches in " + cd.days + " days, " + cd.hours + " hours, " + cd.minutes + " minutes. In your timezone that is " + (local ? local.textContent : "") + ".";
  }
  syncUrl();
}

function tick() {
  var cd = computeCountdown(new Date(), LAUNCH_UTC);
  var block = $("[data-countdown]");
  if (!block) return;
  var days = $("[data-countdown-days]", block);
  var hours = $("[data-countdown-hours]", block);
  var minutes = $("[data-countdown-minutes]", block);
  var seconds = $("[data-countdown-seconds]", block);
  var label = $("[data-countdown-label]", block);
  var live = $("[data-countdown-live]", block);
  if (cd.passed) {
    if (days) days.textContent = "00";
    if (hours) hours.textContent = "00";
    if (minutes) minutes.textContent = "00";
    if (seconds) seconds.textContent = "00";
    if (label) label.textContent = "GTA 6 Is Out Now";
    if (live) live.textContent = "GTA 6 is live. Launch window opened. Enjoy Vice City.";
    block.setAttribute("aria-label", "GTA 6 has been released");
    return;
  }
  if (days) days.textContent = pad(cd.days);
  if (hours) hours.textContent = pad(cd.hours);
  if (minutes) minutes.textContent = pad(cd.minutes);
  if (seconds) seconds.textContent = pad(cd.seconds);
  if (label) label.textContent = "Release Countdown";
  if (live) live.textContent = "GTA 6 launches in " + cd.days + " days, " + cd.hours + " hours, " + cd.minutes + " minutes and " + cd.seconds + " seconds.";
  block.setAttribute("aria-label", "Time until GTA 6 release: " + cd.days + " days, " + cd.hours + " hours, " + cd.minutes + " minutes");
}

var gcal = $("[data-gcal-link]");
if (gcal) gcal.href = googleCalendarUrl();
var outlook = $("[data-outlook-link]");
if (outlook) outlook.href = outlookUrl();
var yahoo = $("[data-yahoo-link]");
if (yahoo) yahoo.href = yahooUrl();
var apple = $("[data-apple-link]");
if (apple) apple.href = "data:text/calendar;charset=utf-8," + encodeURIComponent(buildIcs());

if (tzSel) tzSel.addEventListener("change", function () { tz = tzSel.value; renderLocal(); });

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copy";
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
    try { document.execCommand("copy"); done("Copied!"); } catch (e) { done("Copy failed"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copied!"); }, fallback);
  } else {
    fallback();
  }
}
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

renderLocal();
tick();
window.setInterval(tick, 1000);
