# Gameplay contracts

## Baseline

R-BASE uses a 10 × 20 visible board, columns 0–9 and rows 0–19, positive y downward. Settled cells are empty or one of I/J/L/O/S/T/Z. The active piece is separate from settled cells. Spawn standard tetromino geometry in rotation 0, with a fixed 4 × 4 local origin at board x=3, y=-1; O uses the central two columns, and J/L/S/T/Z use the standard upper 3 × 3 SRS spawn geometry. A complete orientation cell table is defined in this document below. Cells above row 0 are permitted for normal active movement, but x bounds and the bottom bound always apply. Any overlap with a settled in-board cell rejects a normal pose. A failed spawn ends the game. Locking any cell above row 0 ends the game without inserting that piece.

| Kind | Rotation 0 local occupied cells (x,y) |
| --- | --- |
| I | (0,1), (1,1), (2,1), (3,1) |
| J | (0,0), (0,1), (1,1), (2,1) |
| L | (2,0), (0,1), (1,1), (2,1) |
| O | (1,0), (2,0), (1,1), (2,1) |
| S | (1,0), (2,0), (0,1), (1,1) |
| T | (1,0), (0,1), (1,1), (2,1) |
| Z | (0,0), (1,0), (1,1), (2,1) |

Rotate J/L/S/T/Z clockwise about (1,1), I about (1.5,1.5), and keep O's occupied cells fixed. Rotations are 0, R, 2, L. Clockwise mapping about a pivot is (x,y) → (cx-(y-cy), cy+(x-cx)); counterclockwise is its inverse. The classic baseline may reject rotation at walls/blocks without kicks; complete modern behavior uses the candidate tables below. The baseline may draw pieces independently with equal probability; the complete game uses seven-bag.

Gravity interval in milliseconds is max(100, floor(1000 × 0.85^(level−1))). Begin at level 1, score 0 and cleared lines 0. Level is 1 + floor(total cleared lines / 10). Clearing 1/2/3/4 lines awards 100/300/500/800 multiplied by the level before that clear. Remove complete rows simultaneously and shift rows above downward, inserting empty rows at the top. Soft drop awards one point per successful downward cell; hard drop awards two per vertical row traversed. Gravity, failed movement and repeated zero-distance hard drops award no drop points. Score saturates at 9007199254740991; total lines uses the same non-negative safe-integer range. No combo or back-to-back bonuses apply.

Idle has no falling simulation. Start creates a fresh board, queue, hold slot and zero bonuses; restart resets all game state and input timers while keeping settings, panel visibility and session results. Running advances the simulation; paused preserves it; game over freezes it and emits one completion event for that game. A rejected command changes no board/pose/bonus/score state. Rotation/movement keys in idle, paused or game over have no gameplay effect.

## Movement aids and timing

R-MOD seven-bag uses an unbiased permutation of all seven kinds, exhausting each bag before shuffling another. Maintain enough queued kinds for one next preview and future spawns; hiding preview never consumes a draw. A seeded source must make test sequences repeatable. Preview shows the next draw only.

Hold is usable once per active piece between locks. First Hold stores the current kind and spawns the next queued kind; later Hold swaps the held/current kinds. Incoming pieces spawn at rotation 0 and the spawn origin, with fresh gravity/contact accumulators. A failed incoming spawn ends the game and yields one completed result. The hold-used flag becomes available after the next lock. When Hold is disabled, reject Hold without changing slot, queue or flag. Reenabling Hold does not reset an already-used flag. Active penetrators cannot Hold.

Rotation tries candidates in table order and accepts the first legal one. O rotation does not move cells. Offsets below use screen y downward and are added to the unshifted rotated origin; no mirrored y interpretation is permitted.

| Transition | J/L/S/T/Z offsets |
| --- | --- |
| 0→R | (0,0), (-1,0), (-1,-1), (0,2), (-1,2) |
| R→0 | (0,0), (1,0), (1,1), (0,-2), (1,-2) |
| R→2 | (0,0), (1,0), (1,1), (0,-2), (1,-2) |
| 2→R | (0,0), (-1,0), (-1,-1), (0,2), (-1,2) |
| 2→L | (0,0), (1,0), (1,-1), (0,2), (1,2) |
| L→2 | (0,0), (-1,0), (-1,1), (0,-2), (-1,-2) |
| L→0 | (0,0), (-1,0), (-1,1), (0,-2), (-1,-2) |
| 0→L | (0,0), (1,0), (1,-1), (0,2), (1,2) |

| Transition | I offsets |
| --- | --- |
| 0→R | (0,0), (-2,0), (1,0), (-2,1), (1,-2) |
| R→0 | (0,0), (2,0), (-1,0), (2,-1), (-1,2) |
| R→2 | (0,0), (-1,0), (2,0), (-1,-2), (2,1) |
| 2→R | (0,0), (1,0), (-2,0), (1,2), (-2,-1) |
| 2→L | (0,0), (2,0), (-1,0), (2,-1), (-1,2) |
| L→2 | (0,0), (-2,0), (1,0), (-2,1), (1,-2) |
| L→0 | (0,0), (1,0), (-2,0), (1,2), (-2,-1) |
| 0→L | (0,0), (-1,0), (2,0), (-1,-2), (2,1) |

Normal projected landing is the last legal pose reached by consecutive unit downward movement without crossing an illegal pose. Ghost and hard drop use this identical projection. Hidden ghost mode draws none; always-show draws the legal projection; dynamic mode draws only if the minimum occupied destination y is at least 10. Exactly row 10 qualifies. Any cell above row 10, including a straddling projection, hides the entire ghost. A ghost coincident with the active piece may be occluded by normal draw order.

Grounded means that the current piece is at its legal terminal landing for its current x/orientation. Under interval policy, entering grounded state starts a deadline one full current gravity interval later, independent of residual gravity time. Successful grounded moves, rotations, failed down attempts and repeated hard drops do not extend that deadline. Becoming airborne clears the deadline; a later contact starts a new full interval. Lock at or after the deadline, provided final placement remains valid. Under failed-down policy, only a failed attempted downward movement locks a grounded piece, including a gravity tick or soft-drop attempt. Merely arriving at contact does not lock under that policy.

Hard drop moves to the projected destination and awards distance points. With `immediate` hard-drop locking it locks in that command, including distance zero; with `follow` it respects general locking. Arrival by a follow-policy hard drop does not itself constitute a failed downward attempt. A hard drop that becomes grounded starts the contact deadline under interval policy; if already grounded it preserves the existing deadline.

Simulation events at the same active time are processed with contact-expiry lock first, then a due downward tick, then queued user commands. Once locking/spawning occurs at a timestamp, commands targeted at the old piece are discarded; elapsed time may continue for the new piece. Use monotonic active time, not UTC. Pause, hidden document and focus loss freeze gravity/contact/key accumulators and clear held keys; hidden/focus loss leaves the game explicitly paused on return. A frame gap over 250 ms automatically pauses before consuming that gap and reports the pause, avoiding an uncontrolled catch-up. Timer fixtures below that gap limit must be independent of frame partitioning. Start/resume establishes a fresh frame timestamp without charging paused time.

## Penetrator

R-PEN grants one bonus for exactly four simultaneously cleared rows, never for four cumulative single clears. Clamp to three. New games start at zero; restart clears bonuses. The game-info indicator shows exactly the available bonus count and updates immediately on earning/spending.

V activates the current piece only while running, with at least one bonus, no active penetration, and all four occupied cells within visible board bounds. Rejection above the board, with no bonus, while paused, or on repeated activation spends nothing. Successful activation spends one, preserves kind/orientation and hold-used state, and lasts until that piece locks or the game restarts/ends. Active cells are white. Settled cells after lock use the original kind's regular color; Hold and next previews are never white penetrators.

A penetrator may transiently overlap settled cells without changing them. For a given pose, enumerate in-bounds downward origins from the current y through the bottommost origin; choose the greatest y whose occupied cells are wholly in-board and empty of settled cells. Intermediate overlap does not stop traversal. There must be such a destination at or below the pose; movement/rotation candidates without one are rejected. Advance toward that destination without stepping below it. Grounded/locking eligibility uses that terminal destination, not collisions along the path.

Left/right movement and SRS rotation ignore settled-cell collision for traversal but retain occupied-cell board bounds and eventual-landing viability. Evaluate candidates in the same order as normal rotation. They cannot kick above the board. Activation that opens a deeper landing makes the piece airborne and clears normal contact timing. Ghost and hard drop use exactly the deepest legal penetrator destination; hard drop must cross intervening occupied rows. Failed-down locking applies only at that valid terminal pose. Every lock rechecks complete in-board, non-overlapping placement before inserting cells; transient overlap cannot trigger a lock.

## Required boundary evidence

Cover wall/floor/all-kicks-rejected rotations for I and JLSTZ; O invariance; spawn and above-top locking failure; simultaneous row compaction; scoring at a level boundary; empty/populated Hold and spawn failure; bag edges; contact at 999/1000 ms at level 1; grounded movement versus airborne recontact; both hard-drop policies at zero/nonzero distance; paused/hidden time; all ghost/midline positions; penetrator pockets below blockers, no valid landing, activation at spawn, bonus cap/spend/rejection, disabled Hold and final lock validity. Tests must verify settled cells are unchanged by penetration until lock/clear.
