// Boletín form. Posts to the same Supabase table the TanStack source uses
// (newsletter_subscribers via PostgREST with the publishable key). A 409
// means the address is already on the list. If the endpoint is unreachable
// the form says so plainly instead of pretending the signup went through.
(function () {
  var form = document.querySelector("[data-newsletter-form]");
  if (!form) return;
  var cfg = window.TOOLWOOLS_SUPABASE || {};
  var email = form.querySelector('input[type="email"]');
  var feedback = document.querySelector("[data-newsletter-feedback]");
  var success = document.querySelector("[data-newsletter-success]");
  var submitBtn = form.querySelector('button[type="submit"]');
  function showError(msg) {
    if (!feedback) return;
    feedback.hidden = false;
    feedback.textContent = msg;
    feedback.classList.add("error");
    feedback.classList.remove("ok");
    feedback.setAttribute("role", "alert");
    email.setAttribute("aria-invalid", "true");
  }
  function showSuccess(msg) {
    if (success) {
      form.hidden = true;
      success.hidden = false;
      var m = success.querySelector("[data-newsletter-success-msg]");
      if (m) m.textContent = msg;
    } else if (feedback) {
      feedback.hidden = false;
      feedback.textContent = msg;
      feedback.classList.add("ok");
      feedback.classList.remove("error");
      feedback.setAttribute("role", "status");
      email.removeAttribute("aria-invalid");
    }
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = email.value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showError("Introduce una dirección de correo válida.");
      email.focus();
      return;
    }
    if (submitBtn) submitBtn.disabled = true;
    if (!cfg.url || !cfg.key) {
      if (submitBtn) submitBtn.disabled = false;
      showError("La suscripción al boletín no está conectada ahora mismo, así que no se envió nada. Inténtalo de nuevo más tarde.");
      return;
    }
    fetch(cfg.url + "/rest/v1/newsletter_subscribers", {
      method: "POST",
      headers: { apikey: cfg.key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email: value.toLowerCase(), source: "homepage", locale: "es" })
    }).then(function (res) {
      if (res.status === 409) { showSuccess("Ya estás en la lista, no hay nada más que hacer."); return; }
      if (!res.ok) throw new Error("http " + res.status);
      showSuccess("Ya estás dentro. Revisa tu bandeja de entrada para la próxima entrega.");
    }).catch(function () {
      if (submitBtn) submitBtn.disabled = false;
      showError("No pudimos guardarlo ahora mismo, así que no se envió nada. Inténtalo de nuevo en un momento.");
    });
  });
})();
