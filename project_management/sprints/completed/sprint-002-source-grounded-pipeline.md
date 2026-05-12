# Sprint 002: Source-Grounded Pipeline

## Goal
Implement the core source-grounded storyboarding pipeline.

## Scope
- Add the seeded story knowledge base.
- Implement schemas and repository loading.
- Implement retrieval scoring and ranking.
- Implement storyboard generation.
- Implement evaluation and Markdown export.
- Add orchestration and route handling.

## Out of Scope
- User-authored note management
- Vector databases
- Paid AI APIs
- Multi-story support

## Tasks
1. Create the story schemas and data contracts.
2. Add the local knowledge base and repository wrapper.
3. Implement deterministic retrieval scoring.
4. Implement top-note selection.
5. Implement storyboard generation and evaluation.
6. Implement Markdown export and orchestration.

## Files Likely Affected
- `src/lib/schemas/story.ts`
- `src/lib/data/story-knowledge-base.json`
- `src/lib/data/repository.ts`
- `src/lib/retrieval/*.ts`
- `src/lib/storyboard/generate-storyboard.ts`
- `src/lib/evaluation/*.ts`
- `src/lib/export/to-markdown.ts`
- `src/lib/orchestration/create-storyboard-response.ts`
- `src/app/api/storyboard/route.ts`

## Acceptance Criteria
The sprint is complete when:
1. Valid requests return retrieved notes.
2. Storyboard sections are generated from retrieved context.
3. Evaluation results and Markdown export are produced.
4. The pipeline is modular and testable.

## Testing / QA Steps
1. Run unit tests covering retrieval, generation, evaluation, and export.
2. Manually verify a request through the local UI.

## Drift Check
1. Work stayed inside the single-story MVP scope.
2. No external AI providers or databases were introduced.
3. The pipeline remained source-grounded and inspectable.

## Definition of Done
The application can retrieve source notes, generate a storyboard, evaluate it, and export the result.