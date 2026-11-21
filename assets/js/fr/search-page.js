// /search: client-side search over the static index (23 tools, 2 guides,
// 7 reference pages). Same scoring shape as the source search lib: title
// hits weigh most, then description, then tags. Combobox with listbox,
// options, and an aria-live status region, as the source has.
(function () {
  var INDEX = window.TOOLWOOLS_SEARCH_INDEX || [];
  var form = document.querySelector("[data-search-form]");
  var input = document.querySelector("[data-search-input]");
  var listbox = document.querySelector("[data-search-listbox]");
  var status = document.querySelector("[data-search-status]");
  var resultsEl = document.querySelector("[data-search-results]");
  var summaryEl = document.querySelector("[data-search-summary]");
  var countsEl = document.querySelector("[data-search-counts]");
  if (!input || !resultsEl) return;
  var STOP = new Set(["gta", "6", "le", "la", "les", "un", "une", "et", "ou", "de", "pour", "à", "dans", "sur", "est", "comment", "mon", "avec", "vs"]);
  // Normalize for matching: fold Turkish dotted/dotless I before lowercasing.
  // Plain toLowerCase() turns "İ" into "i" + U+0307 combining dot, so "İsim"
  // never matches "isim"; folding first fixes every İ-word query in all locales.
  function norm(s) { return s.replace(/[İI]/g, "i").replace(/ı/g, "i").toLowerCase(); }
  function tokens(s) {
    return norm(s).replace(/[^a-z0-9àâäéèêëîïôöùûüç\s]/g, " ").split(/\s+/)
      .filter(function (t) { return t.length > 1 && !STOP.has(t); });
  }
  function score(item, toks) {
    if (!toks.length) return item.status === "live" ? 2 : 1;
    var s = 0;
    var parts = [[item.title, 6], [item.desc, 2], [(item.tags || []).join(" "), 3]];
    parts.forEach(function (p) {
      var lower = norm(p[0]);
      toks.forEach(function (t) {
        if (lower === t) s += p[1] * 3;
        else if (lower.indexOf(t) === 0) s += p[1] * 2;
        else if (lower.indexOf(t) !== -1) s += p[1];
      });
    });
    return s;
  }
  function esc(s) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }
  function highlight(text, toks) {
    var out = esc(text);
    toks.forEach(function (t) {
      if (t.length < 2) return;
      out = out.replace(new RegExp("(" + t.replace(/[^a-z0-9àâäéèêëîïôöùûüç]/g, "") + ")", "ig"), "<mark>$1</mark>");
    });
    return out;
  }
  function render(q) {
    var trimmed = q.trim();
    var toks = tokens(trimmed);
    var scored = INDEX.map(function (item) { return { item: item, s: score(item, toks) }; })
      .filter(function (r) { return !toks.length || r.s > 0; })
      .sort(function (a, b) { return b.s - a.s; });
    var results = scored.map(function (r) { return r.item; });
    var kinds = ["tool", "guide", "resource"];
    var kindLabel = { tool: "Outils", guide: "Guides", resource: "Pages de référence" };
    var LIVE_WORD = " live";
    if (summaryEl) {
      if (!trimmed) summaryEl.textContent = "La recherche couvre 23 outils — 19 en direct et 4 bientôt disponibles — ainsi que 2 guides écrits et 7 pages de référence. Choisissez un point de départ ci-dessous ou tapez ce que votre PC doit savoir.";
      else if (!results.length) summaryEl.textContent = "Rien sur le site ne correspond à \"" + trimmed + "\" pour le moment. Des termes matériels comme \"rtx 4070\", \"vram\" ou \"download time\" trouvent le plus.";
      else {
        var best = results[0];
        summaryEl.textContent = "\"" + trimmed + "\" correspond à " + results.length + " résultat" + (results.length === 1 ? "" : "s") + " sur le site. Le meilleur résultat est " + best.title + ".";
      }
    }
    if (status) status.textContent = results.length + " résultat" + (results.length === 1 ? "" : "s") + (trimmed ? ' pour "' + trimmed + '"' : "");
    if (countsEl) {
      countsEl.innerHTML = "";
      kinds.forEach(function (k) {
        var items = results.filter(function (r) { return r.kind === k; });
        var n = items.length;
        if (!n) return;
        var li = document.createElement("li");
        var label = kindLabel[k] + " " + n;
        if (k === "tool") {
          var liveN = items.filter(function (r) { return r.status === "live"; }).length;
          label += " (" + liveN + LIVE_WORD + ")";
        }
        li.textContent = label;
        countsEl.appendChild(li);
      });
    }
    resultsEl.innerHTML = "";
    if (!results.length) {
      var empty = document.createElement("div");
      empty.className = "empty-state";
      empty.innerHTML = "<p>Rien ne correspond à \"" + esc(trimmed) + "\" pour le moment. Essayez un terme plus large comme <em>vram</em>, <em>fps</em> ou <em>download</em>.</p><p style=\"margin-top:0.75rem\"><a href=\"/fr/search\">Effacer la recherche</a></p>";
      resultsEl.appendChild(empty);
      if (listbox) { listbox.innerHTML = ""; listbox.hidden = true; }
      return;
    }
    kinds.forEach(function (k) {
      var items = results.filter(function (r) { return r.kind === k; });
      if (!items.length) return;
      var h = document.createElement("h3");
      h.className = "search-group-title";
      h.textContent = kindLabel[k] + "  " + items.length;
      resultsEl.appendChild(h);
      var ul = document.createElement("ul");
      ul.className = "guide-cards";
      ul.setAttribute("role", "list");
      items.forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        a.className = "result-card";
        a.href = item.href;
        var tag = '<span class="badge badge-muted">' + esc(item.tag) + "</span>";
        var soon = item.status === "coming-soon" ? ' <span class="badge badge-muted">Bientôt</span>' : "";
        a.innerHTML = tag + soon + "<h3>" + highlight(item.title, toks) + "</h3><p>" + highlight(item.desc, toks) + "</p><span class=\"open-link\">Ouvrir \u2192</span>";
        li.appendChild(a);
        ul.appendChild(li);
      });
      resultsEl.appendChild(ul);
    });
    if (listbox) {
      listbox.innerHTML = "";
      results.slice(0, 6).forEach(function (item, i) {
        var opt = document.createElement("a");
        opt.href = item.href;
        opt.setAttribute("role", "option");
        opt.id = "search-option-" + i;
        opt.textContent = item.title;
        listbox.appendChild(opt);
      });
      listbox.hidden = !(trimmed.length >= 2 && results.length);
      input.setAttribute("aria-expanded", listbox.hidden ? "false" : "true");
    }
  }
  function applyFromUrl(push) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get("q") || "";
    if (input.value !== q) input.value = q;
    render(q);
    if (push) {
      var url = new URL(window.location.href);
      if (q.trim()) url.searchParams.set("q", q.trim()); else url.searchParams.delete("q");
      history.replaceState(null, "", url.toString());
    }
  }
  input.addEventListener("input", function () { render(input.value); });
  input.addEventListener("keydown", function (e) {
    if (!listbox || listbox.hidden) return;
    var links = listbox.querySelectorAll("a");
    if (e.key === "Escape") { listbox.hidden = true; input.setAttribute("aria-expanded", "false"); input.blur(); }
    if ((e.key === "ArrowDown" || e.key === "ArrowUp") && links.length) {
      e.preventDefault();
      links[0].focus();
    }
  });
  if (form) form.addEventListener("submit", function (e) {
    e.preventDefault();
    // The old handler re-read the query from the URL, so clicking SEARCH
    // (or pressing Enter) discarded the typed query and re-rendered the
    // empty state. Sync the input into the URL first, then render from it.
    var q = input.value.trim();
    var url = new URL(window.location.href);
    if (q) url.searchParams.set("q", q); else url.searchParams.delete("q");
    history.replaceState(null, "", url.toString());
    applyFromUrl(false);
  });
  document.addEventListener("click", function (e) {
    if (listbox && !e.target.closest("[data-search-form]")) { listbox.hidden = true; input.setAttribute("aria-expanded", "false"); }
  });
  applyFromUrl(false);
  input.focus();
})();
