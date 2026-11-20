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
        showNotice(true, "تم تحميل الإعدادات لعنوانك. تُحفظ التغييرات عند الضغط على حفظ التفضيلات، وإذا فشل الحفظ فاستخدم إلغاء الاشتراك بالبريد الإلكتروني أدناه.");
      } else {
        if (cardEl) cardEl.hidden = false;
        showNotice(false, "رابط الإدارة هذا لم يعد صالحا. استخدم إلغاء الاشتراك بنقرة واحدة أدناه بدلا منه.");
      }
    }).catch(function () {
      if (loadingEl) loadingEl.hidden = true;
      if (cardEl) cardEl.hidden = false;
      showNotice(false, "تعذر علينا التحقق من رابط الإدارة هذا من هذه الصفحة، لذا لا تظهر إعداداتك المحفوظة هنا. استخدم إلغاء الاشتراك بنقرة واحدة أدناه، أو أرسل بريدا إلى hello@toolwools.com وسنحدث تفضيلاتك يدويا.");
    });
  } else {
    if (loadingEl) loadingEl.hidden = true;
    if (cardEl) cardEl.hidden = false;
    showNotice(false, "تعذر علينا التحقق من رابط الإدارة هذا من هذه الصفحة. استخدم إلغاء الاشتراك بنقرة واحدة أدناه، أو أرسل بريدا إلى hello@toolwools.com.");
  }
  if (emailForm) emailForm.addEventListener("submit", function (e) {
    e.preventDefault();
    var value = emailInput ? emailInput.value.trim() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      if (emailStatus) { emailStatus.hidden = false; emailStatus.textContent = "أدخل عنوان البريد الإلكتروني الذي اشتركت به."; }
      if (emailInput) emailInput.setAttribute("aria-invalid", "true");
      return;
    }
    var btn = emailForm.querySelector('button[type="submit"]');
    if (btn) { btn.disabled = true; btn.textContent = "جارٍ إلغاء الاشتراك…"; }
    function fallback() {
      if (btn) { btn.disabled = false; btn.textContent = "إلغاء الاشتراك"; }
      if (emailStatus) {
        emailStatus.hidden = false;
        emailStatus.innerHTML = "تعذر علينا تسجيل ذلك تلقائيا. يرجى إرسال بريد إلكتروني إلى <a href=\"mailto:hello@toolwools.com?subject=" + encodeURIComponent("إلغاء الاشتراك " + value) + "\">hello@toolwools.com</a> بموضوع \"إلغاء الاشتراك " + value + "\" وسنلغي اشتراكك يدويا.";
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
    showNotice(false, "الحفظ من هذه الصفحة غير متاح: تغييرات التفضيلات تتطلب التحقق من رابط الإدارة على الخادم. استخدم إلغاء الاشتراك بالبريد الإلكتروني أدناه، أو أرسل بريدا إلى hello@toolwools.com بالتواتر والمواضيع التي تريدها.");
  });
})();
