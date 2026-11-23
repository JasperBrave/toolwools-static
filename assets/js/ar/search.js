// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/ar/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /ar/tools/<slug> (live tools), t.url when set
// (e.g. /ar/generators, which lives outside /ar/tools), or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "مدقق متطلبات نظام GTA 6", desc: "حكم فوري مقابل المستويات الدنيا والموصى بها والفائقة المقدرة من المجتمع. وحدة معالجة الرسومات ووحدة المعالجة المركزية والذاكرة والتخزين." },
    { slug: "download-time", title: "حاسبة وقت تنزيل GTA 6", desc: "قدّر كم سيستغرق التثبيت الأساسي البالغ نحو 212 غيغابايت على اتصالك، مع حساب تصحيح اليوم الأول." },
    { slug: "storage-planner", title: "مخطط تخزين GTA 6", desc: "خصص كل غيغابايت: التثبيت الأساسي وتصحيح اليوم الأول والمحتوى الموسمي القابل للتنزيل وهامش آمن للتحديثات." },
    { slug: "add-to-calendar", title: "مذكّر تاريخ إصدار GTA 6", desc: "أضف إطلاق GTA 6 إلى تقويمك حسب منطقتك الزمنية." },
    { slug: "readiness-score", title: "نتيجة جاهزية GTA 6", desc: "نتيجة واحدة لجهازك كله: الأداء وذاكرة الفيديو والتخزين والشبكة." },
    { slug: "bottleneck-calculator", title: "حاسبة عنق زجاجة GTA 6", desc: "تحقق من توازن وحدة المعالجة المركزية ووحدة معالجة الرسومات للعبة GTA 6 بدقة 1080p و1440p و4K. نسبة عنق زجاجة مباشرة ونطاق معدل الإطارات وأصغر ترقية تعيد توازن جهازك." },
    { slug: "vram-calculator", title: "مدقق متطلبات ذاكرة فيديو GTA 6", desc: "تحقق من الحد الأدنى لذاكرة الفيديو التي تحتاجها للعبة GTA 6 بدقة 1080p و1440p و4K. حكم لبطاقات 6 غيغابايت و8 غيغابايت و12 غيغابايت و16 غيغابايت." },
    { slug: "fps-calculator", title: "حاسبة معدل إطارات GTA 6", desc: "قدّر معدل الإطارات لوحدة معالجة الرسومات لديك بدقة 1080p و1440p و4K عبر إعدادات منخفضة ومتوسطة وعالية وفائقة." },
    { slug: "gpu-tier-list", title: "قائمة مستويات وحدة معالجة الرسومات في GTA 6", desc: "أفضل بطاقات الرسومات للعبة GTA 6، مرتبة حسب المستوى." },
    { slug: "interactive-map", title: "الخريطة التفاعلية للعبة GTA 6", desc: "مستكشف ليونيدا ومقارنة أحجام لخريطة GTA 6." },
    { slug: "pre-order-tracker", title: "أين تشتري GTA 6: مقارنة الإصدارات والقنوات", desc: "أين تشتري GTA 6، مقارنة حسب القناة." },
    { slug: "edition-comparison", title: "منتقي إصدارات GTA 6", desc: "مقارنة بين كل إصدارات GTA 6: المكافآت والسعر وما يفتحه كل إصدار." },
    { slug: "internet-speed-check", title: "مستشار سرعة الإنترنت في GTA 6", desc: "تحقق مما إذا كان اتصالك سريعا بما يكفي لتنزيلات GTA 6 واللعب عبر الإنترنت." },
    { slug: "price-by-country", title: "سعر GTA 6 حسب البلد", desc: "سعر GTA 6 حسب البلد بالعملة المحلية." },
    { slug: "economy-calculator", title: "حاسبة المال وعائد الأعمال للعبة GTA 6", desc: "اعرف أسرع طريقة لكسب GTA$ وأي الأعمال تسترد تكلفتها أولا." },
    { slug: "gta-6-tracker", title: "معالم إطلاق GTA 6", desc: "معالم الإطلاق ونوافذ التحميل المسبق المكتملة للعبة GTA 6." },
    { slug: "settings-optimizer", title: "محسّن إعدادات الرسومات", desc: "اضبط إعدادات الرسومات لمعدل الإطارات المستهدف وجهازك." },
    { slug: "hardware-comparison", title: "مقارنة الأجهزة", desc: "قارن وحدتي معالجة رسومات أو وحدتي معالجة مركزية وجهًا لوجه لـ GTA 6." },
    { slug: "server-status", title: "حالة خوادم GTA 6", desc: "هل خوادم GTA 6 معطلة؟ تحقق مباشر من الحالة." },
    { slug: "preload-tracker", title: "سجل التحميل المسبق للعبة GTA 6 وجدول التحديثات", desc: "سجل التحميل المسبق للعبة GTA 6 وجدول التحديثات: التحميل المسبق للإطلاق (10–19 نوفمبر 2026)، وتحديثات 1.002.000 و 1.002.001 وأول تصحيح بعد الإطلاق 01.002.002 (23 نوفمبر، مع ملاحظات رسمية). لم يُعلن عن أي DLC. آخر تحقق 23 نوفمبر 2026." },
    { slug: "vehicle-comparison", title: "مقارنة مركبات GTA 6", desc: "قارن بين أي مركبتين من GTA 6." },
    { slug: "weapon-comparison", title: "مقارنة إحصاءات أسلحة GTA 6", desc: "مقارنة مباشرة لإحصاءات أسلحة GTA 6: الضرر ومعدل إطلاق النار والمدى والدقة." },
    { slug: "generators", title: "مولد أسماء GTA 6", desc: "أسماء الشخصيات، ووسوم الطواقم، ولوحات الترخيص، وإشارات النداء اللاسلكية، وأسماء اللاعبين — تُنشأ فورًا.", url: "/ar/generators", tags: "name generator مولد الأسماء gta 6" },
    { slug: "business-tracker", title: "متتبع أعمال GTA 6", desc: "حاسبة ومتتبع أعمال GTA 6: لا يمكن شراء أي عمل بعد، لذا تتبع أعمال Leonida الـ12، وحاكِ الاسترداد بأرقامك الخاصة، وقارن طرق كسب المال في القصة." },
  ];

  // Normalize for matching: fold Turkish dotted/dotless I before lowercasing.
  // Plain toLowerCase() turns "İ" into "i" + U+0307 combining dot, so "İsim"
  // never matches "isim"; folding first fixes every İ-word query in all locales.
  function norm(s) { return s.replace(/[İI]/g, "i").replace(/ı/g, "i").toLowerCase(); }

  function setup(input) {
    if (!input) return;
    var box = input.closest(".header-search, .mobile-nav-search");
    if (!box) return;
    var list = box.querySelector("[data-search-results]");
    if (!list) return;
    var active = -1;

    function close() { list.hidden = true; list.innerHTML = ""; active = -1; input.removeAttribute("aria-expanded"); }
    function render(q) {
      var query = norm(q.trim());
      list.innerHTML = "";
      if (query.length < 2) { close(); return; }
      var hits = TOOLS.filter(function (t) {
        return norm(t.title + " " + t.desc + " " + (t.tags || "")).indexOf(query) !== -1;
      }).slice(0, 6);
      if (!hits.length) {
        var empty = document.createElement("div");
        empty.className = "search-results-empty";
        empty.textContent = 'لا توجد أدوات تطابق "' + q.trim() + '" بعد. جرّب "FPS" أو "VRAM" أو "bottleneck".';
        list.appendChild(empty);
      } else {
        hits.forEach(function (t) {
          var a = document.createElement("a");
          a.href = t.url || "/ar/tools/" + t.slug;
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
