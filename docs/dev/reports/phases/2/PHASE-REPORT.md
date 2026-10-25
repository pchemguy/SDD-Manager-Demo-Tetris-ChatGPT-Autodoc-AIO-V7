# Phase 2 — Modern mechanics

## Outcome and source

T-006–T-009 satisfy the phase-2 exits: seven-bag, Hold/next, exact SRS, dynamic ghost and delayed hard drop form one playable increment. Starting release commit is 0b51efdfc4771ff78e7fd128f626691bb4fad9ac; delivery tip is 46f9683a45637cf6f6cde2c41c7f186d923c432f. The containing review commit records this preparation. Integration/tag/GitHub publication follow separately.

## Cumulative review

Reviewed canonical geometry, bag/queue consumption, incoming Hold resets/top-out, kick tables, shared projection, scoring/contact/event ordering, held input/lifecycle, Canvas/previews/help, tests and current documentation. The independent milestone review and repaired evidence gaps are recorded in [2.1](2.1.md). No unresolved finding remains. Corrected guide/README wording that still called delivered ghost/kicks/drop planned.

## Executed checks and limits

- `npm run test:unit`: 30/30 passed, independently reproduced by reviewer.
- `npm run build`: passed with TypeScript; production assets unchanged after version/docs-only preparation.
- Development native suite: 14/14 plus the final ghost and exact-lock fixtures 2/2 each. Both browser engines passed real keyboard/raster checks and controlled domain fixtures.
- Production suite: 12 passed, 6 deliberate development-fixture-only skips. Real production Hold/Space/movement/rotation/score/pause/restart/DPR/navigation run in both browsers. Test hook absent from production JS.
- `npm run package:release`: seven unique entries, CRCs valid, VERSION 0.2.0, static app, guides/license; no credential/cache/test-hook content. Root complete notes are prepared; this does not assert uploaded bytes.

PLAN phase-2 boundaries pass without expanding into future phases. Required local browser recovery and focus evidence limits remain in DEVELOPMENT. Remote CI execution is not claimed.

## Tracking and next boundary

Delivery issues 15–17 are closed/read back. GitHub milestone counters remained stale (3 open/0 closed) while its associated issue list and individual records were closed; closure uses those authoritative task records, and milestone state is read back separately. Publish/read back T-009, close review milestone, integrate the complete phase into main, verify/publish main, create matching release commit and annotated v0.2.0 tag, then publish/read back body and both assets. Only then activate phase 3.

## TODO

None.
