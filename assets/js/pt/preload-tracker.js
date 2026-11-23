// preload-tracker.js — GTA 6 Preload History & Update Schedule page logic.
// The record itself is static HTML (SEO/GEO content). This module owns the
// data-driven bits: the "Last checked" stamps (single source of truth =
// data/preload-updates.json, embedded below as DATA) and the upcoming-schedule
// list, which is empty in Phase 1 and renders rows the day a dated
// announcement lands (Phase 2 trigger = a data update, no page edit).
// It never invents a date, size or version: every row comes from DATA.

var DATA = {
  "datedButNotDownload": [
    {
      "date": "2026-12-11",
      "item": "Grand Theft Auto VI Original Score by Justice",
      "note": "Album, not DLC, not a patch, not a download",
      "source": "Rockstar Newswire 29 Oct 2026"
    }
  ],
  "lastChecked": "2026-11-23",
  "launch": {
    "date": "2026-11-19",
    "note": "Midnight local time in each region (Rockstar Support); first unlock New Zealand 11:00 UTC 18 Nov"
  },
  "postLaunchPatch": {
    "asOf": "2026-11-23",
    "source": "https://www.videogameschronicle.com/news/grand-theft-auto-6-has-received-a-new-patch-which-fixes-autosaving/",
    "status": "01.002.002 released 2026-11-23"
  },
  "preload": {
    "announced": "2026-11-03",
    "announcedSource": "https://www.rockstargames.com/newswire/article/k4ak9okk485712/grand-theft-auto-vi-pre-load-begins-on-november-10",
    "codeInBox": {
      "from": "2026-11-12",
      "note": "Retailers from Thu 12 Nov 2026; the code in the box unlocks the preload"
    },
    "eligibility": "Digital pre-orders (Standard or Ultimate); game stays locked until launch",
    "ps5": {
      "note": "Midnight local time, each timezone's own midnight",
      "start": "2026-11-10T00:00:00",
      "tz": "local"
    },
    "size": "up to 212 GB",
    "xbox": {
      "note": "Single global unlock: 12:00 AM GMT (Mon 9 Nov 7:00 PM ET / 4:00 PM PT; 1:00 AM CET; 9:00 AM JST; 11:00 AM AEDT)",
      "start": "2026-11-10T00:00:00Z"
    }
  },
  "schedule": [],
  "updates": [
    {
      "date": "2026-11-13",
      "id": "1.002.000",
      "notes": "None published by Rockstar",
      "ps5": "~1.07 GB",
      "sources": [
        "https://www.gta6box.com/blog/gta-6-update/",
        "https://hudwire.com/gta-6-update-1-002/"
      ],
      "xbox": "~2.18 GB (KeenGamer) / ~1.07 GB (Beebom), disputed, show both"
    },
    {
      "date": "2026-11-16",
      "id": "1.002.001",
      "notes": "None published by Rockstar",
      "ps5": "602.5 MB",
      "sources": [
        "https://www.gta6box.com/blog/gta-6-update/",
        "https://hudwire.com/gta-6-update-1-002/"
      ],
      "waves": "PS5 three waves: 33% at 10:00 UTC 16 Nov, 66% at 22:00 UTC 16 Nov, everyone by 10:00 UTC 17 Nov; Xbox all at once",
      "xbox": "~1.59 GB"
    },
    {
      "date": "2026-11-23",
      "id": "01.002.002",
      "notes": "Official notes published by Rockstar (first for any GTA VI update): crash fixes; weather not changing; autosave; phone calls not triggering, including story and mission content; unable to lose Wanted Level; deadlift bar in the Gym; partners not handing over bags to sell to fences",
      "ps5": "~603.8 MB",
      "sources": [
        "https://www.videogameschronicle.com/news/grand-theft-auto-6-has-received-a-new-patch-which-fixes-autosaving/",
        "https://www.dexerto.com/wikis/gta-6/update-patch-notes/",
        "https://insider-gaming.com/gta-6-update-01-002-002-all-changes-download-size/"
      ],
      "waves": "PS5 three waves over about 6 hours, all by about 16:15 UTC; Xbox all at once",
      "xbox": "~1.6 GB"
    }
  ],
  "version": "1.0.0"
};

function formatLong(iso) {
  var parts = String(iso).split("-");
  var months = ["janeiro", "fevereiro", "março", "abril", "maio", "junho",
    "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var y = Number(parts[0]), m = Number(parts[1]), d = Number(parts[2]);
  if (!y || !m || !d) return String(iso);
  return d + " de " + months[m - 1] + " de " + y;
}

function syncStamps() {
  var text = formatLong(DATA.lastChecked);
  var stamps = document.querySelectorAll("[data-last-checked]");
  for (var i = 0; i < stamps.length; i++) {
    if (stamps[i].textContent !== text) {
      if (window.console && console.warn) {
        console.warn("preload-tracker: baked last-checked stamp differed from data; corrected to " + DATA.lastChecked);
      }
      stamps[i].textContent = text;
    }
    stamps[i].setAttribute("datetime", DATA.lastChecked);
  }
}

function renderSchedule() {
  var host = document.querySelector("[data-schedule-list]");
  if (!host) return;
  if (!DATA.schedule || DATA.schedule.length === 0) return; // Phase 1: the HTML empty state stands.
  var wrap = document.createElement("div");
  wrap.className = "table-scroll";
  wrap.setAttribute("tabindex", "0");
  wrap.setAttribute("role", "region");
  wrap.setAttribute("aria-label", "Próximos patches e DLC do GTA 6, tabela rolável");
  var table = document.createElement("table");
  table.className = "data-table";
  var caption = document.createElement("caption");
  caption.className = "sr-only";
  caption.textContent = "Próximos patches e DLC do GTA 6: item, data, tamanho e fonte.";
  table.appendChild(caption);
  var head = document.createElement("thead");
  var headRow = document.createElement("tr");
  ["Item", "Data", "Tamanho", "Fonte"].forEach(function (label) {
    var th = document.createElement("th");
    th.setAttribute("scope", "col");
    th.textContent = label;
    headRow.appendChild(th);
  });
  head.appendChild(headRow);
  table.appendChild(head);
  var body = document.createElement("tbody");
  DATA.schedule.forEach(function (row) {
    var tr = document.createElement("tr");
    var th = document.createElement("th");
    th.setAttribute("scope", "row");
    th.textContent = row.item || row.name || "";
    tr.appendChild(th);
    var dateTd = document.createElement("td");
    dateTd.textContent = row.date || "";
    tr.appendChild(dateTd);
    var sizeTd = document.createElement("td");
    var size = "";
    if (row.ps5) size += "PS5 " + row.ps5;
    if (row.xbox) size += (size ? " · " : "") + "Xbox " + row.xbox;
    if (!size) size = row.size || "—";
    sizeTd.textContent = size;
    tr.appendChild(sizeTd);
    var srcTd = document.createElement("td");
    srcTd.textContent = row.source || "";
    tr.appendChild(srcTd);
    body.appendChild(tr);
  });
  table.appendChild(body);
  wrap.appendChild(table);
  host.textContent = "";
  host.appendChild(wrap);
}

syncStamps();
renderSchedule();
