# ToolWools — audit & fix report

Tree verified: **2026-11-20** (re-verified fresh; the 2026-11-17 audit is
superseded by the numbers below). Tree hash at verification:
`f15d17eb64767682c46542b2586a3794` (after the clampNum fix below).

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
| Browser matrix (every page × 375px/1280px, axe) | in progress at push time — see "Open items" |

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

- Full browser matrix (every page × 375/1280, axe) was still running
  when this tree was pushed; the interaction checks above plus the
  static crawl cover the highest-risk paths. Re-run the matrix against
  the deployed URL after the Vercel deploy and record the result here.
