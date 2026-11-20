# ToolWools — audit & fix report

Tree verified: **2026-11-20** (re-verified fresh; the 2026-11-17 audit is
superseded by the numbers below). Tree hash at verification:
`807ca499687cfe4735172eb2e1fa7992` (after the clampNum fix, the axe
fixes, and the traffic-readiness fixes below — commit `32902df`).

## Scope

- 280 pages: 40 per locale — en (root) + es, pt, de, fr, tr, ar (RTL).
- 304 JavaScript files, 11 calculator engines, sitemap index + 7
  per-locale sitemaps, hreflang incl. x-default, localized JSON-LD.

## Verification results (2026-11-20, local tree)

| Check | Result |
|---|---|
| `verify_seo.py` (280 pages) | **0 errors, 0 warnings** |
| `verify_b.py` | **0 errors**, 12 warnings (em-dashes in visible copy — style, not defects) |
| `verify_c.py` | 2 errors — **stale checker**: it expects a flat `sitemap.xml` with 34 URLs; the site now ships a sitemap **index** (7 entries) + 7 per-locale sitemaps × 40 URLs. Verified by hand: 40/40 per locale. |
| `node --check` (304 JS files) | **0 failures** |
| Static crawl (HTTP, all 280 pages) | **280/280 HTTP 200**, 20,692 internal refs checked, 0 zero-byte pages |
| Browser interaction checks (Playwright, localhost) | **42/42 passed** (see below) |
| Browser matrix (every page × 375px/1280px, axe) | **363/363 reports ok=true, 0 console errors, 0 overflow** (see axe notes below) |

## Interaction checks passed (42/42)

- Bottleneck calculator: **23% CPU bottleneck** (RTX 4070 + R5 5600X,
  1440p) — identical in EN, ES, DE (labels translated, number identical).
- FPS calculator: **71 avg / 51 1% low** (RTX 4070 + R5 7600X, 1440p High)
  — identical in EN and ES.
- VRAM calculator: 12 GB total at 1440p Ultra. Economy calculator:
  **1,436,842/hr**. Readiness: **97/100, grade S**. Download time:
  **~4h 35m at 100 Mbps**. Storage planner: **234 GB free**.
- Interactive map renders (38 chips), share-link copy puts the permalink
  on the clipboard, ICS download is a valid VCALENDAR (631 B), trailer
  dialog loads the YouTube embed, single-file homepage clean at 375px
  and 1280px over both `file://` and localhost, homepage clean at both
  widths, 0 console errors throughout.

## Bug found & fixed during verification (2026-11-20)

**`clampNum` null bug — 3 calculators × 7 locales (21 files).**
`clampNum` read URL params with `Number(v)`; a missing param is
`null`, and `Number(null)` is `0`, so bare loads (no query string)
computed with zeros instead of the documented defaults:

- Readiness: 73/100 grade B instead of **97/100 grade S**
  (storage 500→0 GB, speed 150→0 Mbps).
- Download time: **22h 13m** instead of **~4h 35m**
  (100→5 Mbps, 150→20 GB, 80%→40% efficiency).
- Storage planner: **50 GB** instead of **234 GB free**
  (150→50 GB base, patch/DLC/headroom → 0).

Fix (one line, same in all 21 files — `assets/js/{,ar,de,es,fr,pt,tr/}
{readiness-score,download-time,storage-planner}.js`):

```js
if (v === null || v === undefined || v === "") return fallback;
```

added before `Number(v)`. All 21 files re-verified with
`node --check` and re-tested live in the browser — all three now return
the pre-rendered defaults. The economy calculator already used a
null-safe `numOr` and was unaffected. Shared links (which carry the
params in the URL) were never affected.

## Axe findings from the browser matrix (2026-11-20)

The matrix ran axe on every tool page at 375px. Three systematic
rules fired (127 serious/critical instances total). Two are fixed
below; the third is a design decision left open.

**Fixed — `aria-allowed-attr` (critical, 7 pages).** The storage
planner's platform toggle buttons carried `aria-selected`, which is
not allowed on a plain `<button>` (`aria-pressed` alone is correct).
Removed the one `setAttribute("aria-selected", …)` line from
`assets/js/{,ar,de,es,fr,pt,tr/}storage-planner.js`. Re-checked with
axe in all 7 locales: gone. (`aria-selected` on the interactive map's
*tabs* is legitimate and untouched.)

**Fixed — `scrollable-region-focusable` (serious, ~112 pages).** The
`<pre class="methodology-formula">` formula blocks scroll horizontally
at phone width but were not keyboard-focusable. `theme.js` (loads on
every page, 7 locale copies) now gives every `<pre>` a `tabindex="0"`.
Re-checked with axe on fps / bottleneck / economy (EN + ES): gone.
All tool pages at 375px were re-run after the fix.

**Open — `color-contrast` (serious, 7 pages).** The bottleneck
calculator's breadcrumb links and one guide-card tag use muted text
below the 4.5:1 ratio. Fixing it means changing the muted text color
in the shared stylesheet — a visible design change — so it is left
for an explicit design decision rather than changed silently here.

## Known non-issues (verified, not defects)

- `trailers/` pages contain `<iframe src="about:blank">` — a lazy-load
  dialog facade; the Watch button sets the real YouTube embed URL on
  click (verified live).
- YouTube thumbnail requests fail in sandboxed browsers
  (`ERR_TUNNEL_CONNECTION_FAILED`); the thumbnail URLs return HTTP 200.
- `verify_c.py` sitemap errors — stale checker, see table above.
- 27 zero-byte `*.new` files + one `*.b64` file in the tree are staging
  debris from interrupted landings; excluded from this repo via
  `.gitignore`, never served as pages.

## Traffic-readiness fixes (2026-11-20, post-launch)

GTA 6 launched 19 Nov 2026; the static HTML still showed the build-time
countdown (02d 07h 43m 21s, "Release Countdown", "launches in 2 days").
The live toolwools.com has ~zero Google-indexed pages, so the rebuild
must be correct with JavaScript disabled as well as enabled.

**Countdown pre-render → released state — 28 pages** (7 homepages,
7 add-to-calendar, 7 pre-order-tracker, 7 gta-6-tracker). Every
replacement mirrors exactly what that page's own locale JS renders
once loaded in the released state, so the no-JS first paint and the
JS state agree (no flash): numbers 00, localised labels/aria-labels/
live regions, tracker TL;DRs rewritten to past tense (no new facts).
Verified by readback on all 28 pages (0 mismatches) and in the browser
(ES homepage, DE tracker: labels unchanged after JS runs, 0 console
errors). July dates in the tree are legitimate publication/access
dates with a "Last reviewed November 17, 2026" line — not presented as
current. News is current to 17 Nov 2026; nothing post-launch exists
yet (see Open items).

**Page weight — homepage.** `logo-mark.png` was a 1024×1024, 1.17 MB
PNG displayed at 36×36 in the header and footer of every page →
144×144, 26 KB (same image, same path). `og-image.jpg` 1.13 MB →
110 KB (JPEG q82, same 1376×768). Deleted unreferenced
`assets/img/apple-touch-icon.png` (1.3 MB; manifests use
`/favicon-*.png`). Homepage transfer weight fell from ~1.8 MB to ~0.63 MB (22 files). The per-locale `l10n.js` string tables (~720 KB each) are
dense JSON already loaded only by the locale calculator modules; not
minifiable by whitespace stripping (the spaces are inside the
strings).

## Open items

- `color-contrast` on the bottleneck calculator pages (7 locales) —
  see the axe section above; needs a design decision on the muted
  text color. The 2026-11-20 checker spot pass also flags the same
  muted text on the ES homepage (`.tool-card-badge`) and bottleneck
  breadcrumbs/guide tags — same root cause, same decision owed.
- Re-run the browser matrix against the deployed URL after the
  Vercel deploy and record the result here.

## Live-site fixes — 2026-11-20 (post-deploy, commit after 258976a)

Two defects found by the live browser check on toolwools-static.vercel.app
(desktop 1919px), fixed and redeployed the same evening.

**1. Header search box overlapped the primary nav.** At 1280px the
nav ran under the search box in ES/FR/PT/TR (up to 95px covered); at
1440px+ in every LTR locale (EN Trailers 50px; ES worst, 311px over
budget). Root cause: the 80rem header row cannot hold logo + 6 links +
search + lang + theme in long-label locales; the logo tagline (up to
360px wide in ES) was the biggest single contributor. Fix (CSS only,
shared header, all 280 pages): header container widened to 92rem
(header-scoped, padding-inline 1rem) at ≥1024px; nav gap 2.5→2rem,
1.5→1.25rem @1280, 2→1rem @1440+; nav letter-spacing 0.18→0.15em;
search input 12→11rem @1280, 16→13rem @1440+; `.logo-tag` hidden
below 1440px. Source: `build_c.py` CSS_ADD2 (durable — rebuild
re-appends it); built tree: `assets/css/main.css` (same block).
Verified: Playwright measure, 56 checks (7 locales × home +
bottleneck × 375/1280/1440/1919px) — 0 overlaps, 0 console errors.

**2. Bottleneck "Common pairings" cards contradicted the engine.**
11 of 12 rows disagreed with `bottleneck-engine.js` at 1440p / GTA
Online (every fps band wrong; 7 verdicts wrong), e.g. RTX 4070 +
Ryzen 5 5600X said "6% CPU limited, 65–85 fps" while the calculator
says 23% / 44–63 fps. Corrected all 12 rows in all 7 locales (84
cards) to the engine values — script `toolwools-build/fix_pairings.py`
(exact replacements per card, guarded by old-value assertions,
verified by re-extraction): 4090+i9-14900K 11% / 80–115,
4080+7800X3D Balanced / 78–113, 4070Ti+i7-13700K 9% / 64–92,
4070+7600X Balanced / 60–86, 4070+5600X 23% CPU limited / 44–63,
4060Ti+13400F Balanced / 52–74, 4060+5600X Balanced / 44–63,
3080+10600K 28% / 38–55, 3070+3600 25% / 34–48,
3060+5600X Balanced / 39–56, 2060+9400F Balanced / 30–44,
7900XT+7700X 9% / 66–94. Tones follow `readinessOf` (ready <8,
borderline 8–14, upgrade ≥15). Card titles normalised to "Ryzen 5
5600X" on the 4060 and 3060 rows (were "Ryzen 5 5600", href said
r5-5600x). **Source owed:** no generator for the pairing grid exists
in any build script (EN page arrived in the squashed commit 33c0f6a),
so this fix lives in the built tree only. Dict entries for the new
percentages added to `locale/dict_es.py` and `locale/dict_pt.py`;
de/fr/tr/ar have no page-string dict in the build tree, so if the
bottleneck page is ever regenerated the corrected values must be
re-applied from this section. Rule going forward: card verdicts and
fps bands must equal engine output at 1440p / GTA Online.

**3. 375px horizontal overflow on locale homepages** (found while
verifying fix 1: ES 413px, DE 381, FR 448, PT 436, TR 406, AR 378;
EN clean). Root cause (three parts): `.trend-row-title` is nowrap
with ellipsis but an inline span, so ellipsis never engaged;
its unclassed wrapper span kept `min-width: auto`, setting the
panel's min-content width; and `.advanced-panel` is a grid item whose
automatic minimum forced the whole `.advanced-grid` column wide.
Fix (same CSS block as fix 1, source + built tree):
`.trend-row > span { min-width: 0 }`, `.advanced-panel { min-width: 0 }`,
`.trend-row-title { display: block }`. First attempt (wrapper rule
only) changed nothing — the grid track was the binding constraint;
second attempt (panel rule) left only FR +5px — the inline title.

**Verification after all three fixes (localhost, Playwright):**
measure 56/56 pass (0 overlaps, 0 overflow, 0 console errors);
calculator recompute in-browser: 1440p → "CPU bottleneck 23%",
~55 fps; 4K → "CPU bottleneck 15%", ~36 fps (band 29–41);
pairing card renders "RTX 4070 + Ryzen 5 5600X 23% CPU limited
44–63 fps"; `verify_seo.py` 0 errors / 0 warnings (280 pages);
senior-frontend checker spot pass (EN/ES home + bottleneck @375/1280):
0 console errors, 0 overflow, 40 focus stops each, all with visible
focus, axe clean except the known `color-contrast` (muted text,
design decision still owed — see Open items).

**Known quirk (not fixed):** `bottleneck.js` `tldrOf` for a balanced
verdict with readiness "upgrade" (avgFps < 45, e.g. RTX 2060 +
i5-9400F) renders "shows a 4% bottleneck" with an empty CPU/GPU word
and a double space. Cosmetic; engine values are correct.

---

## Fix pass 2026-11-20 (FIX 1–8 + G1–G5) — post-launch cleanup

Driver: `~/workspace/toolwools-build/fix_pass_20261120.mjs` (idempotent,
exact-string replacements, `.new` + rename + readback). Source edits in
`~/workspace/toolwools-build/` (build_c.py, build_llms.py,
locale/build_seo.py, locale/dict_es.py, locale/dict_pt.py, tm/de.json,
tm/fr.json, js_replacements_{de,fr,tr,ar}.py, locale/build_js.py,
content-data.json). No deploy, no commit, no color changes.

### Tree-only fixes (no generator exists) — rebuild will revert these unless the source noted is also fixed

- **FIX 1 — countdown markup removed (28 files).** Homepage markup has no
  generator in build_c.py (patch_homepage only patched values). Source:
  build_c.py `countdown_values()` deleted, H6 rep block replaced with an
  assert that `data-countdown` never reappears in the homepage. NOTE: the
  countdown *label* text itself ("GTA 6 Is Out Now" etc.) also has no
  generator — it lives only in the built HTML.
- **FIX 2 — TR/AR footer strings.** No dict_*.py for tr/ar; the footer
  strings are not in tm JSONs or the tr_ar_batch files either — tree-only.
  ES/PT footer keys updated in locale/dict_es.py:29, dict_pt.py:29; DE/FR
  keys updated in tm/de.json, tm/fr.json; EN in build_c.py FOOTER.
- **FIX 3(a) — FR download-time desc.** build_llms.py TOOL_DESC had no fr
  download-time entry (added now, so future rebuilds keep it); the fr
  tree value was fixed by the driver.
- **FIX 3(a) — ES/PT llms descs.** es/pt llms.txt are generated by
  locale/build_seo.py (SEO_STRINGS intro/roadmap updated) but the
  download-time *description* string has no es/pt generator entry found —
  patched in the built es/pt llms files + dict_es.py:3150/:4106,
  dict_pt.py:3150/:4106 (keys changed to the new EN desc).
- **FIX 4 — "Recommended (estimated)" pill (7 homepages).** `preview-pill`
  has no generator — tree-only, all 7 locales.
- **FIX 6 — `.footer-bottom-links { flex-wrap: wrap; }`.** The base rule in
  built assets/css/main.css (~:986) has no source in the build dir; the
  fix was appended to the built file AND to build_c.py CSS_ADD2 so a
  rebuild carries it.
- **FIX 7(a) — add-to-calendar tldr (all 7 locales).** EN tldr has no .py
  source; ES/PT keys updated in dict_es.py:3271 / dict_pt.py:3271; DE/FR
  keys updated in tm/de.json / tm/fr.json; TR/AR tldr has no source —
  tree-only. The adjacent `data-tldr-verdict` ("Launch in 2 days — Nov 19,
  2026" → "Launched — Nov 19, 2026") was also fixed as an extension: it
  is static-only (no JS updates it) and would otherwise stay stale.
- **G1 — TR/AR generators title/H1/meta.** No tr/ar source for the
  generators page strings — tree-only. ES/PT in dict_es.py:4174-4177 /
  dict_pt.py:4174-4177; DE/FR in tm/de.json / tm/fr.json; EN in
  build_c.py generators tuple + generators_body page_hero.
- **G2 — TR/AR generators status + FAQ Q2.** No tr/ar source — tree-only.
  ES/PT in dict_es.py:4194/:4201 / dict_pt.py:4194/:4201; DE/FR in
  tm/de.json / tm/fr.json; EN in build_c.py generators_body. The EN status
  wording uses "above" (task said "below" — the rules section precedes
  the status block in the DOM). Date key "November 20, 2026" added to
  tm/de.json and tm/fr.json; es/pt dates flow through month-name
  translation. "Last verified November 20, 2026" in the EN tree.
- **G3 — FAQPage `"@id": ""` removed (7 generators pages).** Source:
  build_c.py `faq_ld()` (line ~249) — the `"@id": ""` was removed from
  the shared function, so all pages built from it lose the empty @id,
  matching the bottleneck page pattern (no @id at all).
- **G4 — homepage "AI Generators" panel + "Random Challenge" chip
  (7 homepages).** The homepage panel has no generator in build_c.py —
  tree-only. Panel renamed to "Name Generators" per locale; the Random
  Challenge chip removed (4 chips remain). NOTE: the first driver attempt
  deleted all 5 chips (regex backtracked across chip boundaries); the
  4 good chips were restored byte-for-byte from git HEAD and the driver
  regex was fixed to a tempered pattern that cannot cross `</a>`.
- **G5 — search "live" → "soon" (7 search pages).** Source:
  build_c.py search-index builder now emits `"soon"` for `/generators`
  (`"live"` for all other resources). ES/PT/DE/FR/TR/AR search pages are
  translated from the same builder; the tree files were patched directly.

### Source-only notes / rebuild caveats

- **FIX 1 source:** build_c.py `countdown_values()` deleted; H6 block now
  asserts no `data-countdown` in the homepage. `launch.js`
  (JS_FILES["launch.js"]) still defines TOOLWOOLS_LAUNCH_UTC / the
  "GTA 6 launches November 19, 2026, 05:00 UTC" comment — a code comment
  defining the launch instant, not visible copy; left as-is.
- **FIX 3(b) Locales section:** added to build_c.py `build_llms()` literal
  (before `## Optional`), so root llms.txt + llms-full.txt both gain it
  (+10 lines each). build_llms.py line-count asserts (51/69) are for the
  de/fr/tr/ar files only and are unchanged — the root files have no such
  assert in build_c.py.
- **FIX 3(c) intro em-dash vs hyphen:** pre-existing discrepancy — the
  build_c.py literal and llms-full.txt use an em dash in the intro
  ("guides — hardware checks") while the built llms.txt uses a hyphen.
  Left as-is; the Locales section passes through translate_llms
  untranslated (it is link-only, no prose).
- **FIX 5 source:** balanced-branch pairs added to
  js_replacements_{de,fr,tr,ar}.py (full-line pairs) and glue fragments
  to locale/build_js.py (es/pt). ES/PT bottleneck.js is built from
  build_js.py fragments, NOT jsstrings.py (which has no bottleneck
  entries). `toneOf` aligned for balanced-slow rigs (now returns
  "upgrade" when avgFps < 45); non-balanced slow rigs still show an
  upgrade card tone with a borderline icon — pre-existing design, out of
  scope.
- **FIX 7(b) locale coming-soon sentences NOT changed** (EN-only scope):
  ES "GTA 6 se lanza el 19 de noviembre de 2026" and equivalents remain
  in 4 tools × 6 locales. Also left: bottleneck/vram/fps "before GTA 6
  launches" accuracy FAQs (launch-context, retrospective) and
  methodology:383 "Launch reference: GTA 6 launches November 19, 2026
  at midnight Eastern." (definitional anchor).
- **Add-to-calendar "Live countdown" panel label (:187) and page subtitle
  "Live countdown in your timezone"** left unchanged — flagged as
  follow-ups, outside FIX 1 scope.
- **TR/AR gta-6-tracker.js / add-to-calendar.js countdown strings**
  (tr_ar_batch_01.json, e.g. "GTA 6 ... çıkıyor" / "تصدر GTA 6") are
  still present-tense in the batch source. The countdown JS is inert now
  (no DOM targets remain), so this is cosmetic; left for a locale-JS
  pass.
- **Download-time tool page defaults untouched** (150 GB slider, 15 GB
  patch, FAQ 4h35m) per task — the 212 GB rebase needs the owner's call.
  The "~150 GB" description string was fixed everywhere else (tools
  index, trending, related cards, aria-labels, search JSON, llms files,
  download-time page subtitle).

### Translations needing review (composed by adaptation, not native-verified)

FR/TR/AR balanced-branch sentences (FIX 5), FR/TR/AR generators status +
FAQ Q2 (G2), DE/FR "Launch-Tracker"/"suivis de lancement" intro (FIX
3c), TR/AR "AI Generators" panel names (G4), AR "مُوصى به (تقديري)"
pill (FIX 4).

## Fix pass 2B — CSS / layout only (2026-11-21, uncommitted, no deploy)

Scope: L3 + AR RTL sweep + F17/F18/F19 (forensic audits EN + locales).
No color changes. Every CSS rule added to `assets/css/main.css` was also
added to `build_c.py` CSS_ADD2 (byte-identical block, "Fix pass 2B" header);
`build_c.py` still compiles (`compile()` OK). All file edits via `.new` +
readback + rename.

- **L3 (P1) — AR lang menu clip.** `main.css` + CSS_ADD2:
  `[dir="rtl"] .lang-menu-list { right: auto; left: 0; }` (+ `.lang-note`
  margin swap). Measured @1280 on `/ar/`: menu rect left **-7.03px → +64px**
  (128px wide, fully inside viewport).
- **RTL sweep (a) — header search mirrored.** Icon `right: 0.75rem`, kbd
  `left: 0.5rem` with `direction: ltr; unicode-bidi: isolate` (was rendering
  `K⌘`), input paddings swapped. Verified @1280 AR: icon right, kbd left,
  kbd computed direction `ltr`.
- **RTL sweep (b) — prose lists.** `[dir="rtl"] .prose ul/ol`
  `padding-right: 1.25rem; padding-left: 0`. Plus the 17 inline-style lists
  in AR (8 files) changed `padding-left:1.25rem` →
  `padding-inline-start:1.25rem` in the built files and in `build_c.py`
  (16 spots — direction-neutral in LTR). Verified on `/ar/methodology/`:
  padding-right 20px, padding-left 0.
- **RTL sweep (c) — select chevron.** `[dir="rtl"] select.input`
  `background-position: left 0.75rem center; padding-left: 2.25rem`.
  Verified on `/ar/tools/fps-calculator/`: bgPos `12px 50%`, padLeft 36px.
- **RTL sweep (d) — CTA arrows point left.** `scaleX(-1)` (+ margin/position
  mirrors) for `.tool-card-cta .icon` (hover nudge mirrored to -4px),
  `.cat-card-arrow` (moved to `left: 1rem`, hover -2px/-2px),
  `.guide-card .icon-arrow`, hero `.btn-ultra > svg`,
  `.advanced-panel-cta svg`, `.section-head-action svg`, `.link-cta svg`.
  All compute to `matrix(-1, 0, 0, 1, 0, 0)` on AR pages; the hero play
  triangle (`.btn-outline`) was deliberately NOT flipped. Verified visually
  on AR homepage @1280 (hero CTA arrow points left) and @375.
- **F17 (P2) — trailer stills fallback.** `onerror` chain on both stills:
  hqdefault → mqdefault → local `/assets/img/trailer-thumb.jpg` (1015×677
  neon Vice City still, already in the tree) → `display: none`. Source:
  `build_c.py:1634`; built pages: all 7 locales × 2 imgs (14 handlers; TR/AR
  use the files' existing `&#x27;` escaping). Verified with `*.ytimg.com`
  route-aborted in Playwright: both imgs load the local thumb
  (`naturalWidth 1015`, `broken: false`), no broken-image icon. (One repair
  note: the first TR/AR sed pass corrupted the handlers via `&` expansion
  in the replacement; caught by readback, repaired, re-verified.)
- **F18 (P2) — hero-badges orphan.** `.hero-badges` is a 4-item meta row on
  70 pages (all exactly 4 items); at 375px flex-wrap left EN FPS at 3+1.
  `@media (max-width: 480px)` 2-column grid → clean 2×2 (EN + ES FPS @375:
  166px columns, rows 2). Homepage `.hero-proof` needed no fix: already a
  clean 3-row stack @375 on EN + ES (343px rows, even spacing).
- **F19 (P2) — consent banner slimmed (mobile only).** ≤767px: tighter
  padding, 0.75rem/1.5 text, buttons `flex: 1 1 0` side-by-side at 36px,
  Privacy link on its own row. All three choices stay visible/tappable.
  Height @375: EN **241px → 181px** (30.2% → 22.6% of 800px viewport),
  ES 199px, AR 163px, no horizontal overflow in any locale.
- **CONFIRM — footer-bottom 375px clip:** `scrollWidth == clientWidth ==
  375` on EN/ES/AR homepages (pass-1 `flex-wrap: wrap` holds).
- **CONFIRM — header search/nav overlap:** 0 overlaps @1280/1920 on
  EN/ES/DE homepages, `docOverflow 0`.

Verification (localhost:8321, `~/workspace/toolwools-audit-2026-11-20/fix2b/`):
senior-frontend checker on AR home, AR tracker, DE home, trailers, EN home
@375/1280/1920 — 0 overflow, 0 axe violations, 0 focus stops without a
visible indicator on all 15 runs. Exceptions, both pre-existing / sandbox
artefacts, not regressions: trailers shows 4 console errors at every width
(`ERR_TUNNEL_CONNECTION_FAILED` — sandbox proxy cannot reach `i.ytimg.com`;
the fallback still renders, see F17); AR tracker has 1 checker issue
(`input#share-link.share-link-input` outside a `<form>`, pre-existing
share-link markup, out of CSS scope).

Open items from this pass (not fixed — out of scope):
- AR footer-strip CTA reads `تصفح الأدوات →` on all 40 AR pages (right
  arrow in RTL text). Content fix for pass 2A: glyph should be `←`.
  (The other AR `→` occurrences are data mappings, e.g. `RTX 4090 → S`.)
- Rebuild hazard (pre-existing): `main.css` carries ~400 lines of Builder B
  merged CSS (`.flag-badge`, `.conf-pill`, …) with no home in `build_c.py`
  (0 matches); a `build_c.py` rebuild strips from the CSS_ADD marker and
  would drop it. The Fix 2B block itself IS mirrored in CSS_ADD2 and
  survives a rebuild.

---

## Fix Pass 2A — content, copy, numbers, schema, sitemap (2026-11-21, uncommitted, no deploy)

Driver: `~/workspace/toolwools-build/fix_pass2a.py` (stages s1, s2, s3,
s4a, s4b, s5a, s5b, s5c, s5d, s5e; idempotent, exact-string replacements,
`.new` + readback + rename). All fixes in all 7 locales unless stated.
No deploy, no commit, no color changes. Build-source edits:
`build_c.py` (S1 robots source, F6 aria-label), `build_sitemaps.py`
(S2/S3/S4), `verify_seo.py` (S2: sitemap expectation 40→38, line 208;
loc-set filter excluding search + email-preferences, line 255),
`f14gen.mjs` (P2: locale argv wired into `fmtVs` + ladder `gta`).
Supersedes the 2026-11-20 interaction-checks figures for download-time
(4h35m → 5h58m at 100 Mbps) and storage planner (234 GB → 293.8 GB).

### F1–F5, F8–F10, F12, F13, L6 (past-tense / copy)

- **F1 (P0) — search H1 double-encoding.** `search/index.html:162`
  `&amp;amp;` → `&amp;` (EN only; the other 6 locales were clean).
- **F2 (P0) — search placeholder.** `search/index.html:173` invalid `\"`
  escapes → single-quoted attribute, all 7 locales.
- **F3 (P0) — pre-order-tracker.** Hero + "expected to open" copy → past
  tense, reframed as buy-now/editions comparison; tool kept (owner's call
  to retire). "Pre-orders opened in 2026" — no specific day asserted
  (sources conflict: 25 Jun vs 24 Sep 2026). Remaining stale copy NOT
  fixed: FAQ :345 ("Rockstar has not published the schedule…") — outside
  the named scope. DE/FR JS timelines keep an "open" milestone marked
  confirmed while EN/ES/PT/TR/AR drop it — inconsistent across locales.
- **F4 (P0) — edition-comparison.** Verified against real listings:
  confirmed lineup is ONLY Standard $79.99 + Ultimate $99.99
  (digital-only), PS5 + Xbox Series X|S, launched 19 Nov 2026. NO Deluxe
  edition, NO boxed Collector's Edition game (only a $399.99 merchandise
  box, no game), NO PC version announced. Dated correction note after the
  hero field-hint; tier cards "Sold on …, PC" → console-only; Platforms
  row "PS5, Xbox, PC" → "PS5, Xbox"; PC `<option>` removed; "three
  platforms" → "two platforms"; :348 "has not launched" → "launched
  Nov 19, 2026"; FAQ-5 "Unconfirmed." → "No. There is no boxed GTA 6
  collector's edition game…"; FAQ-10 → "cannot be settled from this page
  alone: check GTA 6's in-game prices…". Engines + controllers
  (`edition-engine.js`, `edition-comparison.js` × 7): platforms arrays
  `["ps5","xbox","pc"]` → `["ps5","xbox"]`; DE/FR controllers also
  hardcode the collectors verdict / upgrade tip / `EDITION_NOTE` —
  fixed there too. Deluxe/Collector tiers stay on the page as
  precedent-scored (owner decision owed on removing them).
- **F5 (P0) — news pre-order article.** Dated correction note added to
  the article card (all 7 news pages) + homepage article-row meta
  ("Update Nov 20, 2026: launched Nov 19, 2026"). Headlines unchanged —
  history not rewritten.
- **F8 (P1) — gta-6-tracker.** Intro / TL;DR / status line / table dek /
  caption rewritten to past tense; "Expected preload window" →
  "Preload window"; Preload Starts (Nov 16) + Day One Patch (Nov 19)
  badges → Complete; dead "Notify on Preload Start" button
  (`data-notify`) removed — the page has no newsletter, so there was
  nothing to wire it to. GTA Online Integration (Dec 2026) stays
  Expected. Assumption: "Preload ran Nov 16–17, 2026" treats the
  expected window as the actual window — not independently verified.
- **F9 (P1) — trackers hub.** "40% complete… ships with the game launch
  window" → past-tense/status update (FAQ + JSON-LD + intro).
- **F10 (P1) — add-to-calendar.** Hero, callout, panel hint, "Live
  countdown" → "Launch status" (label per locale), assumptions, step,
  FAQ Q+A, plus meta descriptions ("Live countdown and local unlock
  times" → "Launch status and local unlock times").
- **F12 (P1) — homepage Recommended card.** Aligned to the tier table's
  Recommended tier: GPU RTX 2070 / RX 5700 XT → RTX 3060 / RX 6600,
  CPU i7-8700K / Ryzen 7 3700X → i5-12400 / Ryzen 5 5600 (all 7
  homepages). "(estimated)" pill kept.
- **F13 (P1) — tools index.** "more shipping as launch nears" clause
  removed, all 7 locales.
- **L6 — roadmap tools launch clause.** "se lanza el 19 de noviembre de
  2026" and equivalents → past tense, 4 tools × 6 locales.
- **Pass-1 follow-ups.** `launch.js` comment "launches November 19,
  2026" → "launched"; TR/AR `gta-6-tracker.js` / `add-to-calendar.js`
  countdown strings fixed (tldrText + share text past tense).

### F6 (P1) — install-size rebase: 150 GB → 212 GB base, 15 GB → 2.8 GB patch

Parent's figure: up-to-212 GB install + 1.7–3.8 GB day-one patches.
Patch default 2.8 GB is the midpoint of 1.7–3.8 (stated choice).
Total 214.8 GB. Engine formula verified by running in Node
(seconds = GB × 8000 / effective-Mbps; `formatDuration` floors hours,
rounds minutes). Recomputed times at 80% efficiency: 25 Mbps → 23h 52m;
50 → 11h 56m; 100 → **5h 58m** (base 212 GB alone 5h 53m, patch 2.8 GB
5m); 300 → 1h 59m; 500 → 1h 12m; 1000 → 36m. FAQ "under 30 min at
1 Gbps" → ~36 min; "past 14 hours at 25 Mbps" → nearly 24 hours.
Storage planner: subtotal 212+2.8+30 = **244.8**, headroom
Math.round(244.8×20%) = **49**, total **293.8 GB** (was 195 + 39 = 234);
tone flips ready→borderline (293.8 > 250 threshold). Storage FAQ
"Plan on 200–235 GB free" → "258–294 GB" (214.8×1.2≈258 to 293.8≈294).
Comcast cap line 14% → "about 18%" (214.8/1200). Slider steps: gb/base
5→1, patch 1→0.1 (else the range inputs snap 212→210). Decimal
convention: dot decimals (2.8, 214.8, 244.8, 293.8) everywhere for
engine-rendered numbers, matching JS output; static prose keeps locale
commas only where already used (AR uses dots). Changed in: JS defaults
(`download-time.js`, `storage-planner.js` × 7), readiness engines
(`REFERENCE_INSTALL_GB` 150→212, all 7), `readiness-score.js` comments,
`search.js` descs, HTML numeric rebase (download-time + storage-planner
pages × 7, incl. speed-table time maps, verdict titles 4h→5h / 35m→58m,
stat-grid base 4h10m→5h53m / patch 25m→5m, share-URL params, stack-bar
widths), readiness-score pages (formula `freeGB / 150` → 212, B-grade
floor, two FAQs: 50 Mbps 6.7h→9.4h, 25 Mbps 13.3h→18.8h), cross-page
mentions (tracker/calendar/speed-check), `content-data.json` +
`build_c.py:2610` aria-label "~150 GB install" → "~212 GB install".
Changelog lines deliberately untouched (history). Follow-ups (not
fixed, values not derivable): system-requirements tier-table storage
rows (Minimum/Recommended "150 GB" SSD cannot hold a 212 GB install;
Ultra "250 GB"); TR storage page console-size claim "~140 GB"
(PS5/Xbox).

### F7 (P1) — NOT reproduced, numbers left unchanged

Ran `estimateFps` in Node (EN + ES engines, identical maths): RTX 3070 +
i5-12400F @1440p Ultra native = avg **31**, low **15**, gpuFps
(pre-VRAM-penalty) **42**, bandHi 36; 1440p High + DLSS Quality = **80**
avg; RTX 4090 4K Ultra DLSS Quality + Frame Gen = **93** (matches the
page's upgrade box). The page copy "42 / 31 (15 low) / 80" already
matches the engine (42 is the engine's own pre-penalty gpuFps). The
task's claimed engine numbers 49/36/93 do not reproduce (36 is the
bandHi of the 31 result; 93 belongs to the 4090 preset).

### F14 (P2) — price-by-country FX re-date 2026-08-01 → 2026-11-20

FX recomputed 2026-11-21 from ECB reference rates 2026-11-20 per EUR ÷
EUR/USD 1.0990, plus Yahoo spot / other sources for non-ECB currencies.
`deluxe` removed from EDITIONS entirely (no such edition); Ultimate
usd 109.99 → **99.99**, confirmed false → true; "All Deluxe content"
removed from Ultimate includes. US ladder is now 2 rows: Standard
$85.59 Baseline 0 n/a; Ultimate $106.99 (99.99×1.07), premium $21.40,
GTA$ 1,000,000, per-100k $2.14. `?edition=deluxe` falls back to
standard automatically. Only the $99.99 price is confirmed; the
Ultimate bonus contents remain unconfirmed/modelled — flag, do not
treat as confirmed. NGN is the least-certain rate (sources 1353–1376.58
on 19–20 Nov). Tables regenerated from the engine via
`~/workspace/toolwools-build/f14gen.mjs` (validated against the old
table: 44 rows, 0 mismatches) and spliced per locale (44 rows + 2-row
ladder each, country-name `<th>` HTML and row attributes preserved).
Copy updated everywhere the date/Deluxe appeared (meta descriptions,
rates banner, byline "Last reviewed" → Nov 20, 2026, field-hints,
verdict panel, edition select, ladder heading/aria/hint, "What is
confirmed", methodology, FAQ-5/FAQ-7, glossary, table caption, JSON-LD
`dateModified` → 2026-11-20; `datePublished` stays 2026-08-01 as
history). New v1.2 changelog entry added in all 7 locales. Spot
values: AR shelf AR$74,999, tax AR$15,750, total AR$90,749, USD $63.22,
vs −26.1%; EG E£2,199.00 → $44.91, −47.5%; DE €79.99 → $87.91, +2.7%;
GB £69.99 → $91.85, +7.3%; JP ¥10,800 → $68.08, −20.5%; TR ₺1,899 →
$37.55, −56.1%. Sort order ascending by USD equivalent (TR $37.55
first, GB $91.85 last).

### F15 (P2) — system-requirements threshold sentence

"49/100 Meets Recommended" now carries the tier thresholds in JS
(`TIER_META.rec.blurb`) and the static default verdict-desc, all 7
locales: EN "Recommended starts at 48 points (Minimum 35 · Ultra 82)."
Thresholds are the system-requirements tier formula (35 / 48 / 82), NOT
the readiness-engine `GRADE_THRESHOLDS` (S 92+ / A 82–91 / B 70–81 /
C 55–69 / D 40–54 / F 0–39) — different tool's scale.

### L1 (P1) — share links localised (DE/FR/TR/AR)

Scope was bigger than the task's 40-file estimate: 18 tools × 4 locales
= 72 files for text, **420 share links** scanned, plus URL-prefix fixes
per link wherever missing. ES/PT have the `/{locale}/` prefix on 9 tools
and lack it on 9 (add-to-calendar, economy-calculator,
edition-comparison, gpu-tier-list, hardware-comparison, interactive-map,
pre-order-tracker, price-by-country [links 2–3 only],
settings-optimizer); DE/FR/TR/AR lacked it on all 18 tools. All 420
links now carry the locale prefix; 0 bad URLs, 0 stale fragments, 0
DE/FR/TR/AR texts still equal to an EN table key (verified by
independent re-scan). Translations adapted from ES/PT references + JS
`shareText` patterns + page H1s (44 unique EN texts × 4 locales, in
the driver). Staleness fixed inside the same strings: download-time
numbers 4h 35m/165 GB → 5h 58m/214.8 GB (all 7 locales);
add-to-calendar / gta-6-tracker launch tense (all 7 where stale).
Edition-comparison share texts still name the non-existent Deluxe
edition — left per the F4 decision.

### L2 (P1) — ES/PT dynamic JS strings translated

`download-time.js` (:123 verdict-desc, :133/:164 shareText, :134
Reddit, :152 tableNote, :158 live), `fps-calculator.js` (:205 fgTag
" (interpolado)", :214 live, :221 shareText), `system-requirements.js`
(:153/:172 "Veredicto de GTA 6: …", :167 live line as a same-class
extension), `vram-calculator.js` (:188 live, tldrText 4 branches as a
same-class extension; PT adequate had Spanish "Recomendado" → fixed to
"Recomendados"). DE/FR/TR/AR used as references. Remaining Spanglish
NOT fixed: ES/PT `TIER_META` labels/blurbs in system-requirements.js
("Below Mínimo", "Tu equipo will struggle…") — outside the named
lines. TR/AR `fps-calculator.js` fgTag is also still " (interpolated)"
(:204) — out of scope (ES/PT only).

### L4 (P1) — TR dates

9 occurrences → Turkish: "6 May 2025" → "6 Mayıs 2025"
(tr/index.html:390, tr/news/index.html:168/:175,
tr/trailers/index.html:223) + 5 tool src-meta lines "Yayınlanma 1 May
2025" → "Yayınlanma 1 Mayıs 2025" (bottleneck, fps, readiness-score,
system-requirements, vram).

### L5 (P1) — untranslated strings

- ES/PT gpu-tier-list FAQ "Is 8 GB VRAM enough for GTA 6?" → ES "¿Son
  suficientes 8 GB de VRAM para GTA 6?", PT "8 GB de VRAM são
  suficientes para GTA 6?" (visible :323 + JSON-LD :648, 2× each;
  answers were already translated).
- settings-optimizer fallback line :331 in all 6 locales (inside
  `<pre class="methodology-formula">`; rest of the `<pre>` is English
  pseudocode by design).
- interactive-map :323 description cell TR/AR: "Florida reef tract and
  Gulf waters" → TR "Florida resif kuşağı ve Körfez suları", AR "شعاب
  فلوريدا المرجانية ومياه الخليج" (adapted — needs review). The other
  21 TR/AR description rows are still English — remaining gap, not
  silently expanded.
- DE/FR map-pin aria-labels (3 each): "Strongly implied" → DE "Stark
  angedeutet", FR "Fortement suggéré", matched to each locale's table
  rows.

### S1–S4 (GSC surgery)

- **S1 — noindex removed from the 4 roadmap tools** (server-status,
  preload-tracker, vehicle-comparison, weapon-comparison × 7 locales =
  28 files). Source: `build_c.py:2425` coming-soon loop no longer
  passes `robots="noindex, nofollow"`; `head()` only emits the meta
  when `robots` is truthy. Search / email-preferences keep theirs.
  Pages stay in the sitemaps. No SoftwareApplication schema added.
- **S2 — /search + /email-preferences removed from the 7 per-locale
  sitemaps** (their noindex is correct and kept). Source:
  `build_sitemaps.py` (`EXCLUDED_PATHS = {'search',
  'email-preferences'}` guard in `load_reference`). Count is now
  **266 / 38 per locale** (was 280 / 40). `verify_seo.py` updated:
  sitemap expectation 40→38 (line 208) + loc-set filter excluding the
  two noindex pages (line 255); pages-on-disk expectation stays 40.
- **S3 — robots.txt** gains `Disallow: /_partials/` and `Disallow:
  /api/` (source + built tree, via `build_sitemaps.py` `robots()`).
- **S4 — sitemap.xsl.** New styled XSL (XSLT 1.0: title, intro, table
  with URL / lastmod / changefreq / priority / hreflang alternates;
  handles urlset + sitemapindex), referenced from ALL 8 sitemaps with
  `<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>` (source +
  built tree, via `build_sitemaps.py`). Validated: lxml compiles it as
  XSLT; all 8 sitemaps parse as valid XML.

### P2 — price number formatting per locale + DE/FR readiness

- **Price tables:** engines `formatLocal`/`formatUsd` now use the
  locale tag instead of hardcoded `"en-US"` (7 engines × 2 calls);
  controllers `e.gtaDollars.toLocaleString` + both `vs` constructions
  localised (7 controllers); `f14gen.mjs` takes the locale argv
  (`fmtVs` + ladder `gta`). Mapping: en-US, es-ES, pt-BR, de-DE,
  fr-FR, tr-TR, **ar-EG-u-nu-latn**. AR renders identically to en-US
  (Latin digits, dot decimals, comma grouping) — verified in Node —
  matching the AR pages' existing "79.99" convention. All 7 tables +
  ladders regenerated from the locale engines and re-spliced (44 rows +
  2-row ladder each; every cell re-parsed and compared to the generator
  output). Examples: DE €79,99 / $87,91 / +2,7% / 1.000.000; FR
  1 000 000 (narrow no-break space grouping); ES E£2199,00 (es-ES omits
  grouping for 4-digit numbers); AR $79.99 unchanged.
- **Readiness — correction to the earlier finding:** the DE/FR
  controller `mapNetwork`/`mapStorage`/`mapPerf`/`mapVram` regexes are
  **dead code** — the DE/FR engines emit translated details directly,
  so the EN-pattern regexes never match. The "3.0 Std." / double-period
  bugs previously reported against those maps never render. The LIVE
  issues were in the engines and are fixed here: DE engine network
  detail "Mbps down" → **"Mbps im Download"**; DE controller tldrText
  :139 same fix; hoursLabel `.0` wart fixed in **all 7 engines**
  (`hours.toFixed(1)` → `Number(hours.toFixed(1))`: "3.0 Std." → "3
  Std.", "3.0 h" → "3 h" — reachable, mbps is a free number input);
  DE engine hoursLabel abbreviation period dropped ("3 Std." + the
  template's sentence "." = "3 Std.." live double period — now
  "in ~3 Std."). FR engine was already fully French; FR maps need no
  change. Verified by running the engines in Node (DE 157 Mbps →
  "157 Mbps im Download, installiert 212 GB in ~3 Std."). Remaining
  nit (not fixed): storage detail "frei auf NVMe SSD" / "libres sur
  NVMe SSD" is article-less, matching the EN source's telegraphic
  style. DE/FR `mapVram` keeps dot decimals (14.5 GB) from the engine —
  same nit, not introduced here.

### Verification (2026-11-21, local tree)

| Check | Result |
|---|---|
| `verify_seo.py` (280 pages) | **0 errors, 0 warnings** (after the line-255 loc-set fix above) |
| `node --check` (price + readiness engines/controllers, all locales) | **0 failures** |
| Grep counts | 0 `&amp;amp;` in search pages; 0 "GTA 6 launches" in fixed files; 0 noindex in the 28 roadmap files; /search + /email-preferences absent from all 7 sitemaps; sitemap.xsl referenced in all 8 sitemaps; 0 "~150 GB" in download-time defaults/FAQs; 38 `<loc>` per sitemap |
| sitemap.xsl | **valid XSLT** (lxml compiled it); all 8 sitemaps valid XML |
| senior-frontend checker (localhost:8321, 7 pages × 375/1280/1920) | **0 console errors, 0 overflow** on homepages EN/ES/AR + bottleneck + search + pre-order-tracker + edition-comparison; axe clean except the known `color-contrast` (see below); 3 pages flag the share-link `<input>` outside a `<form>` (pre-existing copy-field markup, not a submit form) |
| Price tables | 44 rows + 2-row ladder per locale, every cell re-parsed and matched to the generator output |

### Not fixed (report only, per task)

- DE Denglisch ("Launch-Date", "Share-Links", nav "Tools") — owner's
  call (DE hero itself says "Starke Tools").
- `color-contrast` — design decision owed. 2026-11-21 checker: bottleneck
  (3 nodes: two breadcrumb "tools" links + a guide-card tag) and ES
  homepage (1 node: `.tool-card-badge`), all serious.
- Name generator build; Popular Tools card for the generator; sample
  names on the hub.
- "Non-balanced slow rigs upgrade card tone vs borderline icon" —
  pre-existing design.
- `bottleneck.js` `verdictLabelOf` double-% bug (DE/FR): engine returns
  "CPU bottleneck 23%" and the locale wrapper appends another "%" →
  "CPU-Bottleneck 23% %". Pre-existing JS bug, out of L1 scope.
- `llms.txt` still says '~150 GB' (0 locale paths) — GEO gap, outside
  this fix list.

### Translations needing review (composed by adaptation, not native-verified)

L1 table (44 texts × 4 locales); L2 "1% mínimo" (ES/PT pages use it 9×
each vs ES "1% bajo" ×1); sysreq :167 "más"/"mais" for "plus"; TR/AR
map :323 descriptions; P2 locale mapping (esp. `ar-EG-u-nu-latn`);
F14 FX rates (NGN least certain); F4/F14 Ultimate bonus contents
(modelled, not confirmed); ES/PT `TIER_META` Spanglish left in place.
