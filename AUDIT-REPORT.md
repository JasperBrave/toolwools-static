# ToolWools — audit & fix report

Tree verified: **2026-11-20** (re-verified fresh; the 2026-11-17 audit is
superseded by the numbers below). Tree hash at verification:
`3efe3a72f5886395e6f403c51de98411` (after the clampNum fix and the
axe fixes below).

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

## Open items

- `color-contrast` on the bottleneck calculator pages (7 locales) —
  see the axe section above; needs a design decision on the muted
  text color.
- Re-run the browser matrix against the deployed URL after the
  Vercel deploy and record the result here.
