# Main documentation preparation record

## Current control

- Mode: autodoc/onepass, selected by the current user request.
- Scope: the complete browser Tetris target supplied in this conversation, including portable JSON/SQLite saves and the five-panel layout. [PROJECT](PROJECT.md) retains the reviewable scope and proposed clarifications.
- Approval basis: The user accepted the published PROJECT brief and proposed choices with “k” in direct reply to its approval request. Autodoc preapproves ARCHITECTURE through TASKS; their technical QC and publication remain required.
- Stop: after DOCS-008, before whole-package QC, documentation integration, or implementation.
- Tracking: enabled for preparation and implementation by root AGENTS.md. The native sdd-docs-main milestone 1 and issues 1–9 were created from package definitions and read back with exact content/associations before repository modifications.
- Publication: every owned commit is pushed and read back before progression.
- Reporting: Standard; Minimal and Explicit are available.

## Scope sequence

One complete-scope preparation pass. No later scope passes are inferred. The product includes a classic baseline, modern mechanics, penetrator, six settings with cookie/URL resolution, a session top-ten leaderboard, manual versioned JSON/SQLite save/restore, and centered five-panel layout. Each implementation phase will produce a verified, integrated release; release publication is not part of documentation preparation.

## Decisions and document evidence

| Task | Current evidence / decision basis |
| --- | --- |
| DOCS-001 | All four existing root files retained unchanged; task/control/handoff records initialized. Provenance byte comparisons and CRLF-aware whitespace checks passed. Initialization commit 61a02c9a4898e7b771b634a07779899ace3bdf2e was pushed and exact-ref read back; issue 1 was closed with completion evidence and state/milestone readback verified. The connector returned an integration-specific 403 on update; the separately supplied repository token succeeded through the bounded API client. No credential replacement was needed. |
| DOCS-002 | PROJECT proposal SHA-256 8c53570fd942c686f9878f54508d70e18bad0c81c01f0c7ce88a13bcdaa7445a. Accepted by the user’s “k” reply to the published brief at commit 5574842ad4f605128760b67e4e11c401640cb784; exact PROJECT bytes retained. Checked DOCS-002 accompanies this approval record; publication/issue closure follow. Scope/decision/content checks and a fresh builder review found no material feature omissions. Narrow-viewport behavior and restore interaction findings were corrected before presentation. |
| DOCS-003 | Define domain, application, presentation and validated transfer boundaries. Reviewed content: ARCHITECTURE.md SHA-256 7a05d0cbb70612d85cc2dc9d6afaf1b7a2c7317410f606ae507aa88ed7e219bf; PROJECT.md SHA-256 f2eaf21e49943c5b6d2fa0e0a2eda8f0a27405ea8f8a2009ea01a1e891ad85d1. Scoped preapproval: user-selected autodoc, after PROJECT approval. Markdown/link checks passed; commit publication and issue 3 closure/readback follow. |
| DOCS-003–008 | Remaining documents require authoring and scoped QC; checkpoint preapproval derives solely from autodoc selection. |
| DOCS-009 | Not selected: autodoc stops before package QC. |

## Initialization

- Original root files: AGENTS.md, AI_DISCLOSURE.md, SDD-MANAGER.md, SKILL_DISCOVERY_PROTOCOL.md all existed at the initial published baseline dd006f36a24fe145c3e5eae219caf7a0f6c2bfe0. None copied or changed. Their current bytes match that baseline.
- Continuation: all four existed, so no mixed-initialization pause applies.
- Manual provenance: default enabled; two bundled templates were copied byte for byte, with no transcript created. Seed 3ba1ca89180f6f9c2ce980bc0305823bcc937ef2 on design-docs/ai-logs; verified two-parent main merge 9134edef230f2882427442a678602ae50d0b1118 was pushed/read back before creating design-docs/main.
- Credential input is ignored and untracked under the root *.tkn rule; no credential appears in tracked content.
- Execution host: Linux, Git 2.51.1, Node 24.22.1, Python 3.12.14. Windows-only shell policy is inapplicable. Browser policy requires isolated Chromium/managed Firefox when browser work begins; no browser installation or application test was performed during document preparation.
- Initial project state: guidance and vendored skills only; no game source, development documents, or unfinished workflow branch existed.
- Current reset: none.

## Accepted product decisions

[PROJECT](PROJECT.md#consequential-choices) contains the defaults and gameplay boundary choices accepted with the brief. Choices include hiding straddling ghosts; no timer reset from grounded moves/repeated drops; airborne timer reset; paused/hidden-tab timer suspension; disabled Hold during penetration; activation only wholly inside the visible board; SRS kicks with traversal and landing viability; deepest legal penetrator landing; live setting changes; per-setting invalid-source fallback; full-file restore rejection; auto-pause before restore; deterministic leaderboard ties; and a 1280 × 800 supported desktop minimum with scrolling below it. The brief identifies the recommended TypeScript/Canvas/static-HTML direction and alternatives. Accepted by the user’s “k” reply; the recommended TypeScript/Canvas/static-HTML direction is included.

## Proposal QC and limits

- Compared the brief against all requested feature groups, manual formats, six-setting precedence/persistence, panel positions/toggles, bonus indicator, and phase release requirements; no material scope omissions found.
- A fresh builder reviewer flagged conflicting narrow-screen centering guarantees and the proposed active-play restore restriction. Both were clarified: viewport centering applies at the supported desktop minimum; smaller windows scroll a minimum-width game surface; Restore pauses play instead of being unavailable during play.
- Added explicit penetrator activation/spawn and kick-interaction proposals. Kept exact scoring, input bindings, serialization limits and other non-material contract details for SPEC.
- Checked project-document content boundaries, heading/list spacing, local Markdown links, preservation of DOCS-001 root files, and unchecked PROJECT status. No package QC, browser execution or product acceptance is claimed.

## Pending transitions

Publish/read back DOCS-004, then close/read back its issue 4. Continue only through DOCS-008 in dependency order. DOCS-009, preparation integration and implementation remain unselected. Recover actual prior publication/closure from Git and provider state; per-document completion does not prove subsequent effects.
