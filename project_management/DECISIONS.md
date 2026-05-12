# Decisions

## 2026-05-12: Use deterministic retrieval for the MVP
Reason:
The project goal was to demonstrate source-grounded planning and transparent retrieval without requiring embeddings, external infrastructure, or paid APIs.

## 2026-05-12: Use template-driven generation for the MVP
Reason:
The prototype needed structured, testable storyboard output with explicit source influence. Deterministic generation kept the behavior inspectable and stable.

## 2026-05-12: Use a local curated JSON knowledge base
Reason:
The MVP needed to run locally, remain cheap to operate, and support deterministic retrieval/evaluation logic without introducing database setup complexity.

## 2026-05-12: Keep the product as a single-page workspace for the MVP
Reason:
The core value is visible retrieval, storyboarding, and evaluation in one place. A single-page experience reduces navigation complexity while the concept is still being proven.

## 2026-05-12: Use webpack-based Next.js scripts on this machine
Reason:
The current Windows environment does not support the native Turbopack bindings required for reliable local build and dev workflows.

## 2026-05-12: Retrofit the spec-driven workflow around the existing MVP baseline
Reason:
The repo already contains working implementation. The honest and maintainable approach is to document the current baseline and control future work through the new workflow rather than pretending the repo is still pre-implementation.

## 2026-05-12: Make retrieval hardening the next active sprint
Reason:
The most immediate product weakness is that the app can feel overly dependent on sample-like prompts because retrieval always returns top notes without a confidence floor.

## 2026-05-12: Shift the product direction to an authenticated SaaS
Reason:
The approved product goals now include login, per-user ownership, dashboards, uploaded source material, authentic RAG, and AI-backed scoring. The old single-story local-MVP roadmap is no longer sufficient.

## 2026-05-12: Prefer Vercel plus Supabase for the hosted platform
Reason:
This is the best fit for a small-scale 5 to 10 user application because it provides manageable hosting, relational storage, object storage, and a realistic path to vector retrieval without excessive operational overhead.

## 2026-05-12: Prefer Clerk for authentication
Reason:
Clerk gives the fastest path to user accounts, session management, and social/SSO-ready login flows for a small application. It is lighter than a more enterprise-heavy auth stack for the current stage.

## 2026-05-12: Use paid AI APIs for generation and evaluation in the SaaS roadmap
Reason:
The user explicitly wants authentic RAG, real scoring, and higher-quality feedback. For low user volume, paid APIs are the most practical way to reach that quality bar.

## 2026-05-12: Treat uploaded writing as sensitive by default
Reason:
Users may upload unpublished or private work. The product should assume stronger privacy requirements and minimize exposure of raw content in logs, UI, and third-party API calls.

## 2026-05-12: Replace retrieval-hardening as the immediate sprint with auth and data foundation
Reason:
Retrieval hardening still matters, but the new approved scope requires the platform foundation first so future retrieval work happens in the correct per-user, per-story architecture.

## 2026-05-12: Expand the local MVP with curated multi-story support before authentic RAG
Reason:
The product still needed to feel less like a single-sample demo, but document ingestion and semantic retrieval are larger platform steps. Adding multiple curated story kits provided a controlled bridge that improved the demo baseline without pulling the roadmap forward prematurely.

## 2026-05-12: Start ingestion with story-scoped pasted text before file uploads
Reason:
The platform needs real user-owned source material now, but full upload, parsing, and embedding workflows are a larger implementation step. Pasted text is the smallest honest slice that exercises the story-scoped ingestion path without inventing infrastructure too early.

## 2026-05-12: Keep sprint 006 deferred until semantic retrieval exists
Reason:
Confidence handling without authentic retrieval would optimize the wrong layer. Retrieval hardening should happen against real chunked semantic results, not the temporary curated-note demo path.

## 2026-05-12: Support PDF and DOCX upload during ingestion foundation
Reason:
Pasted text alone was enough to prove the story-scoped source-document model, but it was still too narrow for the actual product direction. Adding PDF and DOCX upload with extraction makes the ingestion sprint materially closer to the real workflow without pulling chunking or semantic retrieval forward.