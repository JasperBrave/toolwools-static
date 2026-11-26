// server-status.js — منطق صفحة حالة خوادم GTA 6.
// السجل نفسه HTML ثابت (محتوى SEO/GEO). وتدير هذه الوحدة
// الأجزاء المعتمدة على البيانات: طوابع "آخر تحقق" وكلمات الحالة الثلاث
// (مصدر الحقيقة الوحيد = data/server-status.json، مضمّن أدناه باسم DATA).
// ولا تختلق أبدًا حالة أو تاريخًا أو إصدارًا: فكل قيمة تأتي من DATA.
// قاعدة القدم (الخطة §4.2): أي فحص أقدم من 7 أيام يعرض
// "check stale — see official page" بدلًا من قيمته القديمة. وتعرض حالة "unknown"
// "Check unavailable — see official page"، وليس اللون الأخضر أبدًا.

var DATA = {
  "checkedAt": "2026-11-26T07:30:00Z",
  "checkedBy": "ToolWools",
  "services": [
    {
      "id": "rockstar-auth",
      "name": "Rockstar Authentication",
      "status": "operational",
      "note": "All services operational on Rockstar's status page. No GTA VI row on the page.",
      "source": "https://support.rockstargames.com/servicestatus"
    },
    {
      "id": "psn",
      "name": "PlayStation Network",
      "status": "operational",
      "note": "All services are up and running on Sony's status page.",
      "source": "https://status.playstation.com"
    },
    {
      "id": "xbox",
      "name": "Xbox network",
      "status": "operational",
      "note": "All services up and running on Microsoft's Xbox status page (verified in a live browser on 26 Nov 2026 07:30 UTC; all 11 services normal).",
      "source": "https://support.xbox.com/en-US/xbox-live-status"
    }
  ],
  "incidents": [
    {
      "id": "psn-2026-11-18",
      "service": "psn",
      "label": "PlayStation Network outage — not a GTA 6 server outage",
      "start": "2026-11-18T18:58:00Z",
      "end": "2026-11-18T19:43:00Z",
      "summary": "Gaming and Social degraded; sign-in and PlayStation Store outages in the UK/Europe.",
      "sources": [
        "https://gta6news.gg/is-gta-6-down/",
        "https://timesaver.gg/blog/gta-6-server-status"
      ],
      "caveat": "PlayStation's own status page stayed green during the early sign-in strain."
    },
    {
      "id": "psn-2026-11-19-am",
      "service": "psn",
      "label": "PlayStation Network outage — not a GTA 6 server outage",
      "start": "2026-11-19T05:33:00Z",
      "end": "2026-11-19T06:04:00Z",
      "summary": "Gaming and Social degraded across Americas, Europe, Australia/NZ; PlayStation Store outage in the UK/Europe.",
      "sources": [
        "https://gta6news.gg/is-gta-6-down/",
        "https://leonidaunlocked.com/guides/gta-6-server-status/"
      ]
    },
    {
      "id": "psn-2026-11-19-pm",
      "service": "psn",
      "label": "PlayStation Network outage — not a GTA 6 server outage",
      "start": "2026-11-19T17:41:00Z",
      "end": "2026-11-19T17:57:00Z",
      "summary": "Gaming and Social degraded on PS5 (Sony page updated 12:41 PM ET, cleared 12:57 PM ET); Game Streaming also affected. Sony wording: 'You might have difficulty launching games, apps, or network features.'",
      "sources": [
        "https://www.techjuice.pk/playstation-network-outage-hits-gamers-during-gta-6-launch/",
        "https://gadgetsnow.indiatimes.com/tech-news/playstation-network-outage-resolved-ps5-users-face-brief-service-disruption-login-issues/articleshow/135983856.cms",
        "https://houstonnewsnetwork.com/is-playstation-down-some-gamers-report-problems-with-playstation-servers-amid-gta-6-launch"
      ],
      "caveat": "Duration ~16 min by Sony page timestamps; Gadgets Now reports ~24 min."
    }
  ]
};

var STALE_AFTER_MS = 7 * 24 * 60 * 60 * 1000;

function formatChecked(iso) {
  var d = new Date(iso);
  if (isNaN(d.getTime())) return String(iso);
  var months = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو",
    "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
  var hh = d.getUTCHours();
  var mm = d.getUTCMinutes();
  var hhStr = (hh < 10 ? "0" : "") + hh;
  var mmStr = (mm < 10 ? "0" : "") + mm;
  return d.getUTCDate() + " " + months[d.getUTCMonth()] + " " + d.getUTCFullYear() +
    ", " + hhStr + ":" + mmStr + " UTC";
}

function isStale() {
  var checked = Date.parse(DATA.checkedAt);
  if (isNaN(checked)) return true;
  return (Date.now() - checked) > STALE_AFTER_MS;
}

function statusWord(service) {
  if (isStale()) return "Check stale — see official page";
  if (service.status === "operational") return "Operational";
  if (service.status === "degraded") return "Degraded";
  return "Check unavailable — see official page";
}

function syncStamps() {
  var text = formatChecked(DATA.checkedAt);
  var stamps = document.querySelectorAll("[data-last-checked]");
  for (var i = 0; i < stamps.length; i++) {
    if (stamps[i].textContent !== text) {
      if (window.console && console.warn) {
        console.warn("server-status: baked last-checked stamp differed from data; corrected to " + DATA.checkedAt);
      }
      stamps[i].textContent = text;
    }
    stamps[i].setAttribute("datetime", DATA.checkedAt);
  }
}

function renderStatuses() {
  var stale = isStale();
  var words = document.querySelectorAll("[data-status-word]");
  for (var i = 0; i < words.length; i++) {
    var id = words[i].getAttribute("data-service");
    var service = null;
    for (var j = 0; j < DATA.services.length; j++) {
      if (DATA.services[j].id === id) { service = DATA.services[j]; break; }
    }
    if (!service) continue;
    var word = statusWord(service);
    if (words[i].textContent !== word) {
      if (window.console && console.warn) {
        console.warn("server-status: baked status word for " + id + " differed from data; corrected");
      }
      words[i].textContent = word;
    }
    words[i].setAttribute("data-status", stale ? "stale" : service.status);
  }
}

syncStamps();
renderStatuses();
