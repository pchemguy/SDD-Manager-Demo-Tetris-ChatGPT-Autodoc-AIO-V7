# Architecture

## Context and direction

[PROJECT](PROJECT.md) defines a single-player desktop browser game with a static TypeScript application, a Canvas playfield, HTML panels, browser settings persistence, and manual JSON/SQLite files. The design keeps game rules independent of rendering and external storage. No application server, account service, or remote leaderboard participates.

## Major blocks

| Block | Responsibility and owned state | Dependencies |
| --- | --- | --- |
| Game domain | Board, active/held/queued pieces, scoring, randomizer state, contact timing, penetrator bonuses, game lifecycle; deterministic state transitions and projection | Plain values, explicit elapsed time, supplied random source; no DOM, timers, cookies, file libraries, or browser APIs |
| Application coordinator | One active game, effective settings, session results, commands, scheduling, input routing, settings/restore transactions | Domain and narrow presentation/storage ports |
| Presentation | Canvas painting, HTML controls and panels, keyboard event normalization, focus and visible status/errors | Read-only view model and application commands; never changes board or results directly |
| Browser adapters | Clock/visibility, cookie and URL access, file picker/download, background SQLite execution | Browser APIs and locally packaged parsing/validation runtime assets; return values/errors to the coordinator |
| Transfer validation | Versioned JSON/SQLite decode/encode and canonical snapshot validation | Domain-independent result/settings value contracts; SQLite adapter for database bytes |

The coordinator owns orchestration rather than duplicating rule implementations. Domain functions expose commands and resulting events/snapshots. The renderer consumes snapshots; it does not calculate alternate collision or landing rules. Browser adapters are injected at boundaries that require controlled failure/time tests, without adding a generic service container.

## Dependency direction

Presentation delivers commands to the application coordinator. The coordinator calls the domain and adapters, then publishes an immutable view model. Transfer decoders produce staged plain data for shared validation. Browser adapters depend on canonical value contracts; the domain never imports an adapter or the application coordinator. Shared value types contain no browser behavior.

This direction permits deterministic engine tests without a browser, transaction tests with explicit storage failures, and browser acceptance through the real static server. A component UI framework or a second global state store would introduce unnecessary synchronization for five panels.

## Canonical game state and projections

One domain state owns the settled board and active piece. Commands validate changes before committing a new state. Settled cells and the active piece remain separate so penetrators can overlap occupied cells transiently without destroying or painting over stored state.

A shared placement/projection service is authoritative for collision rules, legal terminal landings, ghost coordinates, and hard-drop destinations. Normal and penetrator traversal differ by an explicit policy while sharing geometry, board bounds, and final-placement validation. Penetrator movement and SRS candidate acceptance must retain a legal landing at or below the candidate position. Only the lock transition can merge an active piece into settled cells; it revalidates the final placement.

The domain receives elapsed active-game time. Browser animation scheduling, keyboard repeat, background-tab events and wall-clock timestamps remain outside it. Monotonic gameplay time is separate from UTC result timestamps. Contact and gravity scheduling use the same simulation timeline; pause suspends both without losing accrued progress.

## Settings and results

The application coordinator owns the six effective setting values and the ordered session leaderboard. One settings descriptor model supplies domains, defaults, URL/cookie keys and presentation labels so resolver, controls, serializers and validators cannot drift into separate rule catalogues. The JSON Schema is checked against this model by fixtures and contract tests.

Completed-game events cross the domain/application boundary once per game identity. The coordinator supplies a stable result ID and UTC timestamp, validates the score, ranks the top ten, and publishes the updated view. Restarting an unfinished game is not a completion event. Results have no automatic persistence; cookies hold settings only, while downloaded files hold both settings and results.

## Validated transfer boundary

Save encodes a validated immutable snapshot of current completed results and all six settings. JSON and SQLite are interchangeable representations of the same canonical payload; neither owns an independent interpretation of a setting or result.

Restore follows a staged pipeline: pause play before file selection, bound input bytes, detect format, decode in isolation, validate the complete canonical payload, then ask the coordinator to apply it. Schema/data errors, unsupported versions, timeouts and cancellations cannot reach a state-mutation path. The current game board/score is not restored; only completed results and settings are imported.

SQLite decoding/encoding runs in a dedicated worker with a finite lifetime, operation ID and timeout. The runtime and WASM assets are packaged with the static build. Import never enables extensions or executes SQL supplied by the file or its schema; fixed application queries read an allowlisted database structure. A terminated/stale worker cannot submit a later commit. The worker is created through the bundler-supported module-worker URL path and its deployed asset loading is verified during implementation.

The settings commit coordinator snapshots effective values, results, raw managed cookies and current URL before applying validated changes. It writes/reads back managed persistence values and URL changes before publishing the new in-memory view, restoring captured values on a detected write failure. It preserves unrelated query parameters and cookies. Operation serialization prevents concurrent settings and restore mutations. Browser denial or failed rollback is reported explicitly; no success is announced without confirmed application of the complete snapshot.

## Presentation and layout

The board is the horizontal anchor. A symmetric reserved space around it accommodates the unequal left and right panel groups; hiding optional panels does not reflow the anchor. On supported desktop viewports, leaderboard and game-info occupy the left group, settings and help the right group. Below the minimum desktop width, the minimum-width game surface scrolls without compressing controls or the board.

HTML owns accessible labels, buttons, settings controls, leaderboard text and errors. Canvas owns settled/active/ghost rendering. Color is supplemented by shape/position and textual state; penetrator white is reserved for its active-piece identity. Preview and Hold rendering reuse tetromino geometry without exposing mutable engine state. Panel visibility state is application UI state, separate from the six persisted game settings.

## Failure, lifecycle and resources

- Domain rejection is a normal command outcome: no partial board mutation and no bonus spending on rejected activation.
- Application/storage errors become visible status messages; raw file content is never inserted as HTML.
- A single scheduling loop and one input owner prevent duplicate gravity or repeat handlers across restarts.
- Pause, game over, restart and page disposal cancel held-key repeat state and prevent delayed commands leaking into a new game.
- File operations are serialized; downloads release object URLs and workers release database memory after success, failure or timeout.
- Valid static game assets require no external service at runtime. Initial deployment uses HTTP(S); persistence behavior is not promised for direct `file:` URLs.

## Verification seams and limits

The domain supports seeded random sources, explicit elapsed time, board fixtures and command sequences. Projection fixtures cover blockers, disconnected empty pockets, midline straddles, penetrator terminal validity and identical hard-drop/ghost destinations. Application fixtures exercise one-time results and storage rollback before real-browser coverage. Cross-format fixtures test semantic equality and complete rejection.

Chromium primary and managed Firefox secondary exercise the actual server/build, isolated contexts, Canvas pixels, keyboard focus, download/restore paths and deployed worker/WASM assets. Test/tool versions are pinned with the implementation lockfile after supported provisioning checks. This design establishes responsibilities and intended behavior, not evidence that browser provisioning or the application already works.
