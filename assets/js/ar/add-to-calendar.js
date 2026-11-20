// add-to-calendar.js — GTA 6 Release Date Reminder page logic.
// Uses the ported calendar engine (assets/js/engines/calendar-engine.js).
// Launch instant comes from the shared constant (window.TOOLWOOLS_LAUNCH_UTC,
// set by assets/js/launch.js); the engine default is the same instant (M10).
// Static HTML ships precomputed countdown numbers so the first paint never
// shows "--" (AUDIT FIX H6); this script then ticks the timer live.
import { LAUNCH_UTC, REGIONS, buildIcs as buildIcsEn, computeCountdown, formatInTz as formatInTzEn, googleCalendarUrl as googleCalendarUrlEn, localClock, offsetLabel, outlookUrl as outlookUrlEn, yahooUrl as yahooUrlEn, computeRange, toGCalStamp } from "../engines/ar/calendar-engine.js";

var CITY = { "America/Los_Angeles": "لوس أنجلوس", "America/New_York": "نيويورك", "America/Sao_Paulo": "ساو باولو", "Europe/London": "لندن", "Europe/Berlin": "برلين", "Europe/Istanbul": "إسطنبول", "Asia/Dubai": "دبي", "Asia/Karachi": "كراتشي", "Asia/Kolkata": "نيودلهي", "Asia/Jakarta": "جاكرتا", "Asia/Singapore": "سنغافورة", "Asia/Tokyo": "طوكيو", "Australia/Sydney": "سيدني", "Pacific/Auckland": "أوكلاند" };
function formatInTz(isoUtc, tz) { var d = new Date(isoUtc); return new Intl.DateTimeFormat("ar", { timeZone: tz, weekday: "short", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" }).format(d); }
var EVENT_TITLE_AR = "إصدار GTA 6";
var EVENT_DESC_AR = "تُفتح Grand Theft Auto VI عالميًا. تذكير من ToolWools (https://toolwools.com/ar/tools/add-to-calendar).";
function googleCalendarUrl() { var r = computeRange(); var p = new URLSearchParams({ action: "TEMPLATE", text: EVENT_TITLE_AR, dates: toGCalStamp(r.start) + "/" + toGCalStamp(r.end), details: EVENT_DESC_AR, location: "Rockstar Games" }); return "https://calendar.google.com/calendar/render?" + p.toString(); }
function outlookUrl() { var r = computeRange(); var p = new URLSearchParams({ path: "/calendar/action/compose", rru: "addevent", subject: EVENT_TITLE_AR, body: EVENT_DESC_AR, location: "Rockstar Games", startdt: r.start.toISOString(), enddt: r.end.toISOString() }); return "https://outlook.live.com/calendar/0/deeplink/compose?" + p.toString(); }
function yahooUrl() { var r = computeRange(); var p = new URLSearchParams({ v: "60", title: EVENT_TITLE_AR, st: toGCalStamp(r.start), et: toGCalStamp(r.end), desc: EVENT_DESC_AR, in_loc: "Rockstar Games" }); return "https://calendar.yahoo.com/?" + p.toString(); }
function buildIcs() { return buildIcsEn().replace("GTA 6 Launch", EVENT_TITLE_AR).replace("Grand Theft Auto VI unlocks worldwide. Reminder from ToolWools (https://toolwools.com/tools/add-to-calendar).", EVENT_DESC_AR).replace("GTA 6 unlocks in 24 hours", "يُفتح GTA 6 خلال 24 ساعة").replace("GTA 6 unlocks in 1 hour", "يُفتح GTA 6 خلال ساعة واحدة").replace("//GTA 6 Reminder//EN", "//GTA 6 Reminder//AR"); }

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
    opt.textContent = (CITY[r.tz] || r.city) + " \u00b7 " + r.tz + " (" + offsetLabel(r.offsetMin) + ")";
    tzSel.appendChild(opt);
  });
  if (!REGIONS.some(function (r) { return r.tz === tz; })) {
    var opt = document.createElement("option");
    opt.value = tz;
    opt.textContent = "تم الكشف · " + tz;
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
      ? "GTA 6 متاحة الآن. فُتحت نافذة الإطلاق."
      : "تصدر GTA 6 خلال " + cd.days + " يوم و" + cd.hours + " ساعة و" + cd.minutes + " دقيقة. وبتوقيت منطقتك يعني ذلك " + (local ? local.textContent : "") + ".";
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
    if (label) label.textContent = "GTA 6 صدرت الآن";
    if (live) live.textContent = "GTA 6 متاحة الآن. فُتحت نافذة الإطلاق. استمتع بفايس سيتي.";
    block.setAttribute("aria-label", "تم إصدار GTA 6");
    return;
  }
  if (days) days.textContent = pad(cd.days);
  if (hours) hours.textContent = pad(cd.hours);
  if (minutes) minutes.textContent = pad(cd.minutes);
  if (seconds) seconds.textContent = pad(cd.seconds);
  if (label) label.textContent = "العد التنازلي للإصدار";
  if (live) live.textContent = "تصدر GTA 6 خلال " + cd.days + " يوم و" + cd.hours + " ساعة و" + cd.minutes + " دقيقة و" + cd.seconds + " ثانية.";
  block.setAttribute("aria-label", "الوقت المتبقي حتى إصدار GTA 6: " + cd.days + " أيام، " + cd.hours + " ساعات، " + cd.minutes + " دقائق");
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
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "نسخ";
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
    try { document.execCommand("copy"); done("تم النسخ!"); } catch (e) { done("فشل النسخ"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("تم النسخ!"); }, fallback);
  } else {
    fallback();
  }
}
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

renderLocal();
tick();
window.setInterval(tick, 1000);
