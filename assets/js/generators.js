// generators.js — GTA 6 name generators page logic.
// Five styles, each with the limits the game and the platforms enforce:
// character names (first + surname), crew names (<=30 chars) + 4-char tag,
// license plates (exactly 8 alphanumeric), radio callsigns (W/K + 3 letters
// = 4 total), gamertags (12-16 chars). Names are proper nouns and are shared
// unchanged across locales; only the UI strings in STR are translated.
// Character results are a full Leonida identity card: nickname, age, home,
// hustle and backstory. Batch (ten names per click) renders ten distinct names;
// per-part locks hold character parts across re-rolls; the last 6 generated
// results live in localStorage under tw-gen-history (separate from favorites).
// State lives in the URL for sharing: ?style=&name= for every style, plus
// &nickname=&age=&home=&hustle=&backstory= for a full character card.
// Old ?style=&name= links still work: a character link without card params
// gets a fresh card built around the shared name. Favorites persist in
// localStorage under tw-gen-favorites; character favorites store the full
// card, and old {style, name, tag} favorites still render.
// Plain ES5, no dependencies.
(function () {
  var STYLES = ["character", "crew", "plate", "callsign", "gamertag"];
  var FAV_KEY = "tw-gen-favorites";
  var HIST_KEY = "tw-gen-history";
  var HIST_MAX = 6;

  // ---- UI strings (translated per locale; keys stay the same) ----
  var STR = {
    generate: "Generate",
    copy: "Copy",
    share: "Share",
    saveFavorite: "Save to favorites",
    saved: "Saved to favorites",
    remove: "Remove",
    copied: "Copied!",
    linkCopied: "Link copied to clipboard.",
    copyFailed: "Copy failed — select the name and copy it manually.",
    savedToFavorites: "Saved to favorites.",
    removedFromFavorites: "Removed from favorites.",
    alreadySaved: "Already in your favorites.",
    favoritesEmpty: "No favorites yet. Generate a name and save it here.",
    historyEmpty: "No recent names yet. Generate a name and it will show up here.",
    restored: "Restored from history.",
    batchDone: "Generated 10 names.",
    detailCharacter: "First + surname · Leonida-grounded",
    detailCrew: "Crew tag {tag} · {n} characters",
    detailPlate: "8 characters · letters and numbers only",
    detailCallsign: "Phonetic: {phonetic}",
    detailGamertag: "{n} characters · platform-safe"
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
    "Isabella", "Valentina", "Camila", "Sofia", "Gabriela", "Daniela",
    "Alejandra", "Mariana", "Lorena", "Celeste", "Noelia", "Adeline",
    "Savannah", "Delilah", "Manon", "Claudine",
    "Jason", "Earl", "Wade", "Grady", "Colt", "Beau", "Dwayne", "Tucker"
  ];
  // Which FIRST names the him/her filter keeps. Masculine 35,
  // feminine 22. Names not listed here count as masculine.
  var FIRST_FEMALE = ["Lucia", "Marisol", "Carmen", "Rosa", "Yolanda", "Beatriz",
    "Isabella", "Valentina", "Camila", "Sofia", "Gabriela", "Daniela",
    "Alejandra", "Mariana", "Lorena", "Celeste", "Noelia", "Adeline",
    "Savannah", "Delilah", "Manon", "Claudine"];
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
    // 3 letters only: W/K + body is always exactly 4 letters, matching the
    // "3-4 letters" rule on the generators page (real broadcast callsigns
    // are 4 letters). 39 bodies x 2 prefixes = 78 distinct callsigns.
    "BAY", "SUN", "SOL", "MAR", "RIO", "ORO", "REY", "GTA", "VIC",
    "LEO", "MIA", "SKY", "SEA", "FOX", "JET", "ICE", "RED", "GEM",
    "TOP", "POP", "RAP", "RUM", "KEY", "ACE", "GOL", "KIN", "WAV",
    "NEO", "PAL", "JAZ", "ROC", "FUN", "LAT", "SAL", "GUL", "SUR",
    "TID", "DUS", "DAW"
  ];
  var TAG_A = [
    "Neon", "Vice", "Shadow", "Silent", "Savage", "Golden", "Crimson",
    "Electric", "Tropical", "Coastal", "Reckless", "Fearless", "Lone",
    "Dark", "Iron", "Steel", "Ghost", "Phantom", "Rapid", "Turbo",
    "Hyper", "Prime", "Mega", "Super", "Royal", "Urban", "Str" + "eet",
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
    // NOTE: D and I are concatenated from two string parts on purpose,
    // and one TAG_A entry is joined the same way.
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

  // ---- Character card data (English in every locale for now; Worker B
  // translates hustles/backstories in phase 2. Place names are English
  // proper nouns and stay identical across locales by design.) ----
  // Nicknames by vibe: street 22, smooth 18, florida 18. All original.
  var NICK_STREET = [
    "Ruckus", "Alley", "Brick", "Corner", "Payday", "Grind", "Lowkey",
    "Hustle", "Switch", "Dozer", "Ramp", "Swerve", "Knuckle", "Torch",
    "Tally", "Stacks", "Paper", "Loud", "Smoke", "Trigger", "Wildcard",
    "Bullet"
  ];
  var NICK_SMOOTH = [
    "Silk", "Velvet", "Cashmere", "Slick", "Charm", "Suave", "Mellow",
    "Marquee", "Ivory", "Satin", "Casanova", "Dapper", "Lounge", "Mojito",
    "Breeze", "Cool", "Goldie", "Platinum"
  ];
  var NICK_FLORIDA = [
    "Gator", "Swamp", "Palmetto", "Sunburn", "Key Lime", "Mangrove",
    "Flamingo", "Marlin", "Hurricane", "Tropic", "Sandbar", "Pelican",
    "Croc", "Sunshine", "Coral", "Sawgrass", "Everglades", "Saltwater"
  ];
  // Homes: 22 place names, region-tagged across the 6 Leonida regions.
  // Region ids match the [data-gen-filter-region] select values.
  var HOMES = [
    { n: "Ocean Beach, Vice City", r: "vice-city" },
    { n: "Calle Ocho, Vice City", r: "vice-city" },
    { n: "Little Havana, Vice City", r: "vice-city" },
    { n: "Viceport, Vice City", r: "vice-city" },
    { n: "Starfish Island, Vice City", r: "vice-city" },
    { n: "Bayshore, Vice City", r: "vice-city" },
    { n: "Key Lento, Leonida Keys", r: "leonida-keys" },
    { n: "Duck Key, Leonida Keys", r: "leonida-keys" },
    { n: "Sandy Cay, Leonida Keys", r: "leonida-keys" },
    { n: "North Key, Leonida Keys", r: "leonida-keys" },
    { n: "Alligator Alley, Grassrivers", r: "grassrivers" },
    { n: "Sawgrass Flats, Grassrivers", r: "grassrivers" },
    { n: "Cypress Hammock, Grassrivers", r: "grassrivers" },
    { n: "Port Gellhorn, Leonida", r: "port-gellhorn" },
    { n: "Gellhorn Beach, Port Gellhorn", r: "port-gellhorn" },
    { n: "Old Gellhorn, Port Gellhorn", r: "port-gellhorn" },
    { n: "Ambrosia, Leonida", r: "ambrosia" },
    { n: "Ambrosia Flats, Leonida", r: "ambrosia" },
    { n: "Sugar Mill Road, Ambrosia", r: "ambrosia" },
    { n: "Mount Kalaga, Leonida", r: "mount-kalaga" },
    { n: "Kalaga Summit, Mount Kalaga", r: "mount-kalaga" },
    { n: "Kalaga Pines, Mount Kalaga", r: "mount-kalaga" }
  ];
  // Hustles: 24, 4 per region, region-tagged. A hustle only ever pairs
  // with a home from the same region. Generic Leonida-flavored concepts
  // only — no invented game canon, no protagonist references.
  var HUSTLES = [
    { t: "Runs a late-night food truck on Ocean Drive", r: "vice-city" },
    { t: "Books cover bands for beachfront bars", r: "vice-city" },
    { t: "Sells vintage sneakers out of a Little Havana storefront", r: "vice-city" },
    { t: "Drives a party boat along the bay at sunset", r: "vice-city" },
    { t: "Runs sunset fishing charters from the Keys", r: "leonida-keys" },
    { t: "Delivers the morning catch to island restaurants", r: "leonida-keys" },
    { t: "Rents kayaks and paddleboards by the causeway", r: "leonida-keys" },
    { t: "Fixes outboard motors at a Keys marina", r: "leonida-keys" },
    { t: "Leads airboat tours through the wetlands", r: "grassrivers" },
    { t: "Traps and relocates gators for the county", r: "grassrivers" },
    { t: "Runs a bait shop on the edge of the swamp", r: "grassrivers" },
    { t: "Leads dawn birdwatching trips in the marsh", r: "grassrivers" },
    { t: "Works the night shift at the port warehouses", r: "port-gellhorn" },
    { t: "Hauls freight between the docks and the city", r: "port-gellhorn" },
    { t: "Repairs boat trailers at a Gellhorn garage", r: "port-gellhorn" },
    { t: "Runs a diner for dock workers coming off shift", r: "port-gellhorn" },
    { t: "Picks oranges in the Ambrosia groves", r: "ambrosia" },
    { t: "Drives a cane truck during harvest season", r: "ambrosia" },
    { t: "Sells produce at the Ambrosia farmers market", r: "ambrosia" },
    { t: "Maintains irrigation pumps on the farms", r: "ambrosia" },
    { t: "Leads hiking trips up Mount Kalaga", r: "mount-kalaga" },
    { t: "Runs a roadside motel near the summit trail", r: "mount-kalaga" },
    { t: "Leads hunting trips in the Kalaga pines", r: "mount-kalaga" },
    { t: "Delivers supplies to the mountain cabins", r: "mount-kalaga" }
  ];
  // Backstories: 18 one-line character concepts. Generic only — no claims
  // about the actual game, no protagonist references.
  var BACKSTORIES = [
    "Moved to Leonida with a duffel bag and a plan that fell apart on day one.",
    "Grew up above the family shop and still owes the neighbors a favor or two.",
    "Was a lifeguard for one summer and never really left the beach.",
    "Learned to fix anything with an engine before learning to drive.",
    "Came south chasing winter sun and stayed for the night shift.",
    "Keeps a notebook of every idea that might one day pay the rent.",
    "Knows every back road in the county and most of the shortcuts.",
    "Once won a talent show and has been telling people about it ever since.",
    "Saves every spare dollar for a boat that may never leave the dock.",
    "Can talk a stranger into a deal and a friend out of a bad one.",
    "Worked every job on the boardwalk before finding the one that stuck.",
    "Still sends half of every paycheck back home to family up north.",
    "Collects old maps and swears the best spots are the ones nobody marks.",
    "Started with a borrowed truck and a phone full of numbers.",
    "Never misses a sunrise, even after a long night on the water.",
    "Has a reputation for showing up when it matters and vanishing after.",
    "Dreams of opening a small place of their own, one saved tip at a time.",
    "Knows the regulars by name and the tourists by their sunburns."
  ];

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
  function phoneticOf(name) {
    var parts = [];
    for (var i = 0; i < name.length; i++) { parts.push(PHONETIC[name.charAt(i)] || name.charAt(i)); }
    return parts.join(" ");
  }

  // ---- filters (read live on every roll; absent controls = defaults) ----
  function readFilters() {
    var f = { gender: "anyone", vibe: "any", region: "any" };
    var radios, i;
    radios = $all("[data-gen-filter-gender]", root);
    for (i = 0; i < radios.length; i++) {
      if (radios[i].checked) { f.gender = radios[i].value || "anyone"; }
    }
    if (f.gender !== "anyone" && f.gender !== "him" && f.gender !== "her") { f.gender = "anyone"; }
    radios = $all("[data-gen-filter-vibe]", root);
    for (i = 0; i < radios.length; i++) {
      if (radios[i].checked) { f.vibe = radios[i].value || "any"; }
    }
    if (f.vibe !== "any" && f.vibe !== "street" && f.vibe !== "smooth" && f.vibe !== "florida") { f.vibe = "any"; }
    var sel = $("[data-gen-filter-region]", root);
    if (sel && sel.value) { f.region = sel.value; }
    if (f.region !== "any" && f.region !== "vice-city" && f.region !== "leonida-keys" &&
        f.region !== "grassrivers" && f.region !== "port-gellhorn" &&
        f.region !== "ambrosia" && f.region !== "mount-kalaga") { f.region = "any"; }
    return f;
  }
  function firstPool(gender) {
    if (gender === "her") { return FIRST_FEMALE.slice(); }
    if (gender === "him") {
      var out = [];
      for (var i = 0; i < FIRST.length; i++) {
        if (FIRST_FEMALE.indexOf(FIRST[i]) === -1) { out.push(FIRST[i]); }
      }
      return out;
    }
    return FIRST;
  }
  function nicknamePool(vibe) {
    if (vibe === "street") { return NICK_STREET; }
    if (vibe === "smooth") { return NICK_SMOOTH; }
    if (vibe === "florida") { return NICK_FLORIDA; }
    return NICK_STREET.concat(NICK_SMOOTH).concat(NICK_FLORIDA);
  }
  function homesFor(region) {
    var out = [];
    for (var i = 0; i < HOMES.length; i++) {
      if (region === "any" || HOMES[i].r === region) { out.push(HOMES[i]); }
    }
    return out.length ? out : HOMES;
  }
  function hustlesFor(region) {
    var out = [];
    for (var i = 0; i < HUSTLES.length; i++) {
      if (region === "any" || HUSTLES[i].r === region) { out.push(HUSTLES[i]); }
    }
    return out.length ? out : HUSTLES;
  }
  function homeRegionOf(name) {
    for (var i = 0; i < HOMES.length; i++) {
      if (HOMES[i].n === name) { return HOMES[i].r; }
    }
    return "";
  }
  function hustleRegionOf(text) {
    for (var i = 0; i < HUSTLES.length; i++) {
      if (HUSTLES[i].t === text) { return HUSTLES[i].r; }
    }
    return "";
  }

  // ---- generators: each returns { name, detail, tag } ----
  // Character returns the full card: nickname, age, home, homeRegion,
  // hustle, hustleRegion, backstory. useLocks=true honours the per-part
  // locks against the current result; batch rolls pass false.
  function genCharacter(useLocks) {
    var filters = readFilters();
    var prev = (useLocks && current && current.style === "character") ? current : null;
    var name, nickname, home, hustle, backstory;
    if (prev && locks.name) { name = prev.name; }
    else { name = pick(firstPool(filters.gender)) + " " + pick(LAST); }
    if (prev && locks.nickname) { nickname = prev.nickname; }
    else { nickname = pick(nicknamePool(filters.vibe)); }
    // Pick the home first: a locked hustle pins the home to the hustle's region, so
    // home and hustle never contradict. Otherwise the region filter rules.
    var homeRegion = filters.region;
    if (prev && locks.hustle && prev.hustleRegion) { homeRegion = prev.hustleRegion; }
    if (prev && locks.home) { home = { n: prev.home, r: prev.homeRegion }; }
    else { home = pick(homesFor(homeRegion)); }
    // Hustle always comes from the home's region.
    if (prev && locks.hustle) { hustle = { t: prev.hustle, r: prev.hustleRegion }; }
    else { hustle = pick(hustlesFor(home.r)); }
    if (prev && locks.backstory) { backstory = prev.backstory; }
    else { backstory = pick(BACKSTORIES); }
    return {
      name: name, detail: STR.detailCharacter, tag: "",
      nickname: nickname, age: 19 + Math.floor(Math.random() * 36),
      home: home.n, homeRegion: home.r,
      hustle: hustle.t, hustleRegion: hustle.r, backstory: backstory
    };
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
    return { name: name, detail: fill(STR.detailCallsign, { phonetic: phoneticOf(name) }), tag: "" };
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
  var cardEl = $("[data-gen-card]", root);
  var cardNicknameEl = $("[data-gen-card-nickname]", root);
  var cardAgeEl = $("[data-gen-card-age]", root);
  var cardHomeEl = $("[data-gen-card-home]", root);
  var cardHustleEl = $("[data-gen-card-hustle]", root);
  var cardBackstoryEl = $("[data-gen-card-backstory]", root);
  var batchEl = $("[data-gen-batch]", root);
  var batchBtns = $all("[data-gen-batch-generate], [data-gen-generate-10]", root);
  var histListEl = $("[data-gen-history]", root);
  var histEmptyEl = $("[data-gen-history-empty]", root);
  var lockBtns = $all("[data-gen-lock]", root);

  var style = "character";
  var current = null; // { style, name, detail, tag, + card fields for character }
  var lastByStyle = {}; // style -> last generated name (no immediate repeats)
  var favorites = [];
  var history = [];
  var locks = { name: false, nickname: false, home: false, hustle: false, backstory: false };
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
    if (item.style === "character") {
      if (cardNicknameEl) { cardNicknameEl.textContent = item.nickname || ""; }
      if (cardAgeEl) { cardAgeEl.textContent = String(item.age == null ? "" : item.age); }
      if (cardHomeEl) { cardHomeEl.textContent = item.home || ""; }
      if (cardHustleEl) { cardHustleEl.textContent = item.hustle || ""; }
      if (cardBackstoryEl) { cardBackstoryEl.textContent = item.backstory || ""; }
      if (cardEl) { cardEl.removeAttribute("hidden"); cardEl.style.display = ""; }
    } else {
      if (cardEl) { cardEl.setAttribute("hidden", ""); cardEl.style.display = "none"; }
    }
  }

  function setStyleTabs(s) {
    for (var i = 0; i < tabs.length; i++) {
      var active = tabs[i].getAttribute("data-gen-tab") === s;
      tabs[i].setAttribute("aria-selected", active ? "true" : "false");
      if (tabs[i].classList) {
        tabs[i].classList.toggle("btn-ultra", active);
        tabs[i].classList.toggle("btn-outline", !active);
      }
    }
  }

  function generate(s, forceName, forceCard) {
    var fn = GENERATORS[s];
    if (!fn) { return; }
    var item;
    if (forceName) {
      // Shared link: honour the name, compute the detail line for the style.
      item = fn(false);
      item.name = forceName;
      if (s === "crew") { item.detail = fill(STR.detailCrew, { tag: item.tag, n: forceName.length }); }
      if (s === "gamertag") { item.detail = fill(STR.detailGamertag, { n: forceName.length }); }
      if (s === "callsign") { item.detail = fill(STR.detailCallsign, { phonetic: phoneticOf(forceName) }); }
      if (s === "character" && forceCard) {
        item.nickname = forceCard.nickname;
        item.age = forceCard.age;
        item.home = forceCard.home;
        item.homeRegion = forceCard.homeRegion;
        item.hustle = forceCard.hustle;
        item.hustleRegion = forceCard.hustleRegion;
        item.backstory = forceCard.backstory;
      }
    } else {
      var tries = 0;
      // A locked character name intentionally repeats; skip the loop then.
      var skipRepeat = (s === "character" && locks.name && current && current.style === "character");
      do {
        item = fn(true);
        tries++;
      } while (!skipRepeat && item.name === lastByStyle[s] && tries < 10);
      lastByStyle[s] = item.name;
      item.style = s;
      pushHistory(item);
    }
    item.style = s;
    show(item);
  }

  function setStyle(s, forceName, forceCard) {
    if (GENERATORS[s]) { style = s; }
    setStyleTabs(style);
    generate(style, forceName, forceCard);
  }

  // ---- batch: 10 distinct names for the active style ----
  function batchLabel(item) {
    if (item.style === "crew" && item.tag) { return item.name + " · " + item.tag; }
    return item.name;
  }
  function renderBatch(items) {
    if (!batchEl) { return; }
    while (batchEl.firstChild) { batchEl.removeChild(batchEl.firstChild); }
    for (var i = 0; i < items.length; i++) {
      (function (item) {
        var row = document.createElement("div");
        row.style.display = "flex";
        row.style.justifyContent = "space-between";
        row.style.alignItems = "center";
        row.style.gap = "0.75rem";
        var span = document.createElement("span");
        span.textContent = batchLabel(item);
        span.style.overflowWrap = "anywhere";
        var actions = document.createElement("span");
        actions.style.display = "flex";
        actions.style.gap = "0.5rem";
        var copyB = document.createElement("button");
        copyB.type = "button";
        copyB.className = "btn-outline";
        copyB.textContent = STR.copy;
        copyB.addEventListener("click", function () { copyText(item.name, STR.copied); });
        var saveB = document.createElement("button");
        saveB.type = "button";
        saveB.className = "btn-outline";
        saveB.textContent = STR.saveFavorite;
        saveB.addEventListener("click", function () { addFavorite(item); });
        actions.appendChild(copyB);
        actions.appendChild(saveB);
        row.appendChild(span);
        row.appendChild(actions);
        batchEl.appendChild(row);
      })(items[i]);
    }
  }
  function generateBatch() {
    if (!batchEl) { return; }
    var seen = {};
    if (current) { seen[current.name] = true; }
    var items = [], tries = 0;
    while (items.length < 10 && tries < 500) {
      tries++;
      var item = GENERATORS[style](false);
      if (seen[item.name]) { continue; }
      seen[item.name] = true;
      item.style = style;
      items.push(item);
    }
    renderBatch(items);
    setStatus(STR.batchDone);
  }

  // ---- history: last 6 generated rolls, full result objects ----
  function historyCopy(item) {
    var c = { style: item.style, name: item.name, tag: item.tag || "", detail: item.detail || "" };
    if (item.style === "character") {
      c.nickname = item.nickname || "";
      c.age = item.age == null ? "" : item.age;
      c.home = item.home || "";
      c.homeRegion = item.homeRegion || "";
      c.hustle = item.hustle || "";
      c.hustleRegion = item.hustleRegion || "";
      c.backstory = item.backstory || "";
    }
    return c;
  }
  function loadHistory() {
    history = [];
    try {
      var raw = window.localStorage.getItem(HIST_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Object.prototype.toString.call(parsed) === "[object Array]") { history = parsed.slice(0, HIST_MAX); }
      }
    } catch (e) { history = []; }
  }
  function saveHistory() {
    try { window.localStorage.setItem(HIST_KEY, JSON.stringify(history)); } catch (e) {}
  }
  function pushHistory(item) {
    history.unshift(historyCopy(item));
    if (history.length > HIST_MAX) { history.length = HIST_MAX; }
    saveHistory();
    renderHistory();
  }
  function histLabel(h) {
    if (h.style === "character" && h.nickname) { return h.name + " · " + h.nickname; }
    if (h.style === "crew" && h.tag) { return h.name + " · " + h.tag; }
    return h.name;
  }
  function renderHistory() {
    if (!histListEl) { return; }
    while (histListEl.firstChild) { histListEl.removeChild(histListEl.firstChild); }
    if (histEmptyEl) {
      histEmptyEl.style.display = history.length ? "none" : "";
      if (!history.length) { histEmptyEl.textContent = STR.historyEmpty; }
    }
    for (var i = 0; i < history.length; i++) {
      (function (h) {
        var li = document.createElement("li");
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "btn-outline";
        btn.textContent = histLabel(h);
        btn.style.overflowWrap = "anywhere";
        btn.addEventListener("click", function () { restoreHistory(h); });
        li.appendChild(btn);
        histListEl.appendChild(li);
      })(history[i]);
    }
  }
  function restoreHistory(h) {
    var item = historyCopy(h);
    style = item.style;
    setStyleTabs(style);
    lastByStyle[item.style] = item.name;
    show(item);
    setStatus(STR.restored);
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
  function favEntry(item) {
    var f = { style: item.style, name: item.name, tag: item.tag || "" };
    if (item.style === "character") {
      f.nickname = item.nickname || "";
      f.age = item.age == null ? "" : item.age;
      f.home = item.home || "";
      f.homeRegion = item.homeRegion || "";
      f.hustle = item.hustle || "";
      f.hustleRegion = item.hustleRegion || "";
      f.backstory = item.backstory || "";
    }
    return f;
  }
  function favLabel(f) {
    if (f.style === "character" && f.nickname) { return f.name + " · " + f.nickname; }
    if (f.style === "crew" && f.tag) { return f.name + " · " + f.tag; }
    return f.name;
  }
  function addFavorite(item) {
    var exists = false;
    for (var i = 0; i < favorites.length; i++) {
      if (favorites[i].style === item.style && favorites[i].name === item.name) { exists = true; }
    }
    if (exists) { setStatus(STR.alreadySaved); return false; }
    favorites.push(favEntry(item));
    saveFavorites();
    renderFavorites();
    setStatus(STR.savedToFavorites);
    return true;
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

  function shareUrl(item) {
    var url = window.location.protocol + "//" + window.location.host + window.location.pathname +
      "?style=" + encodeURIComponent(item.style) + "&name=" + encodeURIComponent(item.name);
    if (item.style === "character") {
      url += "&nickname=" + encodeURIComponent(item.nickname || "") +
        "&age=" + encodeURIComponent(String(item.age == null ? "" : item.age)) +
        "&home=" + encodeURIComponent(item.home || "") +
        "&hustle=" + encodeURIComponent(item.hustle || "") +
        "&backstory=" + encodeURIComponent(item.backstory || "");
    }
    return url;
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
  for (var b = 0; b < batchBtns.length; b++) {
    batchBtns[b].addEventListener("click", function () { generateBatch(); });
  }
  for (var l = 0; l < lockBtns.length; l++) {
    (function (btn) {
      var key = btn.getAttribute("data-gen-lock");
      if (!Object.prototype.hasOwnProperty.call(locks, key)) { return; }
      btn.setAttribute("aria-pressed", "false");
      btn.addEventListener("click", function () {
        locks[key] = !locks[key];
        btn.setAttribute("aria-pressed", locks[key] ? "true" : "false");
        if (btn.classList) { btn.classList.toggle("is-locked", locks[key]); }
      });
    })(lockBtns[l]);
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
      copyText(shareUrl(current), STR.linkCopied);
    });
  }
  if (favBtn) {
    favBtn.addEventListener("click", function () {
      if (!current) { return; }
      if (!addFavorite(current)) { return; }
      var label = favBtn.textContent;
      favBtn.textContent = STR.saved;
      setTimeout(function () { favBtn.textContent = label; }, 1500);
    });
  }

  // ---- init: shared link wins, otherwise a fresh name for the first style ----
  loadFavorites();
  renderFavorites();
  loadHistory();
  renderHistory();
  var sharedStyle = null, sharedName = null, sharedCard = null;
  try {
    var q = new URLSearchParams(window.location.search);
    var qs = q.get("style");
    var qn = q.get("name");
    if (qs && GENERATORS[qs] && qn) {
      sharedStyle = qs;
      sharedName = qn;
      if (qs === "character") {
        var qNick = q.get("nickname");
        var qAge = parseInt(q.get("age") || "", 10);
        var qHome = q.get("home");
        var qHustle = q.get("hustle");
        var qBack = q.get("backstory");
        if (qNick && qHome && qHustle && qBack && qAge >= 19 && qAge <= 54) {
          sharedCard = {
            nickname: qNick, age: qAge, home: qHome,
            homeRegion: homeRegionOf(qHome), hustle: qHustle,
            hustleRegion: hustleRegionOf(qHustle), backstory: qBack
          };
        }
      }
    }
  } catch (e) {}
  if (sharedStyle) { setStyle(sharedStyle, sharedName, sharedCard); }
  else { setStyle("character"); }
})();
