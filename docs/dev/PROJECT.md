# Browser Tetris

## Purpose and outcome

Build a browser game for a single player using a desktop keyboard. Deliver a playable classic Tetris baseline first, then useful, bounded enhancements while preserving earlier gameplay. The complete product includes modern movement aids, a penetrator ability, configurable rules, a session leaderboard, and manual portable saves.

## Principal scope

- Classic falling tetrominoes on a 10-column, 20-row visible board, movement, rotation, gravity, line clearing, scoring, level progression, game over, pause, and restart.
- Hold, ghost, seven-bag randomization, SRS wall kicks, and hard drop. Default locking waits one full gravity interval after ground contact; hard drop follows that policy unless immediate hard-drop locking is selected.
- Three ghost visibility modes: hidden, dynamic above-midline hiding, and always visible.
- A hotkey activates a penetrator when a bonus is available. The active piece passes through occupied cells without destroying them, remains entirely white until locking, and must lock wholly inside the board without overlap. Regular pieces are never white. Four simultaneous cleared lines award one bonus, capped at three; the game-info panel shows one symbol per available bonus.
- Six settings: ghost visibility, hard drop enabled, next preview enabled, hard-drop locking policy, general locking policy, and Hold enabled. Resolve each from valid explicit URL value, then valid saved cookie, then default. Explicit valid URL values also update cookies. Setting changes update both cookie and URL.
- A session-only top-ten leaderboard of completed games, ranked by score. Every result retains a stable ID, non-negative integer score, and UTC completion timestamp.
- One pair of Save and Restore buttons at the bottom of the settings panel. Save downloads one JSON or SQLite file containing the leaderboard and all six settings. Restore accepts either, validates the entire content before any mutation, and replaces the session leaderboard and applies settings, cookies, and URL values together. Invalid files show a clear error and preserve existing state.
- Versioned JSON with results and settings, a supplied JSON Schema, and complete validation including timestamps and setting domains. Versioned SQLite with `high_scores(id, score, timestamp)` and `settings(key, value)`, one uniquely keyed row per setting, and version metadata.

## Layout and interaction

Place panels left to right: leaderboard, game info and controls, board, settings, controls/help. Keep the board centered in the viewport when optional panels change visibility. Supported desktop viewport: at least 1280 × 800 CSS pixels. At smaller sizes, preserve readable panels and the board centered in a minimum-width game surface with scrolling; viewport centering is not guaranteed below that minimum. Keep the board and game-info panel visible within the supported viewport. Game-info contains separate leaderboard/settings/help visibility buttons above Pause and Start/Restart. Hiding settings hides its Save and Restore buttons too.

## Consequential choices

The following choices define gameplay boundaries and default behavior.

| Concern | Behavior and reason |
| --- | --- |
| Ghost crosses the midline | Dynamic mode shows the ghost only when every projected cell is in visible rows 10–19, using zero-based row indices. Any cell above row 10 hides it; a straddling projection is hidden. This avoids a partly upper-half ghost. |
| Lock timing and resets | Ground contact starts a full current gravity interval. Successful grounded movement/rotation and repeated hard drops do not restart it. Becoming airborne clears it; fresh contact starts a new interval. Pause and hidden-tab suspension freeze gameplay timers, avoiding surprise locks on return. |
| Penetrator descent and locking | For the current column/rotation, descend toward the deepest wholly in-board, non-overlapping placement reachable at or below the current height, even through occupied cells. Stop at that placement rather than falling beyond the last valid landing. Hard drop and visible ghost use the identical destination. |
| Penetrator movement and Hold | Hold is disabled while penetration is active. Activation requires the whole piece inside the visible board; reject earlier activation without spending a bonus. Spend one bonus only on successful activation; repeated activation does not spend more. Allow movement/rotation through occupied cells only while within board bounds and retaining a valid eventual landing. Use SRS kick candidate order, ignoring occupied-cell collisions for penetrator traversal but enforcing bounds and eventual-landing viability. Activation may free a normally grounded piece; becoming airborne clears its contact timer. |
| Locking while overlapping | Transient occupied-cell overlap during penetration never permits locking or modifies settled cells. A failed-down locking rule applies only at the legal terminal landing, not when crossing occupied cells. |
| Live rule changes | Settings apply without restarting the game. Switching locking policy reevaluates contact; selecting interval locking on a grounded piece starts one full interval. An already activated penetrator remains active until it locks. Restoring settings follows the same application rules. |
| Invalid URL/cookie data | An invalid source value is ignored for that setting and the next valid source is used, with a concise warning. Unknown query parameters are preserved. Invalid explicit values are not saved as cookies. Restore files instead fail as a whole, including missing/duplicate settings or invalid results. |
| Defaults | Dynamic ghost; hard drop, next preview, and Hold enabled; hard drop follows general policy; full-gravity-interval general locking. A new game resets penetrator bonuses. Restart abandons the current game without recording a completed result. |
| Leaderboard ties and restore | Rank score descending, then completion timestamp ascending, then stable ID for deterministic ties. Opening Restore during play pauses the game before file selection; cancellation or validation failure leaves it paused and preserves all results/settings/cookies/URL values. Resume is explicit. Saving captures the current completed results and settings without ending the game. |

## Technical direction and alternatives

Use TypeScript, Canvas board rendering, standard HTML controls, and a static application with no server-side game state. Keep SQLite handling in a browser-compatible library with locally packaged runtime assets. This supports deterministic game tests and portable downloads without a backend.

A DOM-cell board could work, but offers limited benefit for the requested rendering. A component UI framework would add dependencies and state coordination for a small number of panels. The TypeScript/Canvas approach keeps rule tests independent of the presentation layer.

Use Chromium as the primary automated browser and managed Firefox as secondary, in isolated environments under the repository browser policy. Browser provisioning and application acceptance remain implementation work; documentation does not establish browser execution evidence.

## Delivery and releases

Begin with the simplest usable classic game. Add modern mechanics, penetrator gameplay, configuration/persistence, leaderboard, and portable JSON/SQLite saves in bounded useful increments; detailed phase boundaries belong to the delivery plan. Session-only settings may precede cookies and URL support.

Use semantic versioning, starting with `0.1.0` for the verified classic baseline and increasing minor versions for capability increments. Publish a GitHub release and matching tag only after each implementation phase is completed, verified, and integrated. Promote to `1.0.0` when the complete accepted target scope is verified. Documentation-only checkpoints are not game releases.

## Scope limits and success

Non-goals are multiplayer, online accounts, server leaderboards, mobile touch controls, and automatic file saving/restoring. All game settings and results stay in the browser or a manually selected download; opening a saved file does not execute application code.

Success means the complete requested scope is playable and verified, prior increments continue working, restore failures leave all state unchanged, and the centered board and required controls remain usable across panel-visibility combinations. Exact scoring, controls, timing limits, file size limits, timestamp syntax, and remaining data contracts will be defined in the behavioral specification within these constraints.
