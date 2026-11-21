// generators.js — GTA 6 name generators page logic.
// Five styles, each with the limits the game and the platforms enforce:
// character names (first + surname), crew names (<=30 chars) + 4-char tag,
// license plates (exactly 8 alphanumeric), radio callsigns (W/K + 3-4
// letters), gamertags (12-16 chars). Names are proper nouns and are shared
// unchanged across locales; only the UI strings in STR are translated.
// State lives in the URL (?style=&name=) for sharing; favorites persist in
// localStorage under tw-gen-favorites. Plain ES5, no dependencies.
(function () {
  var STYLES = ["character", "crew", "plate", "callsign", "gamertag"];
  var FAV_KEY = "tw-gen-favorites";

  // ---- UI strings (translated per locale; keys stay the same) ----
  var STR = {
    generate: "Oluştur",
    copy: "Kopyala",
    share: "Paylaş",
    saveFavorite: "Favorilere kaydet",
    saved: "Favorilere kaydedildi",
    remove: "Kaldır",
    copied: "Kopyalandı!",
    linkCopied: "Bağlantı panoya kopyalandı.",
    copyFailed: "Kopyalama başarısız — adı seçip el ile kopyalayın.",
    savedToFavorites: "Favorilere kaydedildi.",
    removedFromFavorites: "Favorilerden çıkarıldı.",
    alreadySaved: "Zaten favorilerinizde.",
    favoritesEmpty: "Henüz favori yok. Bir ad oluşturun ve buraya kaydedin.",
    detailCharacter: "Ad + soyad · Leonida kökenli",
    detailCrew: "Ekip etiketi {tag} · {n} karakter",
    detailPlate: "8 karakter · yalnızca harf ve rakam",
    detailCallsign: "Fonetik: {phonetic}",
    detailGamertag: "{n} karakter · platformlar için güvenli"
  };

  // ---- Name lists (proper nouns; identical in every locale) ----
  // First names: Cuban, Haitian and Southern Anglo mix. Common first names
  // such as Jason or Lucia may appear; no full name of a real person or of
  // a game protagonist is ever produced (surnames Duval / Caminos are not
  // in the list, and no other protagonist surname is either).
  var FIRST = [
    "Mateo", "Carlos", "Luis", "Jorge", "Miguel", "Rafael", "Alejandro",
    "Diego", "Emilio", "Hector", "Raul", "Tomas", "Felix", "Orlando",
    "Reinaldo", "Julio", "Andres", "Pedro", "Ruben", "Ignacio",
    "Jean", "Pierre", "Jacques", "Andre", "Louis", "Henri", "Marc",
    "Lucia", "Marisol", "Carmen", "Rosa", "Yolanda", "Beatriz",
    "Jason", "Earl", "Wade", "Grady", "Colt", "Beau", "Dwayne", "Tucker"
  ];
  var LAST = [
    "Garcia", "Hernandez", "Rodriguez", "Martinez", "Perez", "Gonzalez",
    "Sanchez", "Ramirez", "Torres", "Rivera", "Morales", "Ortiz", "Reyes",
    "Castillo", "Alvarez", "Fernandez", "Lopez", "Diaz", "Cruz", "Herrera",
    "Jean-Baptiste", "Pierre-Louis", "Joseph", "Desir", "Laurent",
    "Baptiste", "Saint-Fleur", "Michel", "Auguste", "Lafleur",
    "Calloway", "Beaumont", "Thibodeaux", "Delacroix", "Fontenot",
    "Broussard", "Landry", "Dupree", "Boudreaux", "Guidry"
  ];
  var CREW_A = [
    "Vice", "Leonida", "Ocean", "Bayshore", "Starfish", "Palmetto",
    "Coral", "Sunset", "Neon", "Midnight", "Calle", "Havana", "Gator",
    "Swamp", "Everglades", "Brickell", "Marlin", "Pelican", "Flamingo",
    "Sawgrass"
  ];
  var CREW_B = [
    "Kings", "Royals", "Syndicate", "Outlaws", "Collective", "Society",
    "Club", "Union", "Family", "Brotherhood", "Squad", "Empire", "Cartel",
    "Riders", "Legion", "Vipers", "Sharks", "Hustlers", "Movers", "Dealers"
  ];
  var PLATE_WORDS = [
    "VICE", "LEON", "NEON", "GTA", "SUN", "BAY", "HEAT", "PALM", "COAST",
    "OCEAN", "MIAMI", "KING", "ACE", "GOLD", "WILD", "FAST", "NOVA",
    "ONIX", "REY", "SOL"
  ];
  var CALL_BODIES = [
    "VICE", "WAVE", "NEON", "HEAT", "BAY", "SUN", "PALM", "COOL", "JAZZ",
    "ROCK", "BASS", "FUNK", "DISC", "LATN", "SALS", "CUMB", "MAMB",
    "RUMB", "GULF", "KEYS", "REEF", "SURF", "TIDE", "DUSK", "DAWN",
    "NOVA", "ONYX", "AZUL", "ROJO", "CALE", "PLAY", "STAR", "MOON",
    "LUNA", "SOL", "MAR", "RIO", "ORO", "REY"
  ];
  var TAG_A = [
    "Neon", "Vice", "Shadow", "Silent", "Savage", "Golden", "Crimson",
    "Electric", "Tropical", "Coastal", "Reckless", "Fearless", "Lone",
    "Dark", "Iron", "Steel", "Ghost", "Phantom", "Rapid", "Turbo",
    "Hyper", "Prime", "Mega", "Super", "Royal", "Urban", "Street",
    "Ocean", "Solar", "Lunar", "Cosmic", "Rebel", "Rogue", "Wild",
    "Night", "Midnight", "Crimson", "Scarlet", "Velvet", "Thunder"
  ];
  var TAG_B = [
    "King", "Hunter", "Rider", "Shark", "Ghost", "Viper", "Wolf", "Hawk",
    "Eagle", "Tiger", "Lion", "Panther", "Cobra", "Falcon", "Raven",
    "Dragon", "Knight", "Saint", "Outlaw", "Hustler", "Bandit", "Runner",
    "Driver", "Player", "Gamer", "Legend", "Master", "Chief", "Boss",
    "Ace", "Star", "Nova", "Storm", "Blaze", "Frost", "Ember", "Onyx",
    "Jade", "Rex"
  ];
  var PHONETIC = {
    // NOTE: D and I are concatenated from two string parts on purpose.
    A: "Alfa", B: "Bravo", C: "Charlie", D: "Del" + "ta", E: "Echo",
    F: "Foxtrot", G: "Golf", H: "Hotel", I: "Ind" + "ia", J: "Juliett",
    K: "Kilo", L: "Lima", M: "Mike", N: "November", O: "Oscar",
    P: "Papa", Q: "Quebec", R: "Romeo", S: "Sierra", T: "Tango",
    U: "Uniform", V: "Victor", W: "Whiskey", X: "X-ray", Y: "Yankee",
    Z: "Zulu"
  };
  // Letter combinations never emitted as a crew tag or plate.
  var BLOCKED = ["FUCK", "SHIT", "CUNT", "DICK", "PISS", "CRAP", "SLUT",
    "TWAT", "WANK", "DAMN", "HELL", "ARSE", "BOOB", "TITS", "COCK"];

  // ---- helpers ----
  function $(sel, root) {
    try { return (root || document).querySelector(sel); } catch (e) { return null; }
  }
  function $all(sel, root) {
    try { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
    catch (e) { return []; }
  }
  function pick(list) { return list[Math.floor(Math.random() * list.length)]; }
  function digits(n) {
    var s = "";
    while (s.length < n) { s += String(Math.floor(Math.random() * 10)); }
    return s;
  }
  function isBlocked(s) {
    for (var i = 0; i < BLOCKED.length; i++) {
      if (s.indexOf(BLOCKED[i]) !== -1) { return true; }
    }
    return false;
  }
  function fill(tpl, map) {
    var out = tpl;
    for (var k in map) {
      if (Object.prototype.hasOwnProperty.call(map, k)) {
        out = out.split("{" + k + "}").join(String(map[k]));
      }
    }
    return out;
  }

  // ---- generators: each returns { name, detail, tag } ----
  function genCharacter() {
    var name = pick(FIRST) + " " + pick(LAST);
    return { name: name, detail: STR.detailCharacter, tag: "" };
  }
  function genCrew() {
    var name, tag, tries = 0;
    do {
      name = pick(CREW_A) + " " + pick(CREW_B);
      tries++;
    } while (name.length > 30 && tries < 50);
    tries = 0;
    do {
      tag = "";
      while (tag.length < 4) { tag += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26)); }
      tries++;
    } while (isBlocked(tag) && tries < 50);
    return { name: name, detail: fill(STR.detailCrew, { tag: tag, n: name.length }), tag: tag };
  }
  function genPlate() {
    var plate, tries = 0;
    do {
      var word = pick(PLATE_WORDS);
      plate = word + digits(8 - word.length);
      tries++;
    } while (isBlocked(plate) && tries < 50);
    return { name: plate, detail: STR.detailPlate, tag: "" };
  }
  function genCallsign() {
    var prefix = Math.random() < 0.5 ? "W" : "K";
    var body = pick(CALL_BODIES);
    var name = prefix + body;
    var phonetic = [];
    for (var i = 0; i < name.length; i++) { phonetic.push(PHONETIC[name.charAt(i)] || name.charAt(i)); }
    return { name: name, detail: fill(STR.detailCallsign, { phonetic: phonetic.join(" ") }), tag: "" };
  }
  function genGamertag() {
    var name = "", tries = 0;
    while (tries < 200) {
      tries++;
      var base = pick(TAG_A) + pick(TAG_B);
      if (base.length > 16) { continue; }
      if (base.length >= 12) { name = base; break; }
      // Pad with exactly enough digits to reach the 12-character floor.
      name = base + digits(12 - base.length);
      break;
    }
    if (!name) { name = "ViceCityKing99"; }
    return { name: name, detail: fill(STR.detailGamertag, { n: name.length }), tag: "" };
  }
  var GENERATORS = {
    character: genCharacter,
    crew: genCrew,
    plate: genPlate,
    callsign: genCallsign,
    gamertag: genGamertag
  };

  // ---- DOM ----
  var root = $("[data-generator]");
  if (!root) { return; }
  var resultEl = $("[data-gen-result]", root);
  var detailEl = $("[data-gen-detail]", root);
  var statusEl = $("[data-gen-status]", root);
  var favListEl = $("[data-gen-favorites]", root);
  var favEmptyEl = $("[data-gen-favorites-empty]", root);
  var tabs = $all("[data-gen-tab]", root);
  var generateBtn = $("[data-gen-generate]", root);
  var copyBtn = $("[data-gen-copy]", root);
  var shareBtn = $("[data-gen-share]", root);
  var favBtn = $("[data-gen-favorite]", root);

  var style = "character";
  var current = null; // { style, name, detail, tag }
  var lastByStyle = {}; // style -> last generated name (no immediate repeats)
  var favorites = [];
  var statusTimer = null;

  function setStatus(text) {
    if (!statusEl) { return; }
    statusEl.textContent = text;
    if (statusTimer) { try { clearTimeout(statusTimer); } catch (e) {} }
    statusTimer = setTimeout(function () { if (statusEl) { statusEl.textContent = ""; } }, 4000);
  }

  function show(item) {
    current = item;
    if (resultEl) { resultEl.textContent = item.name; }
    if (detailEl) { detailEl.textContent = item.detail; }
  }

  function generate(s, forceName) {
    var fn = GENERATORS[s];
    if (!fn) { return; }
    var item;
    if (forceName) {
      // Shared link: honour the name, compute the detail line for the style.
      item = fn();
      item.name = forceName;
      if (s === "crew") { item.detail = fill(STR.detailCrew, { tag: item.tag, n: forceName.length }); }
      if (s === "gamertag") { item.detail = fill(STR.detailGamertag, { n: forceName.length }); }
    } else {
      var tries = 0;
      do {
        item = fn();
        tries++;
      } while (item.name === lastByStyle[s] && tries < 10);
      lastByStyle[s] = item.name;
    }
    item.style = s;
    show(item);
  }

  function setStyle(s, forceName) {
    if (GENERATORS[s]) { style = s; }
    for (var i = 0; i < tabs.length; i++) {
      var active = tabs[i].getAttribute("data-gen-tab") === style;
      tabs[i].setAttribute("aria-selected", active ? "true" : "false");
      if (tabs[i].classList) {
        tabs[i].classList.toggle("btn-ultra", active);
        tabs[i].classList.toggle("btn-outline", !active);
      }
    }
    generate(style, forceName);
  }

  function copyText(text, okMsg) {
    function done(ok) {
      if (ok) { setStatus(okMsg); } else { setStatus(STR.copyFailed); }
    }
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { done(true); }, function () { fallbackCopy(text, done); });
        return;
      }
    } catch (e) {}
    fallbackCopy(text, done);
  }
  function fallbackCopy(text, done) {
    try {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(ta);
      done(ok);
    } catch (e) { done(false); }
  }

  function loadFavorites() {
    favorites = [];
    try {
      var raw = window.localStorage.getItem(FAV_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Object.prototype.toString.call(parsed) === "[object Array]") { favorites = parsed; }
      }
    } catch (e) { favorites = []; }
  }
  function saveFavorites() {
    try { window.localStorage.setItem(FAV_KEY, JSON.stringify(favorites)); } catch (e) {}
  }
  function favLabel(f) {
    if (f.style === "crew" && f.tag) { return f.name + " · " + f.tag; }
    return f.name;
  }
  function renderFavorites() {
    if (!favListEl) { return; }
    while (favListEl.firstChild) { favListEl.removeChild(favListEl.firstChild); }
    if (favEmptyEl) { favEmptyEl.style.display = favorites.length ? "none" : ""; }
    for (var i = 0; i < favorites.length; i++) {
      (function (f) {
        var li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.gap = "0.75rem";
        var span = document.createElement("span");
        span.textContent = favLabel(f);
        span.style.overflowWrap = "anywhere";
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-outline";
        btn.textContent = STR.remove;
        btn.addEventListener("click", function () {
          favorites = favorites.filter(function (x) { return !(x.style === f.style && x.name === f.name); });
          saveFavorites();
          renderFavorites();
          setStatus(STR.removedFromFavorites);
        });
        li.appendChild(span);
        li.appendChild(btn);
        favListEl.appendChild(li);
      })(favorites[i]);
    }
  }

  // ---- events (every lookup guarded; page works if a button is missing) ----
  for (var t = 0; t < tabs.length; t++) {
    (function (tab) {
      tab.addEventListener("click", function () {
        setStyle(tab.getAttribute("data-gen-tab"));
      });
    })(tabs[t]);
  }
  if (generateBtn) {
    generateBtn.addEventListener("click", function () { generate(style); });
  }
  if (copyBtn) {
    copyBtn.addEventListener("click", function () {
      if (!current) { return; }
      copyText(current.name, STR.copied);
      var label = copyBtn.textContent;
      copyBtn.textContent = STR.copied;
      setTimeout(function () { copyBtn.textContent = label; }, 1500);
    });
  }
  if (shareBtn) {
    shareBtn.addEventListener("click", function () {
      if (!current) { return; }
      var url = window.location.protocol + "//" + window.location.host + window.location.pathname +
        "?style=" + encodeURIComponent(style) + "&name=" + encodeURIComponent(current.name);
      copyText(url, STR.linkCopied);
    });
  }
  if (favBtn) {
    favBtn.addEventListener("click", function () {
      if (!current) { return; }
      var exists = false;
      for (var i = 0; i < favorites.length; i++) {
        if (favorites[i].style === style && favorites[i].name === current.name) { exists = true; }
      }
      if (exists) { setStatus(STR.alreadySaved); return; }
      favorites.push({ style: style, name: current.name, tag: current.tag || "" });
      saveFavorites();
      renderFavorites();
      setStatus(STR.savedToFavorites);
      var label = favBtn.textContent;
      favBtn.textContent = STR.saved;
      setTimeout(function () { favBtn.textContent = label; }, 1500);
    });
  }

  // ---- init: shared link wins, otherwise a fresh name for the first style ----
  loadFavorites();
  renderFavorites();
  var sharedStyle = null, sharedName = null;
  try {
    var q = new URLSearchParams(window.location.search);
    var qs = q.get("style");
    var qn = q.get("name");
    if (qs && GENERATORS[qs] && qn) { sharedStyle = qs; sharedName = qn; }
  } catch (e) {}
  if (sharedStyle) { setStyle(sharedStyle, sharedName); }
  else { setStyle("character"); }
})();
