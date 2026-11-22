// search.js — header search over a static tool index.
// The source used a live autocomplete over the full content index; this
// static build ships the tool catalogue (titles + descriptions from
// src/lib/tools/registry.ts) and filters it in the browser. Arrow keys move,
// Enter opens, Escape closes. Links to /tools/<slug> (live tools), t.url when set
// (e.g. /generators, which lives outside /tools), or /tools
// for coming-soon entries, matching the source behaviour.
(function () {
  var TOOLS = [
    { slug: "system-requirements", title: "Vérificateur de configuration requise pour GTA 6", desc: "Verdict instantané par rapport aux niveaux Minimum, Recommandé et Ultra estimés par la communauté. GPU, CPU, RAM et stockage." },
    { slug: "download-time", title: "Calculateur de temps de téléchargement GTA 6", desc: "Estimez combien de temps prendra l'installation de base d'environ 212 Go sur votre connexion, avec le calcul du patch du premier jour." },
    { slug: "storage-planner", title: "Planificateur de stockage GTA 6", desc: "Prévoyez chaque gigaoctet : installation de base, patch du premier jour, DLC saisonniers et marge de sécurité pour les mises à jour." },
    { slug: "add-to-calendar", title: "Rappel de la date de sortie de GTA 6", desc: "Ajoutez des rappels de correctifs et de DLC pour GTA 6 à votre calendrier dans votre fuseau horaire." },
    { slug: "readiness-score", title: "Score de préparation GTA 6", desc: "Un score pour tout votre PC : performances, VRAM, stockage et réseau." },
    { slug: "bottleneck-calculator", title: "Calculateur de goulot d'étranglement GTA 6", desc: "Vérifiez l'équilibre CPU-GPU pour GTA 6 en 1080p, 1440p et 4K. Pourcentage de goulot en direct, plage de FPS et la plus petite mise à niveau qui rééquilibre votre PC." },
    { slug: "vram-calculator", title: "Vérificateur de VRAM requise pour GTA 6", desc: "Vérifiez le minimum de VRAM nécessaire pour GTA 6 en 1080p, 1440p et 4K. Verdict pour les cartes 6 Go, 8 Go, 12 Go et 16 Go." },
    { slug: "fps-calculator", title: "Calculateur de FPS GTA 6", desc: "Estimez la fréquence d'images de votre GPU en 1080p, 1440p et 4K pour les réglages Faible, Moyen, Élevé et Ultra." },
    { slug: "gpu-tier-list", title: "Classement des GPU GTA 6", desc: "Meilleures cartes graphiques pour GTA 6, classées par niveau." },
    { slug: "interactive-map", title: "Carte interactive GTA 6", desc: "Explorateur de Leonida et comparaison de taille pour la carte de GTA 6." },
    { slug: "pre-order-tracker", title: "Où acheter GTA 6 : éditions et canaux comparés", desc: "Où acheter GTA 6, comparé par canal." },
    { slug: "edition-comparison", title: "Sélecteur d'édition GTA 6", desc: "Chaque édition de GTA 6 comparée : bonus, prix et ce que chacune débloque." },
    { slug: "internet-speed-check", title: "Conseiller de vitesse Internet GTA 6", desc: "Vérifiez si votre connexion est assez rapide pour les téléchargements GTA 6 et Online." },
    { slug: "price-by-country", title: "Prix de GTA 6 par pays", desc: "Prix de GTA 6 par pays en devise locale." },
    { slug: "economy-calculator", title: "Calculateur de ROI argent et business GTA 6", desc: "Trouvez le moyen le plus rapide de gagner des GTA$ et quelles entreprises rapportent en premier." },
    { slug: "gta-6-tracker", title: "Jalons du lancement de GTA 6", desc: "Jalons de lancement et fenêtres de préchargement terminées pour GTA 6." },
    { slug: "settings-optimizer", title: "Optimiseur de réglages graphiques", desc: "Réglez les paramètres graphiques pour vos ips cibles et votre configuration." },
    { slug: "hardware-comparison", title: "Comparateur de matériel", desc: "Comparez deux GPU ou CPU en face à face pour GTA 6." },
    { slug: "server-status", title: "Statut du serveur GTA 6", desc: "Les serveurs GTA 6 sont-ils en panne ? Vérification de statut en direct." },
    { slug: "preload-tracker", title: "Fenêtres de préchargement de GTA 6", desc: "Le préchargement du lancement est terminé. Cet outil est toujours en développement." },
    { slug: "vehicle-comparison", title: "Comparaison de véhicules GTA 6", desc: "Comparez deux véhicules GTA 6 en face à face." },
    { slug: "weapon-comparison", title: "Comparaison de statistiques d'armes GTA 6", desc: "Statistiques d'armes GTA 6 en face à face : dégâts, cadence de tir, portée, précision." },
    { slug: "generators", title: "Générateur de noms GTA 6", desc: "Noms de personnage, tags d'équipe, plaques d'immatriculation, indicatifs radio et gamertags — générés instantanément.", url: "/fr/generators", tags: "name generator générateur de noms gta 6" },
    { slug: "business-tracker", title: "Suivi des entreprises GTA 6", desc: "Calculateur et suivi business GTA 6 : aucune entreprise ne peut encore être achetée — suivez les 12 entreprises de Leonida, simulez le retour sur investissement avec vos propres chiffres et comparez les méthodes d'argent du mode histoire." },
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
        empty.textContent = 'Aucun outil ne correspond à "' + q.trim() + '". Essayez "ips", "VRAM" ou "goulot d\'étranglement".';
        list.appendChild(empty);
      } else {
        hits.forEach(function (t) {
          var a = document.createElement("a");
          a.href = t.url || "/fr/tools/" + t.slug;
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
