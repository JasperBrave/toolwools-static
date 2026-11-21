// Consent-gated analytics (B5 decision). GA4 (G-FXX0Z11D8D) loads ONLY after
// the visitor accepts in the consent banner. Choice is stored in
// localStorage ("tw-consent": "granted" | "denied"). No choice yet means no
// analytics and a visible banner on first visit. Re-openable from the footer
// "Configurações de cookies" button on every page.
(function () {
  var KEY = "tw-consent";
  var GA_ID = "G-FXX0Z11D8D";
  var loaded = false;
  function stored() { try { return window.localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { window.localStorage.setItem(KEY, v); } catch (e) { /* private mode */ } }
  function loadGa() {
    if (loaded) return;
    loaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA_ID, { anonymize_ip: true });
  }
  function banner() { return document.querySelector("[data-consent-banner]"); }
  function show() { var b = banner(); if (b) b.hidden = false; }
  function hide() { var b = banner(); if (b) b.hidden = true; }
  var choice = stored();
  if (choice === "granted") loadGa();
  else if (!choice) {
    // Worker C iter2: the fixed banner (181px at 375px) covered the hero
    // proof strip on first paint. Delay the first show so the hero is
    // visible on load; first scroll shows it immediately instead.
    // Re-opening from the footer Configurações de cookies button stays instant.
    var shown = false;
    var showSoon = function () { if (!shown) { shown = true; show(); } };
    window.setTimeout(showSoon, 1800);
    window.addEventListener("scroll", showSoon, { once: true, passive: true });
  }
  document.querySelectorAll("[data-consent-accept]").forEach(function (btn) {
    btn.addEventListener("click", function () { save("granted"); loadGa(); hide(); });
  });
  document.querySelectorAll("[data-consent-decline]").forEach(function (btn) {
    btn.addEventListener("click", function () { save("denied"); hide(); });
  });
  document.querySelectorAll("[data-consent-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      show();
      var b = banner();
      if (b) { var f = b.querySelector("[data-consent-accept]"); if (f) f.focus(); }
    });
  });
})();
