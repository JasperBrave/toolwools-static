// faq.js — FAQ accordions and deep links.
// Mirrors src/components/tools/page/faq-accordion.tsx: a #faq-q-N hash opens
// the matching answer and scrolls it into view, on load and on hash change.
// Button-based accordions (<button data-faq-button> + <div data-faq-answer
// hidden>) get click-toggle wiring; native <details> accordions work by
// themselves and only need the hash deep-link. Each question toggles
// independently, matching the native <details> behaviour.
(function () {
  function toggleButton(button) {
    var answerId = button.getAttribute("aria-controls");
    var answer = answerId ? document.getElementById(answerId) : null;
    if (!answer) return;
    var open = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) {
      answer.removeAttribute("hidden");
    } else {
      answer.setAttribute("hidden", "");
    }
  }

  function bindButtons() {
    var buttons = document.querySelectorAll("[data-faq-button]");
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener("click", function () {
        toggleButton(this);
      });
    }
  }

  function openFromHash() {
    var id = window.location.hash.slice(1);
    if (!id || id.indexOf("faq-") !== 0) return;
    var target = document.getElementById(id);
    if (!target) return;
    var details = target.closest("details");
    if (details) {
      details.open = true;
      details.scrollIntoView({ block: "center", behavior: "smooth" });
      return;
    }
    // Button-based accordion: the hash target is the button itself.
    if (target.hasAttribute("data-faq-button")) {
      if (target.getAttribute("aria-expanded") !== "true") toggleButton(target);
      target.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  bindButtons();
  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
