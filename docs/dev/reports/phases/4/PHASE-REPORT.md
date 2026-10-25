# Phase 4 — Session configuration

## Outcome and source

T-013–T-015 satisfy the phase-4 exits: all six settings, live rules, disabled-feature preservation, optional settings/help and a centered desktop surface. Starting release is v0.3.0 at e1b1eb0a74e363305988ca710d52c17ffa082381; delivery tip 9034d75ea1f7d09fd7e029aaf0835eb306295901. This review commit prepares 0.4.0; integration/publication are pending.

## Cumulative review

Reviewed catalogue/default/wire domains, whole-object validation and memory publication, direct domain guards, failed-down gravity/soft attempts, zero/nonzero immediate drops, unchanged/changed policy timing, paused changes, active penetrator preservation, Hold state, input focus, panels/labels/help and user/developer navigation. The independent [milestone review](4.1.md) records resolved P4-R1 and repaired evidence gaps. No remaining blocking findings. The task-list introduction was also corrected to stop claiming no implementation existed.

## Verification and limits

- Final `npm run test:unit`: 44/44; `npm run build`: passed including TypeScript.
- Development actual-server browser suite: 34/34 across Chromium/Firefox.
- Production suite: 22 passed, 12 intentional development-fixture-only skips; all values, reload defaults, native immediate/failed-down behavior, disabled controls and layout run in production. Controlled ghost/calendar-free gameplay fixtures remain development-only.
- Rebuilt production file hashes match the complete browser-tested dist manifest after version/docs-only preparation; no new product source followed those browser runs.
- Four available optional-panel combinations keep the board within one pixel of viewport center at 1280×800; visible panel edges and required-info height pass. Narrow-surface scroll and visual screenshot verified.
- Static package: seven unique CRC-valid entries, VERSION 0.4.0, app/assets, guides/license, no production fixture hook. Complete body-only release notes prepared; asset upload/download verification belongs to publication.

Session settings reset on reload and persist across game restarts as intended for this increment. No persistence/results/files acceptance is claimed. Environment/browser recovery and OS-focus evidence limits remain in DEVELOPMENT; hosted CI execution is not claimed.

## Tracking, TODO and next boundary

Delivery issues 22/23 and milestone 8 are closed/read back using individual issue states (provider counters remain stale). TODO: None. Publish/read back T-015, close review milestone 9, integrate and verify/publish main, then create matching release commit/annotated v0.4.0 tag and publish/read back notes/assets. Activate phase 5 only afterward.
