// Newsletter form. Posts to the same Supabase table the TanStack source uses
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
      showError("Please enter a valid email address.");
      email.focus();
      return;
    }
    if (submitBtn) submitBtn.disabled = true;
    if (!cfg.url || !cfg.key) {
      if (submitBtn) submitBtn.disabled = false;
      showError("Newsletter signup is not connected right now, so nothing was sent. Please try again later.");
      return;
    }
    fetch(cfg.url + "/rest/v1/newsletter_subscribers", {
      method: "POST",
      headers: { apikey: cfg.key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ email: value.toLowerCase(), source: "homepage", locale: "en" })
    }).then(function (res) {
      if (res.status === 409) { showSuccess("You are already on the list \u2014 nothing else to do."); return; }
      if (!res.ok) throw new Error("http " + res.status);
      showSuccess("You are in. Watch your inbox for the next drop.");
    }).catch(function () {
      if (submitBtn) submitBtn.disabled = false;
      showError("We could not save that just now, so nothing was sent. Please try again in a moment.");
    });
  });
})();
