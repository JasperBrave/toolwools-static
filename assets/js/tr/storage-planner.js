// storage-planner.js — GTA 6 Storage Planner page logic.
// Math follows the source route (src/routes/tools.storage-planner.tsx):
// subtotal = base + patch + dlc; headroom = round(subtotal * buffer / 100);
// total = subtotal + headroom. Base install default is 212 GB (AUDIT FIX H2:
// one install-size constant shared with download-time, readiness and the
// registry copy). State lives in the URL (?base=&patch=&dlc=&buffer=&platform=).
var DEFAULTS = { base: 212, patch: 2.8, dlc: 30, buffer: 20, platform: "pc" };
var PLATFORMS = {
  pc: { label: "PC", usableGB: 0, note: "Sürücünüz, kurallarınız: aşağıdaki sayı GTA 6'nın tam olarak ihtiyacı olan miktar." },
  ps5: { label: "PS5", usableGB: 667, note: "Sony'nin 825 GB SSD'si, sistem ayrımından sonra 667 GB kullanılabilir gösteriyor." },
  xsx: { label: "Xbox Series X", usableGB: 802, note: "Xbox'ın 1 TB SSD'si, sistem ayrımından sonra 802 GB kullanılabilir gösteriyor." },
};
var PLATFORM_ROWS = [
  { p: "PC", drive: "NVMe / SATA SSD'niz", reserve: "—", usable: 0 },
  { p: "PS5 (825 GB)", drive: "Özel Sony SSD", reserve: "158 GB sistem", usable: 667 },
  { p: "PS5 Slim (1 TB)", drive: "Özel Sony SSD", reserve: "158 GB sistem", usable: 842 },
  { p: "Xbox Series X (1 TB)", drive: "NVMe genişletme kartı", reserve: "198 GB sistem", usable: 802 },
  { p: "Xbox Series S (512 GB)", drive: "NVMe genişletme kartı", reserve: "148 GB sistem", usable: 364 },
];

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

function clampNum(v, min, max, fallback) {
  if (v === null || v === undefined || v === "") return fallback;
  var n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}
function readState() {
  var q = new URLSearchParams(window.location.search);
  var platform = q.get("platform");
  return {
    base: clampNum(q.get("base"), 50, 300, DEFAULTS.base),
    patch: clampNum(q.get("patch"), 0, 100, DEFAULTS.patch),
    dlc: clampNum(q.get("dlc"), 0, 200, DEFAULTS.dlc),
    buffer: clampNum(q.get("buffer"), 0, 50, DEFAULTS.buffer),
    platform: Object.prototype.hasOwnProperty.call(PLATFORMS, platform) ? platform : DEFAULTS.platform,
  };
}
var state = readState();

var baseRange = $("[data-base-range]");
var baseValue = $("[data-base-value]");
var patchRange = $("[data-patch-range]");
var patchValue = $("[data-patch-value]");
var dlcRange = $("[data-dlc-range]");
var dlcValue = $("[data-dlc-value]");
var bufferRange = $("[data-buffer-range]");
var bufferValue = $("[data-buffer-value]");
var platformButtons = $all("[data-platform-button]");

function compute() {
  var subtotal = state.base + state.patch + state.dlc;
  var headroom = Math.round(subtotal * (state.buffer / 100));
  return { subtotal: subtotal, headroom: headroom, total: subtotal + headroom };
}
// Display convention: 1 decimal. Binary floating point makes e.g.
// 364 - 293.8 print as 70.1999... instead of 70.2, so every computed GB
// value is rounded to 1 decimal at the point it is rendered.
function fmt1(v) { return String(Math.round(v * 10) / 10); }
function shareUrl() {
  var p = new URLSearchParams({ base: String(state.base), patch: String(state.patch), dlc: String(state.dlc), buffer: String(state.buffer), platform: state.platform });
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ base: String(state.base), patch: String(state.patch), dlc: String(state.dlc), buffer: String(state.buffer), platform: state.platform });
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
function toneOf(total) {
  if (total <= 250) return "ready";
  if (total <= 400) return "borderline";
  return "upgrade";
}
function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}

function render() {
  var r = compute();
  var tone = toneOf(r.total);
  var meta = PLATFORMS[state.platform];

  if (baseRange) baseRange.value = String(state.base);
  if (baseValue) baseValue.textContent = state.base + " GB";
  if (patchRange) patchRange.value = String(state.patch);
  if (patchValue) patchValue.textContent = state.patch + " GB";
  if (dlcRange) dlcRange.value = String(state.dlc);
  if (dlcValue) dlcValue.textContent = state.dlc + " GB";
  if (bufferRange) bufferRange.value = String(state.buffer);
  if (bufferValue) bufferValue.textContent = state.buffer + "%";
  platformButtons.forEach(function (b) {
    b.setAttribute("aria-pressed", String(b.dataset.platformButton === state.platform));
  });

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var label = $("[data-tldr-label]", tldr);
    var text = $("[data-tldr-text]", tldr);
    var verdictEl = $("[data-tldr-verdict]", tldr);
    var iconSlot = $("[data-tldr-icon]", tldr);
    var tldrText = meta.label + " üzerinde GTA 6 için " + fmt1(r.total) + " GB boş bırakın: " + state.base + " GB kurulum + " + state.patch + " GB yama + " + state.dlc + " GB DLC + " + r.headroom + " GB pay.";
    if (label) label.textContent = fmt1(r.total) + " GB boş bırakın · Özet";
    if (text) text.textContent = tldrText;
    if (verdictEl) verdictEl.textContent = fmt1(r.total) + " GB önerilen boş alan";
    if (iconSlot) iconSlot.innerHTML = iconFor(tone);
  }

  var out = $("[data-output-panel]");
  if (out) {
    var pct = function (v) { return Math.round(Math.max(0, Math.min(100, (v / r.total) * 100)) * 10) / 10; };
    var consoleLine = state.platform === "pc" ? "" :
      '<p class="verdict-desc">' + meta.note + ' GTA 6 sonrası diğer oyunlar için <strong>' + fmt1(Math.max(0, meta.usableGB - r.total)) + ' GB</strong> kalıyor.</p>';
    out.innerHTML =
      '<div class="verdict-body">' + iconFor(tone) +
      '<div><p class="verdict-kicker tone-' + tone + '">Önerilen boş alan</p>' +
      '<h3 class="verdict-title">' + fmt1(r.total) + '<span class="unit"> GB</span></h3>' +
      '<p class="verdict-desc">' + fmt1(r.subtotal) + ' GB içerik + gelecek yamalar için ' + r.headroom + ' GB güvenli pay.</p>' +
      consoleLine + '</div></div>' +
      '<div><div class="stack-bar" role="img" aria-label="Dağılım: Temel kurulum ' + state.base + ' GB, İlk gün yaması ' + state.patch + ' GB, DLC ve sezonluk içerik ' + state.dlc + ' GB, Güncelleme payı ' + r.headroom + ' GB">' +
      '<span class="seg-purple" style="width:' + pct(state.base) + '%"></span>' +
      '<span class="seg-pink" style="width:' + pct(state.patch) + '%"></span>' +
      '<span class="seg-blue" style="width:' + pct(state.dlc) + '%"></span>' +
      '<span class="seg-muted" style="width:' + pct(r.headroom) + '%"></span>' +
      '</div></div>' +
      '<dl class="stat-grid">' +
      '<div><dt>Temel kurulum</dt><dd>' + state.base + ' GB</dd></div>' +
      '<div><dt>İlk gün yaması</dt><dd>' + state.patch + ' GB</dd></div>' +
      '<div><dt>DLC + sezonluk</dt><dd>' + state.dlc + ' GB</dd></div>' +
      '<div><dt>Güncelleme payı</dt><dd>' + r.headroom + ' GB</dd></div>' +
      '</dl>' +
      '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Kararı kopyala</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı X\'te paylaş" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent("GTA 6 yaklaşık " + fmt1(r.total) + " GB boş alan") + '&url=' + encodeURIComponent(shareUrl()) + '">X\'te paylaş</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Kararı Reddit\'te paylaş" href="https://www.reddit.com/submit?title=' + encodeURIComponent("GTA 6 yaklaşık " + fmt1(r.total) + " GB boş alan") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a>' +
      '</div>';
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(), copyBtn, "[data-copy-verdict-label]"); });
  }

  // Platform table follows the live total.
  var table = $("[data-platform-table]");
  if (table) {
    table.innerHTML = PLATFORM_ROWS.map(function (row) {
      var after = row.usable === 0 ? "Sürücüye bağlı" : fmt1(row.usable - r.total) + " GB boş alan";
      return "<tr><th scope=\"row\" class=\"mono\">" + row.p + "</th><td>" + row.drive + "</td><td>" + row.reserve + "</td><td class=\"mono\">" + after + "</td></tr>";
    }).join("");
  }
  var tableNote = $("[data-platform-note]");
  if (tableNote) tableNote.textContent = "Mevcut " + fmt1(r.total) + " GB planınızla GTA 6'nın diğer oyunlara ne kadar yer bıraktığı.";

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();

  var live = $("[data-live-region]");
  if (live) live.textContent = "Önerilen boş alan " + fmt1(r.total) + " gigabayt: " + state.base + " gigabayt kurulum, " + state.patch + " gigabayt yama, " + state.dlc + " gigabayt DLC, " + r.headroom + " gigabayt pay.";
  syncUrl();
}

function shareText() {
  var r = compute();
  return "GTA 6 yaklaşık " + fmt1(r.total) + " GB boş alan istiyor: " + state.base + " GB kurulum + " + state.patch + " GB yama + " + state.dlc + " GB DLC + " + r.headroom + " GB pay. Alanınızı planlayın: " + shareUrl();
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

if (baseRange) baseRange.addEventListener("input", function () { state.base = Number(baseRange.value); render(); });
if (patchRange) patchRange.addEventListener("input", function () { state.patch = Number(patchRange.value); render(); });
if (dlcRange) dlcRange.addEventListener("input", function () { state.dlc = Number(dlcRange.value); render(); });
if (bufferRange) bufferRange.addEventListener("input", function () { state.buffer = Number(bufferRange.value); render(); });
platformButtons.forEach(function (b) { b.addEventListener("click", function () { state.platform = b.dataset.platformButton; render(); }); });
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
