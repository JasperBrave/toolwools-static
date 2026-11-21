// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/tr/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /tr/tools/<slug> (live tools) or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "GTA 6 Sistem Gereksinimleri Denetleyicisi", desc: "Topluluk tahminli Minimum, Önerilen ve Ultra katmanlarına karşı anında karar. GPU, CPU, RAM ve depolama." },
    { slug: "download-time", title: "GTA 6 İndirme Süresi Hesaplayıcı", desc: "Bağlantınızda yaklaşık 212 GB'lık temel kurulumun ne kadar süreceğini tahmin edin, ayrıca ilk gün yaması hesabı." },
    { slug: "storage-planner", title: "GTA 6 Depolama Planlayıcı", desc: "Her gigabaytı bütçeleyin: temel kurulum, ilk gün yaması, mevsimsel DLC ve güncellemeler için güvenli pay." },
    { slug: "add-to-calendar", title: "GTA 6 Çıkış Tarihi Hatırlatıcısı", desc: "GTA 6 çıkışını kendi saat diliminizde takviminize ekleyin." },
    { slug: "readiness-score", title: "GTA 6 Hazırlık Puanı", desc: "Tüm sisteminiz için tek puan: performans, VRAM, depolama ve ağ." },
    { slug: "bottleneck-calculator", title: "GTA 6 Darboğaz Hesaplayıcı", desc: "1080p, 1440p ve 4K'da GTA 6 için CPU ve GPU dengesini kontrol edin. Canlı darboğaz yüzdesi, FPS aralığı ve sisteminizi yeniden dengeleyen en küçük yükseltme." },
    { slug: "vram-calculator", title: "GTA 6 VRAM Gereksinimleri Denetleyicisi", desc: "1080p, 1440p ve 4K'da GTA 6 için ihtiyacınız olan minimum VRAM'i kontrol edin. 6 GB, 8 GB, 12 GB ve 16 GB kartlar için karar." },
    { slug: "fps-calculator", title: "GTA 6 FPS Hesaplayıcı", desc: "GPU'nuz için 1080p, 1440p ve 4K'da Düşük, Orta, Yüksek ve Ultra ayarlarında kare hızını tahmin edin." },
    { slug: "gpu-tier-list", title: "GTA 6 GPU Katman Listesi", desc: "GTA 6 için en iyi ekran kartları, katmana göre sıralandı." },
    { slug: "interactive-map", title: "GTA 6 İnteraktif Harita", desc: "GTA 6 haritası için Leonida gezgini ve boyut karşılaştırması." },
    { slug: "pre-order-tracker", title: "GTA 6 Nereden Alınır: Sürümler ve Kanallar Karşılaştırması", desc: "GTA 6'yı nereden alabilirsiniz, kanala göre karşılaştırıldı." },
    { slug: "edition-comparison", title: "GTA 6 Sürüm Seçici", desc: "Her GTA 6 sürümü karşılaştırıldı: bonuslar, fiyat ve her birinin açtıkları." },
    { slug: "internet-speed-check", title: "GTA 6 İnternet Hızı Danışmanı", desc: "Bağlantınızın GTA 6 indirmeleri ve Online için yeterince hızlı olup olmadığını kontrol edin." },
    { slug: "price-by-country", title: "GTA 6 Ülkelere Göre Fiyat", desc: "GTA 6 fiyatı ülkelere göre yerel para birimiyle." },
    { slug: "economy-calculator", title: "GTA 6 Para ve İşletme Getiri Hesaplayıcı", desc: "GTA$ kazanmanın en hızlı yolunu ve hangi işletmelerin önce kendini amorti ettiğini bulun." },
    { slug: "gta-6-tracker", title: "GTA 6 Lansman Kilometre Taşları", desc: "GTA 6 için lansman kilometre taşları ve tamamlanan ön yükleme pencereleri." },
    { slug: "settings-optimizer", title: "Grafik Ayarları Optimize Edici", desc: "Hedef FPS'iniz ve donanımınız için grafik ayarlarını ayarlayın." },
    { slug: "hardware-comparison", title: "Donanım Karşılaştırması", desc: "GTA 6 için iki GPU veya CPU'yu başa baş karşılaştırın." },
    { slug: "server-status", title: "GTA 6 Sunucu Durumu", desc: "GTA 6 sunucuları kapalı mı? Canlı durum kontrolü." },
    { slug: "preload-tracker", title: "GTA 6 Ön Yükleme Pencereleri", desc: "Lansman ön yüklemesi bitti. Bu araç hâlâ geliştirme aşamasında." },
    { slug: "vehicle-comparison", title: "GTA 6 Araç Karşılaştırması", desc: "Herhangi iki GTA 6 aracını karşı karşıya karşılaştırın." },
    { slug: "weapon-comparison", title: "GTA 6 Silah İstatistikleri Karşılaştırması", desc: "Karşı karşıya GTA 6 silah istatistikleri: hasar, atış hızı, menzil, isabet." }
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
        empty.textContent = 'Hiçbir araç "' + q.trim() + '" ile eşleşmiyor. "FPS", "VRAM" veya "bottleneck" deneyin.';
        list.appendChild(empty);
      } else {
        hits.forEach(function (t) {
          var a = document.createElement("a");
          a.href = "/tr/tools/" + t.slug;
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
