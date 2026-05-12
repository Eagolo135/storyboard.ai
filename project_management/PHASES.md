# StoryBoard AI Phases

## Phase 0: Repo Intake and Baseline Capture
### Goal
Document the existing repo honestly as a functioning MVP baseline.

### Deliverables
- `IMPLEMENTATION_REPORT.md`
- initial spec and workflow docs

### Dependencies
- Existing repo contents

### Acceptance Criteria
1. The current implementation, constraints, and risks are documented.
2. No history is fabricated.

### Risks
- Misrepresenting completed work as future work.

## Phase 1: Workflow Adoption
### Goal
Bring the repo under the spec-driven process.

### Deliverables
- `SPEC.md`
- `PHASES.md`
- `DECISIONS.md`
- `CHANGELOG.md`
- sprint folders
- completed sprint backfill
- QA report backfill

### Dependencies
- Phase 0

### Acceptance Criteria
1. The `project_management/` structure exists.
2. The spec is the source of truth.
3. Sprint history and QA history are present.

### Risks
- Duplicate or conflicting control documents.

## Phase 2: Authentication and Data Foundation
### Goal
Establish user identity, persistent storage, and the per-user story ownership model.

### Deliverables
- authentication provider integration
- persistent relational schema
- file storage foundation
- dashboard shell
- story ownership model

### Dependencies
- Phase 1 complete

### Acceptance Criteria
1. Users can authenticate.
2. Users have isolated story data.
3. The dashboard shell exists.
4. The data platform is ready for source ingestion.

### Risks
- Overcomplicating auth or storage before core flows exist.

## Phase 3: Story Dashboard and Workspace Migration
### Goal
Move from the single global MVP workspace to authenticated dashboard and story-specific workspaces.

### Deliverables
- dashboard page
- story creation flow
- story workspace routing
- migration of current sample experience into a story-scoped model

### Dependencies
- Phase 2

### Acceptance Criteria
1. Users can create and open stories.
2. Story workspaces are isolated per user.
3. The old single global experience is no longer the primary model.

### Risks
- Carrying too much MVP-specific coupling into the new structure.

## Phase 4: Source Ingestion and Processing
### Goal
Allow users to bring their own material into the system.

### Deliverables
- PDF upload
- DOCX upload
- pasted text ingestion
- extraction, chunking, and processing states

### Dependencies
- Phase 3

### Acceptance Criteria
1. Users can add source material to a story.
2. Source processing status is visible.
3. Extracted content is stored for retrieval.

### Risks
- File parsing edge cases and failed-ingestion handling.

## Phase 5: Authentic RAG Pipeline
### Goal
Replace the sample-data dependency with real story-scoped semantic retrieval.

### Deliverables
- embeddings pipeline
- vector storage
- story-scoped retrieval
- retrieval provenance
- confidence handling

### Dependencies
- Phase 4

### Acceptance Criteria
1. Retrieval uses uploaded or pasted source material.
2. Retrieval is scoped to the correct user and story.
3. Low-confidence retrieval is surfaced honestly.

### Risks
- Retrieval quality drift and poor chunking strategy.

## Phase 6: Generation and Evaluation Strengthening
### Goal
Use AI-backed generation and grounded feedback while preserving traceability.

### Deliverables
- AI-backed storyboard generation
- grounded scoring and critique
- clearer source citation behavior

### Dependencies
- Phase 5

### Acceptance Criteria
1. Generated outputs are based on retrieved evidence.
2. Feedback includes grounded signals and provenance.
3. The system avoids presenting fabricated certainty.

### Risks
- Overconfident scoring, cost creep, or poor privacy controls.

## Phase 7: Integration and QA
### Goal
Run broader QA across functionality, UX, privacy, and maintainability.

### Deliverables
- sprint QA reports
- browser validation
- privacy and data isolation checks
- regression checks

### Dependencies
- Earlier phases complete enough to test together

### Acceptance Criteria
1. Functional and visual QA are documented.
2. Privacy and isolation expectations are validated.
3. Drift checks pass against the spec.

### Risks
- Discovering late architectural drift.

## Phase 8: Documentation and Release Readiness
### Goal
Ensure the product is documented clearly for contributors and early users.

### Deliverables
- updated README
- updated implementation report
- final QA summary

### Dependencies
- Phase 7

### Acceptance Criteria
1. A new contributor can understand the system from docs alone.
2. Release-facing documentation matches the actual repo state.

### Risks
- Documentation lagging behind implementation.