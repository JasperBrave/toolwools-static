// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /es/tools/<slug> (live tools), t.url when set
// (e.g. /es/generators, which lives outside /tools), or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "Comprobador de requisitos del sistema de GTA 6", desc: "Veredicto instantáneo frente a los niveles Mínimo, Recomendado y Ultra estimados por la comunidad. GPU, CPU, RAM y almacenamiento." },
    { slug: "download-time", title: "Calculadora de tiempo de descarga de GTA 6", desc: "Estima cuánto tardará la instalación base de ~212 GB en tu conexión, más el cálculo del parche del primer día." },
    { slug: "storage-planner", title: "Planificador de almacenamiento de GTA 6", desc: "Presupuesta cada gigabyte: instalación base, parche del primer día, DLC de temporada y margen seguro para actualizaciones." },
    { slug: "add-to-calendar", title: "Recordatorio de fecha de lanzamiento de GTA 6", desc: "Añade el lanzamiento de GTA 6 a tu calendario en tu zona horaria." },
    { slug: "readiness-score", title: "Puntuación de preparación de GTA 6", desc: "Una puntuación para todo tu equipo: rendimiento, VRAM, almacenamiento y red." },
    { slug: "bottleneck-calculator", title: "Calculadora de cuellos de botella de GTA 6", desc: "Comprueba el equilibrio CPU vs GPU para GTA 6 a 1080p, 1440p y 4K. Porcentaje de cuello de botella en vivo, banda de FPS y la mejora más pequeña que reequilibra tu equipo." },
    { slug: "vram-calculator", title: "Comprobador de requisitos de VRAM de GTA 6", desc: "Comprueba la VRAM mínima que necesitas para GTA 6 a 1080p, 1440p y 4K. Veredicto para tarjetas de 6 GB, 8 GB, 12 GB y 16 GB." },
    { slug: "fps-calculator", title: "Calculadora de FPS de GTA 6", desc: "Estima la tasa de fotogramas para tu GPU a 1080p, 1440p y 4K en Bajo, Medio, Alto y Ultra." },
    { slug: "gpu-tier-list", title: "Lista de niveles de GPU de GTA 6", desc: "Las mejores tarjetas gráficas para GTA 6, ordenadas por nivel." },
    { slug: "interactive-map", title: "Mapa interactivo de GTA 6", desc: "Explorador de Leonida y comparación de tamaño para el mapa de GTA 6." },
    { slug: "pre-order-tracker", title: "Dónde comprar GTA 6: ediciones y canales comparados", desc: "Dónde comprar GTA 6, comparado por canal." },
    { slug: "edition-comparison", title: "Selector de ediciones de GTA 6", desc: "Todas las ediciones de GTA 6 comparadas: bonificaciones, precio y lo que desbloquea cada una." },
    { slug: "internet-speed-check", title: "Asesor de velocidad de internet de GTA 6", desc: "Comprueba si tu conexión es lo bastante rápida para las descargas de GTA 6 y Online." },
    { slug: "price-by-country", title: "Precio de GTA 6 por país", desc: "Precio de GTA 6 por país en moneda local." },
    { slug: "economy-calculator", title: "Calculadora de dinero y ROI de negocios de GTA 6", desc: "Descubre la forma más rápida de ganar GTA$ y qué negocios se amortizan antes." },
    { slug: "gta-6-tracker", title: "Hitos del lanzamiento de GTA 6", desc: "Hitos de lanzamiento y ventanas de precarga completadas para GTA 6." },
    { slug: "settings-optimizer", title: "Optimizador de ajustes", desc: "Ajusta la configuración de gráficos para tu FPS objetivo y tu equipo." },
    { slug: "hardware-comparison", title: "Comparación de hardware", desc: "Compara dos GPUs o CPUs cara a cara para GTA 6." },
    { slug: "server-status", title: "Estado del servidor de GTA 6 — ¿Los servidores están caídos?", desc: "GTA 6 no tiene servidores que puedan caerse — se lanzó el 19 nov 2026 como un juego para un jugador sin modo online. Comprueba los tres servicios de los que depende: Rockstar Authentication, PlayStation Network y Xbox network, revisados a mano el 24 nov 2026, con las páginas oficiales enlazadas." },
    { slug: "preload-tracker", title: "Historial de precarga y calendario de actualizaciones de GTA 6", desc: "Historial de precarga y calendario de actualizaciones de GTA 6: la precarga del lanzamiento (10–19 nov 2026), actualizaciones de título 1.002.000, 1.002.001 y el primer parche posterior al lanzamiento 01.002.002 (23 nov, con notas oficiales). Sin DLC anunciado. Última revisión 23 nov 2026." },
    { slug: "vehicle-comparison", title: "Comparación de vehículos de GTA 6 — Valoraciones, coste de registro y valor de venta", desc: "Compara vehículos de GTA 6 cara a cara en las cinco valoraciones del juego sobre 10 — Velocidad, Aceleración, Manejo en asfalto, Manejo todoterreno, Fuerza — además del coste de registro y el valor de venta. Aún no existe ninguna velocidad máxima medida; esta herramienta muestra los números que muestra el juego. Última revisión: 24 nov 2026." },
    { slug: "weapon-comparison", title: "Comparación de armas de GTA 6 — Valoraciones, cargador y precio", desc: "Compara las 53 armas base de GTA 6 en Daño, Precisión, Manejo y Alcance — las cuatro valoraciones del juego sobre 10 — además del tamaño del cargador, el modo de disparo y el precio. En el juego no existe ninguna estadística de cadencia de fuego; esta herramienta muestra los números que muestra el juego. Última revisión: 24 nov 2026." },
    { slug: "generators", title: "Generador de nombres de GTA 6", desc: "Nombres de personaje, etiquetas de equipo, matrículas, indicativos de radio y gamertags — generados al instante.", url: "/es/generators", tags: "name generator generador de nombres gta 6" },
    { slug: "business-tracker", title: "Seguimiento de negocios de GTA 6", desc: "Calculadora y seguimiento de negocios de GTA 6: aún no se puede comprar ningún negocio; sigue los 12 negocios de Leonida, simula el retorno con tus propios números y compara los métodos de dinero del modo historia."},
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
        empty.textContent = 'No tools match "' + q.trim() + '". Try "FPS", "VRAM" or "bottleneck".';
        list.appendChild(empty);
      } else {
        hits.forEach(function (t) {
          var a = document.createElement("a");
          a.href = t.url || "/es/tools/" + t.slug;
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
