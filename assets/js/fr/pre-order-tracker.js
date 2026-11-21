// pre-order-tracker.js — Où acheter GTA 6 page logic.
// Uses the ported preorder engine (assets/js/engines/preorder-engine.js),
// imported by absolute path so the module resolves the same at any depth.
// State lives in the URL (?platform=&region=&edition=&tab=&preload=&cancel=&resale=)
// so results are shareable.
// Iteration 3 (2026-11-21): reframed as a buy-now desk for the released game
// (launched 19 Nov 2026, PS5 + Xbox only). The engine timeline no longer
// carries an "open" milestone; the timeline below shows the download window,
// the cancellation cutoff and the launch. Pre-order framing removed.
// The launch countdown is rendered by the shared countdown.js from
// window.TOOLWOOLS_LAUNCH_UTC (Nov 19, 2026 05:00 UTC); this file does not
// own the timer.
import { PLATFORMS, REGIONS, EDITIONS, CHANNELS, AXIS_LABELS, AXIS_DETAIL, CONFIDENCE_LABEL as CONFIDENCE_LABEL_EN, rankChannels as rankChannelsEn, platformById, regionById, editionById } from "../engines/fr/preorder-engine.js";

var CONFIDENCE_LABEL = { confirmed: "Confirmé", "platform-norm": "Norme de la plateforme", "publisher-norm": "Norme de l'éditeur", estimated: "Estimé" };
var REGION_LABEL = { us: "États-Unis", ca: "Canada", uk: "Royaume-Uni", eu: "Union européenne", au: "Australie et Nouvelle-Zélande", "in": "Inde", br: "Brésil" };
var REGION_NOTE = { us: "La politique de la boutique gouverne, pas la loi. Xbox est la plus indulgente des deux plateformes.", ca: "Reflète la politique de la boutique américaine ; les règles provinciales atteignent rarement les précommandes numériques.", uk: "Les Consumer Contracts Regulations donnent un droit d'annulation de 14 jours pour les achats numériques non téléchargés.", eu: "Le droit de rétractation de 14 jours pour les ventes à distance est la position d'annulation la plus forte de ce tableau.", au: "Les garanties des consommateurs sont fortes, mais le changement d'avis sur une précommande repose quand même sur la politique de la boutique.", "in": "La politique de la boutique gouverne. Le stock physique est mince, donc le numérique est normalement le seul canal.", br: "Le Code de défense du consommateur accorde un droit de rétractation de 7 jours pour les achats à distance." };
var PLATFORM_PRELOAD_NOTE = { ps5: "PlayStation préparait normalement le téléchargement environ 48 heures avant la sortie, et une commande numérique devient non remboursable au moment où ce téléchargement démarre.", xbox: "Xbox préparait les téléchargements tôt, souvent une semaine ou plus avant la sortie, et maintient son flux de remboursement en libre-service pour les commandes non jouées jusqu'au jour de la sortie." };
var EDITION_NOTE = { standard: "Le jeu de base uniquement. Rien à perdre si vous changez de canal plus tard.", ultimate: "Le plus gros pack de bonus, donc les récompenses liées au canal coûtent le plus cher si vous les abandonnez." };
var CHANNEL_LABEL = { "platform-digital": "Boutique de la plateforme (PS Store / Xbox Store)", "retailer-code": "Code numérique de détaillant (Amazon, GameStop, Best Buy)", "retailer-disc": "Disque de détaillant, expédié", "bigbox-disc": "Retrait en grande surface" };
var CHANNEL_SHORT = { "platform-digital": "Numérique plateforme", "retailer-code": "Code détaillant", "retailer-disc": "Disque, expédié", "bigbox-disc": "Retrait en magasin" };
var CHANNEL_NOTE = { "platform-digital": "La voie standard. Le moyen le plus rapide de commencer à jouer, valeur de revente nulle, et la fenêtre de remboursement se ferme dès que le téléchargement commence.", "retailer-code": "Le meilleur équilibre entre protection des prix et annulabilité ; vérifiez quand le code arrive — les délais de livraison varient.", "retailer-disc": "Annulez jusqu'à l'expédition, gardez la garantie de prix et vendez ou prêtez ensuite. Vous attendez la livraison et installez quand même depuis le disque.", "bigbox-disc": "La position d'annulation la plus sûre de toutes, vous n'avez pas payé chez de nombreuses chaînes avant le retrait, plus l'accès au lancement de minuit et la pleine valeur de revente." };
var CHANNEL_TERMS = { "platform-digital": ["Le droit au remboursement prend fin quand le téléchargement commence, pas le jour de la sortie.", "Les bonus d'édition atterrissent sur le compte qui a passé la commande et ne peuvent pas être déplacés.", "Les baisses de prix de la boutique avant la sortie ne vous sont pas remboursées automatiquement."], "retailer-code": ["Les codes sont souvent émis juste avant la sortie, ce qui peut laisser trop peu de temps pour télécharger avant de vouloir jouer.", "La plupart des grands détaillants appliquent des garanties de prix : vous payez le prix le plus bas vu avant la sortie.", "Les bonus exclusifs aux détaillants sont séparés des bonus de plateforme et ne se cumulent peut-être pas."], "retailer-disc": ["Annulable sans pénalité jusqu'à l'expédition du colis.", "Les installations depuis un disque téléchargent quand même un correctif du premier jour, donc prévoyez quand même la bande passante.", "Une livraison qui glisse au-delà du jour du lancement est le vrai risque, pas l'argent."], "bigbox-disc": ["Les réservations ne sont généralement qu'un acompte ou gratuites, et l'annulation en partant est la norme.", "Vous installez depuis le disque le jour du lancement, donc rien ne se télécharge à l'avance.", "Les steelbooks exclusifs au magasin ou les objets bonus sont la raison habituelle de choisir ce canal."] };
var AXIS_LABELS_FR = { cancel: "Annulabilité", priceProtection: "Protection contre les baisses de prix", preload: "Préparation au téléchargement", bonus: "Conservation des bonus", resale: "Valeur de revente" };
var AXIS_DETAIL_FR = { cancel: "La facilité avec laquelle vous pouvez vous retirer avant la sortie sans perdre d'argent.", priceProtection: "Si une baisse de prix avant la sortie vous est remboursée ou créditée.", preload: "À quelle vitesse tu peux commencer à jouer après l'achat.", bonus: "La fiabilité avec laquelle les récompenses de précommande et d'édition atterrissent sur votre compte.", resale: "Si vous pouvez prêter, échanger ou vendre la copie après le lancement." };
function fmtFR(d) { return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); }
function mapPlatform(p) { return { id: p.id, label: p.label, preloadLeadDays: p.preloadLeadDays, preloadNote: PLATFORM_PRELOAD_NOTE[p.id] || p.preloadNote, discAvailable: p.discAvailable }; }
function mapRegion(r) { return { id: r.id, label: REGION_LABEL[r.id] || r.label, consumerLaw: r.consumerLaw, note: REGION_NOTE[r.id] || r.note }; }
function mapEdition(e) { return { id: e.id, label: e.label, bonusWeight: e.bonusWeight, note: EDITION_NOTE[e.id] || e.note }; }
function mapChannel(c) { return { id: c.id, label: CHANNEL_LABEL[c.id] || c.label, short: CHANNEL_SHORT[c.id] || c.short, platforms: c.platforms, physical: c.physical, axes: c.axes, confidence: c.confidence, sourceType: c.sourceType, note: CHANNEL_NOTE[c.id] || c.note, terms: CHANNEL_TERMS[c.id] || c.terms }; }
function mapRanked(e) { var channel = mapChannel(e.channel); var axes = e.axes.map(function (a) { return { id: a.id, label: AXIS_LABELS_FR[a.id] || a.label, raw: a.raw, weight: a.weight, detail: AXIS_DETAIL_FR[a.id] || a.detail }; }); var sorted = axes.slice().sort(function (a, b) { return b.raw - a.raw; }); return { channel: channel, score: e.score, axes: axes, strengths: sorted.slice(0, 2).filter(function (a) { return a.raw >= 6; }).map(function (a) { return a.label; }), risks: sorted.slice(-2).filter(function (a) { return a.raw <= 4; }).map(function (a) { return a.label; }), confidence: e.confidence }; }
function mapTimeline(platform, region) { return [ { id: "preload", label: "Préchargement " + platform.label + ", terminé avant la sortie", when: "Préparé environ " + platform.preloadLeadDays + " jours avant la sortie (norme de plateforme)", iso: null, detail: PLATFORM_PRELOAD_NOTE[platform.id] || "", confidence: "platform-norm" }, { id: "cancel-cutoff", label: "Date limite pratique d'annulation", when: "Début du téléchargement pour le numérique, date d'expédition pour le physique", iso: null, detail: "Les commandes numériques ont cessé d'être remboursables une fois le téléchargement commencé." + (REGION_NOTE[region.id] || ""), confidence: "estimated" }, { id: "launch", label: "Sortie", when: "19 novembre 2026, minuit ET", iso: "2026-11-19", detail: "Le déblocage a été simultané dans le monde entier à 00:00 ET, donc une copie téléchargée s'est jouée des heures avant un disque récupéré le matin du lancement dans la majeure partie de l'Europe et de l'Asie.", confidence: "confirmed" } ]; }
function mapRiskFlags(flags, platform, region, edition) { return flags.map(function (f) { if (f.title === "Your refund window closes when the download starts") return { title: "Ta fenêtre de remboursement se ferme quand le téléchargement commence", body: "Sur " + platform.label + ", une commande numérique cesse d'être remboursable dès que le téléchargement commence. Si garder la possibilité de te retirer compte plus que jouer tout de suite, ne lance pas le téléchargement.", severity: f.severity }; if (f.title === "A late code can cost you the instant download") return { title: "Un code tardif peut te coûter le téléchargement immédiat", body: "Les codes numériques des vendeurs sont généralement livrés juste avant la sortie. Cela peut laisser trop peu de temps pour télécharger avant de vouloir jouer, donc tu seras peut-être en train de télécharger le jour du lancement.", severity: f.severity }; if (f.title === "Discs still download a day-one patch") return { title: "Les disques téléchargent quand même un correctif du premier jour", body: "Un disque supprime le téléchargement de base, mais pas le correctif de lancement. Prévoyez quand même la bande passante et attendez-vous à installer un moment avant de jouer.", severity: f.severity }; if (f.title.indexOf(" bonuses lock to the buying account") !== -1) return { title: edition.label + " : bonus liés au compte acheteur", body: (EDITION_NOTE[edition.id] || "") + " Changer de canal ou de plateforme après la commande signifie racheter le pack de bonus, donc décidez de la plateforme avant l'édition.", severity: f.severity }; if (f.title === "You have a statutory cancellation right — use it before downloading") return { title: "Vous avez un droit légal d'annulation, utilisez-le avant le téléchargement", body: (REGION_NOTE[region.id] || "") + " Ce droit ne survit normalement que tant que le contenu numérique n'est pas téléchargé, la même date limite que celle appliquée par la boutique.", severity: f.severity }; return f; }); }
function rankChannels(input) { var r = rankChannelsEn(input); var platform = mapPlatform(r.platform); var region = mapRegion(r.region); var edition = mapEdition(r.edition); var ranked = r.ranked.map(function (e) { return mapRanked(e); }); var best = ranked[0]; var runnerUp = ranked[1] || null; var wanted = []; if (input.prefs.wantsPreload) wanted.push("jouer immédiatement au déverrouillage"); if (input.prefs.wantsCancel) wanted.push("garder la possibilité d'annuler"); if (input.prefs.wantsResale) wanted.push("valeur de revente ou de prêt"); var priorities = wanted.length === 0 ? "aucune préférence forte sauf la valeur" : wanted.length === 1 ? wanted[0] : wanted.slice(0, -1).join(", ") + " et " + wanted[wanted.length - 1]; var headline = best.channel.short + " sur " + platform.label; var reason = "Parce que vous nous avez dit que " + priorities + " compte, " + best.channel.label + " obtient " + best.score + " sur 100 pour une commande " + edition.label + " en " + region.label + ", en tête pour " + (best.strengths.join(" et ") || "l'équilibre général") + (runnerUp ? ", devant " + runnerUp.channel.short + " avec " + runnerUp.score : "") + "."; return { platform: platform, region: region, edition: edition, prefs: r.prefs, weights: r.weights, ranked: ranked, best: best, runnerUp: runnerUp, headline: headline, reason: reason, riskFlags: mapRiskFlags(r.riskFlags, platform, region, edition), timeline: mapTimeline(platform, region) }; }

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
  if (!regionById(state.region)) { bad.push("region"); state.region = DEFAULTS.region; }
  if (!editionById(state.edition)) { bad.push("edition"); state.edition = DEFAULTS.edition; }
  if (TABS.indexOf(state.tab) === -1) state.tab = DEFAULTS.tab;
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Inconnu " + parsed.bad.map(function (b) { return b === "platform" ? "Plateforme" : b === "region" ? "Région" : "Édition"; }).join(", ") + " dans le lien, donc cette page est revenue aux valeurs par défaut. Choisissez votre achat ci-dessous.";
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
fillSelect(platformSel, PLATFORMS.map(mapPlatform), state.platform);
fillSelect(regionSel, REGIONS.map(mapRegion), state.region);
fillSelect(editionSel, EDITIONS.map(mapEdition), state.edition);
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
    if (label) label.textContent = "Meilleur canal · En bref";
    if (text) text.textContent = result.headline + " obtient " + result.best.score + " sur 100 pour une commande " + result.edition.label + " en " + result.region.label + ", en tête pour " + (result.best.strengths.join(" et ") || "l'équilibre général") + ".";
    if (verdictEl) verdictEl.textContent = "Meilleur : " + result.best.channel.short + " | " + result.best.score + "/100";
  }

  var answer = $("[data-preorder-answer]");
  if (answer) {
    answer.innerHTML = "GTA 6 est sorti le <time datetime=\"2026-11-19\">19 novembre 2026</time> sur PlayStation 5 et Xbox Series X|S. Chaque canal facture le même jeu, donc achetez selon les conditions : le meilleur choix pour vos entrées est Disque, expédié sur PlayStation 5. Parce que vous nous avez dit qu'aucune préférence forte au-delà de la valeur ne compte, le disque détaillant, expédié obtient 65,2 sur 100 pour une commande Standard aux États-Unis, en tête pour l'annulabilité et la protection contre les baisses de prix, devant le retrait en magasin à 63,4.<strong>" + esc(result.headline) + "</strong>. " + esc(result.reason);
  }

  var outLabel = $("[data-output-label]");
  if (outLabel) outLabel.textContent = "Canaux d'achat pour " + result.platform.label;
  var out = $("[data-output-panel]");
  if (out) {
    var html = "";
    if (state.tab === "ranking") {
      html += '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">Meilleur canal</p>' +
        '<h3 class="verdict-title">' + esc(result.best.channel.short) + '<span class="unit"> / ' + result.best.score + ' sur 100</span></h3>' +
        '<p class="verdict-desc">' + esc(result.best.channel.note) + '</p></div></div>';
      // Ranked channels as milestone rows (styled in main.css); the winner
      // is first and already named in the verdict above.
      html += '<ol class="milestone-list">' + result.ranked.map(function (c, i) {
        var s = c.strengths.length ? "Fort pour " + c.strengths.join(" et ") + ". " : "";
        var r = c.risks.length ? "Faible pour " + c.risks.join(" et ") + ". " : "";
        return '<li><div class="milestone-row"><span><strong>' + (i + 1) + '. ' + esc(c.channel.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(s + r) + 'Confiance : ' + esc(CONFIDENCE_LABEL[c.confidence]) + '.</span></span>' +
          '<span class="axis-score">' + c.score + '/100</span></div></li>';
      }).join("") + '</ol>';
    } else if (state.tab === "terms") {
      html += '<p class="verdict-desc">Les clauses derrière le score gagnant. Lisez celles-ci, pas le chiffre.</p>';
      html += result.best.axes.map(function (a) {
        return '<div><div class="axis-row"><span class="axis-label">' + esc(a.label) + '</span>' +
          '<span class="axis-track"><span class="axis-fill" style="width:' + Math.round(a.raw * 10) + '%"></span></span>' +
          '<span class="axis-score">' + a.raw + '/10</span></div>' +
          '<p class="field-hint">' + esc(a.detail) + ' Pondération ' + a.weight + ' %.</p></div>';
      }).join("");
      html += '<ul class="sources-list">' + result.best.channel.terms.map(function (t) {
        return '<li>' + esc(t) + '</li>';
      }).join("") + '</ul>';
    } else {
      // The engine timeline no longer carries an "open" milestone.
      var entries = result.timeline.filter(function (e) { return e.id !== "open"; });
      html += '<p class="verdict-desc">Le jeu est sorti le 19 novembre 2026. Voici les jalons qui comptent encore quand tu achètes.</p>';
      html += '<ol class="milestone-list">' + entries.map(function (e) {
        var badge = e.confidence === "confirmed"
          ? '<span class="badge badge-blue">Confirmé</span>'
          : '<span class="badge badge-muted">' + esc(CONFIDENCE_LABEL[e.confidence]) + '</span>';
        var when = e.iso ? '<time datetime="' + e.iso + '">' + esc(e.when) + '</time>' : esc(e.when);
        return '<li><div class="milestone-row"><span><strong>' + esc(e.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(e.detail) + '</span></span>' +
          '<span>' + when + ' \u00b7 ' + badge + '</span></div></li>';
      }).join("") + '</ol>';
      html += '<p class="verdict-desc"><strong>Tous les jalons sont terminés.</strong> Les précommandes ont ouvert le 25 juin 2026, les préchargements ont été préparés dans les jours précédant la sortie — environ 48 heures avant sur PlayStation 5, environ 10 jours avant sur Xbox — et GTA 6 est sorti le 19 novembre 2026. Il ne reste rien à attendre : acheter maintenant signifie télécharger le jeu complet, jusqu\'à 212 Go plus le correctif du premier jour, alors consultez d\'abord le <a href="/fr/tools/download-time">calculateur de temps de téléchargement</a>.</p>';
    }
    var shareText = "Meilleur endroit pour acheter GTA 6 sur " + result.platform.label + " : " + result.best.channel.short;
    html += '<div class="share-row">' +
      '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur X" href="https://twitter.com/intent/tweet?text=' + encodeURIComponent(shareText + " (" + result.best.score + "/100)") + '&url=' + encodeURIComponent(shareUrl()) + '">Partager sur X</a>' +
      '<a class="btn-chip" target="_blank" rel="noopener noreferrer" aria-label="Partager le verdict sur Reddit" href="https://www.reddit.com/submit?title=' + encodeURIComponent(shareText + " (GTA 6)") + '&url=' + encodeURIComponent(shareUrl()) + '">Reddit</a></div>';
    out.innerHTML = html;
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText + ". " + result.reason + " " + shareUrl(), copyBtn, "[data-copy-verdict-label]"); });
  }

  var risks = $("[data-risk-flags]");
  if (risks) {
    if (result.riskFlags.length) {
      risks.hidden = false;
      risks.innerHTML = '<h2 class="eyebrow-muted" style="text-align:left">Ce qui pourrait mal tourner avec ce choix</h2>' +
        '<ul class="milestone-list">' + result.riskFlags.map(function (f) {
          var sev = { high: "Élevé", medium: "Moyen", low: "Faible" }[f.severity] || f.severity;
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
  if (shareX) shareX.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Meilleur endroit pour acheter GTA 6 sur " + result.platform.label + " : " + result.best.channel.short + " (" + result.best.score + "/100). Où acheter GTA 6 : éditions et canaux comparés sur ToolWools.") + "&url=" + encodeURIComponent(shareUrl());
  var shareR = $("[data-share-reddit]");
  if (shareR) shareR.href = "https://www.reddit.com/submit?title=" + encodeURIComponent("Meilleur endroit pour acheter GTA 6 sur " + result.platform.label + " : " + result.best.channel.short + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = "Meilleur canal d'achat : " + result.headline + ", " + result.best.score + " sur 100. " + result.reason;
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
