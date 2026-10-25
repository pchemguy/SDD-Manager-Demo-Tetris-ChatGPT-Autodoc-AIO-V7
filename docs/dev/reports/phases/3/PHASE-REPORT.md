# Phase 3 — Penetrator gameplay

## Delivered capability and source

T-010–T-012 satisfy PLAN phase 3: four-line bonuses, bounded one-use activation, deepest viable traversal/SRS, matching ghost/drop, full contact timing, Hold prohibition, white active identity and live bonus feedback. Base is v0.2.0 release commit fb9402e297f41c76a650977b14e68307ceb9d5d8; delivery tip 7ef2f1e51ea62b82b9be36c5bcb80ab4ecf0ab4e. This review commit prepares 0.3.0; integration and publication remain coordinator transitions.

## Cumulative review and repair

[Milestone review](3.1.md) records the independent source review and two repaired evidence gaps, including terminal lock/colors and forced viable kicks. No remaining blocking findings. Phase review also identified P3-R1: scaled integer draws introduced tiny range-selection bias. Rejection sampling maps nonzero xorshift states to a complete divisible range before modulo; a boundary seed fixture failed before repair and passes afterward. The independent reviewer inspected the arithmetic, bag exhaustion/determinism and reran 37/37 tests/typecheck with no findings. Deterministic sequences changed, so browser regressions were rerun.

Reviewed source/test separation, final placement guard, overlap board preservation, normal/penetrator contact, bonus reward/cap/reset, stale input, lifecycle and user documentation. No future settings/results/files acceptance is claimed.

## Executed verification

- `npm run test:unit`: 37/37; `npm run build`: passed with TypeScript.
- Final development browser suite: 24/24 across Chromium and Firefox after sampler repair.
- Final production browser suite: 14 passed, 10 deliberate fixture-only skips. Production has no fixture hook; real native play/Hold/drop/bonus-panel/render/lifecycle checks pass in both engines. Controlled penetrator acceptance is development plus domain evidence.
- Visual screenshot inspected for white active/ghost below intact blockers, readable bonus/help and centered board.
- `npm run package:release`: seven unique CRC-valid entries, VERSION 0.3.0, static HTML/assets and guides/license; production hook absent. Complete body-only release notes prepared, including changed sequence selection. No uploaded-asset claim yet.

Environment/browser recovery and OS-focus evidence limits remain documented in DEVELOPMENT. Remote CI execution is not claimed.

## Tracking, TODO and next boundary

Issues 19/20 and milestone 6 are closed/read back. Provider counters remain stale; individual associated issue states establish closure. TODO: None. P3-R1 and review evidence gaps are resolved.

Publish/read back T-012 and close review milestone 7, explicitly merge the complete phase into main, verify/publish merged state, then create the exact matching release commit/tag and publish/read back GitHub notes/assets for v0.3.0. Only then activate phase 4.
