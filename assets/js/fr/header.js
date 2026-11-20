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
      toggle.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      if (open) {
        var first = nav.querySelector("a, input, button");
        if (first) first.focus();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !nav.hidden) {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
        toggle.focus();
      }
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Ouvrir le menu");
      });
    });
  }

  // Ctrl/Cmd+K focuses the header search from anywhere.
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      var input = document.querySelector("[data-header-search-input]");
      if (input) { e.preventDefault(); input.focus(); }
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
