# Development

## Verified toolchain

Node 24.22.1, TypeScript 7.0.2, Vite 8.3.5, Vitest 5.0.5 and Playwright 1.64.1 on Ubuntu 24.04 x86-64. Dependencies are exact-pinned in package-lock.json. Setup is `npm ci`; checks are `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run test:e2e` and `npm run test:e2e:prod`. The initial unit command has zero product tests at T-001; it proves runner configuration only. Domain tests arrive with their tasks.

## Dedicated browsers

`npm run browsers:install` invokes the pinned CLI with one absolute project-owned `.cache/pw-browsers` path. Chromium uses the headless shell, not a system browser. Firefox requires the matching managed build. The finite process wrapper bounds install/test trees, isolated contexts and cleanup. CI provisions host dependencies on its disposable Ubuntu runner. Follow the root browser policy.

Observed normal download failure: the Chromium CDN returned HTTP 200 text/html, 195 bytes beginning `<html>`, with a Site Unavailable page instead of ZIP data. Extraction failed with missing ZIP central-directory signature. Firefox independently fell back to the official playwright.download.prss.microsoft.com URL and downloaded/unpacked its 111 MiB build, revision 1555. FFmpeg CDN recovery was interrupted by the installer's owned-lock heartbeat failure; the completed Firefox build was retained. After that installer exited, only its known owned stale lock may be removed; do not clear another installer's lock.

## Verified official-image recovery

No Docker runtime was available. The version-matched official image `mcr.microsoft.com/playwright:v1.64.1-noble` was reachable. Its Linux/amd64 index descriptor, manifest and config were SHA-256 checked. Platform digest: `sha256:d65108d1a8095d8b0c4a5e32bf1807a40a5ce90ff0c78473e1116b1c243235e8`. Browser layer: `sha256:eb005fbb9cada4cd1b9476577a1eef0e000a2a0e9e319f84ecf4bfff1a4f28bb`, exactly 314299121 compressed bytes.

History mapped that layer to the official Chromium install command. Only `ms-playwright/chromium_headless_shell-1248` and `ms-playwright/ffmpeg-1013` were safely extracted after full layer size/hash validation; paths, links/devices and archive filters were checked. Other image browser layers and host libraries were not extracted. The later image layers install Firefox/WebKit and do not alter these selected directories. Source provenance is retained in the ignored recovery cache; no binary is tracked or packaged.

The bounded recovery script `scripts/extract-browser-image.py` documents the verified extraction mechanics for this pinned Linux image. It expects `.cache/browser-image/manifest.json` with the independently fetched and digest-verified platform manifest/config and refuses to overwrite existing browser directories. Generate that input from the official registry index → linux/amd64 digest → manifest/config, checking the declared digests before use. It is recovery tooling, not a portable Windows browser installer; re-evaluate versions, digests, ABI and layer history on toolchain changes.

## Firefox content process

Unmodified Firefox launched, but newPage crashed; browser debug logs showed `Sandbox: writing /proc/self/uid_map: EPERM`. No missing linked libraries were reported. For trusted local tests in this managed host only, prefix browser commands with `PW_FIREFOX_LOCAL_SANDBOX_WORKAROUND=1`. That flag sets only the Firefox child environment `MOZ_DISABLE_CONTENT_SANDBOX=1`; the host boundary remains in place, while Firefox's internal content isolation is reduced. It is not enabled by default or in CI. Do not use it for arbitrary/untrusted browsing; re-evaluate when the host changes.

With that diagnosed override, repeated isolated context/page cycles, native button interaction, Canvas color/glyph raster assertions, screenshots and teardown passed. Chromium passed without the override. Development-server and production-server evidence is distinct from future game acceptance.

## Domain checks

`tests/unit/domain/movement.test.ts` verifies all orientation cell counts, exact I rotation/O invariance, bounds/overlap, immutable movement, classic no-kick rejection and spawn failure with seeded draws. T-002 observed behavioral RED before the corresponding implementation and GREEN afterward.

Gravity/contact advancement uses explicit active time, with contact expiry before gravity at the same timestamp. Lifecycle fixtures cover 999/1000 ms contact, 100 ms versus 210 ms partitions, pause/lag, immutable compaction, level-boundary awards and top-out completion.

## Preference verification

Unit tests inject failures before and after each managed cookie/history write, including silent refusal and denied rollback. Browser tests cover all six keys, explicit defaults, omitted/invalid/duplicate parameters, URL preservation, cookie attributes and actual profile close/reopen. Persistent profiles are created only under each test’s owned output directory and removed after managed contexts close. Firefox uses the same diagnosed process-local override for these test-owned launches. No personal profile is opened.

## Portable validation

The canonical Draft 2020-12 file is docs/dev/spec/SAVE-SCHEMA.json. Vite emits its bytes as tetris-save.schema.json; package validation compares them and requires one unique archive entry. Ajv 8.20.0 uses its 2020 class with explicit canonical date-time validation. The codec scans decoded member names before constructing ordinary JSON objects, then validates the complete shape, domains, real UTC calendar, numeric bounds and unique IDs before returning a normalized copy. JSON is limited to 1 MiB and requires UTF-8 (optional leading BOM). The JSON file UI stages complete validation before the shared settings/results commit. Numeric token checks use exact decimal digit/scale arithmetic before floating-point parsing, preventing fractional roundoff/underflow acceptance. Native tests cover download/reupload, cancellation, paused Canvas preservation and invalid-file/persistence rollback.

## SQLite runtime acceptance

sql.js 1.14.2 and its local WASM asset are exact-pinned. `npx vite build --config vite.runtime.config.ts` builds a separate acceptance entry without shipping the test harness in the game. Run `TEST_RUNTIME=1 npm run test:e2e -- tests/e2e/sqlite-runtime.spec.ts` against it. To verify a subdirectory deployment, set `APP_BASE=/nested/` during both build and preview/test, and `TEST_BASE=/nested/` for the test URL. The worker deadline includes initialization; each success, failure, cancellation or timeout terminates its own worker. The normal product does not expose SQLite until format integration.

SQLite imports check fixed metadata/schema queries, ordinary table columns/primary indexes, storage classes, integrity, and the canonical snapshot validator. Export binds all row values. `trusted_schema=OFF`, `ignore_check_constraints=ON` and `query_only=ON` precede inspection: imported CHECK expressions are not executed by integrity validation. Unknown objects, generated/virtual tables, views/triggers/custom indexes, unsupported metadata and bad rows reject the complete candidate. Databases close in `finally`; the host then terminates the worker.
