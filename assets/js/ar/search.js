// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/ar/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /ar/tools/<slug> (live tools) or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "مدقق متطلبات نظام GTA 6", desc: "حكم فوري مقابل المستويات الدنيا والموصى بها والفائقة المقدرة من المجتمع. وحدة معالجة الرسومات ووحدة المعالجة المركزية والذاكرة والتخزين." },
    { slug: "download-time", title: "حاسبة وقت تنزيل GTA 6", desc: "قدّر كم سيستغرق التثبيت الأساسي البالغ نحو 150 غيغابايت على اتصالك، مع حساب تصحيح اليوم الأول." },
    { slug: "storage-planner", title: "مخطط تخزين GTA 6", desc: "خصص كل غيغابايت: التثبيت الأساسي وتصحيح اليوم الأول والمحتوى الموسمي القابل للتنزيل وهامش آمن للتحديثات." },
    { slug: "add-to-calendar", title: "مذكّر تاريخ إصدار GTA 6", desc: "أضف إطلاق GTA 6 إلى تقويمك حسب منطقتك الزمنية." },
    { slug: "readiness-score", title: "نتيجة جاهزية GTA 6", desc: "نتيجة واحدة لجهازك كله: الأداء وذاكرة الفيديو والتخزين والشبكة." },
    { slug: "bottleneck-calculator", title: "حاسبة عنق زجاجة GTA 6", desc: "تحقق من توازن وحدة المعالجة المركزية ووحدة معالجة الرسومات للعبة GTA 6 بدقة 1080p و1440p و4K. نسبة عنق زجاجة مباشرة ونطاق معدل الإطارات وأصغر ترقية تعيد توازن جهازك." },
    { slug: "vram-calculator", title: "مدقق متطلبات ذاكرة فيديو GTA 6", desc: "تحقق من الحد الأدنى لذاكرة الفيديو التي تحتاجها للعبة GTA 6 بدقة 1080p و1440p و4K. حكم لبطاقات 6 غيغابايت و8 غيغابايت و12 غيغابايت و16 غيغابايت." },
    { slug: "fps-calculator", title: "حاسبة معدل إطارات GTA 6", desc: "قدّر معدل الإطارات لوحدة معالجة الرسومات لديك بدقة 1080p و1440p و4K عبر إعدادات منخفضة ومتوسطة وعالية وفائقة." },
    { slug: "gpu-tier-list", title: "قائمة مستويات وحدة معالجة الرسومات في GTA 6", desc: "أفضل بطاقات الرسومات للعبة GTA 6، مرتبة حسب المستوى." },
    { slug: "interactive-map", title: "الخريطة التفاعلية للعبة GTA 6", desc: "مستكشف ليونيدا ومقارنة أحجام لخريطة GTA 6." },
    { slug: "pre-order-tracker", title: "مكتب قرارات الطلب المسبق لـ GTA 6", desc: "أين تطلب GTA 6 مسبقا، مقارنة حسب القناة." },
    { slug: "edition-comparison", title: "منتقي إصدارات GTA 6", desc: "مقارنة بين كل إصدارات GTA 6: المكافآت والسعر وما يفتحه كل إصدار." },
    { slug: "internet-speed-check", title: "مستشار سرعة الإنترنت في GTA 6", desc: "تحقق مما إذا كان اتصالك سريعا بما يكفي لتنزيلات GTA 6 واللعب عبر الإنترنت." },
    { slug: "price-by-country", title: "سعر GTA 6 حسب البلد", desc: "سعر GTA 6 حسب البلد بالعملة المحلية." },
    { slug: "economy-calculator", title: "حاسبة المال وعائد الأعمال للعبة GTA 6", desc: "اعرف أسرع طريقة لكسب GTA$ وأي الأعمال تسترد تكلفتها أولا." },
    { slug: "gta-6-tracker", title: "متتبع إطلاق GTA 6", desc: "متتبع الإطلاق ومراحل التحميل المسبق للعبة GTA 6." },
    { slug: "settings-optimizer", title: "محسّن إعدادات الرسومات", desc: "اضبط إعدادات الرسومات لمعدل الإطارات المستهدف وجهازك." },
    { slug: "hardware-comparison", title: "مقارنة الأجهزة", desc: "قارن وحدتي معالجة رسومات أو وحدتي معالجة مركزية وجهًا لوجه لـ GTA 6." },
    { slug: "server-status", title: "حالة خوادم GTA 6", desc: "هل خوادم GTA 6 معطلة؟ تحقق مباشر من الحالة." },
    { slug: "preload-tracker", title: "متتبع التحميل المسبق للعبة GTA 6", desc: "عد تنازلي للتحميل المسبق والإطلاق حسب منطقتك الزمنية." },
    { slug: "vehicle-comparison", title: "مقارنة مركبات GTA 6", desc: "قارن بين أي مركبتين من GTA 6." },
    { slug: "weapon-comparison", title: "مقارنة إحصاءات أسلحة GTA 6", desc: "مقارنة مباشرة لإحصاءات أسلحة GTA 6: الضرر ومعدل إطلاق النار والمدى والدقة." }
  ];

  function setup(input) {
    if (!input) return;
    var box = input.closest(".header-search, .mobile-nav-search");
    if (!box) return;
    var list = box.querySelector("[data-search-results]");
    if (!list) return;
    var active = -1;

    function close() { list.hidden = true; list.innerHTML = ""; active = -1; input.removeAttribute("aria-expanded"); }
    function render(q) {
      var query = q.trim().toLowerCase();
      list.innerHTML = "";
      if (query.length < 2) { close(); return; }
      var hits = TOOLS.filter(function (t) {
        return (t.title + " " + t.desc).toLowerCase().indexOf(query) !== -1;
      }).slice(0, 6);
      if (!hits.length) {
        var empty = document.createElement("div");
        empty.className = "search-results-empty";
        empty.textContent = 'لا توجد أدوات تطابق "' + q.trim() + '" بعد. جرّب "FPS" أو "VRAM" أو "bottleneck".';
        list.appendChild(empty);
      } else {
        hits.forEach(function (t) {
          var a = document.createElement("a");
          a.href = "/ar/tools/" + t.slug;
          a.setAttribute("role", "option");
          var strong = document.createElement("span");
          strong.textContent = t.title;
          var small = document.createElement("span");
          small.className = "search-result-desc";
          small.textContent = t.desc;
          a.appendChild(strong);
          a.appendChild(small);
          list.appendChild(a);
        });
      }
      list.hidden = false;
      input.setAttribute("aria-expanded", "true");
      active = -1;
    }
    input.addEventListener("input", function () { render(input.value); });
    input.addEventListener("focus", function () { if (input.value.trim().length >= 2) render(input.value); });
    input.addEventListener("keydown", function (e) {
      var links = list.querySelectorAll("a");
      if (e.key === "Escape") { close(); input.blur(); return; }
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        if (!links.length) return;
        e.preventDefault();
        active = e.key === "ArrowDown" ? (active + 1) % links.length : (active - 1 + links.length) % links.length;
        links.forEach(function (l) { l.classList.remove("active"); });
        links[active].classList.add("active");
        links[active].focus();
        return;
      }
      if (e.key === "Enter" && active >= 0 && links[active]) {
        e.preventDefault();
        window.location.href = links[active].href;
      }
    });
    document.addEventListener("click", function (e) {
      if (!box.contains(e.target)) close();
    });
  }

  document.querySelectorAll("[data-header-search-input]").forEach(setup);
})();
