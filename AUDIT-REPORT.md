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
