# Sprint 004: Auth And Data Foundation

## Goal
Establish authentication, per-user story ownership, persistent storage, and the initial dashboard shell so StoryBoard AI can evolve from a single-story MVP into a small authenticated SaaS.

## Scope
- Choose and integrate the auth provider.
- Add persistent relational storage and file-storage foundation.
- Define the initial application data model for users, stories, and source documents.
- Add an authenticated app shell and dashboard route.
- Add story creation and listing at a minimal functional level.

## Out of Scope
- Full document parsing and chunking
- Vector retrieval
- AI-backed generation changes
- Full story workspace migration
- Major visual redesign

## Tasks
1. Add the auth and storage dependencies.
2. Configure the auth provider and required environment hooks.
3. Add the initial data model and storage abstraction for users and stories.
4. Create an authenticated dashboard route and minimal story list UI.
5. Add a minimal story-creation flow.
6. Add tests and QA for auth-shell and data-foundation behavior where practical.

## Completion Summary
1. Clerk and Supabase-ready configuration helpers were added.
2. Viewer resolution, sign-in routes, sign-up routes, and dashboard shell were added.
3. Story ownership schema, repository, and minimal story creation flow were added.
4. The initial Supabase migration added `stories` and `source_documents` tables.
5. Automated validation passed in this workspace.

## QA Snapshot
1. `npm test` passed.
2. `npm run lint` passed.
3. `npm run build` passed.
4. Full end-to-end auth and persistence verification remains blocked until Clerk and Supabase credentials are configured locally.

## Definition of Done
This sprint is complete. The platform now has a documented auth/data foundation that later ingestion and retrieval work can build on.