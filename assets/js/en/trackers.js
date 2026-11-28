/* ToolWools trackers — staging build (Worker D, Phase 3).
   Progress is user-owned and stored locally only. Keys are namespaced per
   tracker (tw-tracker-missions etc.), following the generator pattern
   (tw-gen-history / tw-gen-favorites, audit 04 §7.6). NOTE: the
   business-tracker page has NO localStorage checkbox pattern — its JS
   contains zero localStorage calls and its checklist is a static table —
   so this file follows the generator pattern + the theme.js storage-failure
   rule (private mode => session-only, stated plainly) instead.
   No account, no server, no sync. No external requests. */
(function () {
  "use strict";
  var storageOK = (function () {
    try {
      var k = "__tw_tracker_test__";
      localStorage.setItem(k, "1");
      localStorage.removeItem(k);
      return true;
    } catch (e) { return false; }
  })();

  function load(key, fallback) {
    if (!storageOK) return fallback;
    try {
      var v = localStorage.getItem(key);
      return v === null ? fallback : JSON.parse(v);
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    if (!storageOK) return false;
    try { localStorage.setItem(key, JSON.stringify(val)); return true; }
    catch (e) { return false; }
  }
  function $(s, r) { return (r || document).querySelector(s); }
  function $all(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;"); }

  /* ---- theme toggle (all [data-theme-toggle] buttons stay in sync) ---- */
  function setTheme(t, persist) {
    document.documentElement.dataset.theme = t;
    document.documentElement.classList.toggle("dark", t === "dark");
    $all("[data-theme-toggle]").forEach(function (b) {
      b.setAttribute("aria-pressed", t === "dark" ? "true" : "false");
      b.setAttribute("aria-label", t === "dark" ? "Switch to light theme" : "Switch to dark theme");
    });
    if (persist) { try { localStorage.setItem("tw-theme", t); } catch (e) {} }
  }
  $all("[data-theme-toggle]").forEach(function (b) {
    b.addEventListener("click", function () {
      var next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.classList.add("tw-theme-switching");
      setTheme(next, true);
      setTimeout(function () { document.documentElement.classList.remove("tw-theme-switching"); }, 50);
    });
  });

  /* ---- storage notice on every tracker page ---- */
  var storageNote = $("#storage-note");
  if (storageNote) {
    storageNote.textContent = storageOK
      ? "Your progress is saved in this browser only. Clearing browser data clears it, there is no account and no sync."
      : "Browser storage is unavailable (for example, private mode), so your progress lasts for this session only and will not be saved.";
  }

  /* ---- shared progress UI ---- */
  function renderProgress(kind, checked, total, label) {
    var text = $("#progress-text"), fill = $("#progress-fill"), bar = fill;
    var pct = total > 0 ? Math.round(checked / total * 100) : 0;
    if (text) text.textContent = checked + " / " + total + " " + label + " \u00b7 " + pct + "%";
    if (fill) fill.style.width = pct + "%";
    if (bar) {
      bar.setAttribute("aria-valuenow", String(checked));
      bar.setAttribute("aria-valuemax", String(total));
      bar.setAttribute("aria-label", checked + " of " + total + " " + label + " checked, " + pct + " percent");
    }
    var empty = $("#empty-note"), done = $("#done-banner");
    if (empty) empty.hidden = checked !== 0;
    if (done) done.classList.toggle("show", total > 0 && checked === total);
  }

  /* ---- per-container handlers (a page may hold two: missions + optional) ---- */
  $all("[data-tracker-kind]").forEach(function (main) {
  if (main.getAttribute("data-tracker-kind") === "checkbox") {
    var key = main.getAttribute("data-tracker-key");
    var label = main.getAttribute("data-tracker-label") || "checked";
    var boxes = $all('input[type="checkbox"][data-track-id]', main);
    var total = boxes.length;
    var checked = load(key, []);
    if (!Array.isArray(checked)) checked = [];
    var checkedSet = {};
    checked.forEach(function (id) { checkedSet[id] = true; });
    boxes.forEach(function (box) { box.checked = !!checkedSet[box.getAttribute("data-track-id")]; });
    function update() {
      var n = boxes.filter(function (b) { return b.checked; }).length;
      renderProgress("checkbox", n, total, label);
      $all("[data-chapter]").forEach(function (sec) {
        var cbs = $all('input[type="checkbox"][data-track-id]', sec);
        var cn = cbs.filter(function (b) { return b.checked; }).length;
        var el = sec.querySelector("[data-chapter-count]");
        if (el) el.textContent = cn + " / " + cbs.length + " checked";
      });
      save(key, boxes.filter(function (b) { return b.checked; }).map(function (b) { return b.getAttribute("data-track-id"); }));
    }
    boxes.forEach(function (box) { box.addEventListener("change", update); });
    update();
    var copyBtn = $("#copy-btn");
    if (copyBtn) copyBtn.addEventListener("click", function () {
      var lines = boxes.filter(function (b) { return b.checked; }).map(function (b) {
        var lab = b.closest(".check-item").querySelector("label");
        return "\u2611 " + (lab ? lab.textContent.trim().replace(/\s+/g, " ") : b.getAttribute("data-track-id"));
      });
      var status = $("#action-status");
      var text = lines.length ? lines.join("\n") : "Nothing checked yet.";
      function done(ok) { if (status) status.textContent = ok ? "Copied " + lines.length + " checked item(s) to the clipboard." : "Copy did not work in this browser, select the list manually."; }
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { done(false); });
      } else { done(false); }
    });
    var resetBtn = $("#reset-btn");
    if (resetBtn) resetBtn.addEventListener("click", function () {
      if (!window.confirm("Clear all checked items on this tracker? This cannot be undone.")) return;
      boxes.forEach(function (b) { b.checked = false; });
      save(key, []);
      update();
      var status = $("#action-status");
      if (status) status.textContent = "Progress cleared.";
    });
  }

  /* ---- collectibles tracker: counters + spot checkboxes ---- */
  if (main.getAttribute("data-tracker-kind") === "collectibles") {
    var ckey = main.getAttribute("data-tracker-key");
    var state = load(ckey, { counts: {}, spotted: [] });
    if (!state || typeof state !== "object") state = { counts: {}, spotted: [] };
    state.counts = state.counts || {};
    state.spotted = Array.isArray(state.spotted) ? state.spotted : [];
    var counters = $all('input[type="number"][data-count-id]', main);
    var spots = $all('input[type="checkbox"][data-spot-id]', main);
    var types = $all("[data-collectible-type]", main);
    var totalTypes = types.length;
    counters.forEach(function (inp) {
      var id = inp.getAttribute("data-count-id");
      var v = parseInt(state.counts[id], 10);
      inp.value = isNaN(v) ? "" : String(Math.max(0, v));
    });
    var spotSet = {};
    state.spotted.forEach(function (id) { spotSet[id] = true; });
    spots.forEach(function (box) { box.checked = !!spotSet[box.getAttribute("data-spot-id")]; });
    function typeHasProgress(typeEl) {
      var id = typeEl.getAttribute("data-collectible-type");
      var inp = typeEl.querySelector('input[type="number"][data-count-id]');
      if (inp) { var v = parseInt(inp.value, 10); return !isNaN(v) && v > 0; }
      var box = typeEl.querySelector('input[type="checkbox"][data-spot-id]');
      return !!(box && box.checked);
    }
    function updateCollectibles() {
      var started = types.filter(typeHasProgress).length;
      var pct = totalTypes > 0 ? Math.round(started / totalTypes * 100) : 0;
      var text = $("#progress-text"), fill = $("#progress-fill"), bar = fill;
      if (text) text.textContent = started + " / " + totalTypes + " types started \u00b7 " + pct + "%";
      if (fill) fill.style.width = pct + "%";
      if (bar) {
        bar.setAttribute("aria-valuenow", String(started));
        bar.setAttribute("aria-valuemax", String(totalTypes));
        bar.setAttribute("aria-label", started + " of " + totalTypes + " collectible types started, " + pct + " percent");
      }
      var empty = $("#empty-note"), done = $("#done-banner");
      if (empty) empty.hidden = started !== 0;
      if (done) done.classList.toggle("show", totalTypes > 0 && started === totalTypes);
      types.forEach(function (typeEl) {
        var id = typeEl.getAttribute("data-collectible-type");
        var out = typeEl.querySelector('[data-type-progress="' + id + '"]');
        if (!out) return;
        var inp = typeEl.querySelector('input[type="number"][data-count-id]');
        if (inp) {
          var lo = inp.getAttribute("data-band-lo"), hi = inp.getAttribute("data-band-hi");
          var v = parseInt(inp.value, 10);
          out.textContent = (isNaN(v) ? 0 : v) + " found, band " + lo + "\u2013" + hi;
        } else {
          var box = typeEl.querySelector('input[type="checkbox"][data-spot-id]');
          out.textContent = (box && box.checked) ? "Spotted in the world" : "Not spotted yet";
        }
      });
      var counts = {};
      counters.forEach(function (inp) {
        var v = parseInt(inp.value, 10);
        if (!isNaN(v) && v > 0) counts[inp.getAttribute("data-count-id")] = v;
      });
      var spottedIds = spots.filter(function (b) { return b.checked; }).map(function (b) { return b.getAttribute("data-spot-id"); });
      save(ckey, { counts: counts, spotted: spottedIds });
    }
    counters.forEach(function (inp) {
      inp.addEventListener("change", function () {
        var hi = parseInt(inp.getAttribute("data-band-hi"), 10);
        var v = parseInt(inp.value, 10);
        if (!isNaN(v)) {
          if (v < 0) inp.value = "0";
          if (!isNaN(hi) && v > hi) inp.value = String(hi);
        }
        updateCollectibles();
      });
    });
    spots.forEach(function (box) { box.addEventListener("change", updateCollectibles); });
    updateCollectibles();
    var creset = $("#reset-btn");
    if (creset) creset.addEventListener("click", function () {
      if (!window.confirm("Clear all collectible progress on this tracker? This cannot be undone.")) return;
      counters.forEach(function (inp) { inp.value = ""; });
      spots.forEach(function (b) { b.checked = false; });
      save(ckey, { counts: {}, spotted: [] });
      updateCollectibles();
      var status = $("#action-status");
      if (status) status.textContent = "Progress cleared.";
    });
  }

  /* ---- hub: live progress on each tile, from localStorage ---- */
  if (main.getAttribute("data-tracker-kind") === "hub") {
    $all("[data-hub-key]").forEach(function (tile) {
      var k = tile.getAttribute("data-hub-key");
      var kind = tile.getAttribute("data-hub-kind");
      var total = parseInt(tile.getAttribute("data-hub-total"), 10);
      var label = tile.getAttribute("data-hub-label") || "checked";
      var out = tile.querySelector("[data-hub-progress]");
      var fill = tile.querySelector("[data-hub-fill]");
      var bar = tile.querySelector("[data-hub-bar]");
      var n = 0;
      if (kind === "collectibles") {
        var st = load(k, { counts: {}, spotted: [] });
        var started = 0;
        if (st && typeof st === "object") {
          var counts = st.counts || {};
          Object.keys(counts).forEach(function (id) { if (counts[id] > 0) started++; });
          started += (st.spotted || []).length;
        }
        n = started;
      } else {
        var arr = load(k, []);
        n = Array.isArray(arr) ? arr.length : 0;
      }
      var pct = total > 0 ? Math.round(n / total * 100) : 0;
      if (out) out.textContent = n + " / " + total + " " + label + " \u00b7 " + pct + "%";
      if (fill) fill.style.width = pct + "%";
      if (bar) {
        bar.setAttribute("aria-valuenow", String(n));
        bar.setAttribute("aria-valuemax", String(total));
        bar.setAttribute("aria-label", n + " of " + total + " " + label + ", " + pct + " percent");
      }
    });
  }

  /* ---- mini tracker: optional missions (own key, own count, no progress bar) ---- */
  if (main.getAttribute("data-tracker-kind") === "mini") {
    var mkey = main.getAttribute("data-tracker-key");
    var mboxes = $all('input[type="checkbox"][data-track-id]', main);
    var mchecked = load(mkey, []);
    if (!Array.isArray(mchecked)) mchecked = [];
    var mset = {};
    mchecked.forEach(function (id) { mset[id] = true; });
    mboxes.forEach(function (box) { box.checked = !!mset[box.getAttribute("data-track-id")]; });
    var mout = main.querySelector("[data-mini-count]");
    function mupdate() {
      var n = mboxes.filter(function (b) { return b.checked; }).length;
      if (mout) mout.textContent = n + " / " + mboxes.length + " done";
      save(mkey, mboxes.filter(function (b) { return b.checked; }).map(function (b) { return b.getAttribute("data-track-id"); }));
    }
    mboxes.forEach(function (box) { box.addEventListener("change", mupdate); });
    mupdate();
  }
  });
})();
