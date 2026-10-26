# Implementation tasks

## Execution contract

[PLAN](PLAN.md) owns phase/milestone outcomes and versions; [layout](layout.md) owns paths; [SPEC](SPEC.md) and its children own behavior. Each task below includes its own meaningful failing contract tests, implementation, GREEN/regression evidence and affected user/developer documentation. Record actual RED/GREEN commands/outcomes; no production task is complete from a checkbox alone.

Before a phase starts, require its authorized range, accepted/published integrated preparation, current QC, predecessor integration/release and verified phase tracking. Keep one task's result/evidence/initial checkbox in one commit; push/read back before the next commit, then close/read back its issue. Preserve partial ranges on their phase branch. Verified task outcomes are recorded in their owning commits and phase reports.

Boundary tasks marked **Milestone exit** own whole-milestone code review, required tests/blocker repairs, committed milestone report and HANDOFF in their completion commit. They depend on all earlier tasks in that milestone. Each **Phase review** waits for its delivery milestones/issue closures and owns cross-capability review, required checks/repairs, phase report/HANDOFF, version, complete release notes and static package readiness. Reports include findings and TODOs (`None` when empty), with provenance for deferred non-critical issues; contract violations block completion.

After a complete phase, the coordinator integrates/verifies/publishes default, creates/verifies the default-branch release commit/tag and publishes/readbacks the GitHub release/assets before the next phase. The review task prepares that transition; it cannot claim future integration or release success. Candidate task selection does not authorize execution beyond a human-selected range.

## Phase 1 — Classic baseline

- [x] Phase 1 — Classic baseline
    - [x] Milestone 1.1 — Playable classic game
        - [x] T-001 — Establish reproducible build and isolated browser harness
            Scope: package/lockfile, TypeScript/Vite/Vitest/Playwright configurations, CI, scripts/browser-env.mjs and run-browser-tests.mjs, DEVELOPMENT guidance and generated-path exclusions. Consume existing host/browser/shell policies; produce pinned commands and dedicated absolute browser path.
            Depends on: none; phase activation and preparation integration required.
            Evidence: clean dependency install, typecheck/unit smoke/build; trusted Chromium headless-shell and managed Firefox provisioning identity; repeated isolated page/context/render/teardown through the pinned runner with finite whole-process deadlines. Synthetic setup evidence is distinguished from application acceptance in T-004. If provisioning fails, retain diagnostics and do not claim T-001 complete.
            Verified T-001: clean npm ci, typecheck, production build, development 2/2 and production 2/2 browser tests passed; each test used two isolated context/page cycles with native input and Canvas pixels/glyphs. Unit runner had zero product tests at this scaffold boundary. Official-image Chromium/FFmpeg recovery and process-local Firefox sandbox diagnosis are in DEVELOPMENT. No game acceptance or RED chronology is claimed.
        - [x] T-002 — Implement normal piece geometry and legal movement
            Scope: src/domain/types.ts, geometry.ts, placement.ts, randomizer.ts and initial game.ts plus tests/unit/domain. Provide typed board/pose/command/event values, spawn, classic equal-probability source, collision, left/right/down movement and rotation without kicks; controller consumes these interfaces later.
            Depends on: T-001.
            Evidence: R-BASE coordinate table, all seven kinds, x/bottom bounds, above-top movement, occupied-cell rejection, rotation/O invariance, spawn failure and rejection without state mutation.
            Verified T-002: observed RED (5 behavioral failures, 1 passing rejection fixture), then GREEN 6/6 domain tests and typecheck. Geometry, spawn/collision, immutable movement and classic no-kick rejection are implemented; UI remains scaffold-only.
        - [x] T-003 — Implement gravity, locking, clears and game lifecycle
            Scope: domain game.ts, timing.ts and scoring.ts; command/time integration and deterministic fixtures. Consume T-002 state/geometry; provide active-time advancement, default full-interval locking, simultaneous clear/score/level, game-over event, pause and restart transitions.
            Depends on: T-002.
            Evidence: R-BASE scoring/level boundaries, compaction, above-top lock, 999/1000 ms contact, frame partitioning, pause/resume, score saturation and unique completion; document baseline rule choices.
            Verified T-003: RED 7 lifecycle/timing failures with 6 earlier tests passing; GREEN 13/13 tests and typecheck. Exact contact boundary, grounded/airborne reset, simultaneous clears, pre-clear-level score, immutable boards, pause/lag, distinct frame partitions, saturation and single top-out completion covered.
        - [x] T-004 — Deliver playable classic interface and baseline package
            Scope: src/app/controller.ts and view-model.ts, UI input/board/panels/styles, platform clock, bootstrap, e2e tests, USER-GUIDE and release-package script. Integrate T-002/T-003 into one frame/input lifecycle, centered board/game-info/help, Pause and Start/Restart. Exclude unimplemented feature controls; keep later panel space compatible with layout.
            Depends on: T-001, T-002, T-003.
            Evidence: native movement/rotation/soft drop, pause/blur/hidden-tab, game over/restart, readable score/level, Canvas pixels and centered board in both browsers through development and production server; repeated restart has one loop/listener set. Static package excludes secrets/caches. Milestone exit: review all 1.1 code, resolve blockers, demonstrate playable baseline, commit docs/dev/reports/phases/1/1.1.md and HANDOFF.
            Verified T-004/milestone 1.1: independent source review findings repaired/rechecked; 19 unit tests, typecheck/build, dev 10/10, production 8 passed with 2 explicit fixture-only skips, native raster/focus/rotation/DPR/navigation and static ZIP validation. Report: docs/dev/reports/phases/1/1.1.md.
    - [x] Milestone 1.2 — Phase review
        - [x] T-005 — Review, test and report the classic baseline
            Depends on: T-004 and milestone 1.1 completion/verified closure.
            Evidence: PLAN phase-1 exits, independent code review versus actual tests, both browser capability/acceptance, build/package inspection, user guide and no deferred later-feature claims. Prepare 0.1.0 and RELEASE-NOTES; commit docs/dev/reports/phases/1/PHASE-REPORT.md and HANDOFF. Integration/release follows through the coordinator.

            Verified T-005: separate phase integration/source/package review passed; 19 unit tests, typecheck/build, production 8 passed/2 fixture-only skips, prior unchanged-source development 10/10. Prepared 0.1.0, exact notes body and stable ZIP/checksum; hosted integration/tag/release transitions remain pending.

## Phase 2 — Modern mechanics

- [x] Phase 2 — Modern mechanics
    - [x] Milestone 2.1 — Modern play aids
        - [x] T-006 — Add seven-bag, Hold and next preview
            Scope: domain randomizer/game, view model, Hold/next rendering and focused tests/docs. Consume baseline source/state interfaces; replace classic draws with seven-bag while preserving restart determinism and spawn/lifecycle contracts.
            Depends on: T-005 and verified phase-1 integration/release.
            Evidence: complete seeded bags and bag boundaries; hidden preview consumes no extra pieces; empty/swap/repeated Hold, rotation reset, incoming spawn failure and hold-used reset after lock; native Hold/preview checks in both browsers.
        - [x] T-007 — Implement ordered SRS wall and floor kicks
            Scope: geometry/placement/game rotation and domain fixtures. Consume the canonical orientation/pivot definitions; produce first-legal-candidate rotation for both directions with exact screen-coordinate tables.
            Depends on: T-006.
            Evidence: I/JLSTZ wall/floor cases, candidate order, all candidates rejected, above-top normal poses, O invariance and no score/queue mutation from rejected rotation; relevant baseline regressions.
        - [x] T-008 — Integrate ghost projection and follow-policy hard drop
            Scope: placement/game timing, input, Canvas and help; share one normal landing projector for ghost and hard drop. Enable default dynamic ghost and default follow-policy hard drop without a settings panel.
            Depends on: T-006, T-007.
            Evidence: exact row-10 boundary and straddles, concealed preview/ghost invariance, destination equality, drop score, zero-distance repeated drops and unextended grounded timer; native keyboard/Canvas checks and baseline regressions. Milestone exit: review 2.1 code, demonstrate modern aids, commit docs/dev/reports/phases/2/2.1.md and HANDOFF.
    - [x] Milestone 2.2 — Phase review
        - [x] T-009 — Review, test and report modern mechanics
            Depends on: T-008 and milestone 2.1 completion/verified closure.
            Evidence: PLAN phase-2 exits, all modern interactions plus prior lifecycle/scoring, both browsers and production package; prepare 0.2.0/RELEASE-NOTES, docs/dev/reports/phases/2/PHASE-REPORT.md and HANDOFF.

## Phase 3 — Penetrator gameplay

- [x] Phase 3 — Penetrator gameplay
    - [x] Milestone 3.1 — Penetrator ability
        - [x] T-010 — Implement bonus lifecycle and viable penetrator traversal
            Scope: domain game/placement/timing and fixtures. Consume the canonical projector/kick owner; add four-line bonus earning/cap, successful activation spending, overlapping traversal with deepest valid terminal projection and Hold prohibition.
            Depends on: T-009 and verified phase-2 integration/release.
            Evidence: no-bonus/repeated/above-board/paused rejection, four simultaneous versus cumulative clears, cap three, pockets below blockers, no viable candidate, bounded kicks, airborne activation clearing contact and valid lock preserving unrelated settled cells. Ghost/drop consumers receive the same projected result.
        - [x] T-011 — Integrate penetrator controls, rendering and feedback
            Scope: controller/input/view model/Canvas/game-info/help and e2e fixtures. Expose V activation, entirely white active pieces and one bonus symbol per available use; keep normal/settled pieces non-white.
            Depends on: T-010.
            Evidence: native activation/spend/reward, disabled Hold while active, hard drop and ghost below blocking cells, valid lock, normal and penetrator color pixels, restart reset and prior gameplay regressions in both browsers. Milestone exit: whole 3.1 review/repairs, ability demonstration, docs/dev/reports/phases/3/3.1.md and HANDOFF.
    - [x] Milestone 3.2 — Phase review
        - [x] T-012 — Review, test and report penetrator gameplay
            Depends on: T-011 and milestone 3.1 completion/verified closure.
            Evidence: PLAN phase-3 exits and cross-rule projection/timing/bonus interactions, both browsers and package; prepare 0.3.0/RELEASE-NOTES, docs/dev/reports/phases/3/PHASE-REPORT.md and HANDOFF.

## Phase 4 — Session configuration

- [x] Phase 4 — Session configuration
    - [x] Milestone 4.1 — Configurable session
        - [x] T-013 — Define six settings and live locking-policy application
            Scope: app/settings.ts, initial settings-transaction.ts memory port, domain rule application and unit tests. Produce one descriptor catalogue with exact key/domain/default/wire strings; add failed-down and immediate hard-drop policies and accepted live-change semantics.
            Depends on: T-012 and verified phase-3 integration/release.
            Evidence: every domain/default, invalid values, disabled Hold/drop preserving state, both lock policies and zero-distance drops, changed versus unchanged policy contact timing, paused changes and active penetrator preservation. Session-only values; no browser storage claims.
        - [x] T-014 — Deliver settings controls and centered optional panels
            Scope: UI settings/help controls, controller/view model/styles and e2e tests. Render six labeled values, separate settings/help toggles above Pause/Start, minimum-width responsive surface and stable board anchor. Keep transfer buttons and leaderboard capability absent until delivered.
            Depends on: T-013.
            Evidence: native interaction with each value, feature keys in form fields versus gameplay focus, settings/help combinations, no overlap, board center within one CSS pixel at supported sizes and scrolling below minimum; reload defaults and prior gameplay regressions. Milestone exit: review 4.1, demonstrate controls, docs/dev/reports/phases/4/4.1.md and HANDOFF.
    - [x] Milestone 4.2 — Phase review
        - [x] T-015 — Review, test and report session configuration
            Depends on: T-014 and milestone 4.1 completion/verified closure.
            Evidence: PLAN phase-4 exits, all live-policy/disabled-feature interactions, both browsers, labels/help and build; prepare 0.4.0/RELEASE-NOTES, docs/dev/reports/phases/4/PHASE-REPORT.md and HANDOFF.

## Phase 5 — Persistent configuration

- [x] Phase 5 — Persistent configuration
    - [x] Milestone 5.1 — Persistent settings
        - [x] T-016 — Implement independent URL and cookie source resolution
            Scope: app/settings.ts and platform/preferences.ts with controlled adapter tests. Produce exact managed-cookie/query capture, safe wire decoding, source selection and source-specific warnings; preserve unknown parameters/fragment.
            Depends on: T-015 and verified phase-4 integration/release.
            Evidence: every key with valid/invalid/missing/conflicting sources, duplicate/empty/case-sensitive query values, explicit default, missing parameter retaining cookie and malformed cookie fallback. Adapter operations are separately testable from application mutation.
        - [x] T-017 — Integrate persistent changes, readback and rollback
            Scope: settings-transaction/controller/preferences, startup resolution and persistent-context e2e tests/docs. Consume T-016 resolution and add canonical cookie/query writes for explicit URL and user changes, serialized capture/readback/rollback and clear denied-storage messages.
            Depends on: T-016.
            Evidence: six-key native reload matrix, omission/default semantics, no unmanaged value loss, cookie flags, failure at every managed write/history step and verified exact rollback; no reset on unchanged policy. Both browsers retain earlier gameplay/layout checks. Milestone exit: review 5.1, demonstrate URL sharing/cookie recovery, docs/dev/reports/phases/5/5.1.md and HANDOFF.
    - [x] Milestone 5.2 — Phase review
        - [x] T-018 — Review, test and report persistent settings
            Depends on: T-017 and milestone 5.1 completion/verified closure.
            Evidence: PLAN phase-5 exits, source/write failure distinctions and cumulative native regressions, both browsers/build; prepare 0.5.0/RELEASE-NOTES, docs/dev/reports/phases/5/PHASE-REPORT.md and HANDOFF.

## Phase 6 — Session leaderboard

- [x] Phase 6 — Session leaderboard
    - [x] Milestone 6.1 — Completed-game history
        - [x] T-019 — Record and rank completed games exactly once
            Scope: app/leaderboard.ts, controller completion consumption, platform identity/UTC clock and tests. Produce canonical stable-ID/timestamp/safe-score results and deterministic top-ten ranking; no automatic result persistence.
            Depends on: T-018 and verified phase-5 integration/release.
            Evidence: zero-score results, duplicate events, restart abandonment, ties, eleven-plus games, ID stability, UTC calendar format, result retention across restart and clearing on page session reload. Existing settings persistence remains independent.
        - [x] T-020 — Deliver leaderboard panel and complete toggle layout
            Scope: panels/view model/styles/help and native acceptance. Add ranked top-ten/empty state, leaderboard toggle above Pause/Start and the final five-panel order; use textual time/score values safely.
            Depends on: T-019.
            Evidence: visible ranking updates after game completion, session restart retention/reload clearing, all eight optional-panel combinations, required panels visible and board-centered measurements at supported sizes in both browsers. Milestone exit: review 6.1, demonstrate completed history, docs/dev/reports/phases/6/6.1.md and HANDOFF.
    - [x] Milestone 6.2 — Phase review
        - [x] T-021 — Review, test and report session leaderboard
            Depends on: T-020 and milestone 6.1 completion/verified closure.
            Evidence: PLAN phase-6 exits, result lifecycle versus settings/bonus/game restart, full layout/native regressions and build; prepare 0.6.0/RELEASE-NOTES, docs/dev/reports/phases/6/PHASE-REPORT.md and HANDOFF.

## Phase 7 — Portable saves

- [ ] Phase 7 — Portable saves
    - [x] Milestone 7.1 — JSON transfer
        - [x] T-022 — Implement canonical snapshot validation and strict JSON codec
            Scope: transfer/types.ts, validate.ts, json.ts, canonical SAVE-SCHEMA packaging and synthetic transfer corpus. Consume exact settings/result types; produce a validated immutable payload or located error, with duplicate-member detection before object construction.
            Depends on: T-021 and verified phase-6 integration/release.
            Evidence: valid empty/top-ten/default payloads and schema equivalence; unknown/missing/duplicate properties or IDs, unsafe/fractional/negative numbers, bad UUID/calendar/offset, version and size/UTF-8/BOM cases. A bad final result rejects the whole file; no application mutation occurs in codecs.
        - [x] T-023 — Deliver manual JSON Save and atomic Restore
            Scope: platform/files.ts, app settings/results commit coordination, panels/controller and native download/upload tests/docs. Add exactly one bottom-of-settings Save/Restore pair, snapshot capture, pause-before-picker, serialized operation/cancellation/error handling and complete persistence/state commit after T-022 validation.
            Depends on: T-022.
            Evidence: native JSON download/reupload, replacement including empty history, all six cookies/query defaults, preserved active board/score, explicit resume, hiding settings hides both buttons, blocked start during commit, unchanged data on every invalid/cancel/failure case and no resource leaks in both browsers. Milestone exit: review 7.1, JSON demonstration, docs/dev/reports/phases/7/7.1.md and HANDOFF.
    - [x] Milestone 7.2 — SQLite transfer
        - [x] T-024 — Package isolated SQLite worker and runtime assets
            Scope: pinned SQLite dependency/lockfile, transfer/sqlite-host.ts and sqlite.worker.ts, Vite asset routing and production browser checks. Provide operation IDs, finite 10-second lifecycle, runtime initialization and disposal without application-state access.
            Depends on: T-023 and milestone 7.1 completion/verified closure.
            Evidence: actual packaged module-worker/WASM load under root and non-root production bases in both browsers; trusted empty-database operation, stale reply, timeout, startup error and cleanup. Do not expose a working SQLite format choice until T-026 integration.
        - [x] T-025 — Implement versioned SQLite schema and fixed-query codec
            Scope: transfer/sqlite.ts and worker command integration with corruption/schema/type fixtures. Consume T-022 canonical validator and T-024 worker; produce parameterized export and staged canonical decode with required metadata, integrity and allowlisted ordinary tables.
            Depends on: T-024.
            Evidence: zero/ten results and six unique settings; stable IDs/score/time; exact storage classes/column structure/metadata; corrupt/spoofed/truncated files, views/triggers/virtual tables/custom indexes, bad rows/keys and safe-integer boundaries. Imported SQL or schema code is never executed by an application command.
        - [x] T-026 — Integrate format choice and cross-format file acceptance
            Scope: existing single Save/Restore pair, header detection/files, transfer orchestration, schema/download packaging and e2e/user guide. Offer JSON/SQLite through the existing Save format choice; Restore accepts either through the same validated commit path.
            Depends on: T-024, T-025.
            Evidence: JSON→SQLite→JSON canonical equality, both native downloads/reuploads, immutable Save snapshot during play, complete invalid-file rejection, worker timeout/asset failure, cookie/history rollback and all earlier gameplay/layout regressions in both browsers. Milestone exit: review 7.2, interchangeable-format demonstration, docs/dev/reports/phases/7/7.2.md and HANDOFF.
    - [ ] Milestone 7.3 — Phase review
        - [ ] T-027 — Review, test and report the complete target product
            Depends on: T-023, T-026 and milestones 7.1/7.2 completion/verified closure.
            Evidence: every SPEC acceptance group, independent code review, unit/integration/native-browser matrix, malformed/corrupt/resource/persistence failure corpus, production worker/base-path assets, final docs/schema/archive and all prior regressions. Prepare 1.0.0/RELEASE-NOTES, docs/dev/reports/phases/7/PHASE-REPORT.md, final docs/dev/reports/IMPLEMENTATION-REPORT.md with all unresolved/deferred TODO provenance, and HANDOFF. Full release completion is reported only after the coordinator's verified integration/tag/GitHub publication.
