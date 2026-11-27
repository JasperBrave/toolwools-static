// theme.js — ToolWools theme toggle.
// Key and values match the TanStack source (localStorage "tw-theme").
// L6: no stored preference -> light-first default (task decision).
(function () {
  var KEY = "tw-theme";
  function apply(theme) {
    document.documentElement.dataset.theme = theme;
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-label", theme === "dark" ? "Zum hellen Theme wechseln" : "Zum dunklen Theme wechseln");
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }
  function stored() {
    try { return window.localStorage.getItem(KEY); } catch (e) { return null; }
  }
  function save(theme) {
    try { window.localStorage.setItem(KEY, theme); } catch (e) { /* private mode: theme lasts for the session */ }
  }
  var TW_THEME_DEFAULT = "light"; // merge gate N2 (27 Nov 2026): light-first, as the homepage guard + shared theme.js
  var current = stored() || TW_THEME_DEFAULT;
  apply(current);
  document.querySelectorAll("[data-theme-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      current = current === "dark" ? "light" : "dark";
      save(current);
      apply(current);
    });
  });
  // AXE FIX (2026-11-20): <pre> formula blocks scroll horizontally at
  // phone width; make them keyboard-focusable so the scrollable region
  // has keyboard access (axe scrollable-region-focusable).
  document.querySelectorAll("pre").forEach(function (p) {
    if (!p.hasAttribute("tabindex")) p.setAttribute("tabindex", "0");
  });
})();
