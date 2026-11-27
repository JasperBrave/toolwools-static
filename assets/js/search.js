// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /tools/<slug> (live tools), t.url when set
// (e.g. /generators, which lives outside /tools), or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "GTA 6 System Requirements Checker", desc: "Instant verdict against community-estimated Minimum, Recommended and Ultra tiers. GPU, CPU, RAM and storage." },
    { slug: "download-time", title: "GTA 6 Download Time Calculator", desc: "Estimate how long the ~212 GB base install will take on your connection, plus day-one patch math." },
    { slug: "storage-planner", title: "GTA 6 Storage Planner", desc: "Budget every gigabyte: base install, day-one patch, seasonal DLC and safe headroom for updates." },
    { slug: "add-to-calendar", title: "GTA 6 Release Date Reminder", desc: "Add the GTA 6 launch to your calendar in your timezone." },
    { slug: "readiness-score", title: "GTA 6 Readiness Score", desc: "One score for your whole rig: performance, VRAM, storage and network." },
    { slug: "bottleneck-calculator", title: "GTA 6 Bottleneck Calculator", desc: "Check CPU vs GPU balance for GTA 6 at 1080p, 1440p and 4K. Live bottleneck percentage, FPS band and the smallest upgrade that rebalances your rig." },
    { slug: "vram-calculator", title: "GTA 6 VRAM Requirements Checker", desc: "Check the minimum VRAM you need for GTA 6 at 1080p, 1440p and 4K. Verdict for 6 GB, 8 GB, 12 GB and 16 GB cards." },
    { slug: "fps-calculator", title: "GTA 6 FPS Calculator", desc: "Estimate frame rate for your GPU at 1080p, 1440p and 4K across Low, Medium, High and Ultra." },
    { slug: "gpu-tier-list", title: "GTA 6 GPU Tier List", desc: "Best graphics cards for GTA 6, ranked by tier." },
    { slug: "interactive-map", title: "GTA 6 Interactive Map", desc: "Leonida explorer and size comparison for the GTA 6 map." },
    { slug: "pre-order-tracker", title: "Where to Buy GTA 6: Editions & Channels Compared", desc: "Where to buy GTA 6, compared by channel." },
    { slug: "edition-comparison", title: "GTA 6 Edition Picker", desc: "Every GTA 6 edition compared: bonuses, price and what each unlocks." },
    { slug: "internet-speed-check", title: "GTA 6 Internet Speed Advisor", desc: "Check whether your connection is fast enough for GTA 6 downloads and Online." },
    { slug: "price-by-country", title: "GTA 6 Price by Country", desc: "GTA 6 price by country in local currency." },
    { slug: "economy-calculator", title: "GTA 6 Money Calculator: Best Method by $/Hour & Business ROI", desc: "Work out the fastest way to earn GTA$ and which businesses pay back first." },
    { slug: "gta-6-tracker", title: "GTA 6 Launch Milestones", desc: "Launch milestones and completed preload windows for GTA 6." },
    { slug: "settings-optimizer", title: "Graphics Settings Optimizer", desc: "Dial in graphics settings for your target FPS and rig." },
    { slug: "hardware-comparison", title: "Hardware Comparison", desc: "Compare two GPUs or CPUs head to head for GTA 6." },
    { slug: "server-status", title: "GTA 6 Server Status — Are the Servers Down?", desc: "GTA 6 has no servers to go down — it launched 19 Nov 2026 as a single-player game with no online mode. Check the three services it depends on: Rockstar Authentication, PlayStation Network and Xbox network, hand-checked 24 Nov 2026, with the official pages linked." },
    { slug: "preload-tracker", title: "GTA 6 Preload History & Update Schedule", desc: "GTA 6 preload history and update schedule: the launch preload (10–19 Nov 2026), title updates 1.002.000, 1.002.001 and the first post-launch patch 01.002.002 (23 Nov, with official notes). No DLC announced. Last checked 23 Nov 2026." },
    { slug: "vehicle-comparison", title: "GTA 6 Vehicle Comparison — Ratings, Register Cost & Sell Value", desc: "Compare GTA 6 vehicles head-to-head on the five in-game ratings out of 10 — Speed, Acceleration, Asphalt Handling, Off-Road Handling, Strength — plus cost to register and sell value. No measured top speed exists yet; this tool shows the numbers the game shows. Last checked 24 Nov 2026." },
    { slug: "weapon-comparison", title: "GTA 6 Weapon Comparison — Ratings, Magazine & Price", desc: "Compare the 53 base GTA 6 guns on Damage, Accuracy, Handling and Range — the four in-game ratings out of 10 — plus magazine size, fire mode and price. No fire-rate stat exists in the game; this tool shows the numbers the game shows. Last checked 24 Nov 2026." },
    { slug: "generators", title: "GTA 6 Name Generator", desc: "Character names, crew tags, license plates, radio callsigns and gamertags — generated instantly.", url: "/generators", tags: "name generator gta 6" },
    { slug: "business-tracker", title: "GTA 6 Business Tracker", desc: "GTA 6 business calculator and tracker: no business can be bought yet, so track the 12 Leonida businesses, simulate payback with your own numbers, and compare story money methods."},
  ];

  // Normalize for matching: fold Turkish dotted/dotless I before lowercasing.
  // Plain toLowerCase() turns "İ" into "i" + U+0307 combining dot, so "İsim"
  // never matches "isim"; folding first fixes every İ-word query in all locales.
  function norm(s) { return s.replace(/[İI]/g, "i").replace(/ı/g, "i").toLowerCase(); }

  function setup(input) {
    if (!input) return;
    var box = input.closest(".header-search, .mobile-nav-search");
    if (!box) return;
    var list = box.querySelector("[data-search-results]");
    if (!list) return;
    var active = -1;

    function close() { list.hidden = true; list.innerHTML = ""; active = -1; input.removeAttribute("aria-expanded"); }
    function render(q) {
      var query = norm(q.trim());
      list.innerHTML = "";
      if (query.length < 2) { close(); return; }
      var hits = TOOLS.filter(function (t) {
        return norm(t.title + " " + t.desc + " " + (t.tags || "")).indexOf(query) !== -1;
      }).slice(0, 6);
      if (!hits.length) {
        var empty = document.createElement("div");
        empty.className = "search-results-empty";
        empty.textContent = 'No tools match "' + q.trim() + '". Try "FPS", "VRAM" or "bottleneck".';
        list.appendChild(empty);
      } else {
        hits.forEach(function (t) {
          var a = document.createElement("a");
          a.href = t.url || "/tools/" + t.slug;
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
