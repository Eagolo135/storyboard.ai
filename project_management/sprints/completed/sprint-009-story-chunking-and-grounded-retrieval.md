# Sprint 009: Story Chunking And Grounded Retrieval

## Goal
Move authenticated story workspaces from extraction-only source storage to usable grounded retrieval by adding chunk persistence, story-scoped retrieval, and storyboard generation against user-owned sources.

## Scope
- Add source-document chunk storage and migration support.
- Chunk pasted and uploaded source text during ingestion.
- Retrieve story-scoped chunks for storyboard generation.
- Add the authenticated workspace panel for grounded storyboard generation.
- Validate with tests, lint, and build.

## Out of Scope
- Embedding generation
- Vector search
- Retrieval confidence thresholds
- Broad dashboard redesign

## Tasks
1. Add chunk schema, repository, and chunking utility.
2. Persist chunks during source-document ingestion.
3. Route authenticated storyboard generation through story-owned chunk retrieval.
4. Add workspace UI for grounded storyboard generation.
5. Update docs and verify the repo.

## Acceptance Criteria
The sprint is complete when:
1. Pasted and uploaded sources create chunk records.
2. Story workspaces can generate storyboards from story-owned source chunks.
3. Demo storyboards still work through the curated local knowledge base.
4. Tests, lint, and build pass.

## Definition of Done
Authenticated story workspaces use chunk-backed retrieval for storyboard generation, the database schema supports persisted chunks, and the implementation is documented.