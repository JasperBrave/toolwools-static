# ENGINES.md — ported calculation engines

Every calculator engine from the TanStack source (`~/workspace/toolwools-src/src/lib/tools/`)
is ported to vanilla JS in `assets/js/engines/`, one file per engine, same file
name, same exported function names, same maths, same data tables. No data was
invented and no formula was re-typed: each file was produced by transpiling
the TypeScript original with Bun (types stripped only) and rewriting only the
import paths to relative `.js` files.

## How the port was made

- Tool: `/tmp/port-engines.mjs` (run with `bun`; kept out of this tree because
  it is a one-off scaffold script, re-run it from the source if an engine
  changes — do not hand-edit the maths in the `.js` files).
- Type-only imports dropped; value imports rewritten:
  - `@/lib/tools/bottleneck-engine` → `./bottleneck-engine.js`
  - `@/lib/tools/vram-engine` → `./vram-engine.js`
  - `@/lib/tools/fps-engine` → `./fps-engine.js`
  - `../constants` (calendar-engine only) → inlined as
    `SITE_URL = "https://toolwools.com"`, `SITE_NAME = "ToolWools"` (exact
    values from `src/lib/constants.ts`).
- Dependency order: `bottleneck-engine` and `vram-engine` are standalone;
  `fps-engine` imports both; `gpu-tier-engine` imports `fps-engine`;
  `readiness-engine` imports `fps-engine` and `vram-engine`. All other
  engines are standalone.
- Each ported file carries a header comment naming its TS source.

## Engine inventory

| Ported file | Source file | Exports (functions + tables) |
|---|---|---|
| `bottleneck-engine.js` | `src/lib/tools/bottleneck-engine.ts` (143 lines) | `GPUS` (28), `CPUS` (21), `RES_FACTOR`, `WORKLOAD_FACTOR`, `BASE_FPS`, `WORKLOAD_META`, `computeBalance`, `suggestUpgrade`, `verdictLabelOf` |
| `calendar-engine.js` | `src/lib/tools/calendar-engine.ts` (207 lines) | `LAUNCH_UTC`, `REGIONS`, `formatInTz`, `offsetLabel`, `localClock`, `toGCalStamp`, `computeRange`, `googleCalendarUrl`, `outlookUrl`, `yahooUrl`, `buildIcs`, `computeCountdown` |
| `economy-engine.js` | `src/lib/tools/economy-engine.ts` (378 lines) | `METHODS`, `BUSINESSES`, `SHARK_CARDS`, `rateFor`, `rankedMethods`, `findMethod`, `planGrind`, `businessRoi`, `rankedBusinesses`, `valueTable`, `cheapestBundle`, `money`, `compactMoney` |
| `edition-engine.js` | `src/lib/tools/edition-engine.ts` (555 lines) | `EDITIONS`, `BONUSES`, `PROFILES`, `UNKNOWNS`, `editionById`, `profileById`, `platformById`, `resolveWeights`, `evaluateEditions` |
| `fps-engine.js` | `src/lib/tools/fps-engine.ts` (353 lines) | `GPUS`, `CPUS` (re-exported bottleneck catalogs), `RES_META`, `PRESET_META`, `UPSCALER_META`, `FRAMEGEN_META`, `GPU_DEFAULT_VRAM`, `estimateFps`, `suggestTweaks`, `findGpuById`, `findCpuById`, `defaultVramForGpu` |
| `gpu-tier-engine.js` | `src/lib/tools/gpu-tier-engine.ts` (610 lines) | `GPU_CATALOG`, `TIER_META`, `TIER_ORDER`, `scoreGpu`, `tierFor`, `rank`, `rankAll`, `filterAndRank` |
| `preorder-engine.js` | `src/lib/tools/preorder-engine.ts` (526 lines) | `PLATFORMS`, `REGIONS`, `EDITIONS`, `CHANNELS`, `AXIS_LABELS`, `AXIS_DETAIL`, `platformById`, `regionById`, `editionById`, `channelById`, `weightsFor`, `rankChannels` |
| `price-engine.js` | `src/lib/tools/price-engine.ts` (330 lines) | `RATES_AS_OF`, `EDITIONS`, `MARKETS`, `decimalsFor`, `formatLocal`, `formatUsd`, `convert`, `priceFor`, `allPrices`, `importVerdict`, `editionValues`, `guessMarketCode`, `marketByCode`, `BAND_LABEL` |
| `readiness-engine.js` | `src/lib/tools/readiness-engine.ts` (225 lines) | `DRIVE_META`, `GRADE_THRESHOLDS`, `WEIGHTS`, `performanceScore`, `vramScore`, `storageScore`, `networkScore`, `gradeFor`, `estimateReadiness` |
| `speed-engine.js` | `src/lib/tools/speed-engine.ts` (557 lines) | `REGIONS`, `CONNECTION_TYPES`, `DEVICES`, `REQUIREMENTS`, `regionById`, `connectionById`, `deviceById`, `pingTargetFor`, `gradeConnection`, `buildFixes`, `regionTargets`, `guessRegion` |
| `vram-engine.js` | `src/lib/tools/vram-engine.ts` (246 lines) | `GPUS`, `RES_META`, `PRESET_META`, `estimateVramNeeded`, `verdictForCard`, `findGpuById` |

## Verification — TS original vs JS port, same inputs

Harness: `/tmp/verify-engines.mjs`, run with `bun`. It imports each TypeScript
original and its JS port, runs the same calls, and deep-compares outputs
(canonical JSON, keys sorted). Result: **163 checks, 163 pass, 0 fail.**

Comparison table (representative cases; the harness runs all of these plus
full data-table equality for every engine):

| Engine | Case | TS original | JS port | Match |
|---|---|---|---|---|
| bottleneck | computeBalance RTX 4070 + R5 5600X, 1440p, online | CPU bottleneck 23%, 44–63 fps, avg 55 | same | Yes |
| bottleneck | computeBalance RTX 5090 + i5-8400, 1080p, stream | CPU bottleneck (headGpu 1.573, headCpu 0.304) | same | Yes |
| bottleneck | suggestUpgrade RTX 4070 + R5 5600X, 1440p, online | Ryzen 7 5800X3D, 23% → 6% | same | Yes |
| bottleneck | GPUS (28) + CPUS (21) tables | identical | identical | Yes |
| calendar | computeCountdown 2026-10-01 | 49 days, 5 h, 0 m, 0 s | same | Yes |
| calendar | googleCalendarUrl / outlookUrl / yahooUrl / buildIcs | identical strings | identical | Yes |
| calendar | formatInTz launch, America/New_York + Asia/Karachi | identical | identical | Yes |
| economy | planGrind flagship-heist, goal 1,000,000, balance 250,000, 2 h sessions | identical | identical | Yes |
| economy | cheapestBundle 2,500,000; valueTable 60,000; rankedBusinesses 20 h | identical | identical | Yes |
| edition | evaluateEditions ps5 / online-grinder / 50% uplift | identical | identical | Yes |
| edition | evaluateEditions pc / collector / 0% uplift; xbox / story-only / 200% | identical | identical | Yes |
| fps | estimateFps RTX 4070 + R5 5600X, 1440p High, DLSS Quality, 16 GB | identical | identical | Yes |
| fps | estimateFps RTX 5090 + 7800X3D, 4K Ultra, DLSS FG, 32 GB | identical | identical | Yes |
| fps | estimateFps GTX 1060 + i5-8400, 1080p Low, 8 GB | identical | identical | Yes |
| fps | suggestTweaks (all 4 inputs above) | identical | identical | Yes |
| gpu-tier | scoreGpu + rank (first, 11th, 26th catalog entries) | identical | identical | Yes |
| gpu-tier | rankAll; filterAndRank {} / {S, nvidia} / {minVram 12, max $600} | identical | identical | Yes |
| preorder | rankChannels ps5/uk/deluxe; pc/eu/ultimate; xbox/us/standard | identical | identical | Yes |
| price | priceFor US; priceFor JP deluxe; allPrices; importVerdict GB + US | identical | identical | Yes |
| price | editionValues DE; guessMarketCode en-GB / none; convert 100 USD→GBP | identical | identical | Yes |
| readiness | estimateReadiness ×3 rigs (mid, low, flagship) + 4 sub-scores each | identical | identical | Yes |
| speed | gradeConnection ×3 (fibre/500 Mbps, cable/120 Mbps, DSL/25 Mbps) | identical | identical | Yes |
| speed | buildFixes for each graded result; pingTargetFor; regionTargets | identical | identical | Yes |
| vram | estimateVramNeeded 1440p High RT on; 4K Ultra all extras; 1080p Low | identical | identical | Yes |
| vram | verdictForCard 12 GB + 8 GB against each need | identical | identical | Yes |

Notes on the comparison:
- `computeCountdown` for 2026-11-20 returns `released: true` with all zeros in
  both versions.
- `formatInTz` / `localClock` use `Intl` in both versions, so locale output
  matches in the same runtime.
- The harness also compares every exported data table wholesale
  (`METHODS`, `BUSINESSES`, `SHARK_CARDS`, `EDITIONS`, `BONUSES`, `PROFILES`,
  `UNKNOWNS`, `MARKETS`, `GPU_CATALOG`, `REGIONS`, `CONNECTION_TYPES`,
  `DEVICES`, `PLATFORMS`, `CHANNELS`, `GPUS`, `CPUS`, `RES_META`,
  `PRESET_META`, `TIER_META`, `WEIGHTS`, `REQUIREMENTS`).

## Not ported (deliberately)

- `src/lib/tools/registry.ts` — tool catalogue metadata, not a calculator.
  Page builders should read it directly for titles/descriptions (the header
  search index in `assets/js/search.js` already embeds its 19 tools).
- `src/lib/tools/content/*.ts` — page copy (hero, FAQs, methodology). Copied
  by hand into each page's HTML, not as JS.
- `src/lib/tools/breadcrumbs.ts`, `related-engine.ts`, `guides-registry.ts`,
  `share.functions.ts`, `use-saved-results.ts` — routing/UI helpers, not
  maths. Their behaviour is re-implemented in page JS where needed
  (breadcrumbs are static HTML; share links are built in `bottleneck.js`).
- `src/lib/tools/types.ts`, `content-types.ts` — TypeScript types only.

## Audit fixes applied 2026-11-17 (deliberate divergence from the TS original)

The audit (`~/workspace/goals/toolwools-multilingual-static-rebuild/hidden_files/AUDIT-2026-11-17.md`)
found defects in the TanStack source. The source itself was NOT edited; the
ported JS below carries the fixes, each marked with an `AUDIT FIX` comment.
The 163-check harness compares against the TS original, so these points now
differ from it by design:

- **H4 — shared catalog (bottleneck-engine.js, fps-engine.js):** GPU/CPU
  lists sorted by score descending; "Core i9-14900K / 15900K" typo fixed
  (no 15900K); missing current-gen cards added with sourced scores —
  RTX 5060 (52), RTX 5060 Ti 8/16 GB (62), RX 9070 (84), RX 9070 XT (94),
  Intel Arc B580 (54) — and `GPU_DEFAULT_VRAM` extended for them, so a
  5060 owner can use the FPS and bottleneck calculators.
- **M5 — VRAM tuning tips (vram-engine.js):** `verdictForCard` tuning tips
  now compute saved gigabytes per resolution from the same constants as
  `estimateVramNeeded` (Ultra to Very High saves 1.8 GB at 1080p, 2.3 GB at
  1440p, 3.1 GB at 4K). No hardcoded 1080p numbers at other resolutions.
- **M6 — ultrawide VRAM (fps-engine.js):** `estimateFps` multiplies the
  VRAM need by 1.34 for ultrawide 1440p (3440×1440 has ~34% more pixels
  than 2560×1440). Frame-gen FPS is labelled interpolated, not measured,
  in the page copy.
- **H2 — install size (readiness-engine.js):** `REFERENCE_INSTALL_GB`
  100 → 150, so storage and network sub-scores match the download-time and
  storage-planner tools. The hours formula was also fixed: the TS source
  `(REFERENCE_INSTALL_GB * 8) / mbps / 3600` understates install time
  1000× (it printed "~0 min" for 150 GB at 150 Mbps); the port uses
  `* 8000`. 150 GB at 111 Mbps is now ~3.0 h, matching the full-marks
  network threshold.
