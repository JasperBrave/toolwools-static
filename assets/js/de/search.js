// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /tools/<slug> (live tools) or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "GTA-6-Systemanforderungen-Prüfer", desc: "Sofort-Urteil gegen Community-geschätzte Minimum-, Recommended- und Ultra-Tiers. GPU, CPU, RAM und Speicher." },
    { slug: "download-time", title: "GTA-6-Download-Zeit-Rechner", desc: "Schätze, wie lange die ~212-GB-Basis-Installation auf deiner Verbindung dauert, plus Day-One-Patch-Mathe." },
    { slug: "storage-planner", title: "GTA-6-Speicher-Planer", desc: "Budgetiere jedes Gigabyte: Basis-Installation, Day-One-Patch, saisonale DLC und sicheren Headroom für Updates." },
    { slug: "add-to-calendar", title: "GTA-6-Release-Date-Erinnerung", desc: "Füge den GTA-6-Launch zu deinem Kalender in deiner Zeitzone hinzu." },
    { slug: "readiness-score", title: "GTA-6-Readiness-Score", desc: "Ein Score für deinen ganzen PC: Performance, VRAM, Speicher und Netzwerk." },
    { slug: "bottleneck-calculator", title: "GTA-6-Bottleneck-Rechner", desc: "Prüfe CPU- vs. GPU-Balance für GTA 6 bei 1080p, 1440p und 4K. Live-Bottleneck-Prozentsatz, FPS-Band und das kleinste Upgrade, das deinen PC neu ausbalanciert." },
    { slug: "vram-calculator", title: "GTA-6-VRAM-Anforderungs-Prüfer", desc: "Prüfe die Minimum-VRAM, die du für GTA 6 bei 1080p, 1440p und 4K brauchst. Urteil für 6-GB-, 8-GB-, 12-GB- und 16-GB-Karten." },
    { slug: "fps-calculator", title: "GTA-6-FPS-Rechner", desc: "Schätze die Frame-Rate für deine GPU bei 1080p, 1440p und 4K von Low bis Ultra." },
    { slug: "gpu-tier-list", title: "GTA-6-GPU-Tier-Liste", desc: "Beste Grafikkarten für GTA 6, nach Tier gerankt." },
    { slug: "interactive-map", title: "GTA-6-Interaktive-Karte", desc: "Leonida-Explorer und Größen-Vergleich für die GTA-6-Karte." },
    { slug: "pre-order-tracker", title: "GTA 6 kaufen: Editionen und Kanäle im Vergleich", desc: "Wo man GTA 6 kaufen kann, nach Kanal verglichen." },
    { slug: "edition-comparison", title: "GTA-6-Editions-Picker", desc: "Jede GTA-6-Edition verglichen: Boni, Preis und was jede freischaltet." },
    { slug: "internet-speed-check", title: "GTA-6-Internet-Speed-Berater", desc: "Prüfe, ob deine Verbindung schnell genug ist für GTA-6-Downloads und Online." },
    { slug: "price-by-country", title: "GTA-6-Preis nach Land", desc: "GTA-6-Preis nach Land in lokaler Währung." },
    { slug: "economy-calculator", title: "GTA-6-Geld- und Business-ROI-Rechner", desc: "Finde den schnellsten Weg, GTA$ zu verdienen, und welche Businesses sich zuerst amortisieren." },
    { slug: "gta-6-tracker", title: "GTA-6-Launch-Tracker", desc: "Launch-Tracker und Preload-Meilensteine für GTA 6." },
    { slug: "settings-optimizer", title: "Grafik-Einstellungs-Optimierer", desc: "Stelle Grafik-Einstellungen ein für dein Ziel-FPS und deinen PC." },
    { slug: "hardware-comparison", title: "Hardware-Vergleich", desc: "Vergleiche zwei GPUs oder CPUs im direkten Vergleich für GTA 6." },
    { slug: "server-status", title: "GTA-6-Server-Status", desc: "Sind die GTA-6-Server down? Live-Status-Check." },
    { slug: "preload-tracker", title: "GTA-6-Preload-Tracker", desc: "Countdown zu Preload und Launch in deiner Zeitzone." },
    { slug: "vehicle-comparison", title: "GTA-6-Fahrzeug-Vergleich", desc: "Vergleiche zwei beliebige GTA-6-Fahrzeuge im direkten Vergleich." },
    { slug: "weapon-comparison", title: "GTA-6-Waffen-Stats-Vergleich", desc: "GTA-6-Waffen-Stats im direkten Vergleich: Schaden, Feuerrate, Reichweite, Genauigkeit." }
  ];

  function setup(input) {
    if (!input) return;
    var box = input.closest(".header-search, .mobile-nav-search");
    if (!box) return;
    var list = box.querySelector("[data-search-results]");
    if (!list) return;
    var active = -1;

    function close() { list.hidden = true; list.innerHTML = ""; active = -1; input.removeAttribute("aria-expanded"); }
    function render(q) {
      var query = q.trim().toLowerCase();
      list.innerHTML = "";
      if (query.length < 2) { close(); return; }
      var hits = TOOLS.filter(function (t) {
        return (t.title + " " + t.desc).toLowerCase().indexOf(query) !== -1;
      }).slice(0, 6);
      if (!hits.length) {
        var empty = document.createElement("div");
        empty.className = "search-results-empty";
        empty.textContent = 'Keine Tools passen zu "' + q.trim() + '". Versuche "FPS", "VRAM" oder "Bottleneck".';
        list.appendChild(empty);
      } else {
        hits.forEach(function (t) {
          var a = document.createElement("a");
          a.href = "/de/tools/" + t.slug;
          a.setAttribute("role", "option");
          var strong = document.createElement("span");
          strong.textContent = t.title;
          var small = document.createElement("span");
          small.className = "search-result-desc";
          small.textContent = t.desc;
          a.appendChild(strong);
          a.appendChild(small);
          list.appendChild(a);
        });
      }
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      active = -1;
    }
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("focus", function () { if (input.value.trim().length >= 2) render(input.value); });
    input.addEventListener("keydown", function (e) {
      var links = list.querySelectorAll("a");
      if (e.key === "Escape") { close(); input.blur(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!links.length) return;
        e.preventDefault();
        active = e.key === "ArrowDown" ? (active + 1) % links.length : (active - 1 + links.length) % links.length;
        links.forEach(function (l) { l.classList.remove("active"); });
        links[active].classList.add("active");
        links[active].focus();
        return;
      }
      if (e.key === "Enter" && active >= 0 && links[active]) {
        e.preventDefault();
        window.location.href = links[active].href;
      }
    });
    document.addEventListener("click", function (e) {
      if (!box.contains(e.target)) close();
    });
  }

  document.querySelectorAll("[data-header-search-input]").forEach(setup);
})();
