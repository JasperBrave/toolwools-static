# ToolWools — static multilingual site

GTA 6 tools, calculators and guides as a fully static, SEO-ready website.
No build step, no backend, no framework at runtime: plain HTML, CSS and
JavaScript that any static host can serve.

- **280 pages** — 40 per locale × 7 locales: English (root) + Spanish,
  Portuguese, German, French, Turkish and Arabic (RTL).
- **11 calculator engines** (bottleneck, FPS, VRAM, economy, readiness,
  download time, storage planner, price by country, GPU tier list,
  system requirements, edition comparison) with identical numbers in
  every locale.
- **SEO**: per-locale sitemaps + sitemap index, hreflang including
  x-default, localized JSON-LD, robots.txt, `llms.txt` / `llms-full.txt`
  per locale.
- **Content**: guides, news, trailers, interactive map, trackers,
  countdown and add-to-calendar (ICS download).

## Origin

Rebuilt from the original TanStack Start + React codebase into static
HTML/CSS/JS so the site can be hosted anywhere with zero runtime
dependencies. The newsletter form posts to the same Supabase endpoints
the original app used; without backend credentials it reports
"not connected" and nothing breaks.

## Deploy

Any static host works. On Vercel: import this repo, no build command,
output directory is the repo root. The site is also served locally with
any static server, e.g. `python3 -m http.server 8903`.

## Layout

- `index.html` — English homepage; `/es/`, `/pt/`, `/de/`, `/fr/`,
  `/tr/`, `/ar/` hold the other locales (same 40 slugs each).
- `tools/` — the calculators and trackers.
- `guides/`, `news/`, `trailers/`, `trending/`, `trackers/` — content.
- `assets/js/` — page scripts (`assets/js/<locale>/` holds the
  localized copies) and `assets/js/engines/` — the calculator engines.
- `assets/css/`, `assets/images/` — styles and media.
- `sitemap.xml` (index) + `sitemap-en.xml` + `<locale>/sitemap.xml`.
- `llms.txt`, `llms-full.txt`, `robots.txt`, `manifest.json`.

## Verification

See [AUDIT-REPORT.md](AUDIT-REPORT.md) for the audit and the
verification numbers for this tree.
