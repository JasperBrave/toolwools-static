// Contato form. Posts to the same Supabase table the TanStack source uses
// (contact_messages via PostgREST with the publishable key). Validation
// messages match the source (contact.tsx). If the endpoint is unreachable,
// the form says so plainly and offers a pre-filled email instead of
// pretending the message was sent.
(function () {
  var form = document.querySelector("[data-contact-form]");
  if (!form) return;
  var cfg = window.TOOLWOOLS_SUPABASE || {};
  var fields = ["name", "email", "subject", "message"];
  var touched = {};
  function val(name) { var el = form.querySelector('[name="' + name + '"]'); return el ? el.value.trim() : ""; }
  function el(name) { return form.querySelector('[name="' + name + '"]'); }
  function errors() {
    var e = {};
    if (val("name").length < 2) e.name = "Diga como devemos chamá-lo (mínimo de 2 caracteres).";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val("email"))) e.email = "Precisamos de um endereço de e-mail válido para responder.";
    if (val("subject").length < 4) e.subject = "Adicione um assunto curto (mínimo de 4 caracteres).";
    if (val("message").length < 20) e.message = "Forneça pelo menos 20 caracteres de detalhe para que possamos agir.";
    return e;
  }
  function showErrors(errs) {
    fields.forEach(function (name) {
      var input = el(name);
      var msg = form.querySelector('[data-error-for="' + name + '"]');
      var err = touched[name] ? errs[name] : null;
      if (input) input.setAttribute("aria-invalid", err ? "true" : "false");
      if (msg) { msg.textContent = err || ""; msg.hidden = !err; }
    });
  }
  fields.forEach(function (name) {
    var input = el(name);
    if (!input) return;
    input.addEventListener("blur", function () { touched[name] = true; showErrors(errors()); });
    input.addEventListener("input", function () { if (touched[name]) showErrors(errors()); });
  });
  var counter = document.querySelector("[data-message-count]");
  var msgInput = el("message");
  if (msgInput && counter) {
    msgInput.addEventListener("input", function () { counter.textContent = msgInput.value.length + "/2000"; });
  }
  var submitBtn = form.querySelector('button[type="submit"]');
  var statusBox = document.querySelector("[data-contact-error]");
  var successBox = document.querySelector("[data-contact-success]");
  function mailtoFallback() {
    var subject = encodeURIComponent("Contato do ToolWools: " + (val("subject") || "(sem assunto)"));
    var body = encodeURIComponent("Nome: " + val("name") + "\nEmail: " + val("email") + "\nCategory: " + val("category") + "\n\n" + val("message"));
    return "mailto:hello@toolwools.com?subject=" + subject + "&body=" + body;
  }
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    fields.forEach(function (n) { touched[n] = true; });
    var errs = errors();
    showErrors(errs);
    if (Object.keys(errs).length) {
      var first = fields.find(function (n) { return errs[n]; });
      if (first && el(first)) el(first).focus();
      return;
    }
    if (el("company") && el("company").value) { // honeypot: pretend success, store nothing
      form.hidden = true;
      if (successBox) successBox.hidden = false;
      return;
    }
    if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = "Enviando…"; }
    var payload = { name: val("name"), email: val("email").toLowerCase(),
      category: val("category"), subject: val("subject"), message: val("message") };
    function fail() {
      if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Enviar mensagem"; }
      if (statusBox) {
        statusBox.hidden = false;
        statusBox.className = "status-box err";
        statusBox.setAttribute("role", "alert");
        statusBox.innerHTML = "<strong>Não conseguimos enviar isso agora.</strong><p>O serviço de formulário não respondeu. Nada foi salvo. Você pode tentar novamente, ou enviar a mesma mensagem por e-mail: <a href=\"" + mailtoFallback() + "\">email hello@toolwools.com</a>.</p>";
      }
    }
    if (!cfg.url || !cfg.key) { fail(); return; }
    fetch(cfg.url + "/rest/v1/contact_messages", {
      method: "POST",
      headers: { apikey: cfg.key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify(payload)
    }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      form.hidden = true;
      if (successBox) successBox.hidden = false;
      if (statusBox) statusBox.hidden = true;
    }).catch(fail);
  });
  var again = document.querySelector("[data-contact-again]");
  if (again) again.addEventListener("click", function () {
    if (successBox) successBox.hidden = true;
    form.hidden = false;
    form.reset();
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = "Enviar mensagem"; }
    if (counter) counter.textContent = "0/2000";
  });
})();
