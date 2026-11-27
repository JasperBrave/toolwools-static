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

  // Móvel nav: Escape closes and returns focus to the toggle.
  var toggle = document.querySelector("[data-menu-toggle]");
  var nav = document.querySelector("[data-mobile-nav]");
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.hidden;
      nav.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
      if (open) {
        var first = nav.querySelector("a, input, button");
        if (first) first.focus();
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && !nav.hidden) {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
        toggle.focus();
      }
    });
    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.hidden = true;
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Abrir menu");
      });
    });
  }

  // Ctrl/Cmd+K focuses the header search from anywhere. The first
  // [data-header-search-input] in DOM order is the desktop input, which is
  // display:none below 1280px, so focusing it there was a no-op. Mirror the
  // homepage inline handler: on narrow screens open the mobile menu first
  // and focus its search input instead. (FPS template shell fix, 27 Nov 2026.)
  document.addEventListener("keydown", function (e) {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      var input = window.innerWidth >= 1280
        ? document.querySelector("#header-search")
        : document.querySelector(".mobile-menu [data-header-search-input]");
      if (window.innerWidth < 1280 && nav && nav.hidden) {
        nav.hidden = false;
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fechar menu");
      }
      if (input) input.focus();
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
