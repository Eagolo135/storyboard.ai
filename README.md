# StoryBoard AI

StoryBoard AI is a practical applied AI prototype for long-form fiction planning. Instead of acting like a generic writing chatbot, it uses a local story knowledge base, deterministic retrieval logic, source-grounded storyboard generation, and continuity evaluation to help writers plan scenes without losing track of lore, character motivation, worldbuilding rules, or style guidance.

## Why it was built

Writers working on large story worlds need more than freeform text generation. They need a system that can retrieve the right notes first, show why those notes were selected, generate a structured storyboard from source material, and then evaluate the result for continuity and hallucination risk before the draft moves forward.

## Features

- Knowledge base panel with curated notes across character, lore, plot, setting, style, and previous chapter context
- Scene and chapter request input for targeted planning
- Deterministic retrieval and scoring pipeline with transparent selection reasons
- Structured storyboard output with source-backed planning sections
- Continuity and style evaluation across source alignment, character consistency, worldbuilding consistency, tone fit, style match, scene clarity, and hallucination risk
- Copy and export as Markdown
- Responsive Next.js interface with multiple curated demo story workspaces
- Authenticated dashboard foundation with early story-scoped source intake
- Story-level source workspaces with pasted text plus PDF/DOCX upload and extraction
- Automated unit tests with Vitest

## Tech stack

- Next.js 16 with App Router
- TypeScript
- Zod
- Vitest
- CSS Modules
- Local JSON curated story library

## How it works

1. The app loads a curated local story library with three sample long-form projects: `The Glass Archive`, `The Hollow Choir`, and `The Ninth Ember`.
2. A writer enters a scene or chapter request.
3. StoryBoard AI selects the active story workspace, then scores that story's notes using lexical overlap, entity matches, category cues, chapter relevance, and note priority.
4. The app returns the highest-value notes along with a scoring breakdown and short explanation for each selection.
5. A structured storyboard is generated from the retrieved notes.
6. The storyboard is evaluated for continuity, source alignment, style fit, and hallucination risk.
7. The result can be copied or exported as Markdown.

## Demo stories

- `The Glass Archive`: flooded-archive intrigue with sibling tension and civic machinery.
- `The Hollow Choir`: gothic cathedral pressure built on resonance debt and institutional judgment.
- `The Ninth Ember`: ashpunk rail suspense built on route fraud, logistics, and engineered storms.

## Authenticated ingestion foundation

The dashboard now includes a real ingestion foundation for the SaaS direction: authenticated users can create stories, open story-level source workspaces, attach pasted source text, and upload PDF or DOCX files for server-side text extraction. This is still short of chunking and embeddings, but it establishes the story-scoped source-document path needed for later authentic retrieval.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

On this Windows environment the project uses webpack-based Next.js scripts (`next dev --webpack` and `next build --webpack`) for compatibility with the available SWC bindings.

## Run tests

```bash
npm test
```

## Production build

```bash
npm run build
```

## Skills demonstrated

- RAG-style application design using a source-first retrieval workflow
- Context engineering for structured creative planning
- Transparent scoring and retrieval explanation design
- Source-grounded generation and continuity-aware evaluation
- Modular architecture with clear seams for future vector databases and AI APIs
- Type-safe validation with Zod
- Automated testing with Vitest
- Technical communication through a polished prototype and documentation
