# Specification conformance review

## Current gate

Ready for delivery-strategy authoring after Revision 1 recheck. This is SPEC/design conformance and schema-fixture assessment, not whole-package QC or application acceptance. No browser or game implementation was executed.

## Reviewed state

- `SPEC.md`: SHA-256 `e80881865b9b8f3b75bc6ac71c86d39352817d199b5153bb9ffb650ce90d35b4`.
- `spec/GAMEPLAY.md`: SHA-256 `c70822208f1102c226629a14e1dbe850345c79007458285aae30b1564214de7e`.
- `spec/SETTINGS.md`: SHA-256 `f3ef0dc34afee8df317d1181160dba4d6a05b430f293caddd07c8a6c39b2b600`.
- `spec/TRANSFER.md`: SHA-256 `ac2137a47d574f8809c26c92f0a171044a87f262c6a2600ecb5a7d08fc80d087`.
- `spec/SAVE-SCHEMA.json`: SHA-256 `427157da946929bf18483f9c1558368e5d33aac68cd597a7c1a76e1111c4fc23`.

## Governing state

- `PROJECT.md`: SHA-256 `f2eaf21e49943c5b6d2fa0e0a2eda8f0a27405ea8f8a2009ea01a1e891ad85d1`.
- `ARCHITECTURE.md`: SHA-256 `7a05d0cbb70612d85cc2dc9d6afaf1b7a2c7317410f606ae507aa88ed7e219bf`.
- `DECOMPOSITION.md`: SHA-256 `005090437f694a5266168979420a6e2c037f7f93212d439d39682a2fdd07d855`.

## Coverage and assessment

| Contract group | Design fit and assessed boundaries |
| --- | --- |
| R-BASE / R-MOD | D1–D4 own geometry/source/transitions/timing; precise coordinates, kick tables, scoring, Hold, time ordering and pause/reset contracts allow deterministic acceptance. |
| R-PEN | D1 and D3 share traversal/final-placement invariants; bonus ownership and P2/P3 rendering are explicit. No collision/landing algorithm is duplicated in UI. |
| R-CFG / R-URL | A2 owns the six domains/defaults; A4/B2 own complete commit/readback/rollback. Source absence, invalidity, defaults and unrelated parameters are distinct. |
| R-LB / R-XFER | A3 consumes one completion per game; T1 is the cross-format validator. Files preserve stable identity/time/score; whole-candidate staging precedes mutation. Worker/asset/resource failures have explicit rejection paths. |
| R-UI / R-QUAL | Presentation, focus, panel centering, accessible controls, runtime asset isolation and both required browser targets fit the selected static architecture. |

## Checks and findings

- Compared the complete specification and three children with the accepted brief and component ownership. Every requested capability has a canonical contract; no unsupported backend/account/multiplayer scope was introduced.
- Assessed normal/penetrator destination equivalence, above-top activation/locking, grounded timing/reset, policy changes, hidden-tab pause and repeated hard drops for contradictions. Final-placement validity is independent of transient traversal collision.
- Assessed JSON and SQLite shape/type/version/calendar/duplicate/resource obligations and no-partial-commit paths. Browser-denied rollback cannot support a successful restore acceptance claim; required implementation failure checks remain mandatory.
- F-SPEC-001: The initial report incorrectly stated that Draft202012Validator schema/fixture checks passed. The command actually failed at import because jsonschema is absent from default and supplied Python runtimes. No fixture test ran in that attempt. The claim is withdrawn; this finding blocks dependent planning until corrected/rechecked. Duplicate IDs/object names and strict timestamp canonicality remain required runtime validation.
- Heading spacing, local links, exact six-key alignment and document-content boundaries checked. Found no confirmed unresolved conformance issue. No correction cycle was needed; no Revision section is fabricated.

## Limits and downstream gate

Schema tests do not validate a parser, transaction implementation, native downloads or SQLite engine. Browser provisioning, real database corruption/resource fixtures, cookie/history failure injection and all gameplay checks belong to implementation. PLAN must preserve complete contract coverage while bounding each increment and deferring later capabilities honestly. Any material design/contract change invalidates the affected assessment.

## Revision 1 — Correct schema verification evidence

F-SPEC-001 was caused by advancing after a failed tool exit rather than checking its result before report composition. The coordinator corrected the inaccurate report and installed jsonschema 4.23.0 only in an external disposable tool directory; no project dependency changed. An initial fixture run exposed that the optional RFC date-time checker was unavailable, so a FormatChecker was explicitly registered using Python datetime.strptime plus the canonical UTC shape. This makes calendar assertion active instead of treating format as an annotation.

Observed recheck: Draft202012Validator.check_schema passed; all 14 fixture assertions passed (2 valid payloads, 12 invalid mutations). Accepted empty/leap-day payloads; rejected negative, fractional and unsafe scores, invalid non-leap date, offset timestamp, bad UUID and each of six missing settings. Command used external PYTHONPATH schema-check-deps with Python 3.12.14, jsonschema 4.23.0 and an explicit calendar checker. No specification behavior or schema bytes changed. F-SPEC-001 is resolved by corrected provenance and observed checks; no application behavior is claimed. Duplicate IDs/names remain additional runtime validation obligations. The inaccurate earlier claim remains visible in Git history.
