// Email preferences. The source manages subscriptions server-side with the
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
        showNotice(true, "Einstellungen für deine Adresse geladen. Änderungen speichern, wenn du auf Einstellungen speichern drückst, wenn ein Speichern fehlschlägt, nutze das E-Mail-Opt-out unten.");
      } else {
        if (cardEl) cardEl.hidden = false;
        showNotice(false, "Dieser Verwalten-Link ist nicht mehr gültig. Nutze stattdessen das Ein-Klick-Opt-out unten.");
      }
    }).catch(function () {
      if (loadingEl) loadingEl.hidden = true;
      if (cardEl) cardEl.hidden = false;
      showNotice(false, "Wir konnten diesen Verwalten-Link von dieser Seite aus nicht verifizieren, also werden deine gespeicherten Einstellungen hier nicht gezeigt. Nutze das Ein-Klick-Opt-out unten oder maile an hello@toolwools.com und wir aktualisieren deine Einstellungen von Hand.");
    });
  } else {
    if (loadingEl) loadingEl.hidden = true;
    if (cardEl) cardEl.hidden = false;
    showNotice(false, "Wir konnten diesen Verwalten-Link von dieser Seite aus nicht verifizieren. Nutze das Ein-Klick-Opt-out unten oder maile an hello@toolwools.com.");
  }
  if (emailForm) emailForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = emailInput ? emailInput.value.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      if (emailStatus) { emailStatus.hidden = false; emailStatus.textContent = "Gib die E-Mail-Adresse ein, mit der du dich angemeldet hast."; }
      if (emailInput) emailInput.setAttribute("aria-invalid", "true");
      return;
    }
    var btn = emailForm.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "Abmelden\u2026"; }
    function fallback() {
      if (btn) { btn.disabled = false; btn.textContent = "Abmelden"; }
      if (emailStatus) {
        emailStatus.hidden = false;
        emailStatus.innerHTML = "Wir konnten das nicht automatisch erfassen. Bitte maile an <a href=\"mailto:hello@toolwools.com?subject=" + encodeURIComponent("Abmelden " + value) + "\">hello@toolwools.com</a> mit dem Betreff \"Abmelden " + value + "\" und wir melden dich von Hand ab.";
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
    showNotice(false, "Speichern von dieser Seite ist nicht verfügbar: Einstellungs-Änderungen brauchen den Verwalten-Link, verifiziert auf dem Server. Nutze das E-Mail-Opt-out unten oder maile an hello@toolwools.com mit der Frequenz und den Themen, die du willst.");
  });
})();
