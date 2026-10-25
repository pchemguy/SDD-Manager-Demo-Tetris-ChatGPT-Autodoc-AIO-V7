# Task-list conformance review

## Current gate

Ready for TASKS derivation only. No implementation task is complete or activated. Whole-package QC, documentation integration and execution readiness remain separate gates.

## Reviewed and governing state

- `TASKS.md`: SHA-256 `50c538ead667d661ee7381a965e38480502d84d4012782acab6beb310473725e`.
- `PLAN.md`: SHA-256 `636835aa47532354a7889422aaad8b35e248282a93982d5dc15a1485f823a7d9`.
- `layout.md`: SHA-256 `36f32a74535b20879a61ed5de5c4cb58cd19c0982ad53462d69db9e3f781abaf`.
- `PLAN-REVIEW-REPORT.md`: SHA-256 `1113355ccdc2b34a0d09f8b2321ccc0db48114538a4a4ae88032e9d9ceefc15e`.
- `SPEC.md`: SHA-256 `e80881865b9b8f3b75bc6ac71c86d39352817d199b5153bb9ffb650ce90d35b4`.
- `spec/GAMEPLAY.md`: SHA-256 `c70822208f1102c226629a14e1dbe850345c79007458285aae30b1564214de7e`.
- `spec/SETTINGS.md`: SHA-256 `f3ef0dc34afee8df317d1181160dba4d6a05b430f293caddd07c8a6c39b2b600`.
- `spec/TRANSFER.md`: SHA-256 `ac2137a47d574f8809c26c92f0a171044a87f262c6a2600ecb5a7d08fc80d087`.
- `spec/SAVE-SCHEMA.json`: SHA-256 `427157da946929bf18483f9c1558368e5d33aac68cd597a7c1a76e1111c4fc23`.
- `SPEC-REVIEW-REPORT.md`: SHA-256 `f168978c4ee9f8af8277917fe78008b858a6e8094f3f95e260ad74db8e905833`.
- `PROJECT.md`: SHA-256 `f2eaf21e49943c5b6d2fa0e0a2eda8f0a27405ea8f8a2009ea01a1e891ad85d1`.
- `ARCHITECTURE.md`: SHA-256 `7a05d0cbb70612d85cc2dc9d6afaf1b7a2c7317410f606ae507aa88ed7e219bf`.
- `DECOMPOSITION.md`: SHA-256 `005090437f694a5266168979420a6e2c037f7f93212d439d39682a2fdd07d855`.

## Delivery counts and boundary assessment

| Milestone | Delivery tasks | Excluded phase review | Assessment |
| --- | --- | --- | --- |
| 1.1 | 4 | T-005 | Harness, movement, timing/scoring and playable integration are separate outcomes; T-004 owns folded review because phase 1 has one delivery milestone. |
| 2.1 | 3 | T-009 | Bag/Hold, kicks and projection/UI integration isolate rule risks; T-008 owns review. |
| 3.1 | 2 | T-012 | Small count assessed: ability invariants and native feedback are both needed; retain two coherent outcomes, T-011 owns review. |
| 4.1 | 2 | T-015 | Small count assessed: live rule model versus panel integration; per-setting splits would be artificial. T-014 owns review. |
| 5.1 | 2 | T-018 | Small count assessed: source resolution versus persistent transaction/native reload; distinct failure domains. T-017 owns review. |
| 6.1 | 2 | T-021 | Small count assessed: result lifecycle/ranking versus visible panel/native layout. T-020 owns review. |
| 7.1 | 2 | T-027 | Small count assessed: strict canonical/JSON validation versus atomic UI/state application. T-023 owns review. |
| 7.2 | 3 | T-027 | Worker/assets, fixed schema codec and native cross-format integration bound separate risks. T-026 owns review. |

Totals: 7 phases, 8 delivery and 7 phase-review milestones, 20 delivery tasks plus 7 dedicated phase-review tasks, 27 unique tasks. No standalone delivery-milestone review tasks meet the threshold; all eight final delivery tasks own code review, testing/repairs, report and HANDOFF. Small groups were assessed for under-splitting and fragmentation rather than padded to a quota.

## Coverage and findings

R-BASE maps to T-001–005; R-MOD to T-006–009 with policy alternatives T-013–015; R-PEN to T-010–012; R-CFG to T-013–015; R-URL to T-016–018; R-LB to T-019–021; R-XFER to T-022–027. Input/focus, raster output, browser matrix, production assets, docs, packages and regressions belong to every applicable integrated boundary. T-027 aggregates the final report/TODO provenance. Releases remain coordinator transitions after integration.

Manual assessment checked outcomes, localized edit scope, consumers/outputs, dependencies and evidence against PLAN/layout. Domain movement is separated from timing/clearing; JSON validation from mutation; SQLite environment risk from data validation. No task changes strategy, implements the whole product or is a trivial file edit. Relevant tests/docs accompany each task; common obligations are stated once.

The bundled forge parseOwner accepted all seven hierarchies. Additional checks passed: 27 unchecked unique IDs, canonical parentage/heading identity, valid backward-only task dependencies (acyclic), one final review task per phase and eight folded milestone review obligations. Heading/local Markdown links checked. No confirmed unresolved TASKS conformance finding; no Revision section is fabricated.

This scoped review does not certify whole-package history/compliance. Preparation-evidence repairs and withdrawn schema-test claims remain recorded in DOCS_PREPARATION and SPEC-REVIEW-REPORT for later package QC. No application/browser/release test or implementation projection was run.
