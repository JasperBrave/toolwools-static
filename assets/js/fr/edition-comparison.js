// edition-comparison.js — GTA 6 Edition Picker page logic.
// Uses the ported edition engine (assets/js/engines/edition-engine.js).
// AUDIT FIX H3: Ultimate uplift is 25.0% (99.99 / 79.99), never 42%.
// State lives in the URL (?platform=&profile=&uplift=&p=&view=) so results
// are shareable. Defaults match the source route loaderDeps:
// PlayStation 5, story plus casual online, 30% uplift ceiling.
import { EDITIONS, BONUSES, PROFILES, CATEGORY_LABEL as CATEGORY_LABEL_EN, CONFIDENCE_LABEL as CONFIDENCE_LABEL_EN, PLATFORM_LABEL, evaluateEditions as evaluateEditionsEn, profileById, platformById } from "../engines/fr/edition-engine.js";

var CATEGORY_LABEL = { cash: "Monnaie du jeu", vehicles: "Véhicules et biens immobiliers", cosmetics: "Cosmétiques et personnalisation", earlyAccess: "Accès anticipé et avance", storyExtras: "Extras du mode Histoire" };
var CONFIDENCE_LABEL = { confirmed: "Confirmé par Rockstar", reported: "Signalé / listé, pas entièrement détaillé", precedent: "Précédent des éditions GTA V et RDR2" };
var EDITION_LABEL = { standard: "Standard Edition", ultimate: "Ultimate Edition" };
var EDITION_NOTE = { standard: "Le jeu complet : campagne d'histoire complète et accès complet au mode en ligne. Chaque niveau supérieur ajoute des bonus, jamais d'histoire supplémentaire.", ultimate: "Le plus gros pack numérique : une subvention monétaire plus importante, des déblocages immobiliers ou de véhicules supplémentaires et les avantages d'accès les plus précoces, quand un niveau en propose." };
var BONUS_LABEL = { "full-story": "Campagne d'histoire complète", "full-online": "Accès complet en ligne", "cash-mid": "Injection d'argent en ligne", "cash-large": "Subvention monétaire plus importante", "starter-vehicle": "Pack de véhicule de démarrage", "property-unlock": "Avance immobilière ou commerciale", "cosmetic-pack": "Pack de tenues et de livrées", "cosmetic-exclusive": "Ensemble cosmétique exclusif au niveau", "early-access": "Fenêtre d'accès anticipé", "bonus-week": "Semaines de récompenses bonus" };
var BONUS_DETAIL = { "full-story": "Chaque édition contient la campagne solo complète. Aucune édition ne bloque les missions d'histoire, les personnages ou les fins, c'est la chose la plus importante à savoir avant de payer plus.", "full-online": "Le mode en ligne est inclus dans le jeu de base sur chaque plateforme. Les niveaux supérieurs accélèrent votre démarrage ; ils ne débloquent aucun contenu que les joueurs Standard ne peuvent pas atteindre en jouant.", "cash-mid": "Une subvention unique de monnaie du jeu pour le personnage en ligne. Réelle le premier jour, sans importance en quelques semaines pour quiconque joue régulièrement, et sans valeur dans le mode Histoire.", "cash-large": "La subvention monétaire du niveau supérieur est la raison principale pour laquelle les farmeurs passent au niveau supérieur. Comparez-la à ce que le même supplément achèterait plus tard comme pack de monnaie, car l'économie du jeu est l'endroit où elle sera dépensée.", "starter-vehicle": "Une voiture ou deux, données au garage en ligne à la première connexion. GTA V et RDR2 faisaient tous les deux cela. Honnêtement utile pour les dix premières heures de jeu en ligne, puis cosmétique.", "property-unlock": "Les niveaux supérieurs incluaient historiquement un bien immobilier ou une entreprise qui demanderait sinon plusieurs sessions à se payer. C'est le bonus avec la plus longue durée d'utilisation pour les joueurs en ligne.", "cosmetic-pack": "Vêtements, tatouages et livrées de véhicules exclusifs aux niveaux payants. Aucun effet sur le gameplay. La valeur ici dépend entièrement de l'importance que vous accordez à l'apparence de votre personnage.", "cosmetic-exclusive": "Des objets qui ne sont ensuite pas vendus dans le jeu. La seule catégorie de bonus qui reste vraiment inaccessible plus tard, c'est pourquoi les acheteurs qui tiennent à l'exclusivité les valorisent.", "early-access": "Certains niveaux supérieurs de Rockstar ont débloqué avant la sortie Standard. Rockstar n'a pas dit si GTA 6 le fera ; considérez-le comme possible, pas comme promis.", "bonus-week": "Un boost temporaire des revenus ou des récompenses en ligne pendant les premières semaines. Limité dans le temps par conception, donc il ne vaut le coup que si vous jouez beaucoup au lancement." };
var PROFILE_LABEL = { "story-only": "Mode Histoire uniquement", "online-casual": "Histoire plus en ligne occasionnel", "online-grinder": "En ligne dès le premier jour", "undecided": "Pas encore sûr" };
var PROFILE_NOTE = { "story-only": "Vous voulez la campagne et vous ne toucherez probablement jamais au mode en ligne.", "online-casual": "La campagne d'abord, puis un peu de jeu en ligne avec des amis à votre rythme.", "online-grinder": "Vous allez farmer l'économie en ligne pendant la semaine de lancement.", "undecided": "Vous voulez un choix par défaut raisonnable sans trop vous engager." };
function mapEdition(e) { var c = Object.assign({}, e); c.label = EDITION_LABEL[e.id] || e.label; c.note = EDITION_NOTE[e.id] || e.note; return c; }
function mapBonus(b) { var c = Object.assign({}, b); c.label = BONUS_LABEL[b.id] || b.label; c.detail = BONUS_DETAIL[b.id] || b.detail; return c; }
function mapProfile(p) { var c = Object.assign({}, p); c.label = PROFILE_LABEL[p.id] || p.label; c.note = PROFILE_NOTE[p.id] || p.note; return c; }
function evaluateEditions(input) { var r = evaluateEditionsEn(input); r.profile = mapProfile(r.profile); r.ranked = r.ranked.map(function (s) { var c = Object.assign({}, s); c.edition = mapEdition(s.edition); c.bonuses = s.bonuses.map(mapBonus); c.addedOverPrevious = s.addedOverPrevious.map(mapBonus); return c; }); r.best = r.ranked[0]; if (r.best.edition.id === "standard") r.reason = "Pour un " + buyerPhrase(r.profile) + ", rien au-dessus de Standard n'ajoute assez de valeur utilisable pour justifier le supplément à votre plafond de " + r.upliftTolerance + " %, et Standard contient déjà toute l'histoire et tout le mode en ligne."; else r.reason = "Elle ajoute environ " + r.best.utilityDelta + " points d'utilité pondérée au-dessus de Standard pour un supplément de " + r.best.edition.upliftPercent + " %, soit environ " + r.best.utilityPerUpliftPoint + " points par tranche de 10 % dépensée, ce qui est le meilleur rendement de tous les niveaux disponibles sur " + r.platformLabel + " dans votre plafond de " + r.upliftTolerance + " %."; r.upgradeMath = r.upgradeMath.map(function (m) { var mm, tm; if (m.title === "Buying up from Standard to Ultimate") { mm = m.body.match(/costs about ([\d.]+)% more than Standard and adds roughly ([\d.]+) points/); return { title: "Passer de Standard à Ultimate", body: mm ? "Ultimate coûte environ " + mm[1] + " % de plus que Standard et ajoute environ " + mm[2] + " points d'utilité pondérée pour votre façon de jouer. Si ce chiffre est inférieur à 3, le passage est cosmétique pour vous ; au-dessus de 6, c'est l'utilité la moins chère de la page." : m.body }; } if (m.title === "Standard now, upgrade later") return { title: "Standard maintenant, passer au niveau supérieur plus tard", body: "Les mises à niveau numériques de niveau sur console sont normalement vendues en boutique au prix de la différence, donc acheter Standard puis passer au niveau supérieur plus tard coûte le plus souvent le même montant total, avec un bémol : les semaines de bonus de la fenêtre de lancement et tout avantage d'accès anticipé expirent, et vous ne pouvez pas les réclamer rétroactivement." }; if (m.title === "Buying currency instead of a tier") return { title: "Acheter de la monnaie plutôt qu'un niveau", body: "La comparaison honnête pour un farmeur n'est pas un supplément de niveau contre Standard, mais un supplément de niveau contre l'achat de la même quantité de monnaie du jeu après le lancement, une fois que vous connaissez les prix réels dans le jeu. Si la monnaie est la seule raison de votre mise à niveau, attendez." }; if (m.title === "Your stated ceiling") { tm = m.body.match(/go to ([\d.]+)% over Standard/); return { title: "Votre plafond déclaré", body: tm ? "Vous avez dit que vous iriez jusqu'à " + tm[1] + " % au-dessus de Standard. Tout ce qui dépasse est marqué dans le tableau plutôt que caché, pour que vous puissiez voir ce que vous ne voulez pas acheter." : m.body }; } return m; }); return r; }

var DEFAULTS = { platform: "ps5", profile: "online-casual", uplift: 30, p: [], view: "verdict" };
var PLATFORMS = ["ps5", "xbox"];
var VIEWS = ["verdict", "matrix", "upgrade"];
var VIEW_LABEL = { verdict: "Quoi acheter", matrix: "Matrice des bonus", upgrade: "Calculs de mise à niveau" };
var CATEGORIES = Object.keys(CATEGORY_LABEL);
var CONF_SHORT = { confirmed: "Confirmé", reported: "Signalé", precedent: "Précédent" };

function $(sel, root) { return (root || document).querySelector(sel); }
function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

function readState() {
  var q = new URLSearchParams(window.location.search);
  var upliftParam = q.get("uplift");
  var upliftRaw = upliftParam === null ? NaN : Number(upliftParam);
  var pRaw = q.get("p") || "";
  var state = {
    platform: PLATFORMS.indexOf(q.get("platform")) !== -1 ? q.get("platform") : DEFAULTS.platform,
    profile: profileById(q.get("profile")) ? q.get("profile") : DEFAULTS.profile,
    uplift: Number.isFinite(upliftRaw) ? Math.max(0, Math.min(200, Math.round(upliftRaw))) : DEFAULTS.uplift,
    p: pRaw.split(",").map(function (s) { return s.trim(); }).filter(function (s) { return CATEGORIES.indexOf(s) !== -1; }),
    view: VIEWS.indexOf(q.get("view")) !== -1 ? q.get("view") : DEFAULTS.view
  };
  var bad = [];
  if (q.get("platform") && PLATFORMS.indexOf(q.get("platform")) === -1) bad.push("platform");
  if (q.get("profile") && !profileById(q.get("profile"))) bad.push("profile");
  if (q.get("uplift") !== null && !Number.isFinite(Number(q.get("uplift")))) bad.push("uplift ceiling");
  if (q.get("view") && VIEWS.indexOf(q.get("view")) === -1) bad.push("view");
  return { state: state, bad: bad };
}

var parsed = readState();
var state = parsed.state;
var notice = $("[data-input-notice]");
if (notice && parsed.bad.length) {
  notice.textContent = "Inconnu " + parsed.bad.join(", ") + " dans le lien, donc cette page est revenue à la configuration par défaut. Choisissez vos options ci-dessous.";
  notice.classList.add("show");
}

var platformSel = $("[data-platform-select]");
var profileSel = $("[data-profile-select]");
var profileNote = $("[data-profile-note]");
var upliftInput = $("[data-uplift-input]");
var upliftValue = $("[data-uplift-value]");
var priorityBtns = $all("[data-priority]");
var viewBtns = $all("[data-view-button]");

function shareUrl() {
  var p = new URLSearchParams({ platform: state.platform, profile: state.profile, uplift: String(state.uplift) });
  if (state.p.length) p.set("p", state.p.join(","));
  if (state.view !== "verdict") p.set("view", state.view);
  return window.location.origin + window.location.pathname + "?" + p.toString();
}
function syncUrl() {
  var p = new URLSearchParams({ platform: state.platform, profile: state.profile, uplift: String(state.uplift) });
  if (state.p.length) p.set("p", state.p.join(","));
  if (state.view !== "verdict") p.set("view", state.view);
  window.history.replaceState(null, "", window.location.pathname + "?" + p.toString());
}
var BUYER_PHRASE = {
  "story-only": "joueur concentré uniquement sur l'histoire",
  "online-casual": "joueur d'histoire et de jeu en ligne occasionnel",
  "online-grinder": "joueur en ligne dès le premier jour",
  "undecided": "acheteur indécis"
};
function buyerPhrase(profile) {
  return BUYER_PHRASE[profile.id] || profile.label.toLowerCase();
}
function shareTitle(result) {
  return "Meilleure édition GTA 6 pour un " + buyerPhrase(result.profile) + " : " + result.best.edition.label + " (" + result.best.score + "/100). Sélecteur d'édition GTA 6 sur ToolWools.";
}
function xUrl(result) {
  return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(shareTitle(result)) + "&url=" + encodeURIComponent(shareUrl());
}
function redditUrl(result) {
  return "https://www.reddit.com/submit?title=" + encodeURIComponent(result.best.edition.label + " - meilleure édition GTA 6 pour un " + buyerPhrase(result.profile) + " (GTA 6)") + "&url=" + encodeURIComponent(shareUrl());
}

function iconFor(tone) {
  return tone === "ready"
    ? '<svg class="verdict-icon tone-ready" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>'
    : tone === "upgrade"
      ? '<svg class="verdict-icon tone-upgrade" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>'
      : '<svg class="verdict-icon tone-borderline" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
}
function toneOf(result) {
  if (result.best.score >= 85) return "ready";
  if (result.best.score >= 60) return "borderline";
  return "upgrade";
}

function verdictHtml(result) {
  var items = result.ranked.map(function (e, i) {
    var desc;
    if (e.edition.upliftPercent === 0) {
      desc = "Prix de base. Jeu complet.";
    } else {
      desc = "+" + e.edition.upliftPercent + " % au-dessus de Standard · ajoute " + e.utilityDelta + " points d'utilité pondérée (" + e.utilityPerUpliftPoint + " par tranche de 10 % dépensée).";
    }
    if (!e.available) desc += " Non vendu sur " + result.platformLabel + ".";
    else if (e.overBudget) desc += " Au-dessus du plafond que vous avez fixé.";
    desc += " Confiance : " + CONFIDENCE_LABEL[e.confidence] + ".";
    return "<li><strong>" + (i + 1) + ". " + esc(e.edition.label) + " | " + e.score + "/100</strong> | " + esc(desc) + "</li>";
  }).join("");
  return '<div class="verdict-body"><div><p class="verdict-kicker tone-ready">Meilleur rapport · ' + result.best.score + "/100</p>"
    + '<h3 class="verdict-title">' + esc(result.best.edition.label) + "</h3>"
    + '<p class="verdict-desc">' + esc(result.best.edition.note) + "</p></div></div>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">Éditions classées</p><ul>' + items + "</ul></div>"
    + '<dl class="stat-grid">'
    + "<div><dt>Score de valeur</dt><dd>" + result.best.score + "/100</dd></div>"
    + "<div><dt>Supplément par rapport à Standard</dt><dd>+" + result.best.edition.upliftPercent + " %</dd></div>"
    + "<div><dt>Utilité ajoutée</dt><dd>+" + result.best.utilityDelta + " pts</dd></div>"
    + "<div><dt>Votre plafond</dt><dd>" + result.upliftTolerance + " %</dd></div></dl>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + xUrl(result) + '">Partager sur X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function matrixHtml(result) {
  var items = result.best.bonuses.map(function (b) {
    return "<li><strong>" + esc(b.label) + " | " + b.utility + " pts</strong> | " + esc(CATEGORY_LABEL[b.category]) + " · " + esc(CONFIDENCE_LABEL[b.confidence]) + ". " + esc(b.detail) + "</li>";
  }).join("");
  var added = result.best.addedOverPrevious.length
    ? '<p class="verdict-desc">Nouveau dans ce niveau : ' + esc(result.best.addedOverPrevious.map(function (b) { return b.label; }).join(", ")) + ".</p>"
    : "";
  return '<p class="verdict-desc">Ce que ' + esc(result.best.edition.label) + " offre, classé selon sa valeur pour un " + esc(buyerPhrase(result.profile)) + ". La confiance est indiquée sur chaque bonus.</p>"
    + '<div class="upgrade-box"><p class="eyebrow-muted">' + esc(result.best.edition.label) + " bonus</p><ul>" + items + "</ul></div>" + added
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + xUrl(result) + '">Partager sur X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function upgradeHtml(result) {
  var items = result.upgradeMath.map(function (m) {
    return "<li><strong>" + esc(m.title) + "</strong>, " + esc(m.body) + "</li>";
  }).join("");
  return '<div class="upgrade-box"><p class="eyebrow-muted">Calculs de mise à niveau</p><ul>' + items + "</ul></div>"
    + '<div class="share-row">'
    + '<button type="button" class="btn-chip" data-copy-verdict><span data-copy-verdict-label>Copier le verdict</span></button>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + xUrl(result) + '">Partager sur X</a>'
    + '<a class="btn-chip" target="_blank" rel="noopener noreferrer" href="' + redditUrl(result) + '">Reddit</a>'
    + "</div>";
}

function render() {
  var result = evaluateEditions({ platform: state.platform, profile: state.profile, upliftTolerance: state.uplift, priorities: state.p });
  var tone = toneOf(result);

  if (platformSel) platformSel.value = state.platform;
  if (profileSel) profileSel.value = state.profile;
  if (profileNote) profileNote.textContent = result.profile.note;
  if (upliftInput) upliftInput.value = String(state.uplift);
  if (upliftValue) upliftValue.textContent = state.uplift + "%";
  priorityBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(state.p.indexOf(b.dataset.priority) !== -1)); });
  viewBtns.forEach(function (b) { b.setAttribute("aria-pressed", String(b.dataset.viewButton === state.view)); });

  var label = $("[data-output-label]");
  if (label) label.textContent = "Éditions sur " + result.platformLabel;

  var tldr = $("[data-tldr-card]");
  if (tldr) {
    tldr.dataset.tone = tone;
    var tLabel = $("[data-tldr-label]", tldr);
    var tText = $("[data-tldr-text]", tldr);
    var tVerdict = $("[data-tldr-verdict]", tldr);
    var tIcon = $("[data-tldr-icon]", tldr);
    if (tLabel) tLabel.textContent = result.best.edition.label + " · En bref";
    if (tText) tText.textContent = result.best.edition.label + " est le meilleur rapport pour un " + buyerPhrase(result.profile) + " sur " + result.platformLabel + " avec un plafond de " + result.upliftTolerance + " % : " + result.best.score + "/100, ajoutant " + result.best.utilityDelta + " points d'utilité pondérée au-dessus de Standard pour un supplément de " + result.best.edition.upliftPercent + " %.";
    if (tVerdict) tVerdict.textContent = result.best.edition.label + " | " + result.best.score + "/100 de valeur pour le supplément";
    if (tIcon) tIcon.innerHTML = iconFor(tone);
  }

  var shortEl = $("[data-short-answer-text]");
  if (shortEl) {
    shortEl.innerHTML = "Chaque édition de GTA 6 inclut la campagne d'histoire complète et le mode en ligne complet, le jeu est sorti le 19 novembre 2026 à 05:00 UTC et aucun niveau ne vend d'histoire supplémentaire. Sur " + esc(result.platformLabel) + ", pour un " + esc(buyerPhrase(result.profile)) + " avec un plafond de " + result.upliftTolerance + " % au-dessus de Standard, le meilleur rapport est <strong>" + esc(result.best.edition.label) + "</strong>. " + esc(result.reason);
  }

  var out = $("[data-output-panel]");
  if (out) {
    out.innerHTML = state.view === "matrix" ? matrixHtml(result) : state.view === "upgrade" ? upgradeHtml(result) : verdictHtml(result);
    var copyBtn = $("[data-copy-verdict]", out);
    if (copyBtn) copyBtn.addEventListener("click", function () { copyText(shareText(result), copyBtn, "[data-copy-verdict-label]"); });
  }

  var linkInput = $("[data-share-link-input]");
  if (linkInput) linkInput.value = shareUrl();
  var shareLinks = $all(".share-panel .share-row a");
  if (shareLinks[0]) shareLinks[0].href = xUrl(result);
  if (shareLinks[1]) shareLinks[1].href = redditUrl(result);

  var live = $("[data-live-region]");
  if (live) live.textContent = "Meilleur rapport : " + result.best.edition.label + ", " + result.best.score + " sur 100, pour un " + buyerPhrase(result.profile) + " sur " + result.platformLabel + " avec un plafond de " + result.upliftTolerance + " pour cent au-dessus de Standard.";
  syncUrl();
}

function shareText(result) {
  return shareTitle(result) + " " + shareUrl();
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
if (profileSel) profileSel.addEventListener("change", function () { state.profile = profileSel.value; render(); });
if (upliftInput) upliftInput.addEventListener("input", function () { state.uplift = Number(upliftInput.value); render(); });
priorityBtns.forEach(function (b) {
  b.addEventListener("click", function () {
    var c = b.dataset.priority;
    var i = state.p.indexOf(c);
    if (i === -1) state.p.push(c); else state.p.splice(i, 1);
    render();
  });
});
viewBtns.forEach(function (b) {
  b.addEventListener("click", function () { state.view = b.dataset.viewButton; render(); });
});
var copyLinkBtn = $("[data-copy-link]");
if (copyLinkBtn) copyLinkBtn.addEventListener("click", function () { copyText(shareUrl(), copyLinkBtn, "[data-copy-link-label]"); });

render();
