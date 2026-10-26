# Browser Tetris

## Play

Serve the extracted static release over HTTP(S), or use the development commands in DEVELOPMENT. Choose Start game and focus the board. Left/right arrows move, Down soft-drops, Up/X rotates clockwise and Z counterclockwise. P pauses/resumes; R starts a fresh game. Pause/Resume and Restart buttons provide the same actions.

Complete horizontal rows to clear them. One/two/three/four rows award 100/300/500/800 times the level before clearing. Soft drop awards one point per cell. Every ten cleared lines raises the level and increases gravity. By default, a grounded piece waits one full gravity interval before locking; grounded moves do not extend that time, but becoming airborne starts a fresh interval on recontact.

Moving focus away or hiding the tab pauses play; resume explicitly. Long frame gaps also pause instead of catching up unexpectedly. Restart abandons an unfinished game. The game uses seven-bag randomization. Press C to Hold once per active piece; the next piece and held kind are shown beside the board. Swapping restores the incoming piece to its spawn orientation. Manual JSON and SQLite backup/restore is available.

At widths below 1280 CSS pixels the minimum-width game surface scrolls; the board stays centered in that surface. At supported desktop widths it stays centered in the viewport.

Modern play uses ordered SRS wall/floor kicks. Space hard-drops to the outlined ghost destination and awards two points per row. By default, the ghost hides if any destination cell is above row 10. Default hard drop waits one full gravity interval to lock; repeated drops or grounded moves do not extend that deadline.

Clear four rows at once to earn one ⚡ penetrator bonus (maximum three). Press V when the falling piece is wholly visible to spend one. The piece turns white and passes through occupied cells until it locks. Its ghost and hard drop find the lowest empty destination even below blockers. Hold is unavailable while penetrating; settled blocks are preserved. New games clear bonuses.

## Settings and panels

Use the individual leaderboard, settings and controls/help toggle buttons above Pause and Start/Restart. The board stays centered and game information stays visible. Changing a setting takes effect without restarting; moving keyboard focus into controls pauses play until you resume.

- Ghost visibility: always hide, hide when any destination cell is above row 10, or always show.
- Hard drop, next-piece preview and Hold: turn each on or off. Disabled keys are ignored; held state and the next queue are preserved.
- Hard-drop locking: follow general locking, or lock immediately on Space, even at zero distance.
- General locking: lock on the next failed downward attempt, or one full gravity interval after contact. Arrival by a follow-policy hard drop is not a failed downward attempt.

Only changing the general locking policy reevaluates contact timing. Keeping that policy preserves an existing deadline; switching to interval while grounded starts a full new interval. Hard-drop policy changes affect subsequent drops. Settings survive game restarts, reloads and reopening the game. Each valid URL value overrides its saved cookie independently; an omitted parameter retains the cookie, then the default applies only if neither supplies a valid value.

## Remember and share settings

Changing a setting saves a cookie for one year and updates that setting’s URL parameter without reloading. Copy the URL to share explicit choices. A valid explicit URL value is saved even if it equals the default; omitted parameters do not erase saved values. Invalid or repeated parameters fall back to the saved value/default with a warning.

| Parameter | Values | Default |
| --- | --- | --- |
| ghost | hide, dynamic, show | dynamic |
| hardDrop | on, off | on |
| nextPreview | on, off | on |
| hardDropLock | follow, immediate | follow |
| lockPolicy | failedDown, interval | interval |
| hold | on, off | on |

For example, `?ghost=show&hardDropLock=immediate` sets only those two values. Other saved settings remain effective. Cookies belong to the serving site; unrelated query values and the URL fragment are retained.

If cookies or URL replacement are refused, the game reports the failure, restores prior external values where allowed and keeps effective settings unchanged. If the browser also refuses recovery, the error says recovery is incomplete and settings controls are disabled until you repair access and reload. Initial in-memory settings remain playable in a denied-storage environment.

## Session leaderboard

The left panel lists the ten best completed games by score, with UTC completion times. Equal scores use earlier completion times, then stable result IDs. Zero-score completions count. Restart abandons an unfinished game and retains earlier completed results; repeated game-over input does not add duplicates. Reloading or opening a new page clears this session history while settings remain saved. Use manual Save/Restore below to retain history across sessions.

The full list scrolls inside its panel so it does not overlap the game or footer. Use the leaderboard toggle above Pause to hide it; the board and game information remain visible.

## Manual Save and Restore

Save and Restore sit at the bottom of Settings and hide with that panel. Choose JSON or SQLite in Save format. Save downloads tetris-save.json or tetris-save.sqlite containing the current top ten and all six settings, including defaults. It captures once and does not pause play; the active board/score, held piece, bonuses and panel visibility are excluded.

Restore pauses a running game before opening the picker and leaves it paused after success, rejection or cancellation. Choose one UTF-8 JSON file (optional BOM), at most 1 MiB, or one SQLite file, at most 5 MiB. File extensions are hints; content is validated. Use Resume explicitly afterward. Idle/game-over states remain unchanged. While processing, Save/Restore and conflicting controls are disabled; Cancel discards pending work.

The whole file must pass version, schema, setting, ID, exact integer and real UTC calendar checks before any results, settings, cookies or URL change. Restore replaces history (including an empty list), applies all six settings and writes their cookies/query values, preserving active gameplay. Failure leaves effective data unchanged; persistence denial uses the recovery behavior described above. The included tetris-save.schema.json documents JSON version 1. SQLite version 1 contains high_scores(id, score, timestamp) and settings(key, value), with version metadata. Its worker/runtime and WASM are packaged locally. A ten-second deadline includes initialization; errors and cancellation discard staged data. Both formats preserve the same canonical values.
