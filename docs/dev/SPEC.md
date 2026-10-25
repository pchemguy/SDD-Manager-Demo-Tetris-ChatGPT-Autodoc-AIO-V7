# Behavioral specification

## Scope and normative owners

The application provides the complete single-player desktop Tetris experience in [PROJECT](PROJECT.md). [ARCHITECTURE](ARCHITECTURE.md) defines dependency direction; [DECOMPOSITION](DECOMPOSITION.md) names the responsible components. This specification defines required outcomes rather than implementation progress.

| Contract | Canonical owner | Components / consumers |
| --- | --- | --- |
| R-BASE: classic board, movement, score and lifecycle | [Gameplay: baseline](spec/GAMEPLAY.md#baseline) | D1–D4, A1, P1/P2 |
| R-MOD: bag, Hold, SRS, ghost, hard drop and lock timing | [Gameplay: movement aids and timing](spec/GAMEPLAY.md#movement-aids-and-timing) | D1–D4, P1/P2, A2 |
| R-PEN: bonuses and penetrator traversal/locking | [Gameplay: penetrator](spec/GAMEPLAY.md#penetrator) | D1/D3/D4, P2/P3 |
| R-CFG: six controls and live application | [Settings: values and application](spec/SETTINGS.md#values-and-application) | A2/A4, P3 |
| R-URL: per-setting URL/cookie persistence | [Settings: source resolution and persistence](spec/SETTINGS.md#source-resolution-and-persistence) | A2/A4, B2 |
| R-LB: completed results and ranking | [Transfer: session results](spec/TRANSFER.md#session-results) | A1/A3, P3, B1 |
| R-XFER: JSON/SQLite export, validation and atomic restore | [Transfer: manual files](spec/TRANSFER.md#manual-files) and [JSON Schema](spec/SAVE-SCHEMA.json) | A4, T1–T3, B3/B4 |
| R-UI: panels, toggles, centering and focus | This document | P1–P3, A1 |
| R-QUAL: distribution, accessibility and browser evidence | This document | All blocks |

## R-UI: layout and controls

At viewport sizes of at least 1280 × 800 CSS pixels, place panels left to right: leaderboard, game info/controls, board, settings, controls/help. The board's horizontal center stays within one CSS pixel of viewport center across all eight combinations of optional-panel visibility. Panel edges do not overlap. Keep game info and board visible. Below the minimum viewport, use an at-least-1280-pixel-wide scrollable game surface; center the board within that surface, with vertical scrolling when necessary.

Game info contains individually labeled leaderboard, settings and help toggle buttons above Pause and Start/Restart. Each toggle exposes expanded/hidden state accessibly. Initially all panels are shown; visibility is session UI state and is excluded from the six-setting files, cookies and query keys. Start/Restart starts a new game immediately; a running or paused unfinished game is abandoned without a leaderboard result. Pause toggles running/paused only, shows its current action, and is disabled when idle or game over.

Place exactly one Save button and one Restore button at the bottom of settings. Save offers JSON or SQLite via a format choice; this choice must not create a second button pair. Hiding settings hides those controls and removes them from tab order. Settings have a visible label and current value. Next/Hold views are labeled, and penetrator bonuses display one lightning-bolt symbol per available bonus plus accessible numeric text.

Use ArrowLeft/ArrowRight to move, ArrowDown for soft drop, ArrowUp or X for clockwise rotation, Z for counterclockwise rotation, Space for hard drop, C for Hold, V for penetrator activation, P for pause and R for Start/Restart. Help lists these bindings and explains disabled features. Only the focused game surface or page body receives gameplay keys; form fields/buttons retain normal keyboard interaction. Consumed gameplay keys prevent page scrolling. Moving focus away from gameplay clears held keys and pauses a running game. Returning focus does not resume automatically.

ArrowLeft/ArrowRight move once on keydown, then repeat after 150 ms at 50 ms intervals using active-game time; the most recently pressed direction wins until released, with a new delay when another held direction becomes active. ArrowDown attempts one cell immediately and repeats every 50 ms. Rotation, Hold, activation, hard drop, pause and restart ignore native key-repeat. Keyup, blur, pause, restart and game over clear repeat state. Pointer controls and settings must remain operable while paused.

## R-QUAL: delivery and robustness

Serve a static application over HTTP(S), with all production JavaScript, fonts if used, SQLite worker/runtime and WASM available from its own build assets. Game play and file operations require no backend or third-party network request. Direct `file:` loading is outside supported persistence behavior. Include a production build command, pinned dependency lockfile, user guide, browser setup instructions, and distributable static assets for each phase release.

Use readable high-contrast HTML text, associated labels, visible keyboard focus and status announcements for game over, validation errors and successful restore. Do not announce every animation frame. Canvas has an accessible label and textual score/state companions. Penetrator active cells are white; ordinary tetromino colors are distinct non-white colors. The ghost is visually distinguishable from active/settled cells, and white penetrator identity is preserved by its outline/translucency treatment.

The board renders at device-pixel-ratio-correct resolution while retaining integer CSS cell geometry. A valid app load, gameplay, restart, every panel toggle, settings changes and file operations produce no uncaught exception or failed required asset request. A single animation loop/listener set survives repeated restarts. Imported strings render as text, never HTML.

Primary acceptance uses isolated Chromium headless shell, with managed Firefox secondary for the same core scenarios. Follow [BROWSER_DEV_POLICY](../../BROWSER_DEV_POLICY.md): pinned compatible runner/builds, one dedicated absolute browser path, finite process deadlines, repeated isolated context/page lifecycles and actual application/production-server execution. Canvas checks must inspect raster output; DOM state alone is insufficient. Missing required browser capability blocks that affected exit and release claim; no silent browser substitution or coverage reduction is permitted.

## End-to-end acceptance

1. A player can start, move, rotate, clear lines, gain score/levels, pause/resume, lose, and restart using keyboard and buttons. Boundary and spawn failures preserve valid board state.
2. Deterministic fixtures prove bag membership, Hold restrictions, SRS candidates, both lock policies, full-interval contact timing, pause/focus behavior, and ghost/hard-drop equivalence.
3. Dynamic ghosts are hidden for wholly upper or straddling projections and visible only when all projected cells are in the lower half. Hidden ghost/preview panels do not change gameplay.
4. A four-line clear grants one bonus, the indicator caps at three, and successful activation spends exactly one. Penetrators traverse blockers without deleting cells, cannot be held, and lock at valid destinations; ghost and hard drop agree.
5. Every setting is independently controllable and survives reload according to valid URL → valid cookie → default. Invalid source values cannot corrupt other settings; unrelated URL values survive updates.
6. The top ten completed results rank deterministically, survive in-session restarts, and reset on a fresh page session except when manually restored. Duplicate completion is impossible.
7. Both exported formats preserve IDs, scores, UTC timestamps and all six settings; cross-format round trips are semantically equal. Invalid input, unsupported versions, malformed schemas, timeout and injected persistence failures cannot leave partial imported state.
8. The board stays centered across all panel combinations at supported sizes, required panels remain usable, and Save/Restore hide with settings. Keyboard focus is respected.

Each condition is assessed when its delivery increment is included, with regressions for earlier increments. These are acceptance obligations, not claims that tests have already run.
