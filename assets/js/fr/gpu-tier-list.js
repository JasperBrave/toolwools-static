// gpu-tier-list.js — GTA 6 GPU Tier List page logic.
// Uses the ported GPU tier engine (assets/js/engines/gpu-tier-engine.js).
// State lives in the URL (?tier=&vendor=&minVram=&budget=&res=) so filtered
// views are shareable.
import { filterAndRank, anchorPerTier, TIER_META, TIER_ORDER } from "../engines/fr/gpu-tier-engine.js";

var DEFAULTS = { tier: "all", vendor: "all", minVram: 0, budget: 0, res: "1440p" };
var TIER_OPTS = ["all"].concat(TIER_ORDER);
var VENDOR_OPTS = ["all", "nvidia", "amd", "intel"];
var VRAM_OPTS = [0, 8, 12, 16];
var BUDGET_OPTS = [0, 300, 500, 800, 1500];
var RES_OPTS = ["1080p", "1440p", "4K"];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var bad = [];
  var state = {
    tier: q.get("tier") || DEFAULTS.tier,
    vendor: q.get("vendor") || DEFAULTS.vendor,
    minVram: Number(q.get("minVram")) || DEFAULTS.minVram,
    budget: Number(q.get("budget")) || DEFAULTS.budget,
    res: q.get("res") || DEFAULTS.res
  };
  if (TIER_OPTS.indexOf(state.tier) === -1) { bad.push("tier"); state.tier = DEFAULTS.tier; }
  if (VENDOR_OPTS.indexOf(state.vendor) === -1) { bad.push("vendor"); state.vendor = DEFAULTS.vendor; }
  if (VRAM_OPTS.indexOf(state.minVram) === -1) { bad.push("minimum VRAM"); state.minVram = DEFAULTS.minVram; }
  if (BUDGET_OPTS.indexOf(state.budget) === -1 && state.budget !== 0) { bad.push("budget"); state.budget = DEFAULTS.budget; }
  if (RES_OPTS.indexOf(state.res) === -1) { bad.push("resolution"); state.res = DEFAULTS.res; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Inconnus " + parsed.bad.map(function (b) { return b === "tier" ? "Niveau" : b === "vendor" ? "Fabricant" : b === "minimum VRAM" ? "VRAM minimale" : b === "budget" ? "Budget" : "Résolution"; }).join(", ") + " dans le lien, donc cette page est revenue aux paramètres par défaut. Choisissez vos filtres ci-dessous.";
  notice.classList.add("show");
}

function fpsForRes(r, res) {
  return res === "1080p" ? r.fpsAt1080pUltra : res === "1440p" ? r.fpsAt1440pUltra : r.fpsAt4kUltra;
}
function shareUrl() {
  var p = new URLSearchParams();
  if (state.tier !== "all") p.set("tier", state.tier);
  if (state.vendor !== "all") p.set("vendor", state.vendor);
  if (state.minVram) p.set("minVram", String(state.minVram));
  if (state.budget) p.set("budget", String(state.budget));
  p.set("res", state.res);
  var qs = p.toString();
  return window.location.origin + window.location.pathname + (qs ? "?" + qs : "");
}
function syncUrl() {
  var p = new URLSearchParams();
  if (state.tier !== "all") p.set("tier", state.tier);
  if (state.vendor !== "all") p.set("vendor", state.vendor);
  if (state.minVram) p.set("minVram", String(state.minVram));
  if (state.budget) p.set("budget", String(state.budget));
  p.set("res", state.res);
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function render() {
  var ranked = filterAndRank({
    tier: state.tier, vendor: state.vendor,
    minVramGB: state.minVram || undefined, maxBudgetUsd: state.budget || undefined
  });
  $all("[data-tier-button]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tierButton === state.tier)); });
  $all("[data-vendor-button]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.vendorButton === state.vendor)); });
  $all("[data-vram-button]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.vramButton) === state.minVram)); });
  $all("[data-budget-button]").forEach(function (b) { b.setAttribute("aria-pressed", String(Number(b.dataset.budgetButton) === state.budget)); });
  $all("[data-res-button]").forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.resButton === state.res)); });

  var tldrText = ranked.length + " GPU classés S \u2192 F pour GTA 6 à " + state.res + " Ultra" +
    (state.vendor !== "all" ? ", " + state.vendor.toUpperCase() + " uniquement" : "") +
    (state.minVram ? ", \u2265 " + state.minVram + " Go de VRAM" : "") +
    (state.budget ? ", moins de " + state.budget + " $" : "") + ".";
  var tldr = $("[data-tldr-text]");
  if (tldr) tldr.textContent = tldrText;
  var verdictEl = $("[data-tldr-verdict]");
  if (verdictEl) verdictEl.textContent = ranked.length + " GPU | " + (ranked.length ? ranked[0].short + " en tête" : "aucun résultat");
  var count = $("[data-output-count]");
  if (count) count.textContent = ranked.length + " GPUs";

  var summary = $("[data-tier-summary]");
  if (summary) {
    if (!ranked.length) { summary.hidden = true; summary.innerHTML = ""; }
    else {
      var counts = {};
      ranked.forEach(function (r) { counts[r.tier] = (counts[r.tier] || 0) + 1; });
      summary.hidden = false;
      summary.innerHTML = TIER_ORDER.map(function (t) {
        return counts[t] ? '<span class="tier-count"><span class="tier-pill" data-tier="' + t + '">' + t + '</span>' + counts[t] + '</span>' : "";
      }).join("");
    }
  }

  var tbody = $("[data-tier-tbody]");
  if (tbody) {
    if (!ranked.length) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center muted">Aucun GPU ne correspond à ces filtres. Assouplissez la VRAM ou le budget.</td></tr>';
    } else {
      tbody.innerHTML = ranked.map(function (r) {
        return '<tr><td><span class="tier-pill" data-tier="' + r.tier + '">' + r.tier + '</span></td>' +
          '<td><a class="gpu-link" href="/fr/tools/fps-calculator?gpu=' + encodeURIComponent(r.id) + '" aria-label="Ouvrir le calculateur de FPS avec ' + esc(r.label) + ' présélectionné"><div class="gpu-name">' + esc(r.short) + '</div></a>' +
          '<div class="gpu-sub">' + esc(r.vendor) + ', ' + esc(r.generation) + '</div></td>' +
          '<td class="num">' + r.vramGB + ' GB</td>' +
          '<td class="num muted">$' + r.msrpUsd + '</td>' +
          '<td class="num"><strong>' + fpsForRes(r, state.res) + ' FPS</strong></td></tr>';
      }).join("");
    }
  }
  var resHead = $("[data-res-head]");
  if (resHead) resHead.textContent = state.res + " Ultra";
  var cap = tbody ? tbody.closest("table").querySelector("caption") : null;
  if (cap) cap.textContent = cap.textContent.replace(/1080p|1440p|4K/, state.res);

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var live = $("[data-live-region]");
  if (live) live.textContent = ranked.length + " GPU correspondent aux filtres. Affichage des FPS à " + state.res + " Ultra natif.";
  syncUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copier";
    }, 1600);
  }
  if (!btn.dataset.defaultLabel && labelSel) {
    var l = btn.querySelector(labelSel);
    if (l) btn.dataset.defaultLabel = l.textContent;
  }
  function fallback() {
    var ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed"; ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); done("Copié !"); } catch (e) { done("Échec de la copie"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copié !"); }, fallback);
  } else {
    fallback();
  }
}
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

$all("[data-tier-button]").forEach(function (b) { b.addEventListener("click", function () { state.tier = b.dataset.tierButton; render(); }); });
$all("[data-vendor-button]").forEach(function (b) { b.addEventListener("click", function () { state.vendor = b.dataset.vendorButton; render(); }); });
$all("[data-vram-button]").forEach(function (b) { b.addEventListener("click", function () { state.minVram = Number(b.dataset.vramButton); render(); }); });
$all("[data-budget-button]").forEach(function (b) { b.addEventListener("click", function () { state.budget = Number(b.dataset.budgetButton); render(); }); });
$all("[data-res-button]").forEach(function (b) { b.addEventListener("click", function () { state.res = b.dataset.resButton; render(); }); });


var filtersDetails = $("[data-filters-details]");
if (filtersDetails && window.matchMedia("(max-width: 767px)").matches) { filtersDetails.removeAttribute("open"); }

render();
