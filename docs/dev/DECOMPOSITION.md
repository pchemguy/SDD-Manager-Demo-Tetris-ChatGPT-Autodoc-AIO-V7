# Component decomposition

## Component model

[ARCHITECTURE](ARCHITECTURE.md) defines the block dependencies; [PROJECT](PROJECT.md) supplies scope. Components below are logical ownership boundaries, not a requirement for one class or file each. Interfaces use plain typed values; SPEC defines their exact success/error contracts.

| ID / component | Owns and provides | Requires / excludes | Verification seam |
| --- | --- | --- | --- |
| D1 Geometry and placement | Tetromino orientation cells, bounds, occupied-cell tests, ordered kick candidates and legal landing projection under normal/penetrator policy | Board and candidate pose values; excludes game score, clocks and drawing | Fixed board/pose fixtures, destination validity and ghost/drop equivalence |
| D2 Piece source | Randomizer state, independent classic draws and seven-bag draws, next-piece queue | Injected random source; excludes UI preview visibility, which must never change the queue | Seeded sequences, complete bag membership and hidden-preview invariance |
| D3 Game transitions | Sole ownership of domain state, command acceptance, spawn/Hold, lock/clear/score/level/bonus transitions and completion event | D1/D2 and elapsed active time; excludes browser events or persistence | Pure command/state tests and completion-event uniqueness |
| D4 Contact and gravity timing | Gravity accumulator, contact deadline and pause-preserving simulation advancement used by D3 | Current piece contact state and selected lock policy; no independent browser scheduler | Partitioned elapsed-time inputs, exact threshold/reset cases |
| A1 Game coordinator | Current domain instance, lifecycle command dispatch, render snapshots, result-event consumption, operation serialization | D3, A2/A3/A4 and browser ports; excludes collision/format algorithms | In-memory ports, controlled game-over and restart sequences |
| A2 Settings service | Six setting descriptors, validation/defaults, source resolution and normalized effective settings | Cookie/URL values through B2; excludes panel-visibility preferences | Exhaustive domain values, per-source precedence and malformed-input fixtures |
| A3 Session results | Stable IDs/timestamps supplied at completion, deterministic top-ten normalization, replacement after validated import | Clock/ID ports and canonical result validator; excludes automatic browser persistence | Ranking/ties/duplicate IDs, repeated completion and restart cases |
| A4 Settings/restore commit | Capture/stage/persist/readback/rollback, then one in-memory settings/results publication | A2/A3, B2 and validated transfer payload; excludes parsing and scoring | Each injected failure point, unchanged-state assertions and operation locking |
| P1 Input and scheduling | Key-to-command mapping, held-key timing, focus/visibility transitions and one frame loop | A1 command/time ports, B1 clock; excludes domain mutation | Focus/native keyboard acceptance plus explicit scheduling tests |
| P2 Board and piece rendering | Canvas draw order, board/active/ghost/preview/Hold appearance from immutable view data | D1 cell geometry and A1 snapshots; excludes computing a separate landing | Canvas pixels/shapes and snapshot fixtures |
| P3 Panels and controls | Layout, panel toggles, score/level/bonuses, six setting controls, leaderboard, errors and Save/Restore controls | A1 commands/view model; excludes cookie writes and file validation | DOM accessibility and every panel-visibility combination |
| T1 Canonical transfer validation | Complete version/results/settings validation, strict timestamp/ID/domain checks and normalized payload | Shared value contracts and JSON Schema; no browser or SQLite dependency | Accepted/rejected corpus shared by both formats |
| T2 JSON codec | UTF-8 JSON encode/decode, strict object/property checks and schema integration | T1; excludes application mutation | Round trips, unknown/missing values and malformed data |
| T3 SQLite codec | Fixed database construction/inspection and canonical payload extraction | T1 and B3; excludes SQL supplied by imported schema or input values | Schema/type/version/integrity corpus and cross-format round trips |
| B1 Clock and identity adapters | Monotonic frame time, UTC completion timestamp, unique result IDs | Browser APIs; no mutable gameplay state | Fixed implementations for unit tests and native smoke coverage |
| B2 Cookie and URL adapter | Read/capture/write/readback/restore of managed persistence only | Browser document/location/history; excludes source-precedence decisions | Encoded values, denied writes, unrelated-value preservation |
| B3 SQLite worker host | One worker operation, packaged runtime/WASM loading, request identity, timeout, disposal | Bundler module-worker asset route and SQLite runtime; no access to application state | Real built-asset load, timeout/stale-response and memory/resource cleanup paths |
| B4 File transport | Picker/drop input bytes, download Blob/object URL lifecycle, cancellation and size detection | Browser File/Blob APIs; excludes decoding and settings application | Native download/upload round trips and cancel/error cases |

## State and collaboration

D3 is the single game-state owner. D4 is part of that domain lifecycle, not a competing timer store. A1 combines domain state, A2 effective values, A3 session results and P3 visibility into a view model. Presentation cannot retain a second authoritative copy of game state. Input and scheduled time are commands delivered to that same owner.

D1 returns a legal destination or rejection, not a partially mutated board. D3 uses it for normal movement, penetrator feasibility, ghost and hard drop. On lock, D3 validates placement, merges cells, clears lines, applies score/level/bonus changes, spawns a new piece and emits game-over when spawning fails. A1 records that completion once. Hiding preview, ghost or panels changes presentation only.

Settings source resolution is distinct from mutation: A2 resolves all six independently, while A4 applies a validated change set. An ordinary settings change and a restored snapshot share A4, including live lock-policy reevaluation. A4 receives no untrusted file bytes. Browser persistence failures return typed errors and captured pre-change state for verified rollback.

## Transfer lifecycle

1. P3 requests Restore; A1 pauses a running game and serializes the operation.
2. B4 returns bounded bytes or cancellation. T2 or B3/T3 decodes into staged plain values.
3. T1 validates the complete payload; any invalid field rejects the entire candidate.
4. A4 captures current results/settings and raw managed persistence values, applies/readbacks persistence, then publishes the validated in-memory snapshot. Failure restores the captured state and reports its actual outcome.
5. A1 releases the operation lock; gameplay remains paused until an explicit resume. B3/B4 dispose owned resources on every path.

Save captures A2/A3 into an immutable payload, validates through T1 and encodes using T2 or B3/T3. File completion callbacks cannot read a changing settings object or introduce half-old/half-new values. Only completed results are exported; the active board is excluded.

## Interface and failure boundaries

Domain commands return accepted/rejected state plus typed events; rejected activation retains bonuses and rejected movement retains pose. Projection failure is handled explicitly rather than choosing an overlapping position. Application commands return success, normal cancellation, validation error, persistence error or resource/runtime error. User-facing text is produced in P3 and does not expose raw SQL, stack traces or file HTML.

Async operations carry operation/game identity. A stale worker result, frame callback or key release from a prior game cannot alter the current game or transaction. Browser listeners are installed once and disposed deliberately; restart resets domain/input state without duplicating listeners. Detailed input values, deadlines, serialization shapes and error acceptance are owned by SPEC.
