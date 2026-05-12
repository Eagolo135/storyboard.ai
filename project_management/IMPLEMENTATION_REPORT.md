# Implementation Report

## Project
StoryBoard AI

## Date
2026-05-12

## Repo Intake Summary
The repository already contains a functioning single-story MVP built before the spec-driven workflow was added. This report captures the current baseline so future work can proceed under controlled sprints instead of ad hoc implementation.

## What Exists
- Next.js 16 App Router project using TypeScript.
- Single-page UI in `src/components/storyboard-workspace.tsx`.
- Local curated story library in `src/lib/data/` with multiple story kits.
- Repository wrapper and Zod schemas.
- Deterministic retrieval and note ranking.
- Template-driven storyboard generation.
- Rule-based evaluation and hallucination-risk checks.
- Markdown export.
- Vitest coverage for retrieval, schema validation, generation, evaluation, and export.

## Current Stack
- Next.js 16
- React 19
- TypeScript
- Zod
- Vitest
- CSS Modules

## Verified Commands
- `npm test`
- `npm run lint`
- `npm run build`
- Local app launch at `http://localhost:3000`

## Sprint 004 Foundation Added
- Environment-aware Clerk and Supabase configuration helpers.
- App-level auth provider wrapper and signed-in viewer resolution.
- Dashboard, sign-in, and sign-up routes for the new authenticated shell.
- Story schema, story repository abstraction, and minimal story-creation server action.
- Initial Supabase SQL migration for `stories` and `source_documents`.
- Additional Vitest coverage for environment/config detection and story input validation.

## Sprint 007 Intake Slice Added
- Source-document schema, repository, and service layers.
- Dashboard action and form for story-scoped pasted source text.
- Recent source-document list in the authenticated dashboard.
- Story-level source workspace route for inspecting source material.
- PDF and DOCX upload plus server-side extraction into source-document records.
- Supabase Storage bucket migration for source document files.
- Initial source-document schema validation tests.

## Architecture Summary
### UI Layer
- `src/app/page.tsx` loads the default story workspace and the curated demo library.
- `src/app/demo/[storyId]/page.tsx` renders story-specific demo workspaces.
- `src/app/dashboard/stories/[storyId]/page.tsx` renders the authenticated story source workspace.
- `src/components/storyboard-workspace.tsx` handles request input, API calls, and rendering of all visible panels.

### API Layer
- `src/app/api/storyboard/route.ts` validates story-aware requests and returns a fully orchestrated response.

### Domain and Data Layer
- `src/lib/schemas/story.ts` defines the main types and Zod schemas.
- `src/lib/data/repository.ts` loads and validates multiple local JSON knowledge bases.
- `src/lib/source-documents/` defines the initial authenticated source-document domain.
- `src/lib/source-documents/extract.ts` handles PDF and DOCX text extraction.

### Retrieval Layer
- `src/lib/retrieval/scoring.ts` extracts request signals and computes note scores.
- `src/lib/retrieval/select-top-notes.ts` sorts, deduplicates, and returns top notes.
- `src/lib/retrieval/retrieve-story-context.ts` orchestrates retrieval.

### Generation Layer
- `src/lib/storyboard/generate-storyboard.ts` builds the required storyboard sections from retrieved notes.

### Evaluation Layer
- `src/lib/evaluation/evaluate-storyboard.ts` computes continuity-related scores.
- `src/lib/evaluation/hallucination-risk.ts` flags unsupported entities, contradictions, and generic phrasing.

### Export Layer
- `src/lib/export/to-markdown.ts` formats the final response as Markdown.

## What Already Works
1. The app loads and renders three curated demo story workspaces.
2. Scene requests produce retrieved notes, storyboard output, evaluation, and exportable Markdown for the selected story kit.
3. The authenticated dashboard can create stories, show story-level source workspaces, and accept pasted source text into story-scoped source-document records.
4. PDF and DOCX uploads can be stored and extracted into source-document records.
5. Test, lint, and build commands pass.

## What Is Missing or Weak
1. The app is still dependent on curated local seed data rather than uploaded source material.
2. Retrieval has no minimum relevance threshold.
3. Weak prompts still receive top notes, even when they are poor matches.
4. Upload extraction exists, but chunking and embeddings are not implemented yet.
5. The new multi-story demo library is not yet backed by user-owned retrieval against ingested sources.
6. Generation is structured but intentionally limited by deterministic templates.

## What Can Be Reused Safely
1. The current app structure and route handler.
2. The schema, retrieval, generation, evaluation, and export layers.
3. The current test harness.

## What Should Not Be Touched Casually
1. Core story schemas in `src/lib/schemas/story.ts` without coordinated test updates.
2. The knowledge-base JSON structure without maintaining Zod compatibility.
3. The public README and project-management docs without keeping them aligned.

## Environment Notes
This Windows setup uses webpack-based Next scripts because Turbopack native bindings are unavailable in the current environment. The existing `package.json` scripts reflect that requirement.

## Current Risks
1. Product drift if future work starts coding without reading the spec and sprint docs.
2. Misleading retrieval confidence for weak prompts.
3. The new product direction now materially exceeds the old MVP scope and requires auth, persistence, ingestion, and real retrieval architecture changes.
4. End-to-end auth and persistence verification is currently blocked until Clerk and Supabase credentials are configured in this workspace.

## Recommendation
Treat the current codebase as a validated bridge baseline: authenticated foundation plus curated multi-story demos. The next meaningful product sprint should focus on document ingestion and authentic retrieval architecture, while sprint 006 retrieval hardening should wait until real semantic retrieval exists.