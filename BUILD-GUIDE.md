# BUILD-GUIDE.md — page pattern for the ToolWools static rebuild

Read this before building any of the remaining 28 pages. The two reference
pages (`index.html`, `tools/bottleneck-calculator/index.html`) are the
pattern; do not invent a new one.

## 1. File layout

```
toolwools-static/
  index.html                     # homepage (English root)
  <slug>/index.html              # every other page lives in its own folder
  tools/<slug>/index.html        # tool pages
  guides/<slug>/index.html       # guide pages
  assets/css/main.css            # the ONLY stylesheet (plus print.css)
  assets/css/print.css           # print only
  assets/js/theme.js             # theme toggle (all pages)
  assets/js/countdown.js         # release countdown (homepage only)
  assets/js/header.js            # mobile nav, Ctrl/Cmd+K (all pages)
  assets/js/search.js            # header search index (all pages)
  assets/js/newsletter.js        # newsletter form (homepage only)
  assets/js/faq.js               # #faq-q-N deep links (tool pages)
  assets/js/engines/*.js         # ported calculators (see ENGINES.md)
  assets/js/<tool>.js            # one page-logic file per interactive tool
  assets/fonts/                  # Inter + Space Grotesk, self-hosted woff2
  assets/img/                    # src/assets images
  og/  favicon*.png  robots.txt  site.webmanifest  llms.txt   # public/ as-is
  _partials/header.html          # copy-paste header (see §3)
  _partials/footer.html          # copy-paste footer (see §3)
```

Rules:

- No Tailwind, no framework, no build step, no bundler. Plain HTML/CSS/JS.
- All asset paths are root-relative (`/assets/...`, `/tools/...`) so the same
  markup works at any depth.
- One `<h1>` per page. Headings in order. Lists as `<ul>`/`<ol>`, tables as
  `<table>` with `<th scope="col">`.
- Copy is English in this scaffold. Locales live under `/es/`, `/pt/`,
  `/de/`, `/fr/`, `/tr/`, `/ar/` later; the language switcher already links
  there with a "Soon" note. Do not build locales until the English pages
  are done.
- Keep copy free of AI tells (no long dashes in user-facing text). The source
  copy already is; when you write new copy, match it.
- The footer year is written by hand. Update it each January.

## 2. Head block (copy from the bottleneck page, adapt the values)

Order in `<head>`:

1. `charset`, `viewport`.
2. `<title>` — from `src/lib/tools/content/<slug>.ts` `seo.title`, or from
   `src/lib/tools/registry.ts` `seo.title` for tools without a content file.
   Homepage title: `ToolWools — All GTA 6 Tools, Calculators & Trackers`.
3. `description` — `seo.metaDescription` from the content file.
4. `keywords` — `seo.keywords` from the content file (tool pages only).
5. `author` = `ToolWools`.
6. Open Graph + Twitter: `og:title`, `og:description`, `og:type=website`,
   `og:site_name=ToolWools`, `og:url` (canonical), `og:image`
   (`https://toolwools.com/og/<slug>.jpg` for tools, `/og-image.jpg` for the
   homepage default; the source route uses a dynamic SVG for bottleneck — the
   static build uses the pre-rendered `/og/bottleneck.jpg`), `og:image:alt`,
   `twitter:card=summary_large_image`, `twitter:title`,
   `twitter:description`, `twitter:image`.
7. `theme-color` twice (dark `#0b0616`, light `#ffffff`, with media queries).
8. `canonical` (always `https://toolwools.com<path>`), favicons, manifest.
9. Font preloads (both woff2 files) and the hero image preload on the
   homepage only.
10. `<link rel="stylesheet" href="/assets/css/main.css">` and print.css
    with `media="print"`.
11. Inline theme boot script (must stay inline in `<head>` to avoid a flash):
    `try{var t=localStorage.getItem('tw-theme')||'light';document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}`.
    Note: the source defaults to **dark** when nothing is stored; this static
    build defaults to **light** by scaffold brief. Do not "fix" this back
    without an explicit decision.
12. JSON-LD: BreadcrumbList on every page; SoftwareApplication on tool pages;
    HowTo where the content file has `howItWorks`; FAQPage where it has FAQs.
    Copy the shape from the bottleneck page. FAQ answers in JSON-LD must
    match the visible FAQ text exactly.

## 3. Header and footer

- Copy `_partials/header.html` and `_partials/footer.html` verbatim into
  each page. Move `aria-current="page"` to the nav link of the current page
  (both desktop and mobile navs) and update the language-switcher links so
  the English entry points at the current page (e.g.
  `/tools/bottleneck-calculator`) and the locale entries at the matching
  locale path (`/es/tools/bottleneck-calculator`, etc.).
- Header scripts on every page (defer): `theme.js`, `header.js`,
  `search.js`. The homepage also loads `countdown.js` and `newsletter.js`.
  Tool pages load `faq.js` and their own `<tool>.js` as `type="module"`.
- The header search index lives in `assets/js/search.js` (22 tools from the
  registry). When a new tool page ships, add it there.

## 4. Tool page pattern (from `tools/bottleneck-calculator/index.html`)

Page order, top to bottom — this mirrors `ToolPageShell` + the route render:

1. `<article aria-labelledby="tool-hero-heading">` + `<header class="page-hero">`:
   breadcrumbs (`Home / Tools / <H1>`), eyebrow chip (icon + category label),
   `<h1 id="tool-hero-heading">`, subtitle paragraph.
2. `<div class="container tool-body">` containing, in order:
   - `.intro-callout` — the content file's `intro` paragraph.
   - `.byline` — author / reviewer / last-reviewed / methodology link, from
     `content.byline` + `seo.updatedISO`.
   - Screen-reader live region (`.sr-only`, `role="status"`,
     `aria-live="polite"`, `data-live-region`) — the page JS writes the
     verdict sentence here.
   - `.tldr-card` (`#tldr`, `data-speakable="tldr"`) — `data-tone` is
     `ready` / `borderline` / `upgrade`; the page JS updates label, text and
     verdict. Ship a correct static default (computed from the engine) so
     the card is right before JS runs.
   - Workspace `<section aria-labelledby="tool-workspace">`:
     `.workspace-grid` with `.input-panel` (a `<form>`, `aria-label` = panel
     title) and `.output-panel` (`aria-live="polite"`). The output panel
     ships an **empty state** (plain-language "pick your inputs" copy) that
     the page JS replaces on load; if JS fails, the empty state stays and
     the page still explains itself.
   - Compare section (`data-compare-section`, `hidden` until compare is on).
   - `.share-panel` — permalink input + copy button + X/Reddit links.
   - Common pairings (if the route has them) — links with `?gpu=&cpu=&res=&mode=`.
   - Tier reference tables (if the route has them) — `.table-scroll` with
     `tabindex="0"`, `role="region"`, `aria-label="… — scrollable table"`.
   - Contextual links box ("Keep planning your GTA 6 rig").
   - `.assumptions-strip` — `content.assumptions` + updated date.
   - How it works (`<ol class="steps-grid">`, numbered `01`–`06`).
   - Use cases (cards with "Load preset" links where the route has them).
   - Methodology (`<details class="methodology-details">`, formula in `<pre>`).
   - FAQ (`<ul class="faq-list">`, `<details>` per item, `id="faq-q-N"` /
     `id="faq-a-N"`, `aria-controls`, `role="region"`).
   - Glossary (`<dl class="glossary-grid">`, `id="term-<slug>"`).
   - Related content — related tools as `.tool-card`s (accent rotates
     purple, blue, pink) + companion guides as `.guide-card`s.
   - Sources (`<ul class="sources-list">`, publisher + published/accessed).
   - Changelog (`<ul class="changelog-list">`, version + date + note).
   - `.disclaimer` aside (`role="note"`, `aria-label="Estimate disclaimer"`).
3. Footer (partial).

Section order inside the shell is `assumptions, howItWorks, useCases,
methodology, faqs, glossary, related` — but the workspace, share panel,
pairings, tier tables and contextual links render **before** those sections
(between the intro and the assumptions strip), because the route renders its
children before the shell's ordered sections. Keep that order.

## 5. Calculator page JS pattern (from `assets/js/bottleneck.js`)

- One ES module per tool, importing its engine from
  `./engines/<name>-engine.js` (engines live at `assets/js/engines/`, so a
  page script in `assets/js/` imports `./engines/...` — never `../engines/...`,
  which 404s).
- State lives in the URL query string (`?gpu=&cpu=&res=&mode=`, plus
  `compare=1&gpu2=&cpu2=` for compare mode) and is synced with
  `history.replaceState` on every change, so results are shareable.
- Defaults match the source route's `loaderDeps` (bottleneck:
  RTX 4070 + Ryzen 5 5600X, 1440p, GTA Online; compare rig RTX 4080 +
  Ryzen 7 7700X).
- **States to handle:** empty (no-JS fallback copy in the output panel),
  valid result (verdict + balance bars + upgrade + stats + share row),
  invalid input (unknown ids in the URL fall back to defaults and show the
  `.input-notice` alert — never silently compute the wrong rig).
- Announce results in the `aria-live` region with the same sentence shape as
  the source (`<Verdict>. Estimated <low> to <high> frames per second at
  <res> on <workload>.`).
- Copy buttons use `navigator.clipboard` with a textarea/`execCommand`
  fallback and a "Copied!" label that reverts after ~1.6 s.
- Do not re-implement engine maths in page JS. Import the engine.

## 6. CSS rules

- Add component classes to `assets/css/main.css` only. Never add a second
  stylesheet per page, never inline `<style>` blocks.
- Use the tokens (`--background`, `--primary`, `--neon-*`, `--accent-*`,
  `--radius-*`). No new hex colours, no magic pixel numbers for spacing that
  a token already covers.
- Accent variants use `data-accent="purple|pink|blue|cyan"` and the
  `--glow` custom property (see `.tool-card`, `.cat-card`,
  `.advanced-panel`).
- Mobile-first: base styles are 375 px; widen with `min-width` media
  queries (640 / 768 / 1024 / 1280).
- Focus is visible everywhere (`:focus-visible` is defined globally). Do not
  remove outlines.
- `prefers-reduced-motion` is handled globally; do not add animations that
  ignore it.
- The source has no print stylesheet; `print.css` is a small addition.
  Keep it that way: hide chrome, show all FAQ answers, print links' URLs.

## 7. Fonts and images

- Fonts: Inter + Space Grotesk, self-hosted variable woff2 (latin subset)
  in `assets/fonts/`. The source loaded them from Google Fonts; this build
  does not call Google Fonts at all. JetBrains Mono is declared in the font
  stack but was never loaded by the source either — it still falls back to
  `ui-monospace`. If a later locale needs non-latin subsets, add the files
  and a second `@font-face` with the matching `unicode-range`.
- Images: `assets/img/` holds the `src/assets` files; the site root holds the
  `public/` files (`favicon*`, `og/`, `robots.txt`, `site.webmanifest`,
  `llms.txt`). Filenames are preserved. Nothing was optimised yet — see §9.
- Every `<img>` needs `alt` (empty for decorative), `width`/`height` where
  the source had them, and `loading="lazy"` except the hero (eager,
  `fetchpriority="high"`).

## 8. Verification before calling a page done

Follow the senior-frontend skill (`~/workspace/custom-skills/senior-frontend/SKILL.md`):

1. `node --check` every JS file (ES modules: `node --input-type=module --check < file`).
2. Serve the tree locally (`python3 -m http.server` from `toolwools-static/`)
   and run the checker against `http://localhost:<port>/<page>`:
   `NODE_PATH=$(npm root -g) node ~/workspace/custom-skills/senior-frontend/scripts/check_ui.mjs <url> --out <dir> --widths 375,1280`.
   Sandbox Playwright cannot reach external hosts — always localhost.
3. Read the screenshots. Check 375 px for horizontal overflow, 1280 px for
   layout. Exercise the unhappy paths: invalid URL params, empty search,
   invalid newsletter email, keyboard-only Tab order, theme toggle in both
   themes.
4. Re-run the engine harness (`bun /tmp/verify-engines.mjs`) if any engine
   file changed — 163 checks must pass.

## 9. Known gaps and notes for later

- **Oversized assets (fidelity first, optimise later):**
  `assets/img/apple-touch-icon.png` is 1,343,866 B (the `src/assets` copy;
  the `public/` one at the site root is 46,287 B and is the one browsers
  use), `assets/img/logo-mark.png` is 1,200,353 B for a 36 px logo,
  `og-image.jpg` / `share-*-dark.jpg` are 1,160,661 B each and byte-identical
  to each other (four copies of the same image in the source).
  `assets/img/og-image.jpg` duplicates the root `og-image.jpg` (same md5).
  A later optimisation pass should resize/compress these and dedupe the
  share images — it needs a decision on which URLs must stay stable.
- **Homepage links that point at not-yet-built pages:** `/tools`,
  `/trackers`, `/generators`, `/news`, `/trailers`, `/trending`, `/about`,
  `/methodology`, `/contact`, `/email-preferences`, and most tool slugs.
  That is expected at scaffold stage; page builders fill them in. Do not
  change the links to `#` — dead links are easier to find than wrong ones.
- **Newsletter:** no backend in the static build. The form validates and
  then says plainly that signup is not connected yet. Wire it to the real
  endpoint when the backend ships; do not fake a success.
- **Trailer:** the homepage links to YouTube (`QdBZY2fkU-0`) instead of the
  source's in-page dialog. A static lightbox can replace the link later.
- **Countdown "Add to Calendar":** links to `/tools/add-to-calendar`
  (not yet built). The `calendar-engine.js` port already has the ICS/URL
  builders for that page.
- **Google Analytics:** the source loads `gtag` (`G-FXX0Z11D8D`). It is
  deliberately absent from the static pages. Add it only on an explicit
  decision, in the same place (head) and with the same ID.
- **Default theme:** light in this build, dark in the source (see §2.11).
- **Common pairings table** on the bottleneck page is the source's
  pre-computed copy. Its verdicts do not always match a live run of the
  engine at 1440p/Online (e.g. RTX 4070 + R5 5600X is listed as "6% CPU
  limited" while the engine computes 23% at 1440p/Online). It is copied
  verbatim with a footnote; reconciling it against the engine is an open
  audit item, not a scaffold decision.
- **Checker fixes already applied at scaffold (2026-11-16):** the
  senior-frontend checker on the homepage found (a) the header search
  overlapping the TRAILERS nav link at exactly 1280 px — fixed by
  shrinking the search to 12 rem at 1280–1440 px and the nav gap to
  1.5 rem; (b) the "View All Categories" action overflowing at 375 px —
  fixed by `flex-wrap: wrap` on `.section-head`; (c) three links sharing
  the accessible name "View all" — fixed with distinct `aria-label`s
  ("View all tools / news / trailers"); (d) axe `color-contrast`
  (serious) on `.preview-pill`, `.preview-vs-delta`,
  `.newsletter-eyebrow` in light mode — fixed with darker light-mode-only
  text colours in `main.css`; (e) missing `width`/`height` on the trailer
  and map images — fixed. Copy these patterns on new pages: every repeated
  link text needs a distinguishing `aria-label`, and accent-coloured small
  text on tinted pills needs a light-mode contrast check.
