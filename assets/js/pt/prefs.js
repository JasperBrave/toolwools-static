// E-mail preferences. The source manages subscriptions server-side with the
// service-role key (token lookup, preference save, opt-out). A static page
// cannot hold that key, so the manage-link lookup is attempted against the
// public PostgREST endpoint and, when it cannot be verified (the expected
// case under RLS), the page says so plainly and offers the email opt-out
// below plus a mail link. Nothing is faked as saved.
(function () {
  var params = new URLSearchParams(window.location.search);
  var token = params.get("token") || "";
  var cfg = window.TOOLWOOLS_SUPABASE || {};
  var loadingEl = document.querySelector("[data-prefs-loading]");
  var cardEl = document.querySelector("[data-prefs-card]");
  var noticeEl = document.querySelector("[data-prefs-notice]");
  var formEl = document.querySelector("[data-prefs-form]");
  var emailForm = document.querySelector("[data-unsub-form]");
  var emailInput = document.querySelector("[data-unsub-email]");
  var emailStatus = document.querySelector("[data-unsub-status]");
  var emailDone = document.querySelector("[data-unsub-done]");
  function showNotice(ok, text) {
    if (!noticeEl) return;
    noticeEl.hidden = false;
    noticeEl.className = "status-box " + (ok ? "ok" : "err");
    noticeEl.setAttribute("role", ok ? "status" : "alert");
    noticeEl.innerHTML = "<p>" + text + "</p>";
  }
  if (!token) {
    if (loadingEl) loadingEl.hidden = true;
    if (cardEl) cardEl.hidden = false;
  } else if (cfg.url && cfg.key) {
    fetch(cfg.url + "/rest/v1/newsletter_subscribers?manage_token=eq." + encodeURIComponent(token) + "&select=email,frequency,topics,unsubscribed", {
      headers: { apikey: cfg.key, Accept: "application/json" }
    }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      return res.json();
    }).then(function (rows) {
      if (loadingEl) loadingEl.hidden = true;
      if (rows && rows.length) {
        if (cardEl) cardEl.hidden = false;
        if (formEl) formEl.hidden = false;
        var row = rows[0];
        var masked = document.querySelector("[data-prefs-email]");
        if (masked && row.email) {
          var parts = row.email.split("@");
          masked.textContent = parts[0].slice(0, 1) + "\u2022\u2022@" + (parts[1] || "");
        }
        showNotice(true, "Configurações carregadas para o seu endereço. As alterações são salvas quando você pressiona Salvar preferências; se uma gravação falhar, use a opção de cancelamento por e-mail abaixo.");
      } else {
        if (cardEl) cardEl.hidden = false;
        showNotice(false, "Esse link de gerenciamento não é mais válido. Use o cancelamento em um clique abaixo.");
      }
    }).catch(function () {
      if (loadingEl) loadingEl.hidden = true;
      if (cardEl) cardEl.hidden = false;
      showNotice(false, "Não conseguimos verificar esse link de gerenciamento a partir desta página, então suas configurações salvas não são mostradas aqui. Use o cancelamento em um clique abaixo, ou envie um e-mail para hello@toolwools.com e atualizaremos suas preferências manualmente.");
    });
  } else {
    if (loadingEl) loadingEl.hidden = true;
    if (cardEl) cardEl.hidden = false;
    showNotice(false, "Não conseguimos verificar esse link de gerenciamento a partir desta página. Use o cancelamento em um clique abaixo, ou envie um e-mail para hello@toolwools.com.");
  }
  if (emailForm) emailForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = emailInput ? emailInput.value.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      if (emailStatus) { emailStatus.hidden = false; emailStatus.textContent = "Digite o endereço de e-mail com o qual você se inscreveu."; }
      if (emailInput) emailInput.setAttribute("aria-invalid", "true");
      return;
    }
    var btn = emailForm.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "Cancelando inscrição…"; }
    function fallback() {
      if (btn) { btn.disabled = false; btn.textContent = "Cancelar inscrição"; }
      if (emailStatus) {
        emailStatus.hidden = false;
        emailStatus.innerHTML = "Não conseguimos registrar isso automaticamente. Envie um e-mail para <a href=\"mailto:hello@toolwools.com?subject=" + encodeURIComponent("Cancelar inscrição " + value) + "\">hello@toolwools.com</a> com o assunto \"Cancelar inscrição " + value + "\" e cancelaremos sua inscrição manualmente.";
      }
    }
    if (!cfg.url || !cfg.key) { fallback(); return; }
    fetch(cfg.url + "/rest/v1/newsletter_subscribers?email=eq." + encodeURIComponent(value.toLowerCase()), {
      method: "PATCH",
      headers: { apikey: cfg.key, "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({ unsubscribed: true, topics: [] })
    }).then(function (res) {
      if (!res.ok) throw new Error("http " + res.status);
      emailForm.hidden = true;
      if (emailDone) emailDone.hidden = false;
    }).catch(fallback);
  });
  if (formEl) formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    showNotice(false, "Salvar a partir desta página não está disponível: as alterações de preferência precisam do link de gerenciamento verificado no servidor. Use o cancelamento por e-mail abaixo, ou envie um e-mail para hello@toolwools.com com a frequência e os tópicos que você quer.");
  });
})();
