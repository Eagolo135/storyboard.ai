# Changelog

## 2026-05-12
- Adopted Nicholas's spec-driven development workflow for the existing StoryBoard AI repo.
- Added `project_management/` control documents, sprint folders, completed sprint history, and QA reports.
- Established retrieval hardening for non-sample prompts as the next active sprint.
- Revised the product direction toward an authenticated multi-user SaaS with dashboard, persistent storage, document ingestion, authentic RAG, and AI-backed generation/evaluation.
- Started Sprint 004 implementation by adding Clerk/Supabase-ready environment scaffolding, dashboard/auth routes, story ownership abstractions, a Supabase migration foundation, and minimal story creation/listing UI.
- Completed Sprint 005 by expanding the local demo from one seeded story to three curated story kits with story-aware routes, repository support, and storyboard generation.
- Started Sprint 007 by adding a story-scoped source-document domain layer plus pasted-text intake and recent-source status in the dashboard.
- Explicitly deferred Sprint 006 retrieval hardening until authentic semantic retrieval exists.
- Extended Sprint 007 with story-level source workspaces, PDF/DOCX upload support, server-side extraction, and a Supabase Storage bucket migration for source files.