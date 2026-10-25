# Phase 5 — Persistent configuration

## Outcome and source

T-016–T-018 satisfy the phase-5 exits: all six settings use independent URL/cookie/default precedence, canonical selected writes, omission/default preservation and verified transaction recovery. Base is v0.4.0 release commit 4ce93be0f27806c1533ac2cbcee8f7a69e7a9987; delivery tip b9254f7241cfdf32738d7e73b4ecb4def6d986a2. This review commit prepares 0.5.0; integration and hosted release remain pending.

## Cumulative review

Reviewed pure resolver domains/case/duplicates/decoding, raw managed-cookie capture and flags, URL updates, startup explicit-cookie writes, validation before external/memory publication, serialization, failure at each managed step, exact recovery, denied recovery blocking and live rule preservation. Independent review and its resolved native evidence gap are in [5.1](5.1.md). No remaining findings. User/developer guides describe supported persistence and distinguish denied external recovery from unchanged effective state.

## Executed verification

- Final `npm run test:unit`: 57/57; `npm run build`: passed with TypeScript.
- Final development browser suite: 52/52 in Chromium/Firefox.
- Final production suite: 40 passed, 12 explicit controlled-fixture skips; all preference source/control/failure/profile tests run in production.
- Six-key native source matrix, explicit defaults, omission, duplicate/invalid fallback, cookie path/SameSite/expiry/HTTP flags, unrelated parameters/fragment, silent refusal, exact rollback and denied recovery pass. HTTPS Secure serialization is adapter evidence.
- Actual owned persistent browser profiles close/reopen with cookies recovered from disk in both engines; profiles removed after teardown. No personal profiles or global sandbox changes.
- Rebuilt dist hashes exactly match the browser-tested manifest after version/docs preparation. Static ZIP has seven unique CRC-valid entries, VERSION 0.5.0, app/assets, guides/license and no production test hook. Complete body-only notes prepared; upload/download verification follows publication.

Existing mechanics, lifecycle and centered-panel regressions pass. Isolated-browser recovery and native OS-focus evidence limits remain documented in DEVELOPMENT. Remote CI execution is not claimed. Leaderboard/files remain planned.

## Tracking, TODO and next boundary

Issues 25/26 and delivery milestone 10 are closed/read back; stale provider counters do not override individually verified issue states. TODO: None. Publish/read back T-018 and close milestone 11, integrate/verify/publish main, then create the matching release commit and annotated v0.5.0 tag. Publish/read back GitHub notes, latest selection and both asset hashes/download bytes before phase 6 activation.
