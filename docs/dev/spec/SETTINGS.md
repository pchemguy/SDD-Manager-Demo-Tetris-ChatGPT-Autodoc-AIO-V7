# Settings contracts

## Values and application

R-CFG defines exactly six game settings. Internal/file keys are stable and shared by both formats. Query/cookie values use the wire strings below, including booleans; JSON uses native booleans. Cookie names prefix the key with `tetris_`.

| Key / query name | JSON domain | Wire strings | Default |
| --- | --- | --- | --- |
| ghost | `hide`, `dynamic`, `show` | same | `dynamic` |
| hardDrop | boolean | `on`, `off` | true |
| nextPreview | boolean | `on`, `off` | true |
| hardDropLock | `follow`, `immediate` | same | `follow` |
| lockPolicy | `failedDown`, `interval` | same | `interval` |
| hold | boolean | `on`, `off` | true |

Controls apply immediately without restarting the game. Disabling a feature rejects its subsequent input while preserving relevant state; disabling Hold preserves the held piece and hold-used flag, and disabling hard drop preserves any contact deadline. A running penetrator stays active until lock even if other settings change. Ghost/next settings only affect visibility. A changed hard-drop policy applies to subsequent drops; it does not retroactively lock a previously dropped piece.

Changing general lock policy reevaluates the current piece: airborne pieces have no contact deadline; switching to interval while grounded starts a full current interval at the change time; switching to failedDown clears the deadline and waits for the next failed down attempt. Reapplying an unchanged policy does not reset timers. Settings changes while paused do not advance active time. Restore uses these same rules and preserves the paused board, active piece and score.

## Source resolution and persistence

R-URL resolves each setting separately at page load: valid explicit query parameter, else valid corresponding cookie, else default. URL presence is distinct from truthiness/default equality. Decode query values once using URLSearchParams rules; matching is case-sensitive. Values outside the exact wire domain, empty values and repeated instances of one managed query key make that URL source invalid for that setting. Unknown parameters are ignored by resolution and preserved by updates. Unknown/malformed cookies never affect other settings.

Use one cookie per setting, path `/`, SameSite=Lax and Max-Age=31536000 seconds; add Secure on HTTPS. Encode names/values safely. Explicit valid URL values write their corresponding cookies at startup, even when equal to default. Omitted or invalid URL sources do not overwrite saved cookie values. On a player setting change, persist that setting's cookie and replace all instances of its query key with exactly one canonical wire value, using history replacement rather than navigation. Preserve unrelated parameters and the fragment.

Restore writes all six cookies and all six query parameters, including defaults. Initial cookie-derived/default-derived resolution does not fill omitted query keys. Invalid sources produce a concise non-blocking warning naming the setting and fallback source; never display raw potentially hostile input as HTML.

## Commit and failure guarantees

Serialize user changes and restore so a second mutation cannot interleave. Parse/validate all candidate values before changing memory or persistence. Snapshot raw managed cookies, URL and effective values/results. For an ordinary setting change write/read back that cookie and candidate URL; for restore write/read back all six before publishing the new in-memory settings/results together. A successful operation updates visible controls to the same effective values. Clear pending key repeat when an operation pauses/changes input behavior.

On detected cookie or history write failure, restore the exact captured URL and prior managed-cookie values or absence, verify rollback, leave in-memory state unchanged and show a clear persistence error. Do not overwrite unrelated cookies/parameters. Never report success when cookie writes are silently blocked. If rollback itself is denied, report that persistence recovery is incomplete and keep the previous in-memory state; do not hide that external platform limitation or continue competing writes. Deterministic tests must cover failure at each managed-write step and verified rollback. A denied storage environment may play with initial in-memory values, but persistent-change acceptance is not claimed there.

## Required acceptance

Exercise every key with URL only, cookie only, neither, conflicting sources, explicit default, omitted key retaining cookie, invalid URL with valid cookie, invalid cookie with default, duplicated query key and unrelated query/fragment. Verify each control and live policy transition while airborne/grounded/paused, no reset on unchanged settings, persisted reload, restored settings and write-failure rollback. Cookies blocked and history denied must display the actual limitation without claiming saved configuration.
