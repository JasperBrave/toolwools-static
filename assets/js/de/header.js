// header.js — sticky header shadow, mobile nav, Ctrl/Cmd+K search focus.
// Mirrors src/components/site/site-header.tsx behaviour without React.
(function () {
  // Scroll elevation.
  var bar = document.querySelector("[data-header-bar]");
  function onScroll() {
    if (bar) bar.classList.toggle("scrolled", window.scrollY > 4);
  }
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile nav: Escape closes and returns focus to the toggle.
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.hidden;
      nav.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Menü schließen" : "Menü öffnen");
      if (open) {
        var first = nav.querySelector("a, input, button");
        if (first) first.focus();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !nav.hidden) {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Menü öffnen");
        toggle.focus();
      }
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Menü öffnen");
      });
    });
  }

  // Ctrl/Cmd+K focuses the header search from anywhere.
  // Phase 4 fix: the desktop search is hidden below 1280px (the mobile
  // nav holds the search there), so the first [data-header-search-input]
  // in DOM order is invisible at mobile widths and focus() on it is a
  // no-op. Focus the VISIBLE input instead; if it lives in the closed
  // mobile nav, open the nav first (mirrors the homepage inline handler).
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      var desktop = null, mobile = null;
      document.querySelectorAll("[data-header-search-input]").forEach(function (input) {
        if (input.closest("[data-mobile-nav]")) { mobile = input; }
        else if (input.offsetParent !== null) { desktop = input; }
      });
      var navOpen = nav && !nav.hidden;
      var target = (navOpen && mobile) ? mobile : (desktop || mobile);
      if (target) {
        e.preventDefault();
        if (target === mobile && nav && nav.hidden) {
          nav.hidden = false;
          if (toggle) { toggle.setAttribute("aria-expanded", "true"); toggle.setAttribute("aria-label", "Menü schließen"); }
        }
        target.focus();
      }
    }
  });

  // Language menu: close on Escape or on an outside click.
  document.querySelectorAll(".lang-menu").forEach(function (menu) {
    var summary = menu.querySelector("summary");
    document.addEventListener("click", function (e) {
      if (menu.open && !menu.contains(e.target)) menu.open = false;
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && menu.open) { menu.open = false; if (summary) summary.focus(); }
    });
  });
})();
