# StoryBoard AI Specification

## Project Name
StoryBoard AI

## Project Purpose
Build a small authenticated AI-assisted storyboarding platform for writers working on long-form fiction. The product should help each user store their own stories and reference material, upload or paste existing writing, retrieve relevant source context with authentic RAG, generate structured storyboards, and receive grounded feedback about continuity, style, and narrative quality.

## Target User
Individual writers or very small teams managing unpublished stories, lore documents, prior chapters, and planning notes.

## Main Goals
1. Support authenticated user accounts with isolated user-owned story data.
2. Give each user a dashboard showing their stories and recent work.
3. Allow users to upload PDF and DOCX documents or paste text as source material.
4. Parse, chunk, store, and retrieve those sources as the basis for authentic RAG.
5. Generate structured storyboards from retrieved evidence, not prompt-only guessing.
6. Provide useful grounded scoring and feedback with visible provenance.
7. Preserve privacy expectations appropriate for unpublished creative work.

## Hard Constraints
1. Next.js App Router, TypeScript, Zod, and Vitest remain required.
2. The product is small scale, targeting roughly 5 to 10 users.
3. User content must be isolated per user and per story.
4. Uploaded writing must be treated as sensitive by default.
5. The architecture must support real persistence, file storage, and semantic retrieval.
6. New work must follow the sprint workflow in `project_management/sprints/`.

## Tech Stack
### Current Baseline
- Next.js 16
- React 19
- TypeScript
- Zod
- Vitest
- CSS Modules

### Approved Direction
- Next.js on Vercel
- Clerk for authentication
- Supabase Postgres for relational storage
- Supabase Storage for uploaded files
- `pgvector` in Supabase for embeddings and semantic retrieval
- Paid AI APIs for generation and evaluation

## Design Direction
The product should feel like a professional writing workspace rather than a chatbot demo. The interface should emphasize ownership, evidence, provenance, retrieval transparency, and controlled generation. The current warm literary visual direction can be preserved, but the app must evolve from a single-page demo into a dashboard plus story workspace model.

## Features
1. Authentication and user accounts.
2. User dashboard showing stories, recent generations, and ingestion status.
3. Story-level workspace with isolated sources and outputs.
4. Source ingestion via PDF upload, DOCX upload, and pasted text.
5. Parsed text storage and chunking for retrieval.
6. Semantic retrieval scoped by user and story.
7. Structured storyboard generation.
8. Evaluation categories including source alignment, character consistency, worldbuilding consistency, tone fit, style match, scene clarity, and hallucination risk.
9. Source provenance for retrieved context and generated outputs.
10. Copy/export as Markdown.
11. Automated tests with Vitest.

## Non-Features
1. No collaborative real-time editing in the near-term plan.
2. No multi-tenant enterprise administration in the near-term plan.
3. No broad CMS or publishing workflow.
4. No requirement for enterprise SAML before the core product works.
5. No unbounded infrastructure expansion beyond what 5 to 10 users need.

## Architecture
### Current Baseline
- `src/app/` provides the page shell and the `/api/storyboard` route.
- `src/components/storyboard-workspace.tsx` renders the current storyboard workspace.
- `src/app/demo/[storyId]/page.tsx` provides story-specific demo routes.
- `src/lib/data/` contains the local curated story library and repository wrapper.
- `src/lib/retrieval/`, `src/lib/storyboard/`, `src/lib/evaluation/`, and `src/lib/export/` power the current deterministic MVP.

### Target Architecture
- Auth layer: Clerk user/session management.
- App shell: authenticated dashboard plus story-specific workspace routes.
- Relational storage: Supabase Postgres for users, stories, documents, chunks, generations, and evaluations.
- Object storage: Supabase Storage for uploaded source files.
- Retrieval layer: story-scoped semantic retrieval using embeddings plus metadata filters and optional heuristic reranking.
- Generation layer: AI-backed storyboard generation grounded in retrieved chunks.
- Evaluation layer: grounded feedback combining rule-based checks and model-assisted analysis.

## Data Flow
1. The user signs in.
2. The user lands on a dashboard listing their stories and recent activity.
3. The user creates a story or opens an existing one.
4. The user uploads a PDF or DOCX, or pastes text.
5. The backend extracts text, stores the source, chunks the text, and creates embeddings.
6. The user requests a storyboard.
7. Retrieval filters by user and story, then selects relevant chunks semantically.
8. The generation layer uses the retrieved evidence to produce a storyboard.
9. The evaluation layer scores and critiques the output using grounded evidence.
10. The UI displays retrieval provenance, output, feedback, and export actions.

## Pages and Screens
### Auth Screens
- Sign in
- Sign up

### Dashboard
- Story list
- Recent generations
- Upload/processing summaries

### Story Workspace
- Story metadata and source manager
- Upload and paste-text ingestion panel
- Request form
- Retrieved context panel
- Storyboard output panel
- Evaluation panel

## Components
- Authenticated app shell
- Dashboard story list
- Story workspace
- Source upload/paste controls
- Retrieval provenance panel
- Storyboard output
- Evaluation summary

## Security Requirements
1. All user-owned rows must be protected with row-level security.
2. Uploaded writing must only be accessible to the owning user.
3. External AI calls must be limited to the minimum content needed.
4. Raw manuscript content should not be logged casually.
5. File upload validation is required for supported document types.

## Performance Requirements
1. Dashboard and story pages should remain responsive for small-scale usage.
2. Upload processing should support asynchronous states rather than blocking the UI.
3. Retrieval latency should remain acceptable for small-story corpora.
4. Build, lint, and tests must continue to pass in the documented Windows setup.

## Accessibility Requirements
1. The dashboard and story workspace must remain keyboard navigable.
2. Interactive controls must have clear labels and states.
3. Upload status and errors must be communicated clearly.

## Acceptance Criteria
The first SaaS-foundation milestone is acceptable when:
1. Users can authenticate and have isolated data scopes.
2. Users can create stories and see them on a dashboard.
3. Users can upload or paste source text tied to a story.
4. Uploaded content is stored and processed for future retrieval.
5. The architecture is ready for authentic semantic retrieval.
6. `npm test`, `npm run lint`, and `npm run build` continue to pass.

## Known Risks
1. Scope expansion could outrun the current MVP architecture if not phased carefully.
2. Upload parsing quality can vary across PDFs and DOCX files.
3. AI-backed scoring can appear overconfident unless evidence and limits are surfaced clearly.
4. Privacy expectations for unpublished work require stricter handling than the current MVP.
5. The current curated multi-story local baseline will still need careful migration into a per-user, per-story model.

## Current Approved Direction
The authenticated platform foundation is in place, the local demo baseline now supports multiple curated stories, and the current sprint is source-intake foundation via story-scoped pasted text plus PDF/DOCX extraction. Retrieval hardening belongs after real chunked semantic retrieval exists.