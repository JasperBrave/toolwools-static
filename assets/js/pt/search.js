// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /tools/<slug> (live tools), t.url when set
// (e.g. /generators, which lives outside /tools), or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "Verificador de requisitos do sistema do GTA 6", desc: "Veredito instantâneo em relação aos níveis Mínimo, Recomendado e Ultra estimados pela comunidade. GPU, CPU, RAM e armazenamento." },
    { slug: "download-time", title: "Calculadora de tempo de download do GTA 6", desc: "Estime quanto tempo a instalação base de ~212 GB vai levar na sua conexão, mais o cálculo do patch do primeiro dia." },
    { slug: "storage-planner", title: "Planejador de armazenamento do GTA 6", desc: "Orce cada gigabyte: instalação base, patch do primeiro dia, DLC sazonal e margem segura para atualizações." },
    { slug: "add-to-calendar", title: "Lembrete de Data de Lançamento do GTA 6", desc: "Adicione o lançamento de GTA 6 ao seu calendário no seu fuso horário." },
    { slug: "readiness-score", title: "Pontuação de prontidão do GTA 6", desc: "Uma pontuação para todo o seu PC: desempenho, VRAM, armazenamento e rede." },
    { slug: "bottleneck-calculator", title: "Calculadora de gargalos do GTA 6", desc: "Verifique o equilíbrio CPU vs GPU para GTA 6 em 1080p, 1440p e 4K. Porcentagem de gargalo ao vivo, faixa de FPS e o menor upgrade que reequilibra sua máquina." },
    { slug: "vram-calculator", title: "Verificador de requisitos de VRAM do GTA 6", desc: "Verifique a VRAM mínima que você precisa para GTA 6 em 1080p, 1440p e 4K. Veredicto para placas de 6 GB, 8 GB, 12 GB e 16 GB." },
    { slug: "fps-calculator", title: "Calculadora de FPS do GTA 6", desc: "Estime a taxa de quadros para sua GPU em 1080p, 1440p e 4K em Baixo, Médio, Alto e Ultra." },
    { slug: "gpu-tier-list", title: "Lista de níveis de GPU do GTA 6", desc: "As melhores placas de vídeo para GTA 6, classificadas por nível." },
    { slug: "interactive-map", title: "Mapa Interativo do GTA 6", desc: "Explorador de Leonida e comparação de tamanho para o mapa do GTA 6." },
    { slug: "pre-order-tracker", title: "Onde comprar GTA 6: Edições & Channels Compared", desc: "Onde comprar GTA 6, comparado por canal." },
    { slug: "edition-comparison", title: "Seletor de Edições do GTA 6", desc: "Todas as edições do GTA 6 comparadas: bônus, preço e o que cada uma desbloqueia." },
    { slug: "internet-speed-check", title: "Consultor de Velocidade de Internet do GTA 6", desc: "Verifique se sua conexão é rápida o suficiente para downloads do GTA 6 e Online." },
    { slug: "price-by-country", title: "Preço do GTA 6 por País", desc: "GTA 6 price by country in local currency." },
    { slug: "economy-calculator", title: "GTA 6 Money and ROI de negócio Calculadora", desc: "Descubra a forma mais rápida de ganhar GTA$ e quais negócios se pagam primeiro." },
    { slug: "gta-6-tracker", title: "Marcos do lançamento do GTA 6", desc: "Marcos de lançamento e janelas de pré-carregamento concluídas para GTA 6." },
    { slug: "settings-optimizer", title: "Graphics Otimizador de configurações", desc: "Ajuste as configurações gráficas para seu FPS alvo e seu setup." },
    { slug: "hardware-comparison", title: "Comparação de hardware", desc: "Compare duas GPUs ou CPUs frente a frente para o GTA 6." },
    { slug: "server-status", title: "Status do Servidor do GTA 6", desc: "Os servidores do GTA 6 estão fora do ar? Verificação de status ao vivo." },
    { slug: "preload-tracker", title: "Janelas de Pré-carregamento do GTA 6", desc: "O pré-carregamento do lançamento acabou. Esta ferramenta ainda está em desenvolvimento." },
    { slug: "vehicle-comparison", title: "Comparação de Veículos do GTA 6", desc: "Compare any two GTA 6 vehicles head to head." },
    { slug: "weapon-comparison", title: "Comparação de Estatísticas de Armas do GTA 6", desc: "Head-to-head GTA 6 weapon stats: damage, fire rate, range, accuracy." },
    { slug: "generators", title: "Gerador de nomes do GTA 6", desc: "Nomes de personagem, tags de equipe, placas, indicativos de rádio e gamertags — gerados instantaneamente.", url: "/pt/generators", tags: "name generator gerador de nomes gta 6" }
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
          a.href = t.url || "/tools/" + t.slug;
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
