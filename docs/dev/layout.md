# Repository layout

## Ownership and status

This layout allocates the components in [DECOMPOSITION](DECOMPOSITION.md) and increments in [PLAN](PLAN.md). Existing repository content consists of root guidance/policies, vendored skills, manual-log scaffold and development documents. Application, test, build and release paths below are intended homes; their appearance here does not claim implementation.

| Path | Owner / responsibility |
| --- | --- |
| `index.html`, `src/main.ts` | Application bootstrap and one installation/disposal of browser listeners |
| `src/domain/types.ts` | Plain game/pose/event types; no DOM or adapter imports |
| `src/domain/geometry.ts`, `placement.ts` | D1 cells/rotations/kicks and canonical normal/penetrator projection |
| `src/domain/randomizer.ts` | D2 random source, classic draws, seven-bag and queue |
| `src/domain/game.ts`, `timing.ts`, `scoring.ts` | D3/D4 state transitions, active-time scheduling and scoring; split only these distinct rule owners |
| `src/app/controller.ts`, `view-model.ts` | A1 lifecycle/commands and immutable presentation values |
| `src/app/settings.ts` | A2 six descriptors, domains/defaults and source resolver |
| `src/app/leaderboard.ts` | A3 canonical results, completion ingestion and deterministic ranking |
| `src/app/settings-transaction.ts` | A4 serialized captured-state persistence/restore commit and rollback |
| `src/ui/input.ts`, `board.ts`, `panels.ts`, `styles.css` | P1 native key/focus dispatch, P2 Canvas rendering, P3 accessible panels/layout; no direct persistence writes |
| `src/platform/clock.ts`, `identity.ts`, `preferences.ts`, `files.ts` | B1/B2/B4 monotonic/UTC/ID, cookie/URL and native file/download adapters |
| `src/transfer/types.ts`, `validate.ts`, `json.ts` | T1/T2 canonical payload types, shared validator, strict JSON codec/duplicate-member detection |
| `src/transfer/sqlite.ts`, `sqlite-host.ts`, `sqlite.worker.ts` | T3/B3 fixed SQLite codec, operation/timeout host and dedicated module worker |
| `docs/dev/spec/SAVE-SCHEMA.json` | Canonical versioned JSON Schema imported/packaged by transfer/build tooling; do not maintain a second authoritative copy |
| `tests/unit/domain/`, `app/`, `transfer/` | Deterministic rule, resolver/transaction/result and codec/validation tests respectively |
| `tests/fixtures/` | Synthetic board/seed/save/corrupt-input fixtures with no real user data or credentials |
| `tests/e2e/` | Playwright native-input, raster, panel, persistence, download/upload and production-worker acceptance |
| `tests/support/` | Seeded clocks/IDs, board setup and failure-injection helpers; no production behavior shortcut used as native acceptance |
| `scripts/browser-env.mjs`, `run-browser-tests.mjs` | Dedicated browser-path provisioning/identity diagnostics and finite process lifecycle/deadline ownership |
| `scripts/package-release.mjs` | Deterministic static release archive/checksum/schema packaging, excluding credentials/caches/provenance |
| `package.json`, `package-lock.json`, `tsconfig.json`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts` | Pinned dependencies, TypeScript/Vite build, unit and two-browser server/test configurations |
| `.github/workflows/ci.yml` | Reproducible unit/build/browser checks with the same isolated environment policy; hosting credentials are not embedded |
| `docs/USER-GUIDE.md`, `docs/DEVELOPMENT.md` | User controls/rules/files and verified setup/check/browser troubleshooting instructions |
| `README.md`, `AGENTS.md` | Concise product navigation and governing project/owner/check-command navigation; preserve manual instructions |
| `RELEASE-NOTES.md` | Complete current release message, source/version/compatibility/validation and limitations |
| `docs/dev/reports/phases/<phase>/<milestone>.md` | Verified implementation milestone review/results and TODOs |
| `docs/dev/reports/phases/<phase>/PHASE-REPORT.md` | Phase exits, code review/testing, remaining findings and integration readiness |
| `docs/dev/reports/IMPLEMENTATION-REPORT.md` | Final aggregate result, evidence and unresolved/deferred TODO provenance |
| `docs/dev/DOCS_TASKS.md`, `DOCS_PREPARATION.md`, `HANDOFF.md` | Preparation task ownership, control/evidence and periodic continuity |
| `.agents/` | Existing pinned skills/plugin content; product tasks do not change it |
| `docs/ai-logs/` | Existing manual provenance scaffold; conversation content is excluded from routine loading and product artifacts |

## Dependency and placement rules

Domain imports only domain/plain shared types. Application depends on domain and narrow adapter contracts; UI dispatches application commands and reads view models. Platform adapters expose browser effects without owning game rules. Transfer validators/codecs accept plain snapshots and never import the game controller. The SQLite host/worker boundary carries operation IDs and validated messages; only the application coordinator can commit a restore.

Do not create separate collision or landing implementations in `board.ts`, preview code or SQLite modules. Keep source-precedence logic in settings and external writes in preferences/transaction modules. Shared transfer/settings types may be moved to one small neutral types module if both consumers need them; do not introduce circular imports or a generic framework for that purpose.

The SQLite worker is instantiated with a bundler-resolved module-worker URL, and runtime/WASM files are copied/imported as production assets from the pinned package. Do not rely on a development-only path, CDN or raw `/node_modules` URL. Production acceptance must load assets under both root and a non-root base path. A generated distributable schema copy is byte-checked against the canonical schema, not edited independently.

## Generated and excluded paths

Ignore `node_modules/`, `dist/`, `coverage/`, `test-results/`, `playwright-report/`, `.cache/` and `artifacts/`. Preserve existing ignore entries including `*.tkn`. Use one absolute `PLAYWRIGHT_BROWSERS_PATH` resolved to the project's `.cache/pw-browsers/` for install and every browser process; profiles/downloads go in owned temporary test directories. Do not search or use personal/global browser installations. Build assets and packages never include the token input or caches.

`artifacts/releases/` holds locally generated static ZIPs/checksums before hosted upload. Release archives contain production assets, schema and usage/license notices needed to use them; source provenance remains Git/tag metadata. Build/CI check that no token, manual transcript, test browser binary, test fixture or development source is accidentally packaged. Only owned generated resources may be cleaned.

## Intended commands

These commands are targets for implementation, not already validated repository commands: `npm ci`, `npm run typecheck`, `npm run test:unit`, `npm run build`, `npm run browsers:install`, `npm run test:e2e`, `npm run test:e2e:prod`, and `npm run package:release`. Use Node 22+ and the lockfile-selected compatible runner/browser versions. `test:e2e` exercises the actual development server; `test:e2e:prod` exercises built assets under the configured preview/base paths. Both use the finite process wrapper and isolated Chromium/managed Firefox configuration.

Update root AGENTS and DEVELOPMENT with observed commands, versions, browser paths/modes, provisioning results and troubleshooting when those commands exist and have been verified. Documentation-only planning requires no browser provisioning. Windows execution uses the existing CMD policy; Linux uses its native shell. Repository checkout, ignored credentials, generated caches and current user settings stay outside release artifacts.
