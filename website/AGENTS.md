# website: guide for AI coding agents

Next.js 16 (App Router) docs site built on Fumadocs, deployed on Vercel (project root directory: `website`).
Design source of truth: `../docs/design/` (principles, tokens, mockups). Match it; change the design docs first.

- Content is Markdown in `content/docs/<lang>/...` (`en`, `bn`), one folder per service with a `meta.json`
  for title and order. URLs are `/<lang>/<folder>/<page>`. A lesson must exist in both languages.
- Colours come from the tokens in `src/app/global.css` (mirrors `docs/design/mockups/src/common.css`), mapped
  onto Fumadocs' `--color-fd-*` variables. Colour carries meaning: blue predict/do, green verified, red denied.
- Top bar is `components/site-header.tsx`: three links only (Learning plan, Getting started, Basics). Services
  live in the sidebar. Do not add per-service links to the top bar.
- Landing copy for both languages is in `src/lib/copy.ts`. Bangla copy and UI strings (`layout.shared.tsx`) are
  a first pass pending native review.
- Diagrams are SVG components in `components/diagrams/`, styled by the `svg.diagram` classes (they follow the theme).
- Commands: `pnpm dev`, `pnpm lint` (oxlint), `pnpm types:check`, `pnpm build`; or `make site-*` from the repo root.
