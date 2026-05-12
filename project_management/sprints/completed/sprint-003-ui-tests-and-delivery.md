# Sprint 003: UI, Tests, and Delivery Verification

## Goal
Integrate the user-facing workspace, validate the experience, and deliver a verifiable MVP.

## Scope
- Build the single-page workspace UI.
- Surface retrieval details and evaluation output.
- Add copy/export controls.
- Add Vitest coverage.
- Verify lint, test, build, and local launch.
- Update public documentation.

## Out of Scope
- Knowledge-base authoring
- Multi-story support
- Retrieval hardening for weak prompts
- LLM integration

## Tasks
1. Build the StoryBoard AI workspace component and styling.
2. Connect the UI to the storyboard API route.
3. Add automated tests for core flows.
4. Verify lint, test, build, and live launch.
5. Update README and delivery docs.

## Files Likely Affected
- `src/components/storyboard-workspace.tsx`
- `src/components/storyboard-workspace.module.css`
- `src/app/page.tsx`
- `src/lib/**/*.test.ts`
- `README.md`

## Acceptance Criteria
The sprint is complete when:
1. The UI exposes the full golden path.
2. The user can retrieve context, review a storyboard, inspect evaluation, and export Markdown.
3. Tests, lint, and build pass.
4. The local app launch succeeds.

## Testing / QA Steps
1. Run `npm test`.
2. Run `npm run lint`.
3. Run `npm run build`.
4. Launch the app locally and verify the main page.

## Drift Check
1. Work stayed inside the MVP experience.
2. No unapproved pages or infrastructure were added.
3. The visual direction remained consistent with the product intent.

## Definition of Done
The user-facing MVP is delivered, verified, and documented.