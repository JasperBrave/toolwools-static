// countdown.js — GTA 6 release countdown.
// Target matches the source (src/components/site/countdown.tsx):
// 2026-11-19T05:00:00Z (midnight ET, Nov 19 2026).
// Updates every [data-countdown] block on the page, once a second.
(function () {
  var TARGET = new Date(window.TOOLWOOLS_LAUNCH_UTC || "2026-11-19T05:00:00Z").getTime();
  var blocks = Array.prototype.slice.call(document.querySelectorAll("[data-countdown]"));
  if (!blocks.length) return;

  function calc() {
    var diff = TARGET - Date.now();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, released: true };
    return {
      days: Math.floor(diff / 86400000),
      hours: Math.floor((diff / 3600000) % 24),
      minutes: Math.floor((diff / 60000) % 60),
      seconds: Math.floor((diff / 1000) % 60),
      released: false,
    };
  }
  function pad(n) { return String(n).padStart(2, "0"); }

  function render() {
    var t = calc();
    blocks.forEach(function (block) {
      block.querySelectorAll("[data-countdown-days]").forEach(function (el) { el.textContent = pad(t.days); });
      block.querySelectorAll("[data-countdown-hours]").forEach(function (el) { el.textContent = pad(t.hours); });
      block.querySelectorAll("[data-countdown-minutes]").forEach(function (el) { el.textContent = pad(t.minutes); });
      block.querySelectorAll("[data-countdown-seconds]").forEach(function (el) { el.textContent = pad(t.seconds); });
      block.querySelectorAll("[data-countdown-label]").forEach(function (el) {
        el.textContent = t.released ? "GTA 6 est sorti" : "Compte à rebours de sortie";
      });
      if (t.released) {
        block.setAttribute("aria-label", "GTA 6 est sorti");
      } else {
        block.setAttribute("aria-label", "Temps restant avant la sortie de GTA 6 : " + t.days + " jours, " + t.hours + " heures, " + t.minutes + " minutes");
      }
    });
  }
  render();
  window.setInterval(render, 1000);
})();
