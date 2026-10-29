# Design

How the aws-with-localstack website should look and feel. The mockups are plain HTML/CSS rendered to PNG;
they are the reference the Next.js site is built against. Background and sources: [research.md](research.md).

## Idea: a lab notebook

The course loop is read, predict, run, verify. The site looks like the notebook you would keep while doing it:
warm paper, ink, real terminal output, and a drawing of the idea before any command.

## Principles

- **Show the subject.** Diagrams of the service (version stack, policy evaluation, ARN anatomy) and real CLI
  output do the work that icons and stock art do elsewhere.
- **Colour carries meaning.** Blue = what you predict or do. Green = verified or allowed. Red = denied or
  destructive. Amber = a real-AWS note. The five muted hues `--c1`..`--c5` appear only inside diagrams.
- Type: Fraunces for headings, IBM Plex Sans for text, IBM Plex Mono for commands, labels and numbers.
- A ruled 1080px column with numbered mono section labels (`01 / Curriculum`); header content sits in the
  same column; one filled primary button per screen.
- No gradients, glassmorphism, emoji icons or decorative cards. Cards exist only to frame a diagram or a
  lab block.
- Real content in every mockup (lesson titles, bucket names, output), never lorem ipsum.
- Claims match the learning plan: a phase is "done" only when its lessons exist.

## Screens (full page, 2x)

| #   | Screen                                           | Light                               | Dark                                     |
| --- | ------------------------------------------------ | ----------------------------------- | ---------------------------------------- |
| 01  | Landing: lab block, diagrams, curriculum, list   | [png](mockups/01-landing.png)       | [png](mockups/01-landing-dark.png)       |
| 02  | Lesson page: sidebar, diagram, predict, TOC      | [png](mockups/02-lesson.png)        | [png](mockups/02-lesson-dark.png)        |
| 03  | Learning plan: phases and lesson status          | [png](mockups/03-learning-plan.png) | [png](mockups/03-learning-plan-dark.png) |
| 04  | Search dialog (Ctrl or ⌘ K)                      | [png](mockups/04-search.png)        | [png](mockups/04-search-dark.png)        |
| 05  | Landing, mobile (390px)                          | [png](mockups/05-landing-mobile.png) | [png](mockups/05-landing-mobile-dark.png) |
| 06  | Lesson, mobile                                   | [png](mockups/06-lesson-mobile.png) | [png](mockups/06-lesson-mobile-dark.png) |
| 07  | Menu open, mobile                                | [png](mockups/07-menu-mobile.png)   | [png](mockups/07-menu-mobile-dark.png)   |
| 08  | Rich lesson: header strip, diagrams, lab, callouts, recap | [png](mockups/08-lesson-rich.png)   | [png](mockups/08-lesson-rich-dark.png)   |
| 09  | Rich lesson, mobile                              | [png](mockups/09-lesson-rich-mobile.png) | [png](mockups/09-lesson-rich-mobile-dark.png) |

The 404 page is built (not mocked first): a missing page shown as an S3 `NoSuchKey`, in the home page's lab card, with
the requested path in the command. Mockups are not yet drawn for it or for a Bangla lesson.

## Lesson components (built; mockups 08 and 09)

Lessons are authored in MDX with a small kit so they carry the home page's structure instead of plain prose.
Source: `website/src/components/lesson/`. Section numbers (`01 /`) come from CSS counters on the `##` headings, so
plain-markdown lessons get them too; the anchor chips are built from the same headings. "Good to know" is neutral
(not amber), since amber means real AWS. `<Run>` can show Command / Expected output tabs (an `<Output>` inside it); the output is only ever real, shortened output.

| Component | What it is |
| --- | --- |
| Lesson header | Eyebrow, title, lead, a meta strip (time, needs, bucket), "You will learn" checklist, and anchor chips (`01 Concept`, `02 Experiment`...) |
| `<Lab>` with `<Predict>`, `<Run>`, `<Verify>` | The home hero card as steps. Predict has a guess box and a reveal; Run has a copyable terminal with Command / Expected output tabs; Verify is a checklist. A lab can be collapsed. |
| Callouts | `<RealAws>` amber (with a `cost` tag), `<Destructive>` red, a neutral "good to know". Colour follows the meaning rules above. |
| Diagram kit | Themed SVG primitives plus reusable diagrams (version stack with before/after, IAM flow, ARN anatomy taking `arn="..."`); more per lesson as needed. |
| Recap | Closing card with the three things to remember. |

Layout decision: the "On this page" table of contents moves out of a right-hand column and into the lesson
header as anchor chips. With the sidebar and a TOC inside the 1080px column the article is only about 500px
wide, too narrow for two diagrams side by side; without the TOC it is about 730px.

## Navigation

- **Top bar: three links only**: Learning plan, Getting started, Basics. Services (S3, IAM, Lambda,
  DynamoDB, SQS...) are not in the top bar: the list would grow with every phase. They live in the lesson sidebar,
  grouped by service, and on the Learning plan page.
- **Desktop:** brand, three links, search (⌘K), language, theme. Every page, home and lessons, uses the same
  1080px column and header.
- **Lesson pages:** the lesson list sits in a sticky sidebar next to the article (a collapsed "All lessons"
  disclosure above the article on phones). The "On this page" links are chips in the lesson header; there is no
  right-hand table of contents.
- **Mobile (390px):** brand, search icon and a menu button, each a 44px target. The menu panel holds the three links,
  language and theme. Buttons are full width, diagrams stack, and code scrolls sideways inside its frame (never
  wraps), so a command stays copy-able.
- Mockups 02 (wide docs header, right-hand TOC) and 07 (menu with the lesson tree) are superseded by the built
  layout and by 08 and 09; they are kept as history.

## Tokens

Defined once in `mockups/src/common.css`; mirror them in the site's `globals.css`.

| Token      | Light     | Dark      | Use                              |
| ---------- | --------- | --------- | -------------------------------- |
| `--bg`     | `#f4f0e6` | `#14151b` | Page                             |
| `--raised` | `#fbf9f3` | `#1b1d25` | Lab blocks, dialogs, diagrams    |
| `--sunken` | `#ebe6d8` | `#0f1015` | Code blocks                      |
| `--line`   | `#ddd6c4` | `#2a2c37` | Rules and borders                |
| `--text`   | `#1c1b22` | `#ece9df` | Body                             |
| `--text2`  | `#5a5750` | `#a3a193` | Secondary text                   |
| `--accent` | `#2a45c9` | `#8da2ff` | Predict, links, primary button   |
| `--ok`     | `#2a7a46` | `#6fcf97` | Verified, allow                  |
| `--deny`   | `#b3261e` | `#ff7b72` | Deny, destructive                |

Each colour has its own dark value (a straight inversion fails contrast). Contrast against WCAG AA has not
been measured yet.

## Theming (light, dark, system)

- Follows the system theme by default; a header toggle sets `data-theme`; the saved choice is applied before
  first paint.
- All colours are CSS custom properties, and dark mode swaps the values. SVG diagrams use the same variables,
  so they switch with the page.

## Regenerating the mockups

Edit the HTML in `mockups/src/` and run `./render.sh` (needs Google Chrome; set `CHROME=/path/to/chrome` to
use another binary). Each page is measured and captured at full height, light and dark. The fonts load from
Google Fonts, so rendering needs network access.
