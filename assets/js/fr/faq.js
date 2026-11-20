// faq.js — FAQ deep links.
// Mirrors src/components/tools/page/faq-accordion.tsx: a #faq-q-N hash opens
// the matching answer and scrolls it into view, on load and on hash change.
(function () {
  function openFromHash() {
    var id = window.location.hash.slice(1);
    if (!id || id.indexOf("faq-") !== 0) return;
    var target = document.getElementById(id);
    if (!target) return;
    var details = target.closest("details");
    if (!details) return;
    details.open = true;
    details.scrollIntoView({ block: "center", behavior: "smooth" });
  }
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
