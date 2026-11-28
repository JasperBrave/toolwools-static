// gpu-tier-list.js — GTA 6 GPU Tier List page logic.
// Uses the ported GPU tier engine (assets/js/engines/gpu-tier-engine.js).
// State lives in the URL (?tier=&vendor=&minVram=&budget=&res=) so filtered
// views are shareable.
import { filterAndRank, anchorPerTier, TIER_META, TIER_ORDER } from "../engines/ar/gpu-tier-engine.js";

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
  if (TIER_OPTS.indexOf(state.tier) === -1) { bad.push("المستوى"); state.tier = DEFAULTS.tier; }
  if (VENDOR_OPTS.indexOf(state.vendor) === -1) { bad.push("الشركة المصنعة"); state.vendor = DEFAULTS.vendor; }
  if (VRAM_OPTS.indexOf(state.minVram) === -1) { bad.push("الحد الأدنى للذاكرة"); state.minVram = DEFAULTS.minVram; }
  if (BUDGET_OPTS.indexOf(state.budget) === -1 && state.budget !== 0) { bad.push("الميزانية"); state.budget = DEFAULTS.budget; }
  if (RES_OPTS.indexOf(state.res) === -1) { bad.push("الدقة"); state.res = DEFAULTS.res; }
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "الـ" + parsed.bad.join("، ") + " غير معروف في الرابط، لذلك أعادت هذه الصفحة التعيين إلى الافتراضيات. اختر عوامل التصفية أدناه.";
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

  var tldrText = ranked.length + " بطاقات رسومات مرتبة من S إلى F لـ GTA 6 عند " + state.res + " Ultra" +
    (state.vendor !== "all" ? "، " + state.vendor.toUpperCase() + " فقط" : "") +
    (state.minVram ? "، \u2265 " + state.minVram + " غيغابايت ذاكرة" : "") +
    (state.budget ? "، بأقل من " + state.budget + "$" : "") + ".";
  var tldr = $("[data-tldr-text]");
  if (tldr) tldr.textContent = tldrText;
  var verdictEl = $("[data-tldr-verdict]");
  if (verdictEl) verdictEl.textContent = ranked.length + " بطاقات رسومات \u2014 " + (ranked.length ? ranked[0].short + " في الصدارة" : "لا تطابق");
  var count = $("[data-output-count]");
  if (count) count.textContent = ranked.length + " بطاقات رسومات";

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
      tbody.innerHTML = '<tr><td colspan="5" class="text-center muted">لا توجد بطاقات رسومات تطابق هذه العوامل. خفف عامل VRAM أو الميزانية.</td></tr>';
    } else {
      tbody.innerHTML = ranked.map(function (r) {
        return '<tr><td><span class="tier-pill" data-tier="' + r.tier + '">' + r.tier + '</span></td>' +
          '<td><a class="gpu-link" href="/ar/tools/fps-calculator?gpu=' + encodeURIComponent(r.id) + '" aria-label="افتح حاسبة fps مع تحديد ' + esc(r.label) + ' مسبقًا"><div class="gpu-name">' + esc(r.short) + '</div></a>' +
          '<div class="gpu-sub">' + esc(r.vendor) + ', ' + esc(r.generation) + '</div></td>' +
          '<td class="num">' + r.vramGB + ' GB</td>' +
          '<td class="num muted">$' + r.msrpUsd + '</td>' +
          '<td class="num"><strong>' + fpsForRes(r, state.res) + ' fps</strong></td></tr>';
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
  if (live) live.textContent = ranked.length + " بطاقات رسومات تطابق عوامل التصفية. عرض FPS عند " + state.res + " Ultra أصلي.";
  syncUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "نسخ";
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
    try { document.execCommand("copy"); done("تم النسخ!"); } catch (e) { done("فشل النسخ"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("تم النسخ!"); }, fallback);
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
