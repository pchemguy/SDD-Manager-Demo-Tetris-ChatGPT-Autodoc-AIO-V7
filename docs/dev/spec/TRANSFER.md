# Results and transfer contracts

## Session results

R-LB records one result per completed game, including zero score. A failed spawn or above-top lock is completion; Restart of an unfinished game is abandonment. Completion emits once even if further input/ticks arrive. Generate a lowercase UUID v4 ID and a UTC completion timestamp when the completion event is consumed. Preserve that ID and timestamp across ranking, downloads and restores.

Scores are non-negative safe integers, maximum 9007199254740991. Timestamps use exactly `YYYY-MM-DDTHH:mm:ss.sssZ`, years 0001–9999, with a real Gregorian date/time, no leap second or offset. Check actual calendar round trip, not a regex alone. Future timestamps are allowed. Rank score descending, timestamp ascending, then ID ascending by ASCII order. Retain at most ten; the leaderboard shows rank, score and completion time, plus an empty-state message. IDs need not be displayed. Results persist across game restarts in the current page, but not reload/new tabs unless manually restored. No cookies/localStorage/IndexedDB store results automatically.

## Manual files

R-XFER exports one snapshot containing zero to ten completed results and all six settings. No active-game board, held piece, bonuses, score-in-progress or panel visibility is included. Save captures once before encoding so concurrent play cannot mix snapshots. Save offers JSON or SQLite and downloads `tetris-save.json` or `tetris-save.sqlite`. Saving does not pause or end the game. A format/runtime error shows an error without changing state or starting an invalid download.

Restore pauses a running game before opening the file picker; it remains paused after success, rejection or cancellation until explicit Resume. Idle/game-over state remains unchanged. Only one file operation runs at a time; disable Save/Restore while busy and announce processing. A new game may not start while a restore commit is pending. Hiding settings does not cancel a pending operation or move the Save/Restore pair elsewhere.

Detect SQLite by its exact `SQLite format 3\0` header; otherwise require UTF-8 JSON. Extension/MIME are hints, never validators. Reject zero bytes, multiple files, invalid UTF-8, JSON over 1 MiB, or SQLite over 5 MiB before decoding. JSON permits a UTF-8 BOM. The complete worker operation, including initialization and decoding, has a 10-second deadline; timeout terminates it and preserves current state. Cancellation after selection discards staged data; stale operation replies are ignored.

## JSON version 1

The root object contains exactly `formatVersion`, `results`, `settings`. `formatVersion` is integer 1. Results is an array of at most ten objects, each containing exactly `id`, `score`, `timestamp`. Settings contains exactly the six keys in [SETTINGS](SETTINGS.md#values-and-application) with native JSON booleans/enums. Reject unknown/missing properties, wrong types, unsafe/non-integer numbers, duplicate IDs and duplicate JSON object member names at any level. A strict parse step must detect duplicate names before normal object construction loses them; ordinary JSON.parse alone is insufficient.

[SAVE-SCHEMA.json](SAVE-SCHEMA.json) is the supplied Draft 2020-12 schema. Apply it with actual date-time format validation, then apply canonical timestamp/calendar, UUID and unique-ID validation. JSON Schema shape validation alone is not complete validation. Input order may be arbitrary; successful import normalizes results using the session ranking rule. More than ten results are invalid rather than silently truncated. Unsupported format versions are rejected without guessing a migration.

## SQLite version 1

Use database metadata `PRAGMA user_version=1` and `PRAGMA application_id=0x54455452`. Exactly two user tables are allowed: `high_scores` and `settings`; reject user views, triggers, virtual tables, extra tables and custom indexes. Automatic primary-key indexes are allowed. Require the following ordered columns and ordinary table structure; absence of CHECK clauses is not alone invalid because every stored value is validated independently.

| Table | Ordered columns / constraints |
| --- | --- |
| high_scores | `id TEXT PRIMARY KEY NOT NULL`, `score INTEGER NOT NULL`, `timestamp TEXT NOT NULL` |
| settings | `key TEXT PRIMARY KEY NOT NULL`, `value TEXT NOT NULL` |

The exporter adds `CHECK(score >= 0 AND score <= 9007199254740991)`. Bind all inserted values as parameters. `settings` has exactly six rows, one per canonical key, with the wire strings from SETTINGS; duplicated/missing/unknown keys are invalid. `high_scores` has at most ten rows with distinct IDs. Check SQLite storage classes (`typeof`), not merely column affinity: score must be INTEGER within the safe range, other values TEXT. Coercion of floats, blobs, nulls or strings into valid canonical results is prohibited. Require a successful integrity check and correct metadata before extracting data.

Inspect schema metadata with fixed queries before reading user tables. Never run SQL statements, extensions, trigger code or migration scripts provided by an imported file. Open bytes in a dedicated disposable worker using the packaged SQLite runtime. Decode rows into canonical values and run the same complete validator as JSON; do not trust database constraints. Release the database and terminate the worker on completion/failure. Cross-format equality concerns canonical values, not byte-identical database pages or JSON whitespace.

## Validation, commit and errors

Decode and validate the entire file before changing results, effective settings, cookies or URL. Invalid timestamps, values, one bad row, schema mismatch, duplicate IDs/keys, unsupported metadata, corrupt database, parser/runtime failure and timeout all reject the candidate as a whole. Report a concise actionable error, such as `Invalid completion timestamp in result 2`, without raw imported HTML or stack traces. Cancellation is a normal no-op for data, with gameplay left paused as specified.

After complete validation, delegate the single settings/results transaction to A4 using the [settings commit guarantees](SETTINGS.md#commit-and-failure-guarantees). Replace the session leaderboard, do not merge; an empty imported results array clears it. Write all six cookies/query values, apply live rules, preserve the active board and score, and publish controls/results together. A validation failure must leave results/settings/raw cookies/exact URL byte-for-byte equivalent to their captured state. Persistence failures require verified rollback and explicit reporting of any denied rollback rather than a false atomic-success claim.

## Required acceptance corpus

Round-trip empty and full top-ten datasets through each format and JSON→SQLite→JSON, retaining IDs/scores/timestamps and every setting, including defaults. Exercise equal-score ties, safe-integer boundaries, zero score, duplicate completion, restart abandonment and truncation on game completion. Reject a bad final result after nine good ones, invalid leap dates, offset timestamps, unsafe/float/negative scores, malformed UUIDs, duplicate IDs/object names, extra/missing properties/settings, bad versions and input size limits. SQLite additionally covers corrupt bytes, spoofed headers, schema/view/trigger/virtual-table substitutions, wrong storage classes, key duplication, metadata mismatch and timeout. For every rejected import assert unchanged results/settings/cookies/URL. Exercise successful replacement, native download/reupload and packaged worker/WASM loading in both required browsers.
