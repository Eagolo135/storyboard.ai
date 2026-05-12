# Sprint 006: Retrieval Hardening In Real RAG Context

## Status
Deferred until authentic semantic retrieval exists.

## Goal
Implement confidence handling and no-good-match behavior after authentic semantic retrieval exists.

## Scope
- Add retrieval thresholds.
- Add low-confidence and insufficient-evidence states.
- Improve retrieval explanations against real story-scoped documents.

## Out of Scope
- Authentication foundation
- Initial document ingestion
- Broad UI redesign

## Tasks
1. Define retrieval confidence behavior for semantic results.
2. Implement threshold-based response states.
3. Update UI messaging.
4. Add tests for low-confidence retrieval.

## Files Likely Affected
- future RAG retrieval modules
- orchestration and UI messaging
- relevant tests

## Acceptance Criteria
The sprint is complete when:
1. Low-confidence retrieval is handled honestly.
2. The user sees when evidence is insufficient.
3. Tests cover weak retrieval scenarios.

## Testing / QA Steps
1. Submit weak and off-domain prompts.
2. Verify low-confidence states.
3. Run tests, lint, and build.

## Drift Check
1. Stay inside the retrieval-confidence scope.
2. Do not add unrelated platform features.
3. Keep docs aligned.

## Definition of Done
Retrieval confidence handling is implemented in the real RAG pipeline and documented.