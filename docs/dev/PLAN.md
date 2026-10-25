# Delivery plan

## Objective and approach

Deliver the complete [SPEC](SPEC.md) as useful increments on a working browser game. [ARCHITECTURE](ARCHITECTURE.md) and [DECOMPOSITION](DECOMPOSITION.md) keep rules, presentation, persistence and transfer independently testable. Each phase preserves the preceding usable baseline, integrates its own changed capability, and produces a verified release. The first phase is an actual playable classic game, not a technical skeleton.

| Phase | Integrated outcome | Delivery milestones | Version |
| --- | --- | --- | --- |
| 1 — Classic baseline | Play, score, level, pause, lose and restart | 1.1 Playable classic game | 0.1.0 |
| 2 — Modern mechanics | Seven-bag, Hold, SRS, ghost and hard drop | 2.1 Modern play aids | 0.2.0 |
| 3 — Penetrator gameplay | Earn/spend bonuses and traverse blockers safely | 3.1 Penetrator ability | 0.3.0 |
| 4 — Session configuration | Six controls, alternative lock policies and optional settings/help layout | 4.1 Configurable session | 0.4.0 |
| 5 — Persistent configuration | Per-setting cookie/URL resolution and persistence | 5.1 Persistent settings | 0.5.0 |
| 6 — Session leaderboard | Ranked completed-game results and leaderboard visibility | 6.1 Completed-game history | 0.6.0 |
| 7 — Portable saves | Manual interchangeable JSON/SQLite snapshots and atomic Restore | 7.1 JSON transfer; 7.2 SQLite transfer | 1.0.0 |

Each phase also has its final review milestone: 1.2, 2.2, 3.2, 4.2, 5.2, 6.2 and 7.3 respectively, each named Phase review. These are excluded from delivery counts. Dependencies are sequential phase exits; the final review milestone depends on all delivery milestones in its phase, not on its own closure.

## Phase 1 — Classic baseline

**Outcome:** a user can complete repeated classic games with keyboard controls and visible score/level/state. **Milestone 1.1 — Playable classic game** includes reproducible TypeScript/static build and isolated browser test setup, normal geometry/collision, independent piece draws, gravity/contact timing, line clearing/scoring/levels, game-over/restart, Canvas board, game-info, help, focus and pause. Use the final intended board size, default interval locking and centered board anchor from the beginning.

Defer Hold, seven-bag, SRS kicks, ghost, hard drop, penetrator, settings panels/persistence, leaderboard and file transfer. Classic rotation without kicks is sufficient. These features are independent of useful classic play and must not expand this phase. Preserve the later accepted scope in SPEC without claiming it is delivered here.

**Exits:** deterministic core-rule and timing checks, repeated actual browser games/restarts, native input/focus, rasterized board evidence and production-build smoke in both required browsers. Capture a playable screenshot and concise evidence of basic usability: controls readable, board centered, no obstructed actions. Milestone review covers all 1.1 code, applicable tests/repairs and report/HANDOFF. **Milestone 1.2 — Phase review** verifies the integrated baseline, dependencies, user guide, build package, version/notes readiness and regressions; then integrate and release 0.1.0. If required browser provisioning fails, retain diagnostics/partial work and block the affected exit rather than marking the phase complete.

## Phase 2 — Modern mechanics

**Milestone 2.1 — Modern play aids** evolves the baseline with seven-bag and one-piece next preview, once-per-piece Hold, bidirectional SRS rotation, shared normal landing projection, default dynamic ghost and follow-policy hard drop. Preserve the baseline score/lifecycle and contact timing. Display labeled Hold/next and help for the new keys. Default enabled behavior needs no settings persistence.

Defer penetrator, configurable alternative policies, cookies/URL, leaderboard and files. **Exits:** bag boundaries and Hold/spawn failure; wall/floor kicks for I/JLSTZ; midline straddles; identical ghost/drop destinations; zero-distance repeated-drop timing and native input/render checks in both browsers. Demonstrate Hold/ghost/drop usefulness without surprising timer resets. Whole-milestone review/report/HANDOFF is folded into the final delivery task. **Milestone 2.2 — Phase review** checks the cumulative playable product, packages/documents the increment, then integration/release yields 0.2.0.

## Phase 3 — Penetrator gameplay

**Milestone 3.1 — Penetrator ability** adds four-line rewards/cap, activation rejection/spending, white active rendering, a bonus symbol count, disabled Hold during activation, and traversal/kicks that retain legal terminal landings. Extend the existing single projection owner so ghost/hard drop agree below blockers. Keep settled cells intact during overlap.

This depends on the modern projector, input and rendering rather than creating a second engine. Configuration/files remain deferred. **Exits:** empty pockets below blocking rows, no viable landing, all activation rejection cases, normal versus penetrator contact, Hold prohibition, bonus cap and four-line reward, white-only active identity and native gameplay. Demonstrate the ability and its indicator from a deterministic board fixture. The final delivery task carries milestone review/report/HANDOFF. **Milestone 3.2 — Phase review** verifies regressions, packaging and notes before integration/release 0.3.0.

## Phase 4 — Session configuration

**Milestone 4.1 — Configurable session** provides the canonical six-setting descriptor/validation model, both general lock policies, immediate/follow hard-drop policy, live application without restarting, settings controls, help/settings toggles and stable centered optional-panel geometry. Save/Restore are not displayed until transfer exists. Leaderboard content/toggle remains deferred until its capability exists.

Session-only values reset on page reload in this increment. Keeping persistence separate permits focused verification of live gameplay changes before browser storage can obscure their effects. **Exits:** every value, disabled feature, paused/grounded/airborne lock transitions, unchanged-policy timer preservation and all available panel combinations in both browsers. Collect usability evidence that the six labels and toggles are clear. Final delivery task owns milestone review/report/HANDOFF. **Milestone 4.2 — Phase review** checks cumulative mechanics/configuration and release readiness; integrate/release 0.4.0.

## Phase 5 — Persistent configuration

**Milestone 5.1 — Persistent settings** adds cookie/URL adapters, independent source resolution, explicit-default cookie writes, canonical setting-change updates, invalid-source warnings and captured-state write/readback/rollback. Apply these to the working controls without changing their domains or gameplay behavior. Omitted parameters must retain cookie values and unrelated parameters/fragments must survive changes.

This phase depends on a verified live-settings model; results/files remain deferred. **Exits:** complete six-key precedence/reload matrix, duplicates/malformed/absent values, HTTPS-aware cookie options, write-denial and rollback failure injection, actual persistent browser contexts in Chromium/Firefox. Demonstrate URL sharing and cookie restoration. Final delivery task owns milestone review/report/HANDOFF. **Milestone 5.2 — Phase review** checks persistence plus all prior rules and packages the increment before integration/release 0.5.0.

## Phase 6 — Session leaderboard

**Milestone 6.1 — Completed-game history** consumes one completion per game, creates IDs/UTC timestamps, ranks/truncates the top ten and retains them across restarts. Add the leaderboard panel/toggle to complete the five-panel order. No automatic result persistence or file transfer is included.

This small complete capability establishes the exact result model needed by transfer without coupling it to codecs. **Exits:** zero score, duplicate completion, abandonment, ties, eleven-plus results, reload clearing, deterministic timestamps/IDs, and all eight optional-panel visibility combinations with board-centering measurements. Final delivery task owns milestone review/report/HANDOFF. **Milestone 6.2 — Phase review** checks cumulative scope and release readiness; integrate/release 0.6.0.

## Phase 7 — Portable saves

**Milestone 7.1 — JSON transfer** establishes the canonical payload validator, supplied JSON Schema, strict duplicate-member detection, UTC/calendar/UUID/numeric/domain checks, snapshot encoding, and one bottom-of-settings Save/Restore pair. Integrate full validation before the shared settings/results commit, pause/cancellation, exact-state rejection, size limits, errors and native JSON download/reupload. This is a demonstrable JSON backup/restore stopping point while SQLite is still absent. Review its data contract and rollback behavior before extending the format surface.

**Milestone 7.2 — SQLite transfer** packages the runtime/WASM and bundler module worker, implements fixed schema/metadata and storage-class validation, exports parameterized rows, rejects unsafe schema/corrupt input and enforces worker deadlines/disposal. Extend the existing format choice and import detector to SQLite without adding another button pair or commit algorithm. Verify JSON↔SQLite semantic equality and all native paths through production assets.

Two delivery milestones retain separate format/runtime risk boundaries rather than creating an omnibus transfer task. Both preserve all earlier gameplay/settings/results. Each final delivery task includes whole-milestone code review, tests/repairs, report and HANDOFF. **Milestone 7.3 — Phase review** verifies all SPEC contracts in both browsers, corruption/timeout/storage-failure recovery, final documentation and distributable assets; aggregate all unresolved/deferred findings into the final implementation report. Integrate and publish 1.0.0 only with full target-scope acceptance.

## Common verification and release gates

Every delivery milestone has whole-capability code review, relevant unit/integration/browser checks, blocker repairs, committed report evidence and HANDOFF. With one delivery milestone in phases 1–6, its final delivery task owns those obligations. Phase 7 uses fewer than four delivery tasks per milestone, so its final delivery tasks also own folded review obligations. A separate phase-review milestone always remains.

Build meaningful failing contract tests before changed production behavior, observe RED, implement and observe GREEN, and retain relevant evidence. Do not add tests that merely mirror private implementation. Browser tests use actual app/server/native input and Canvas output; pure domain state tests cannot substitute for them. Lock exact runner/dependency versions during implementation and keep browser paths/profiles/caches dedicated. Diagnose environment failures with finite deadlines and policy-compliant remedies; missing required evidence blocks completion.

At each milestone demonstrate its integrated behavior and relevant usability/risk evidence so the human can continue, amend, simplify or stop at an authorized checkpoint. This does not add approval for each routine task within an already authorized range. Partial phases remain on their phase branches and are not integrated as complete releases.

Phase review prepares version, complete release notes, static package and source/evidence pointers. After complete phase verification and tracked milestone closure, explicitly integrate into the actual default branch, verify the merged build/regressions, and publish it. Create the release commit/tag on default, verify the exact published tag target, then publish the GitHub release with matching notes/assets. Release publication/readback is a coordinator/forge transition after integration, not a premature claim in the phase-review task. A pending or failed release blocks the next phase transition under the requested per-phase release policy. Do not tag documentation-only checkpoints.

## Coverage and retained risks

R-BASE and baseline R-UI/R-QUAL arrive in phase 1; R-MOD in phase 2, with configurable policy alternatives in phase 4; R-PEN in phase 3; R-CFG in phase 4; R-URL in phase 5; R-LB and complete five-panel R-UI in phase 6; R-XFER in phase 7. R-QUAL, regression checks, documentation and packaging apply in each included slice.

The seven narrow phases separate gameplay changes, live-rule configuration, browser persistence, completed-result lifecycle and portable-file runtime risk. Phases 4/5 are distinct because live-rule correctness and source/write correctness fail for different reasons; phases 6/7 separate session history from file codecs. Early usefulness is demonstrated at phase 1 and each later milestone; no final phase collects unrelated leftover work. SQLite worker/WASM loading and persistence rollback are explicit risk gates, not presumed implementation facts.
