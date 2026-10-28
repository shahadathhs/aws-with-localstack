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

Still to mock before building: a Bangla lesson (needs a Bengali typeface), the 404 page, and the remaining
diagrams (presigned URL flow, storage-class ladder).

## Navigation

- **Top bar: three links only**: Learning plan, Getting started, Basics. Services (S3, IAM, and later Lambda,
  DynamoDB...) are not in the top bar: the list would grow with every phase. They live in the lesson sidebar,
  grouped by service, and on the Learning plan page.
- **Desktop:** brand, three links, search (⌘K), language, theme. Content stays in the 1080px column.
- **Mobile (390px):** brand, search icon and a menu button, each a 44px target. The menu is a full-height
  list: the three links, the lesson tree grouped by service (current lesson highlighted, done dot per
  lesson), then language and theme (System, Light, Dark). The sidebar and "On this page" TOC collapse into
  it and into one collapsed row above the article.
- **Mobile layout:** one column, 16px gutters, buttons full width, diagrams stacked, the curriculum ledger
  drops its progress-bar column and keeps status. Code blocks scroll sideways inside their frame and never
  wrap, so a command stays copy-able; the Copy button sits above the first line so it never covers code.

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
