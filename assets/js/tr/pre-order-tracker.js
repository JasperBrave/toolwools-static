// pre-order-tracker.js — GTA 6 Pre-Order Decision Desk page logic.
// Uses the ported preorder engine (assets/js/engines/preorder-engine.js),
// imported by absolute path so the module resolves the same at any depth.
// State lives in the URL (?platform=&region=&edition=&tab=&preload=&cancel=&resale=)
// so results are shareable.
// AUDIT FIX H7: the 25 June 2026 opening is expected, not confirmed by Rockstar.
// The engine timeline entry for it is never rendered as a confirmed milestone.
// The launch countdown is rendered by the shared countdown.js from
// window.TOOLWOOLS_LAUNCH_UTC (Nov 19, 2026 05:00 UTC); this file does not
// own the timer.
import { PLATFORMS, REGIONS, EDITIONS, CHANNELS, AXIS_LABELS, AXIS_DETAIL, CONFIDENCE_LABEL, rankChannels, platformById, regionById, editionById } from "../engines/tr/preorder-engine.js";

var DEFAULTS = { platform: "ps5", region: "us", edition: "standard", tab: "ranking", preload: false, cancel: false, resale: false };
var TABS = ["ranking", "terms", "timeline"];

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
  if (!regionById(state.region)) { bad.push("bölge"); state.region = DEFAULTS.region; }
  if (!editionById(state.edition)) { bad.push("sürüm"); state.edition = DEFAULTS.edition; }
  if (TABS.indexOf(state.tab) === -1) state.tab = DEFAULTS.tab;
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Bağlantıdaki bilinmeyen " + parsed.bad.join(", ") + ", bu sayfa varsayılanlara sıfırlandı. Satın alımınızı aşağıdan seçin.";
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
    if (label) label.textContent = "En iyi kanal \u00b7 Özet";
    if (text) text.textContent = result.headline + ", " + result.region.label + " bölgesinde " + result.edition.label + " siparişi için 100 üzerinden " + result.best.score + " puan alıyor; " + (result.best.strengths.join(" ve ").toLowerCase() || "genel denge") + " alanında önde.";
    if (verdictEl) verdictEl.textContent = "En iyi: " + result.best.channel.short + " \u2014 " + result.best.score + "/100";
  }

  var answer = $("[data-preorder-answer]");
  if (answer) {
    answer.innerHTML = "GTA 6 ön siparişleri 2026'da açıldı ve oyun <time datetime=\"2026-11-19\">19 Kasım 2026</time> tarihinde çıktı. Her kanal aynı oyun için ücret alır, bu yüzden koşullara göre alın: girdilerinize en uygun seçenek <strong>" + esc(result.headline) + "</strong>. " + esc(result.reason);
  }

  var outLabel = $("[data-output-label]");
  if (outLabel) outLabel.textContent = result.platform.label + " için ön sipariş kanalları";
  var out = $("[data-output-panel]");
  if (out) {
    var html = "";
    if (state.tab === "ranking") {
      html += '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">En iyi kanal</p>' +
        '<h3 class="verdict-title">' + esc(result.best.channel.short) + '<span class="unit"> / ' + result.best.score + ', 100 üzerinden</span></h3>' +
        '<p class="verdict-desc">' + esc(result.best.channel.note) + '</p></div></div>';
      // Ranked channels as milestone rows (styled in main.css); the winner
      // is first and already named in the verdict above.
      html += '<ol class="milestone-list">' + result.ranked.map(function (c, i) {
        var s = c.strengths.length ? "Şu alanlarda güçlü: " + c.strengths.join(" ve ").toLowerCase() + ". " : "";
        var r = c.risks.length ? "Şu alanlarda zayıf: " + c.risks.join(" ve ").toLowerCase() + ". " : "";
        return '<li><div class="milestone-row"><span><strong>' + (i + 1) + '. ' + esc(c.channel.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(s + r) + 'Güven: ' + esc(CONFIDENCE_LABEL[c.confidence]) + '.</span></span>' +
          '<span class="axis-score">' + c.score + '/100</span></div></li>';
      }).join("") + '</ol>';
    } else if (state.tab === "terms") {
      html += '<p class="verdict-desc">Kazanan puanın ardındaki maddeler. Sayıyı değil, bunları okuyun.</p>';
      html += result.best.axes.map(function (a) {
        return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span>' +
          '<span class="axis-track"><span class="axis-fill" style="width:' + Math.round(a.raw * 10) + '%"></span></span>' +
          '<span class="axis-score">' + a.raw + '/10</span></div>' +
          '<p class="field-hint">' + esc(a.detail) + ' Ağırlık %' + a.weight + '.</p></div>';
      }).join("");
      html += '<ul class="sources-list">' + result.best.channel.terms.map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join("") + '</ul>';
    } else {
      // H7: the "open" milestone (25 June 2026) is dropped — expected, not confirmed.
      var entries = result.timeline.filter(function (e) { return e.id !== "open"; });
      html += '<p class="verdict-desc">Ön siparişler 2026'da açıldı. Açılış bu zaman çizelgesinde kilometre taşı olarak gösterilmiyor.</p>';
      html += '<ol class="milestone-list">' + entries.map(function (e) {
        var badge = e.confidence === "confirmed"
          ? '<span class="badge badge-blue">Doğrulandı</span>'
          : '<span class="badge badge-muted">' + esc(CONFIDENCE_LABEL[e.confidence]) + '</span>';
        var when = e.iso ? '<time datetime="' + e.iso + '">' + esc(e.when) + '</time>' : esc(e.when);
        return '<li><div class="milestone-row"><span><strong>' + esc(e.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(e.detail) + '</span></span>' +
          '<span>' + when + ' \u00b7 ' + badge + '</span></div></li>';
      }).join("") + '</ol>';
    }
    var shareText = result.platform.label + " üzerinde en iyi GTA 6 ön sipariş kanalı: " + result.best.channel.short;
    html += '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı X\'te paylaş" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText + " (" + result.best.score + "/100)") + '&url=' + encodeURIComponent(shareUrl()) + '">X\'te paylaş</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı Reddit\'te paylaş" href="https://www.reddit.com/submit?title=' + encodeURIComponent(shareText + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a></div>';
    out.innerHTML = html;
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText + ". " + result.reason + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var risks = $("[data-risk-flags]");
  if (risks) {
    if (result.riskFlags.length) {
      risks.hidden = false;
      risks.innerHTML = '<h2 class="eyebrow-muted" style="text-align:left">Bu seçimde ne ters gidebilir</h2>' +
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
  if (shareX) shareX.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent(result.platform.label + " üzerinde en iyi GTA 6 ön sipariş kanalı: " + result.best.channel.short + " (" + result.best.score + "/100). ToolWools'ta GTA 6 Ön Sipariş Karar Masası.") + "&url=" + encodeURIComponent(shareUrl());
  var shareR = $("[data-share-reddit]");
  if (shareR) shareR.href = "https://www.reddit.com/submit?title=" + encodeURIComponent(result.platform.label + " üzerinde en iyi GTA 6 ön sipariş kanalı: " + result.best.channel.short + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = "En iyi ön sipariş kanalı: " + result.headline + ", 100 üzerinden " + result.best.score + ". " + result.reason;
  syncUrl();
}

function copyText(text, btn, labelSel) {
  function done(label) {
    if (!btn) return;
    var labelEl = labelSel ? btn.querySelector(labelSel) : null;
    if (labelEl) labelEl.textContent = label;
    window.setTimeout(function () {
      if (labelEl) labelEl.textContent = btn.dataset.defaultLabel || "Kopyala";
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
    try { document.execCommand("copy"); done("Kopyalandı!"); } catch (e) { done("Kopyalama başarısız"); }
    document.body.removeChild(ta);
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(function () { done("Kopyalandı!"); }, fallback);
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
