// Herramientas index: client-side filter over the full catalogue (22 tools:
// 18 live + 4 coming-soon). The full list is rendered in the HTML, so the
// page works with JavaScript off; this script only filters it. Stagger is
// rendered inline at build time (L7), never gated on hydration.
(function () {
  var list = document.querySelector("[data-tools-list]");
  if (!list) return;
  var cards = Array.prototype.slice.call(list.querySelectorAll("[data-tool-card]"));
  var searchInput = document.querySelector("[data-tools-search]");
  var countEl = document.querySelector("[data-tools-count]");
  var emptyEl = document.querySelector("[data-tools-empty]");
  var headingEl = document.querySelector("[data-tools-heading]");
  var params = new URLSearchParams(window.location.search);
  var q = params.get("q") || "";
  var category = params.get("category") || "";
  var platform = params.get("platform") || "";
  if (searchInput) searchInput.value = q;
  function syncChips() {
    document.querySelectorAll("[data-category-filter]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-category-filter") === category));
    });
    document.querySelectorAll("[data-status-filter]").forEach(function (b) {
      var v = b.getAttribute("data-status-filter") || "";
      b.setAttribute("aria-pressed", String(v === platform || (v === "" && !platform)));
    });
  }
  function apply() {
    var needle = q.trim().toLowerCase();
    var shown = 0, liveShown = 0;
    cards.forEach(function (card) {
      var hay = (card.getAttribute("data-search-text") || "").toLowerCase();
      var okSearch = !needle || hay.indexOf(needle) !== -1;
      var okCat = !category || card.getAttribute("data-category") === category;
      var okStatus = !platform || card.getAttribute("data-status") === platform;
      var show = okSearch && okCat && okStatus;
      card.hidden = !show;
      if (show) { shown++; if (card.getAttribute("data-status") === "live") liveShown++; }
    });
    if (countEl) countEl.textContent = shown + " of 22 tools \u00b7 " + liveShown + " live";
    if (emptyEl) emptyEl.hidden = shown !== 0;
    if (headingEl) headingEl.textContent = q ? 'Resultados for "' + q + '"' : "Herramientas en vivo";
    var url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q); else url.searchParams.delete("q");
    if (category) url.searchParams.set("category", category); else url.searchParams.delete("category");
    if (platform) url.searchParams.set("platform", platform); else url.searchParams.delete("platform");
    history.replaceState(null, "", url.toString());
  }
  if (searchInput) {
    searchInput.addEventListener("input", function () { q = searchInput.value; apply(); });
    var form = searchInput.closest("form");
    if (form) form.addEventListener("submit", function (e) { e.preventDefault(); apply(); });
  }
  document.querySelectorAll("[data-category-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      var v = b.getAttribute("data-category-filter");
      category = (category === v) ? "" : v;
      syncChips(); apply();
    });
  });
  document.querySelectorAll("[data-status-filter]").forEach(function (b) {
    b.addEventListener("click", function () {
      platform = b.getAttribute("data-status-filter") || "";
      syncChips(); apply();
    });
  });
  var clearBtn = document.querySelector("[data-tools-clear]");
  if (clearBtn) clearBtn.addEventListener("click", function () {
    q = ""; category = ""; platform = "";
    if (searchInput) searchInput.value = "";
    syncChips(); apply();
  });
  syncChips(); apply();
})();
