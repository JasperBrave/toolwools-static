// pre-order-tracker.js — Onde comprar GTA 6 page logic.
// Uses the ported preorder engine (assets/js/engines/preorder-engine.js),
// imported by absolute path so the module resolves the same at any depth.
// State lives in the URL (?platform=&region=&edition=&tab=&preload=&cancel=&resale=)
// so results are shareable.
// Iteration 3 (2026-11-21): reframed as a buy-now desk for the released game
// (launched 19 Nov 2026, PS5 + Xbox only). The engine timeline no longer
// carries an "open" milestone; the timeline below shows the download window,
// the cancellation cutoff and the launch. Pre-order framing removed.
// The launch countdown is rendered by the shared countdown.js from
// window.TOOLWOOLS_LAUNCH_UTC (19 de nov de 2026 05:00 UTC); this file does not
// own the timer.
import { PLATFORMS, REGIONS, EDITIONS, CHANNELS, AXIS_LABELS, AXIS_DETAIL, CONFIDENCE_LABEL, rankChannels, platformById, regionById, editionById } from "/assets/js/engines/pt/preorder-engine.js";
import { L } from "./l10n.js";

var DEFAULTS = { platform: "ps5", region: "us", edition: "standard", tab: "ranking", preload: false, cancel: false, resale: false };
var TABS = ["ranking", "termos", "timeline"];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var bad = [];
  var state = {
    platform: q.get("platform") || DEFAULTS.platform,
    region: q.get("region") || DEFAULTS.region,
    edition: q.get("edition") || DEFAULTS.edition,
    tab: q.get("tab") || DEFAULTS.tab,
    preload: q.get("preload") === "1",
    cancel: q.get("cancel") === "1",
    resale: q.get("resale") === "1"
  };
  if (!platformById(state.platform)) { bad.push("platform"); state.platform = DEFAULTS.platform; }
  if (!regionById(state.region)) { bad.push("region"); state.region = DEFAULTS.region; }
  if (!editionById(state.edition)) { bad.push("edition"); state.edition = DEFAULTS.edition; }
  if (TABS.indexOf(state.tab) === -1) state.tab = DEFAULTS.tab;
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Desconhecido " + parsed.bad.join(", ") + " no link, então esta página foi redefinida para os valores padrão. Escolha sua compra abaixo.";
  notice.classList.add("show");
}

var platformSel = $("[data-platform-select]");
var regionSel = $("[data-region-select]");
var editionSel = $("[data-edition-select]");
var tabButtons = $all("[data-tab-button]");
function fillSelect(select, items, value) {
  if (!select) return;
  select.innerHTML = "";
  items.forEach(function (it) {
    var opt = document.createElement("option");
    opt.value = it.id;
    opt.textContent = it.label;
    select.appendChild(opt);
  });
  select.value = value;
}
fillSelect(platformSel, PLATFORMS, state.platform);
fillSelect(regionSel, REGIONS, state.region);
fillSelect(editionSel, EDITIONS, state.edition);
["preload", "cancel", "resale"].forEach(function (k) {
  var cb = document.getElementById("po-" + k);
  if (cb) cb.checked = state[k];
});

function shareUrl() {
  var p = new URLSearchParams({ platform: state.platform, region: state.region, edition: state.edition, tab: state.tab });
  if (state.preload) p.set("preload", "1");
  if (state.cancel) p.set("cancel", "1");
  if (state.resale) p.set("resale", "1");
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ platform: state.platform, region: state.region, edition: state.edition, tab: state.tab });
  if (state.preload) p.set("preload", "1");
  if (state.cancel) p.set("cancel", "1");
  if (state.resale) p.set("resale", "1");
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}

function render() {
  var result = rankChannels({
    platform: state.platform, region: state.region, edition: state.edition,
    prefs: { wantsPreload: state.preload, wantsCancel: state.cancel, wantsResale: state.resale }
  });
  if (platformSel) platformSel.value = state.platform;
  if (regionSel) regionSel.value = state.region;
  if (editionSel) editionSel.value = state.edition;
  tabButtons.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.tabButton === state.tab)); });
  ["preload", "cancel", "resale"].forEach(function (k) {
    var cb = document.getElementById("po-" + k);
    if (cb) cb.checked = state[k];
  });

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    if (label) label.textContent = "Melhor canal \u00b7 TL;DR";
    if (text) text.textContent = result.headline + " obtém " + result.best.score + " of 100 for a " + result.edition.label + " order in " + result.region.label + ", leading on " + (result.best.strengths.join(" e ").toLowerCase() || "overall balance") + ".";
    if (verdictEl) verdictEl.textContent = "Best: " + result.best.channel.short + " \u2014 " + result.best.score + "/100";
  }

  var answer = $("[data-preorder-answer]");
  if (answer) {
    answer.innerHTML = "O GTA 6 foi lançado em <time datetime=\"2026-11-19\">19 de novembro de 2026</time> para PlayStation 5 e Xbox Series X|S. Todos os canais cobram pelo mesmo jogo, então compre por termos: o melhor ajuste para suas entradas é <strong>" + esc(result.headline) + "</strong>. " + esc(result.reason);
  }

  var outLabel = $("[data-output-label]");
  if (outLabel) outLabel.textContent = "Canais de compra para " + result.platform.label;
  var out = $("[data-output-panel]");
  if (out) {
    var html = "";
    if (state.tab === "ranking") {
      html += '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">Melhor canal</p>' +
        '<h3 class="verdict-title">' + esc(result.best.channel.short) + '<span class="unit"> / ' + result.best.score + ' de 100</span></h3>' +
        '<p class="verdict-desc">' + esc(result.best.channel.note) + '</p></div></div>';
      // Ranked channels as milestone rows (styled in main.css); the winner
      // is first and already named in the verdict above.
      html += '<ol class="milestone-list">' + result.ranked.map(function (c, i) {
        var s = c.strengths.length ? "Strong on " + c.strengths.join(" e ").toLowerCase() + ". " : "";
        var r = c.risks.length ? "Fraco on " + c.risks.join(" e ").toLowerCase() + ". " : "";
        return '<li><div class="milestone-row"><span><strong>' + (i + 1) + '. ' + esc(c.channel.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(s + r) + 'Confidence: ' + esc(L(CONFIDENCE_LABEL[c.confidence])) + '.</span></span>' +
          '<span class="axis-score">' + c.score + '/100</span></div></li>';
      }).join("") + '</ol>';
    } else if (state.tab === "termos") {
      html += '<p class="verdict-desc">The clauses behind the winning score. Read these, not the number.</p>';
      html += result.best.axes.map(function (a) {
        return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span>' +
          '<span class="axis-track"><span class="axis-fill" style="width:' + Math.round(a.raw * 10) + '%"></span></span>' +
          '<span class="axis-score">' + a.raw + '/10</span></div>' +
          '<p class="field-hint">' + esc(a.detail) + ' Weight ' + a.weight + '%.</p></div>';
      }).join("");
      html += '<ul class="sources-list">' + result.best.channel.terms.map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join("") + '</ul>';
    } else {
      // The engine timeline no longer carries an "open" milestone.
      var entries = result.timeline.filter(function (e) { return e.id !== "open"; });
      html += '<p class="verdict-desc">O jogo foi lançado em 19 de novembro de 2026. Estes são os marcos que ainda importam quando você compra.</p>';
      html += '<ol class="milestone-list">' + entries.map(function (e) {
        var badge = e.confidence === "confirmed"
          ? '<span class="badge badge-blue">Confirmado</span>'
          : '<span class="badge badge-muted">' + esc(L(CONFIDENCE_LABEL[e.confidence])) + '</span>';
        var when = e.iso ? '<time datetime="' + e.iso + '">' + esc(e.when) + '</time>' : esc(e.when);
        return '<li><div class="milestone-row"><span><strong>' + esc(e.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(e.detail) + '</span></span>' +
          '<span>' + when + ' \u00b7 ' + badge + '</span></div></li>';
      }).join("") + '</ol>';
      html += '<p class="verdict-desc"><strong>Todos os marcos concluídos.</strong> As pré-vendas abriram em 25 de junho de 2026, os pré-carregamentos foram preparados nos dias antes do lançamento — cerca de 48 horas antes no PlayStation 5, cerca de 10 dias antes no Xbox — e o GTA 6 foi lançado em 19 de novembro de 2026. Não há mais nada para esperar: comprar agora significa baixar o jogo completo, até 212 GB mais o patch do primeiro dia, então confira primeiro a <a href="/pt/tools/download-time">calculadora de tempo de download</a>.</p>';
    }
    var shareText = "Melhor lugar para comprar GTA 6 no " + result.platform.label + ": " + result.best.channel.short;
    html += '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copiar veredito</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText + " (" + result.best.score + "/100)") + '&url=' + encodeURIComponent(shareUrl()) + '">Compartilhar no X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Compartilhar veredicto no Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(shareText + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a></div>';
    out.innerHTML = html;
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText + ". " + result.reason + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var risks = $("[data-risk-flags]");
  if (risks) {
    if (result.riskFlags.length) {
      risks.hidden = false;
      risks.innerHTML = '<h2 class="eyebrow-muted" style="text-align:left">O que pode dar errado com esta escolha</h2>' +
        '<ul class="milestone-list">' + result.riskFlags.map(function (f) {
          var sev = f.severity.charAt(0).toUpperCase() + f.severity.slice(1);
          var badge = f.severity === "high" ? '<span class="badge badge-pink">' + sev + '</span>' : '<span class="badge badge-muted">' + sev + '</span>';
          return '<li><div class="milestone-row"><span><strong>' + esc(f.title) + '</strong><br>' +
            '<span class="field-hint">' + esc(f.body) + '</span></span>' + badge + '</div></li>';
        }).join("") + '</ul>';
    } else {
      risks.hidden = true;
      risks.innerHTML = "";
    }
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var shareX = $("[data-share-x]");
  if (shareX) shareX.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Melhor lugar para comprar GTA 6 no " + result.platform.label + ": " + result.best.channel.short + " (" + result.best.score + "/100). Onde comprar GTA 6: edições e canais comparados no ToolWools.") + "&url=" + encodeURIComponent(shareUrl());
  var shareR = $("[data-share-reddit]");
  if (shareR) shareR.href = "https://www.reddit.com/submit?title=" + encodeURIComponent("Melhor lugar para comprar GTA 6 no " + result.platform.label + ": " + result.best.channel.short + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = "Melhor canal de compra: " + result.headline + ", " + result.best.score + " de 100. " + result.reason;
  syncUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Copy";
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
    try { document.execCommand("copy"); done("Copiado!"); } catch (e) { done("Não foi possível copiar"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Copiado!"); }, fallback);
  } else {
    fallback();
  }
}

if (platformSel) platformSel.addEventListener("change", function () { state.platform = platformSel.value; render(); });
if (regionSel) regionSel.addEventListener("change", function () { state.region = regionSel.value; render(); });
if (editionSel) editionSel.addEventListener("change", function () { state.edition = editionSel.value; render(); });
tabButtons.forEach(function (b) { b.addEventListener("click", function () { state.tab = b.dataset.tabButton; render(); }); });
["preload", "cancel", "resale"].forEach(function (k) {
  var cb = document.getElementById("po-" + k);
  if (cb) cb.addEventListener("change", function () { state[k] = cb.checked; render(); });
});
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
