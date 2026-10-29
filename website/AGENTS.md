# website: guide for AI coding agents

Next.js 16 (App Router) docs site built on Fumadocs, deployed on Vercel (project root directory: `website`).
Design source of truth: `../docs/` (principles, tokens, mockups). Match it; change the design docs first.

- Content is Markdown in `content/docs/<lang>/...` (`en`, `bn`), one folder per service with a `meta.json`
  for title and order. URLs are `/<lang>/<folder>/<page>`. A lesson must exist in both languages.
- Lessons can be `.mdx` and use the lesson kit in `src/components/lesson/` (`Lab`/`Predict`/`Answer`/`Run`/`Verify`,
  `RealAws`/`Destructive`/`Note`, `Figures`/`Figure`, diagrams, `Recap`; header fields `time`, `needs`, `learn`).
  Component labels follow the page language (`src/lib/lesson-labels.ts`). Keep en and bn built the same way:
  `pnpm check:content` compares components, sections, code blocks and tables. See `docs/README.md`.
- Colours come from the tokens in `src/app/global.css` (mirrors `docs/mockups/src/common.css`), mapped
  onto Fumadocs' `--color-fd-*` variables. Colour carries meaning: blue predict/do, green verified, red denied.
- Top bar is `components/site-header.tsx`: three links only (Learning plan, Getting started, Basics). Services
  live in the sidebar. Do not add per-service links to the top bar.
- Landing copy for both languages is in `src/lib/copy.ts`. Bangla copy and UI strings (`layout.shared.tsx`) are
  a first pass pending native review.
- Diagrams are SVG components in `components/diagrams/`, styled by the `svg.diagram` classes (they follow the theme).
- Commands: `pnpm dev`, `pnpm lint` (oxlint), `pnpm types:check`, `pnpm build`; or `make site-*` from the repo root.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
