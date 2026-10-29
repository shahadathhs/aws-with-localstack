# Design research

What the design is based on, and what was and was not verified.

## The reference sites (rendered and inspected, 2026-10-28)

Fetched as text, then screenshotted in headless Chrome at 1280px: getadda, getvoicestudio, playdropgrid,
playalgomind, playgulibatto (all `.vercel.app`). Dropgrid rendered almost empty in the capture and was
judged from its text only.

What they share, and what separates them from a generic template:

- **Each one shows something drawn from its own subject.** Voicestudio and adda show the real app UI.
  Algomind draws its instruction tiles and boards. Guli & Batto draws the marble tables. There are no stock
  icons or abstract hero art.
- **Each has its own type and colour identity**: Algomind a condensed all-caps display face with chamfered
  tiles on near-black and yellow; Guli & Batto a heavy rounded display face on warm brown; adda Space
  Grotesk with amber; voicestudio mono caps with a ruled grid and teal.
- **Structure is plain**: left-aligned hero, one primary action, numbered mono section labels, top-ruled
  short lists, real sample data, short flat copy. Cards are used for screenshots, not for decoration.

## Decisions taken from that

| Observation | Decision here |
| --- | --- |
| Subject-specific visuals | Every lesson has a drawn diagram (S3 version stack, IAM evaluation, ARN anatomy) and real CLI output instead of icons. |
| Own identity per site | A lab-notebook identity: warm paper, serif display (Fraunces), IBM Plex Sans body and Plex Mono for commands and labels, blue "ink" accent. No orange, so it is not AWS-branded and does not repeat adda. |
| Colour with a job | Blue = what you predict or do, green = verified or allowed, red = denied or destructive, amber = real-AWS notes. Five muted hues (`--c1` to `--c5`) only inside diagrams. |
| Ruled column, mono labels | Kept from voicestudio: 1080px column, `01 / Section` labels, header content in the same column. |
| Real sample data | Mockups use real lesson titles, bucket names and command output from the existing lessons. |

## Web search

Two searches were run. They returned vendor blogs and listicles, not measured analysis: nothing usable on
Stripe, Vercel, Linear or Tailwind docs typography beyond "Stripe uses three columns, Vercel keeps a single
accent". Treat those as unverified; no decision above depends on them. The Fumadocs result matches its own
documentation: Tailwind v4 tokens prefixed `--color-fd-*`, `app/[lang]` routing, `defineI18n`, and a
middleware file whose name depends on the Next.js version (check `proxy.ts` versus `middleware.ts`).

## Not yet researched

- A Bengali typeface: Fraunces has no Bengali glyphs, so the Bangla pages need a serif or sans with proper
  conjunct shaping (Noto Serif Bengali and Hind Siliguri are the candidates) and a larger line height.
- Contrast ratios: the accent and the muted text colours have not been measured against WCAG AA.
