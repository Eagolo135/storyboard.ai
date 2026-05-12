# Sprint 007: Source Intake And Ingestion Foundation

## Goal
Start the real document-ingestion path so authenticated story workspaces can move away from curated local JSON and toward user-owned source material.

## Scope
- Add a minimal story-scoped source-document domain layer.
- Implement the first ingestion slice using pasted text.
- Add story-level source views and status inspection.
- Support PDF and DOCX uploads with server-side text extraction.
- Keep the implementation compatible with later file uploads, parsing, chunking, and embeddings.

## Out of Scope
- Chunk generation
- Embedding generation
- Semantic retrieval
- Major UI redesign

## Tasks
1. Add source-document schema, repository, and service layers.
2. Add a dashboard action and form for pasted source text.
3. Add story-level source views and per-story source listing.
4. Add PDF and DOCX upload plus server-side extraction.
5. Update docs and keep sprint 006 deferred until semantic retrieval exists.
6. Validate with tests, lint, and build.

## Current Status
- Completed: source-document schema, repository, and service were added.
- Completed: pasted-text source intake was added to the dashboard as the first ingestion slice.
- Completed: recent source documents now render in the authenticated dashboard.
- Completed: story-level source workspaces now exist under `/dashboard/stories/[storyId]`.
- Completed: PDF and DOCX uploads are stored in Supabase Storage and extracted server-side.
- Completed: automated tests were expanded for source-document input validation.
- Remaining: chunking, embeddings, and retrieval integration are still ahead.

## Acceptance Criteria
The sprint is complete when:
1. Authenticated users can attach source text to a story.
2. Source-document records are represented in the application domain.
3. Authenticated users can inspect story-scoped source material beyond the dashboard list.
4. Authenticated users can upload PDF and DOCX files and store extracted text.
5. Sprint 006 is documented as deferred until real semantic retrieval exists.

## Testing / QA Steps
1. Run `npm test`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Verify the dashboard route still renders correctly in unconfigured and authenticated paths.
5. Verify the story source workspace route renders coherently in the unconfigured path.

## Drift Check
1. Stay inside source-intake foundation work.
2. Do not add semantic retrieval prematurely.
3. Do not pretend uploaded files are already chunked or embedded.

## Definition of Done
This sprint is done when StoryBoard AI can store and inspect the first user-owned source material in a story-scoped way, including uploaded files with extracted text, and the codebase is positioned for later chunking and retrieval work.