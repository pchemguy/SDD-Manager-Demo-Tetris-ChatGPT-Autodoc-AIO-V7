# Browser Tetris

## Play a classic game

Serve the extracted static release over HTTP(S), or use the development commands in DEVELOPMENT. Choose Start game and focus the board. Left/right arrows move, Down soft-drops, Up/X rotates clockwise and Z counterclockwise. P pauses/resumes; R starts a fresh game. Pause/Resume and Restart buttons provide the same actions.

Complete horizontal rows to clear them. One/two/three/four rows award 100/300/500/800 times the level before clearing. Soft drop awards one point per cell. Every ten cleared lines raises the level and increases gravity. A grounded piece waits one full gravity interval before locking; grounded moves do not extend that time, but becoming airborne starts a fresh interval on recontact.

Moving focus away or hiding the tab pauses play; resume explicitly. Long frame gaps also pause instead of catching up unexpectedly. Restart abandons an unfinished game. The game uses seven-bag randomization. Press C to Hold once per active piece; the next piece and held kind are shown beside the board. Swapping restores the incoming piece to its spawn orientation. Ghost, wall kicks, hard drop, settings, leaderboard and file transfer remain planned increments.

At widths below 1280 CSS pixels the minimum-width game surface scrolls; the board stays centered in that surface. At supported desktop widths it stays centered in the viewport.
