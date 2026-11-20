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
import { PLATFORMS, REGIONS, EDITIONS, CHANNELS, AXIS_LABELS, AXIS_DETAIL, CONFIDENCE_LABEL as CONFIDENCE_LABEL_EN, rankChannels as rankChannelsEn, platformById, regionById, editionById } from "../engines/fr/preorder-engine.js";

var CONFIDENCE_LABEL = { confirmed: "Confirmé", "platform-norm": "Norme de la plateforme", "publisher-norm": "Norme de l'éditeur", estimated: "Estimé" };
var REGION_LABEL = { us: "États-Unis", ca: "Canada", uk: "Royaume-Uni", eu: "Union européenne", au: "Australie et Nouvelle-Zélande", "in": "Inde", br: "Brésil" };
var REGION_NOTE = { us: "La politique de la boutique gouverne, pas la loi. Xbox est la plus indulgente des trois plateformes.", ca: "Reflète la politique de la boutique américaine ; les règles provinciales atteignent rarement les précommandes numériques.", uk: "Les Consumer Contracts Regulations donnent un droit d'annulation de 14 jours pour les achats numériques non téléchargés.", eu: "Le droit de rétractation de 14 jours pour les ventes à distance est la position d'annulation la plus forte de ce tableau.", au: "Les garanties des consommateurs sont fortes, mais le changement d'avis sur une précommande repose quand même sur la politique de la boutique.", "in": "La politique de la boutique gouverne. Le stock physique est mince, donc le numérique est normalement le seul canal.", br: "Le Code de défense du consommateur accorde un droit de rétractation de 7 jours pour les achats à distance." };
var PLATFORM_PRELOAD_NOTE = { ps5: "PlayStation ouvre normalement le préchargement 48 heures avant la sortie, et une précommande numérique devient non remboursable au moment où ce téléchargement démarre.", xbox: "Xbox ouvre les préchargements tôt, souvent 7 à 10 jours avant, et maintient son flux de remboursement en libre-service pour les précommandes non jouées jusqu'au jour de la sortie.", pc: "Les boutiques PC échelonnent le téléchargement quelques jours avant. Le launcher propre de Rockstar et Steam préchargent tous les deux ; aucune sortie PC physique n'est attendue." };
var EDITION_NOTE = { standard: "Le jeu de base uniquement. Rien à perdre si vous changez de canal plus tard.", deluxe: "Niveau intermédiaire : monnaie du jeu et packs cosmétiques liés au compte qui les a achetés.", ultimate: "Le plus gros pack de bonus, donc les récompenses liées au canal coûtent le plus cher si vous les abandonnez." };
var CHANNEL_LABEL = { "platform-digital": "Boutique de la plateforme (PS Store / Xbox Store)", "publisher-direct": "Directement chez l'éditeur (Rockstar Store)", "retailer-code": "Code numérique de détaillant (Amazon, GameStop, Best Buy)", "retailer-disc": "Disque de détaillant, expédié", "bigbox-disc": "Retrait en grande surface", "marketplace-key": "Revendeur de clés du marché gris" };
var CHANNEL_SHORT = { "platform-digital": "Numérique plateforme", "publisher-direct": "Direct éditeur", "retailer-code": "Code détaillant", "retailer-disc": "Disque, expédié", "bigbox-disc": "Retrait en magasin", "marketplace-key": "Clé marché gris" };
var CHANNEL_NOTE = { "platform-digital": "La voie standard. Préchargement le plus rapide, valeur de revente nulle, et la fenêtre de remboursement se ferme au moment où le téléchargement commence.", "publisher-direct": "Les bonus sont accordés ici de la façon la plus fiable, car l'éditeur possède l'autorisation et les escalades de support ne sautent pas d'intermédiaire.", "retailer-code": "Le meilleur équilibre entre protection des prix et annulabilité, au détriment du timing du préchargement, le code arrive souvent juste avant la sortie.", "retailer-disc": "Annulez jusqu'à l'expédition, gardez la garantie de prix et vendez ou prêtez ensuite. Vous attendez la livraison et installez quand même depuis le disque.", "bigbox-disc": "La position d'annulation la plus sûre de toutes, vous n'avez pas payé chez de nombreuses chaînes avant le retrait, plus l'accès au lancement de minuit et la pleine valeur de revente.", "marketplace-key": "Le prix affiché le plus bas, les pires conditions. Clés verrouillées par région, risque de révocation et aucun support de l'éditeur si l'autorisation est retirée." };
var CHANNEL_TERMS = { "platform-digital": ["Le droit au remboursement prend fin quand le préchargement commence à se télécharger, pas le jour de la sortie.", "Les bonus de précommande atterrissent sur le compte qui a passé la commande et ne peuvent pas être déplacés.", "Les baisses de prix de la boutique avant la sortie ne vous sont pas remboursées automatiquement."], "publisher-direct": ["L'autorisation est liée à votre compte Rockstar, où vit aussi le personnage en ligne.", "Les boutiques des éditeurs honorent historiquement les annulations avant la sortie plus volontiers que les boutiques de consoles.", "Vous n'achetez pas de clé échangeable, donc il n'y a pas de voie de revente."], "retailer-code": ["Les codes sont souvent émis 24 à 72 heures avant le lancement, ce qui peut pousser votre préchargement au-delà de la fenêtre de la plateforme.", "La plupart des grands détaillants appliquent des garanties de prix de précommande : vous payez le prix le plus bas vu avant la sortie.", "Les bonus exclusifs aux détaillants sont séparés des bonus de plateforme et ne se cumulent peut-être pas."], "retailer-disc": ["Annulable sans pénalité jusqu'à l'expédition du colis, normalement 2 à 4 jours avant la sortie.", "Les installations depuis un disque téléchargent quand même un correctif du premier jour, donc prévoyez quand même la bande passante.", "Une livraison qui glisse au-delà du jour du lancement est le vrai risque, pas l'argent."], "bigbox-disc": ["Les réservations ne sont généralement qu'un acompte ou gratuites, et l'annulation en partant est la norme.", "Vous installez depuis le disque le jour du lancement, donc rien ne précharge à l'avance.", "Les steelbooks exclusifs au magasin ou les objets bonus sont la raison habituelle de choisir ce canal."], "marketplace-key": ["Les clés peuvent être verrouillées par région ou révoquées, et une clé révoquée signifie normalement pas de remboursement et pas de jeu.", "Les bonus de précommande manquent souvent avec les clés de tiers.", "Le support de l'éditeur n'aide pas pour une autorisation qu'il n'a pas vendue."] };
var AXIS_LABELS_FR = { cancel: "Annulabilité", priceProtection: "Protection contre les baisses de prix", preload: "Préparation du préchargement", bonus: "Conservation des bonus", resale: "Valeur de revente" };
var AXIS_DETAIL_FR = { cancel: "La facilité avec laquelle vous pouvez vous retirer avant la sortie sans perdre d'argent.", priceProtection: "Si une baisse de prix avant la sortie vous est remboursée ou créditée.", preload: "À quel point le téléchargement peut être échelonné tôt pour que vous jouiez au déverrouillage.", bonus: "La fiabilité avec laquelle les récompenses de précommande et d'édition atterrissent sur votre compte.", resale: "Si vous pouvez prêter, échanger ou vendre la copie après le lancement." };
function fmtFR(d) { return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }); }
function mapPlatform(p) { return { id: p.id, label: p.label, preloadLeadDays: p.preloadLeadDays, preloadNote: PLATFORM_PRELOAD_NOTE[p.id] || p.preloadNote, discAvailable: p.discAvailable }; }
function mapRegion(r) { return { id: r.id, label: REGION_LABEL[r.id] || r.label, consumerLaw: r.consumerLaw, note: REGION_NOTE[r.id] || r.note }; }
function mapEdition(e) { return { id: e.id, label: e.label, bonusWeight: e.bonusWeight, note: EDITION_NOTE[e.id] || e.note }; }
function mapChannel(c) { return { id: c.id, label: CHANNEL_LABEL[c.id] || c.label, short: CHANNEL_SHORT[c.id] || c.short, platforms: c.platforms, physical: c.physical, axes: c.axes, confidence: c.confidence, sourceType: c.sourceType, note: CHANNEL_NOTE[c.id] || c.note, terms: CHANNEL_TERMS[c.id] || c.terms }; }
function mapRanked(e) { var channel = mapChannel(e.channel); var axes = e.axes.map(function (a) { return { id: a.id, label: AXIS_LABELS_FR[a.id] || a.label, raw: a.raw, weight: a.weight, detail: AXIS_DETAIL_FR[a.id] || a.detail }; }); var sorted = axes.slice().sort(function (a, b) { return b.raw - a.raw; }); return { channel: channel, score: e.score, axes: axes, strengths: sorted.slice(0, 2).filter(function (a) { return a.raw >= 6; }).map(function (a) { return a.label; }), risks: sorted.slice(-2).filter(function (a) { return a.raw <= 4; }).map(function (a) { return a.label; }), confidence: e.confidence }; }
function mapTimeline(platform, region) { var launch = new Date("2026-11-19T05:00:00Z"); var preload = new Date(launch.getTime() - platform.preloadLeadDays * 86400000); var days = platform.preloadLeadDays === 1 ? "jour" : "jours"; return [ { id: "open", label: "Précommandes ouvertes", when: "25 juin 2026", iso: "2026-06-25", detail: "Rockstar a ouvert les précommandes de Grand Theft Auto VI via les boutiques des plateformes et les partenaires commerciaux. Chaque canal de cette page est déjà en ligne.", confidence: "confirmed" }, { id: "price-watch", label: "Fenêtre de protection des prix", when: "Maintenant jusqu'à " + fmtFR(launch), detail: "Les garanties de prix de précommande des détaillants courent jusqu'à la sortie. Si le prix baisse une fois dans cette fenêtre, un canal garanti rembourse la différence, une boutique de plateforme généralement pas.", confidence: "platform-norm" }, { id: "preload", label: platform.label + "-Préchargement prévu pour être débloqué", when: fmtFR(preload) + " (environ " + platform.preloadLeadDays + " " + days + " avant)", iso: preload.toISOString().slice(0, 10), detail: PLATFORM_PRELOAD_NOTE[platform.id] || "", confidence: "platform-norm" }, { id: "cancel-cutoff", label: "Date limite pratique d'annulation", when: fmtFR(preload) + " pour le numérique, date d'expédition pour le physique", iso: preload.toISOString().slice(0, 10), detail: "Les précommandes numériques ne sont plus remboursables dès que le préchargement démarre. " + (REGION_NOTE[region.id] || ""), confidence: "estimated" }, { id: "launch", label: "Sortie", when: "19 novembre 2026, minuit HE", iso: "2026-11-19", detail: "Le déverrouillage est simultané dans le monde entier à 00:00 HE, donc une copie préchargée joue des heures avant un disque récupéré le matin du lancement dans la plupart des régions d'Europe et d'Asie.", confidence: "confirmed" } ]; }
function mapRiskFlags(flags, platform, region, edition) { return flags.map(function (f) { if (f.title === "Your refund window closes at preload, not at launch") return { title: "Votre fenêtre de remboursement se ferme au préchargement, pas au lancement", body: "Sur " + platform.label + ", une précommande numérique n'est plus remboursable à partir du moment où le téléchargement commence, environ " + platform.preloadLeadDays + " " + (platform.preloadLeadDays === 1 ? "jour" : "jours") + " avant la sortie. Si la possibilité de partir compte plus que de jouer au déverrouillage, ne lancez pas le préchargement.", severity: f.severity }; if (f.title === "A late code can cost you the preload") return { title: "Un code tardif peut vous coûter le préchargement", body: "Les codes numériques des détaillants sont généralement livrés 24 à 72 heures avant la sortie. Cela se situe dans la fenêtre de préchargement sur Xbox et peut être juste sur PlayStation, donc vous téléchargerez peut-être le jour du lancement.", severity: f.severity }; if (f.title === "Discs still download a day-one patch") return { title: "Les disques téléchargent quand même un correctif du premier jour", body: "Un disque supprime le téléchargement de base, mais pas le correctif de lancement. Prévoyez quand même la bande passante et attendez-vous à installer un moment avant de jouer.", severity: f.severity }; if (f.title === "Grey-market keys carry revocation risk") return { title: "Les clés du marché gris comportent un risque de révocation", body: "Une clé révoquée signifie normalement pas de jeu et pas de remboursement, et le support de l'éditeur n'intervient pas pour une autorisation qu'il n'a pas vendue. L'économie vaut rarement l'exposition sur un titre du jour du lancement.", severity: f.severity }; if (f.title.indexOf(" bonuses lock to the buying account") !== -1) return { title: edition.label + " : bonus liés au compte acheteur", body: (EDITION_NOTE[edition.id] || "") + " Changer de canal ou de plateforme après la commande signifie racheter le pack de bonus, donc décidez de la plateforme avant l'édition.", severity: f.severity }; if (f.title === "You have a statutory cancellation right — use it before downloading") return { title: "Vous avez un droit légal d'annulation, utilisez-le avant le téléchargement", body: (REGION_NOTE[region.id] || "") + " Ce droit ne survit normalement que tant que le contenu numérique n'est pas téléchargé, la même date limite que celle appliquée par la boutique.", severity: f.severity }; return f; }); }
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
    answer.innerHTML = "Les précommandes de GTA 6 devraient ouvrir le <time datetime=\"2026-06-25\">25 juin 2026</time> (non confirmé par Rockstar) et le jeu sort le <time datetime=\"2026-11-19\">19 novembre 2026</time>. Chaque canal facture le même jeu, donc achetez selon les conditions : le meilleur choix pour vos entrées est <strong>" + esc(result.headline) + "</strong>. " + esc(result.reason);
  }

  var outLabel = $("[data-output-label]");
  if (outLabel) outLabel.textContent = "Canaux de précommande pour " + result.platform.label;
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
      // H7: the "open" milestone (25 June 2026) is dropped — expected, not confirmed.
      var entries = result.timeline.filter(function (e) { return e.id !== "open"; });
      html += '<p class="verdict-desc">Ouverture des précommandes attendue le 25 juin 2026, non confirmée par Rockstar, donc elle ne figure pas parmi les jalons confirmés.</p>';
      html += '<ol class="milestone-list">' + entries.map(function (e) {
        var badge = e.confidence === "confirmed"
          ? '<span class="badge badge-blue">Confirmé</span>'
          : '<span class="badge badge-muted">' + esc(CONFIDENCE_LABEL[e.confidence]) + '</span>';
        var when = e.iso ? '<time datetime="' + e.iso + '">' + esc(e.when) + '</time>' : esc(e.when);
        return '<li><div class="milestone-row"><span><strong>' + esc(e.label) + '</strong><br>' +
          '<span class="field-hint">' + esc(e.detail) + '</span></span>' +
          '<span>' + when + ' \u00b7 ' + badge + '</span></div></li>';
      }).join("") + '</ol>';
    }
    var shareText = "Meilleur canal de précommande GTA 6 sur " + result.platform.label + " : " + result.best.channel.short;
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
  if (shareX) shareX.href = "https://twitter.com/intent/tweet?text=" + encodeURIComponent("Meilleur canal de précommande GTA 6 sur " + result.platform.label + " : " + result.best.channel.short + " (" + result.best.score + "/100). Bureau de décision de précommande GTA 6 sur ToolWools.") + "&url=" + encodeURIComponent(shareUrl());
  var shareR = $("[data-share-reddit]");
  if (shareR) shareR.href = "https://www.reddit.com/submit?title=" + encodeURIComponent("Meilleur canal de précommande GTA 6 sur " + result.platform.label + " : " + result.best.channel.short + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());

  var live = $("[data-live-region]");
  if (live) live.textContent = "Meilleur canal de précommande : " + result.headline + ", " + result.best.score + " sur 100. " + result.reason;
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
