# QA Report: Site Functionality And PDF Extraction

Date: 2026-05-15

## Scope
- Verify the app still passes repository validation after the OpenAI-backed RAG work.
- Fix PDF extraction quality issues for uploaded source documents.
- Re-test upload, extraction, chunking, embedding, retrieval, generation, and evaluation using a real PDF.
- Check the public site routes and the sign-up to sign-in redirect.

## Documents Available For QA
- Present in workspace root:
  - `The Path of an Undead Book 1_ A Hollow Awakening.pdf` (1,835,204 bytes)
- Not present in workspace:
  - Any document matching "Gang of Four"
  - Any document matching "Don Knuth" or "Donald Knuth"

## PDF Extraction Fix
### Issue Observed
- PDF text extraction preserved hard line wraps from page layout.
- Extracted text included page counter markers such as `-- 127 of 128 --`.
- The raw extraction produced paragraph breaks inside ordinary prose, which degraded chunk quality and retrieval grounding.

### Fix Applied
- Added `normalizeExtractedSourceText` in `src/lib/source-documents/extract.ts`.
- Removed page marker lines during PDF normalization.
- Merged wrapped PDF lines into paragraphs.
- Separated in-world system/status lines from adjacent prose so they no longer contaminate ordinary narrative paragraphs.
- Trimmed leading PDF title-page fragments before the first real chapter heading.
- Preserved DOCX paragraph breaks.
- Added regression tests covering page-marker removal, wrapped-line merging, and DOCX paragraph preservation.

## Validation Results
### Repository Validation
- `npm test`: pass
- `npm run lint`: pass
- `npm run build`: pass

### Authenticated RAG Regression
- `npm run verify:authenticated-rag`: pass
- Result used:
  - retrieval mode: `semantic-hybrid`
  - retrieval provider/model: `OpenAI / text-embedding-3-small`
  - generation mode: `ai-provider`
  - evaluation mode: `ai-provider`

### Real PDF Upload Test
- Uploaded file: `The Path of an Undead Book 1_ A Hollow Awakening.pdf`
- Uploaded document id: `c7e53c17-c73b-4f74-8b8f-d70954496079`
- Supabase processing status: `embedded`
- Story-scoped duplicate count after refresh: `1`
- Stored chunk count after refresh: `946`
- Story tested: `The Salt Meridian`
- Storyboard result used:
  - retrieval mode: `semantic-hybrid`
  - generation mode: `ai-provider`
  - evaluation mode: `ai-provider`
- Top retrieved titles were dominated by chunks from the uploaded PDF, confirming that the uploaded book content was used during grounded retrieval.

### Duplicate Upload Regression
- Re-uploading the same PDF for the same story now refreshes the existing source document record instead of creating another row for that story.
- Historical duplicates in the active test story were collapsed during the replacement run.
- A second record with the same file name still exists for a different story, which is expected because replacement is scoped per story, not global across the account.

### Public Route Checks
- `/`: loads
- `/setup`: loads and reports all three provider groups as configured
- `/sign-up`: redirects to `/sign-in`
- `/sign-in`: route loads, but the integrated browser shows external Clerk request aborts during full hosted-auth rendering

## Findings
### Passed
- PDF extraction quality improved for wrapped prose and page-counter noise.
- PDF extraction now starts at the first substantive chapter heading for the tested book instead of indexing title-page fragments.
- Status-style PDF lines are preserved as separate blocks instead of being merged into surrounding prose.
- Real PDF uploads still extract, chunk, embed, and participate in retrieval correctly.
- Re-uploading the same PDF for the same story no longer accumulates duplicate source-document rows.
- Authenticated RAG orchestration remains functional after the extraction fix.
- Public site navigation and setup route work.
- Sign-up was successfully collapsed into sign-in at the route level.

### Limitations
- Full hosted Clerk sign-in could not be completed inside the integrated browser because external Clerk requests aborted in this environment.
- "Gang of Four" and "Don Knuth" source documents were requested for QA but were not present in the workspace, so they could not be tested.

## Recommendation
- Keep the new extraction normalization in place.
- If you want document-specific QA for "Gang of Four" or "Don Knuth", add those files to the workspace and rerun the same upload-and-grounding pass.
- If browser-level auth QA is required, test Clerk sign-in in a normal desktop browser session outside the integrated browser.