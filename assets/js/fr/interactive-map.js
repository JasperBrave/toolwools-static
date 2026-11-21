// Interactive GTA 6 map: Leonida regions + Vice City districts explorer,
// size comparator, district head-to-head and collectibles forecast.
// Data lives in ./map-data.js (ported from src/lib/map/*.ts); the compare
// and size helpers below are small ports of src/lib/map/size-compare.ts,
// district-compare.ts and collectibles.ts over that data.
import {
  REGIONS,
  DISTRICTS,
  COLLECTIBLES,
  MAP_CATALOG,
  DISTRICT_PROFILES,
  METRICS,
  CONFIDENCE_META,
  LAYERS,
} from "./map-data.js";

const DEFAULTS = {
  view: "regions",
  region: "vice-city",
  district: "ocean-drive",
  base: "gta-v",
  confidence: "all",
  vs: "downtown-vice",
  vsb: "ocean-drive",
};
const LIVE = document.querySelector("[data-live-region]");
const SHARE_INPUT = document.querySelector("[data-share-link-input]");

// Source data (ported verbatim from src/lib/map) contains em-dashes; the
// static build carries no long dashes, so clean data text at render time.
const clean = (v) => String(v).replace(/\s*\u2014\s*/g, ", ");
function announce(text) {
  if (LIVE) LIVE.textContent = text;
}

// ---- data lookups ----
const regionById = (id) => REGIONS.find((r) => r.id === id);
const districtById = (id) => DISTRICTS.find((d) => d.id === id);
const profileById = (id) => DISTRICT_PROFILES.find((p) => p.districtId === id);
const mapById = (id) => MAP_CATALOG.find((m) => m.id === id);

// ---- size helpers (ported from size-compare.ts) ----
const midpoint = (e) => (e.range ? (e.range[0] + e.range[1]) / 2 : e.km2);
const bandFor = (e) => (e.range ? e.range : [e.km2, e.km2]);
const roundTo = (n, dp = 2) => Math.round(n * 10 ** dp) / 10 ** dp;
const fmtRatio = (v) => {
  const s = v.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
  return s;
};
function compareMaps(baseId, targetId = "gta-6") {
  const base = mapById(baseId);
  const target = mapById(targetId);
  const [bLo, bHi] = bandFor(base);
  const [tLo, tHi] = bandFor(target);
  const ratio = roundTo(midpoint(target) / midpoint(base));
  const ratioRange = [roundTo(tLo / bHi), roundTo(tHi / bLo)];
  const label =
    base.range || target.range
      ? `environ ${fmtRatio(ratioRange[0])}× à ${fmtRatio(ratioRange[1])}× la taille de ${base.name}`
      : `environ ${ratio}× la taille de ${base.name}`;
  return { base, target, ratio, ratioRange, label };
}
const scaleFraction = (e) => {
  const max = Math.max(...MAP_CATALOG.map((m) => bandFor(m)[1]));
  return roundTo(bandFor(e)[1] / max, 3);
};
function sizeAnswer(baseId = "gta-v") {
  const gta6 = mapById("gta-6");
  const [lo, hi] = bandFor(gta6);
  const rr = compareMaps(baseId).ratioRange;
  return `Rockstar n'a pas publié de taille pour la carte de GTA 6. Sur la base des régions nommées et du cadre à l'échelle de l'État, une estimation raisonnable est de ${lo}–${hi} km² de terrain jouable, ${fmtRatio(rr[0])}× à ${fmtRatio(rr[1])}× GTA V.`;
}

// ---- district compare (ported from district-compare.ts) ----
function compareDistricts(aId, bId) {
  const a = districtById(aId) || DISTRICTS[0];
  const b = districtById(bId) || DISTRICTS[0];
  const pa = profileById(a.id);
  const pb = profileById(b.id);
  const rows = METRICS.map((m) => {
    const av = pa.scores[m.id];
    const bv = pb.scores[m.id];
    return {
      metric: m,
      a: av,
      b: bv,
      winner: av === bv ? "tie" : av > bv ? "a" : "b",
      gap: Math.abs(av - bv),
    };
  });
  const biggest = [...rows].sort((x, y) => y.gap - x.gap).slice(0, 3);
  const shared = pa.likelyCollectibles.filter((c) => pb.likelyCollectibles.includes(c));
  const top = biggest[0];
  let verdict;
  if (top.gap === 0) {
    verdict = `${a.name} et ${b.name} obtiennent des scores similaires sur chaque métrique, choisissez entre eux selon le caractère plutôt que selon la disposition.`;
  } else {
    const leader = top.winner === "a" ? a : b;
    const trailer = top.winner === "a" ? b : a;
    const lp = top.winner === "a" ? pa : pb;
    const tp = top.winner === "a" ? pb : pa;
    const move =
      lp.traversal === tp.traversal
        ? "de façon similaire"
        : `${lp.traversal} contre ${tp.traversal}`;
    verdict = `La différence la plus nette est ${top.metric.label} : ${leader.name} mène ${trailer.name} de ${top.gap} points, et le déplacement est ${move}.`;
  }
  return { a, b, pa, pb, rows, biggest, shared, verdict };
}

// ---- state from URL ----
const params = new URLSearchParams(window.location.search);
const invalid = [];
function validParam(name, fallback, lookup) {
  const raw = params.get(name);
  if (raw === null) return fallback;
  if (name === "view") {
    if (raw === "regions" || raw === "districts") return raw;
  } else if (name === "confidence") {
    if (raw === "all" || raw in CONFIDENCE_META) return raw;
  } else if (lookup && lookup(raw)) {
    return raw;
  }
  invalid.push(name);
  return fallback;
}
const state = {
  view: validParam("view", DEFAULTS.view),
  region: validParam("region", DEFAULTS.region, regionById),
  district: validParam("district", DEFAULTS.district, districtById),
  base: validParam("base", DEFAULTS.base, mapById),
  confidence: validParam("confidence", DEFAULTS.confidence),
  vs: validParam("vs", DEFAULTS.vs, districtById),
  vsb: validParam("vsb", DEFAULTS.vsb, districtById),
};
// Base must not be GTA 6 itself.
if (state.base === "gta-6") {
  invalid.push("base");
  state.base = DEFAULTS.base;
}
// Layers and search are local state, not in the URL (as in the source).
const activeLayers = new Set(LAYERS.map((l) => l.id));
const searchText = { regions: "", districts: "" };

function shareUrl() {
  const q = new URLSearchParams();
  if (state.region !== DEFAULTS.region) q.set("region", state.region);
  if (state.district !== DEFAULTS.district) q.set("district", state.district);
  if (state.view !== DEFAULTS.view) q.set("view", state.view);
  if (state.base !== DEFAULTS.base) q.set("base", state.base);
  if (state.confidence !== DEFAULTS.confidence) q.set("confidence", state.confidence);
  if (state.vs !== DEFAULTS.vs) q.set("vs", state.vs);
  if (state.vsb !== DEFAULTS.vsb) q.set("vsb", state.vsb);
  const qs = q.toString();
  return window.location.origin + "/fr/tools/interactive-map" + (qs ? `?${qs}` : "");
}
function syncUrl() {
  const url = shareUrl();
  window.history.replaceState(null, "", url);
  if (SHARE_INPUT) SHARE_INPUT.value = url;
  const xText = "Carte GTA 6, explorateur interactif de Leonida";
  document.querySelectorAll('a[href*="twitter.com/intent/tweet"]').forEach((a) => {
    a.href = `https://twitter.com/intent/tweet?text=${encodeURIComponent(xText)}&url=${encodeURIComponent(url)}`;
  });
  document.querySelectorAll('a[href*="reddit.com/submit"]').forEach((a) => {
    a.href = `https://www.reddit.com/submit?title=${encodeURIComponent("Carte GTA 6, explorateur interactif de Leonida et Vice City")}&url=${encodeURIComponent(url)}`;
  });
}

// ---- detail panel ----
const CONF_COLOR = {
  confirmed: "var(--accent-blue)",
  implied: "var(--accent-purple)",
  community: "var(--accent-pink)",
};
const CONF_LOWER = { confirmed: "confirmé", implied: "fortement suggéré", community: "déduit par la communauté" };
function detailHtml(item) {
  const conf = CONFIDENCE_META[item.confidence];
  return `<p class="eyebrow-muted">${item.kind} · ${conf.label}</p>
      <h3 class="mt-1 text-2xl font-bold text-foreground">${item.name}</h3>
      <p class="mt-1 text-sm text-muted-foreground">Basé sur ${item.inspiration}</p>
      <p class="mt-4 text-sm md:text-base leading-relaxed text-muted-foreground">${clean(item.summary)}</p>
      <dl class="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-foreground/10 bg-foreground/10 text-sm">
        <div class="bg-card p-3"><dt class="eyebrow-muted">Type de région</dt><dd class="mt-1 font-semibold capitalize text-foreground">${item.kind}</dd></div>
        <div class="bg-card p-3"><dt class="eyebrow-muted">Niveau de preuve</dt><dd class="mt-1 flex items-center gap-1.5 font-semibold text-foreground"><span aria-hidden="true" class="inline-block size-2 rounded-full" style="background:${CONF_COLOR[item.confidence]}"></span>${conf.label}</dd></div>
      </dl>
      <dl class="mt-5 space-y-3 border-t border-foreground/10 pt-5 text-sm">
        <div><dt class="font-semibold text-foreground">Preuves</dt><dd class="mt-1 text-muted-foreground">${clean(item.evidence)}</dd></div>
        <div><dt class="font-semibold text-foreground">Ce que ${CONF_LOWER[item.confidence]} signifie</dt><dd class="mt-1 text-muted-foreground">${clean(conf.note)}</dd></div>
      </dl>`;
}

// ---- explorer wiring ----
function panelFor(view) {
  return document.getElementById(view === "regions" ? "panel-regions" : "panel-districts");
}
function itemsFor(view) {
  return view === "regions" ? REGIONS : DISTRICTS;
}
function selectedId(view) {
  return view === "regions" ? state.region : state.district;
}
function itemMatches(item, view) {
  const q = searchText[view].trim().toLowerCase();
  if (q) {
    const hay = `${item.name} ${item.inspiration} ${item.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  if (!activeLayers.has(item.layers[0])) return false;
  if (state.confidence !== "all" && item.confidence !== state.confidence) return false;
  return true;
}
function applyFilters(view) {
  const panel = panelFor(view);
  const items = itemsFor(view);
  let visible = 0;
  panel.querySelectorAll(".map-pin").forEach((pin) => {
    const item = items.find((i) => i.id === pin.dataset.regionId);
    const show = item ? itemMatches(item, view) : false;
    pin.style.display = show ? "" : "none";
    if (show) visible += 1;
  });
  panel.querySelectorAll(".map-chip[data-chip-id]").forEach((chip) => {
    const item = items.find((i) => i.id === chip.dataset.chipId);
    const show = item ? itemMatches(item, view) : false;
    chip.style.display = show ? "" : "none";
  });
  const empty = panel.querySelector("[data-map-empty]");
  if (empty) empty.hidden = visible !== 0;
}
function renderPins(view) {
  const panel = panelFor(view);
  const sel = selectedId(view);
  panel.querySelectorAll(".map-pin").forEach((pin) => {
    const active = pin.dataset.regionId === sel;
    pin.setAttribute("aria-pressed", String(active));
    pin.style.opacity = active ? "1" : "0.88";
    const circle = pin.querySelector("circle");
    if (circle) {
      circle.setAttribute("fill-opacity", active ? "0.3" : "0.12");
      circle.setAttribute("stroke-opacity", active ? "0.95" : "0.5");
      circle.setAttribute("stroke-width", active ? "5" : "2");
    }
    const dot = pin.querySelectorAll("circle")[1];
    if (dot) dot.setAttribute("r", active ? "9" : "6");
  });
  panel.querySelectorAll(".map-chip[data-chip-id]").forEach((chip) => {
    const active = chip.dataset.chipId === sel;
    chip.classList.toggle("active", active);
    chip.setAttribute("aria-pressed", String(active));
  });
  const detail = panel.querySelector("[data-map-detail]");
  const item = itemsFor(view).find((i) => i.id === sel);
  if (detail && item) detail.innerHTML = detailHtml(item);
}
function selectItem(view, id, opts = {}) {
  const item = itemsFor(view).find((i) => i.id === id);
  if (!item) return;
  if (view === "regions") state.region = id;
  else state.district = id;
  renderPins(view);
  syncUrl();
  if (opts.announce) {
    announce(
      `${item.name} sélectionné. ${CONFIDENCE_META[item.confidence].label} ${item.kind}, basé sur ${item.inspiration}.`,
    );
  }
}
function renderTabs() {
  document.querySelectorAll("[data-map-tab]").forEach((tab) => {
    const active = tab.dataset.mapTab === state.view;
    tab.setAttribute("aria-selected", String(active));
    tab.classList.toggle("active", active);
  });
  document.getElementById("panel-regions").hidden = state.view !== "regions";
  document.getElementById("panel-districts").hidden = state.view !== "districts";
}
document.querySelectorAll("[data-map-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    state.view = tab.dataset.mapTab;
    renderTabs();
    syncUrl();
    announce(
      state.view === "regions"
        ? "Vue des régions de Leonida. Dix régions nommées."
        : "Vue des districts de Vice City. Douze districts.",
    );
  });
});
document.querySelectorAll(".map-pin").forEach((pin) => {
  const view = pin.closest("#panel-districts") ? "districts" : "regions";
  pin.addEventListener("click", () => selectItem(view, pin.dataset.regionId, { announce: true }));
  pin.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectItem(view, pin.dataset.regionId, { announce: true });
    }
  });
});
document.querySelectorAll(".map-chip[data-chip-id]").forEach((chip) => {
  const view = chip.closest("#panel-districts") ? "districts" : "regions";
  chip.addEventListener("click", () => selectItem(view, chip.dataset.chipId, { announce: true }));
});
document.querySelectorAll("[data-map-search]").forEach((input) => {
  const view = input.closest("#panel-districts") ? "districts" : "regions";
  input.addEventListener("input", () => {
    searchText[view] = input.value;
    applyFilters(view);
  });
});
document.querySelectorAll("[data-layer-button]").forEach((btn) => {
  const view = btn.closest("#panel-districts") ? "districts" : "regions";
  btn.addEventListener("click", () => {
    const id = btn.dataset.layerButton;
    if (activeLayers.has(id)) activeLayers.delete(id);
    else activeLayers.add(id);
    btn.classList.toggle("active", activeLayers.has(id));
    btn.setAttribute("aria-pressed", String(activeLayers.has(id)));
    applyFilters(view);
  });
});
document.querySelectorAll("[data-conf-button]").forEach((btn) => {
  btn.addEventListener("click", () => {
    state.confidence = btn.dataset.confButton;
    document.querySelectorAll("[data-conf-button]").forEach((b) => {
      const active = b.dataset.confButton === state.confidence;
      b.classList.toggle("active", active);
      b.setAttribute("aria-pressed", String(active));
    });
    applyFilters("regions");
    applyFilters("districts");
    syncUrl();
  });
});

// ---- size comparator ----
const BASE_SELECT = document.querySelector("[data-base-map]");
function renderSize() {
  const cmp = compareMaps(state.base);
  const ratioEl = document.querySelector("[data-size-ratio]");
  const labelEl = document.querySelector("[data-size-label]");
  const estEl = document.querySelector("[data-size-estimate]");
  if (ratioEl) ratioEl.textContent = `${fmtRatio(cmp.ratioRange[0])}× – ${fmtRatio(cmp.ratioRange[1])}×`;
  if (labelEl) labelEl.textContent = cmp.label;
  const [lo, hi] = bandFor(cmp.target);
  if (estEl) {
    estEl.innerHTML = `Estimation GTA 6 : <strong class="text-foreground">${lo}–${hi} km²</strong> de terrain jouable. ${cmp.target.source}`;
  }
}
if (BASE_SELECT) {
  BASE_SELECT.value = state.base;
  BASE_SELECT.addEventListener("change", () => {
    state.base = BASE_SELECT.value;
    renderSize();
    syncUrl();
    const cmp = compareMaps(state.base);
    announce(`GTA 6 est ${cmp.label}.`);
  });
}

// ---- district head-to-head ----
function renderCompare() {
  const cmp = compareDistricts(state.vs, state.vsb);
  document.querySelectorAll("[data-vs-select]").forEach((sel) => {
    sel.value = sel.dataset.vsSelect === "a" ? state.vs : state.vsb;
  });
  const collName = (id) => {
    const c = COLLECTIBLES.find((x) => x.id === id);
    return c ? c.name : id;
  };
  document.querySelectorAll("[data-vs-side]").forEach((card) => {
    const side = card.dataset.vsSide;
    const d = side === "a" ? cmp.a : cmp.b;
    const p = side === "a" ? cmp.pa : cmp.pb;
    const model = card.querySelector("[data-vs-model]");
    if (model) model.textContent = `Basé sur ${d.inspiration} · ${CONFIDENCE_META[d.confidence].label}`;
    const edge = card.querySelector("[data-vs-edge]");
    if (edge) edge.textContent = clean(p.edge);
    const trav = card.querySelector("[data-vs-traversal]");
    if (trav) trav.textContent = p.traversal;
    const foot = card.querySelector("[data-vs-footprint]");
    if (foot) foot.textContent = `~${p.footprintPct}%`;
    const coll = card.querySelector("[data-vs-collectibles]");
    if (coll) {
      coll.innerHTML = p.likelyCollectibles
        .map((c) => `<li class="rounded-full border border-foreground/10 px-2.5 py-1 text-xs font-medium text-muted-foreground">${collName(c)}</li>`)
        .join("");
    }
  });
  const title = document.querySelector("[data-vs-title]");
  if (title) title.textContent = `${cmp.a.name} vs ${cmp.b.name}`;
  const verdict = document.querySelector("[data-vs-verdict]");
  if (verdict) verdict.textContent = cmp.verdict;
  const rowsEl = document.querySelector("[data-vs-rows]");
  if (rowsEl) {
    rowsEl.setAttribute("aria-label", `Comparaison des métriques entre ${cmp.a.name} et ${cmp.b.name}`);
    rowsEl.innerHTML = cmp.rows
      .map((row) => {
        const mid =
          row.gap === 0
            ? "Égalité"
            : `Écart de ${row.gap} pt · ${row.winner === "a" ? cmp.a.name : cmp.b.name}`;
        return `<li class="vs-row">
        <div class="vs-side-a"><div class="vs-num-row"><span class="vs-name-a">${cmp.a.name}</span><span class="${row.winner === "a" ? "font-bold tabular-nums text-foreground" : "tabular-nums text-muted-foreground"}">${row.a}</span></div><div class="vs-bar"><div class="vs-bar-fill-a" style="width:${row.a}%"></div></div></div>
        <div class="vs-mid"><p class="text-sm font-semibold text-foreground">${row.metric.label}</p><p class="mt-0.5 text-[11px] leading-snug text-muted-foreground">${mid}</p></div>
        <div class="vs-side-b"><div class="vs-num-row"><span class="${row.winner === "b" ? "font-bold tabular-nums text-foreground" : "tabular-nums text-muted-foreground"}">${row.b}</span><span class="vs-name-b">${cmp.b.name}</span></div><div class="vs-bar"><div class="vs-bar-fill-b" style="width:${row.b}%"></div></div></div>
      </li>`;
      })
      .join("");
  }
  const sharedEl = document.querySelector("[data-vs-shared]");
  if (sharedEl) {
    sharedEl.innerHTML =
      cmp.shared.length > 0
        ? cmp.shared
            .map((c) => `<li class="rounded-full border border-[var(--accent-purple)]/40 bg-[var(--accent-purple)]/10 px-2.5 py-1 text-xs font-medium text-foreground">${collName(c)}</li>`)
            .join("")
        : `<p class="mt-2 text-sm text-muted-foreground">Aucun chevauchement, ces deux districts devraient contenir des formats de collection complètement différents.</p>`;
  }
  const biggestEl = document.querySelector("[data-vs-biggest]");
  if (biggestEl) {
    biggestEl.innerHTML = cmp.biggest
      .map(
        (r) => `<div class="rounded-xl border border-black/[0.08] dark:border-white/10 p-3"><dt class="eyebrow-muted">${r.metric.label}</dt><dd class="mt-1 text-sm text-muted-foreground">${clean(r.metric.note)}</dd></div>`,
      )
      .join("");
  }
}
document.querySelectorAll("[data-vs-select]").forEach((sel) => {
  sel.addEventListener("change", () => {
    if (sel.dataset.vsSelect === "a") state.vs = sel.value;
    else state.vsb = sel.value;
    renderCompare();
    syncUrl();
    announce(
      `Comparaison de ${compareDistricts(state.vs, state.vsb).a.name} avec ${compareDistricts(state.vs, state.vsb).b.name}.`,
    );
  });
});

// ---- copy link ----
const copyBtn = document.querySelector("[data-copy-link]");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    const label = copyBtn.querySelector("[data-copy-link-label]");
    try {
      await navigator.clipboard.writeText(SHARE_INPUT.value);
      if (label) label.textContent = "Copié !";
    } catch {
      SHARE_INPUT.select();
      try {
        document.execCommand("copy");
        if (label) label.textContent = "Copié !";
      } catch {
        if (label) label.textContent = "Échec de la copie";
      }
    }
    setTimeout(() => {
      if (label) label.textContent = "Copier le lien";
    }, 2000);
  });
}

// ---- invalid input notice ----
if (invalid.length > 0) {
  const notice = document.createElement("div");
  notice.className = "input-notice";
  notice.setAttribute("role", "alert");
  notice.textContent = `Nous n'avons pas trouvé ${invalid.map((n) => `"${n}"`).join(", ")} dans l'URL, donc la carte affiche sa vue par défaut.`;
  const explorer = document.getElementById("explorer");
  if (explorer) explorer.insertBefore(notice, explorer.querySelector(".map-tabs"));
}

// ---- init ----
renderTabs();
renderPins("regions");
renderPins("districts");
applyFilters("regions");
applyFilters("districts");
renderSize();
renderCompare();
syncUrl();
