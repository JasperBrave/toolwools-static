// Trailers page: Radix-equivalent accessible <dialog>.
// Screen-reader title + description, Escape to close (native), focus returns
// to the trigger. The YouTube iframe loads only when a dialog opens, and its
// src is cleared on close so playback stops.
(function () {
  var dialog = document.querySelector("[data-trailer-dialog]");
  if (!dialog) return;
  var frame = dialog.querySelector("iframe");
  var titleEl = dialog.querySelector("[data-trailer-dialog-title]");
  var descEl = dialog.querySelector("[data-trailer-dialog-desc]");
  var loading = dialog.querySelector("[data-trailer-loading]");
  var lastTrigger = null;
  function open(id, title, desc) {
    lastTrigger = document.activeElement;
    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = "Lecteur vidéo YouTube pour " + title + ". Appuyez sur Échap pour fermer.";
    if (loading) loading.hidden = false;
    if (frame) {
      frame.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
      frame.title = title;
      frame.addEventListener("load", function () { if (loading) loading.hidden = true; }, { once: true });
    }
    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
    var closeBtn = dialog.querySelector("[data-trailer-close]");
    if (closeBtn) closeBtn.focus();
  }
  function close() {
    if (frame) frame.removeAttribute("src");
    if (typeof dialog.showModal === "function") { if (dialog.open) dialog.close(); }
    else dialog.removeAttribute("open");
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  }
  document.querySelectorAll("[data-trailer-open]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      open(btn.getAttribute("data-trailer-open"), btn.getAttribute("data-trailer-title") || "Bande-annonce GTA 6",
        btn.getAttribute("data-trailer-desc") || "");
    });
  });
  dialog.querySelectorAll("[data-trailer-close]").forEach(function (btn) {
    btn.addEventListener("click", close);
  });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) close();
  });
  dialog.addEventListener("close", function () {
    if (frame) frame.removeAttribute("src");
    if (lastTrigger && lastTrigger.focus) lastTrigger.focus();
  });
})();
