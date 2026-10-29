# Writing lessons

How to author a lesson page with the lesson kit. Design background: [README.md](README.md) (mockups 08 and 09).
The reference lesson is `website/content/docs/{en,bn}/s3/02-versioning.mdx`: read it before writing one.

## Files

- One MDX file per lesson per language: `website/content/docs/en/<service>/<NN-name>.mdx` and the same path under `bn/`.
- Order and group titles live in each folder's `meta.json`. A lesson must exist in both languages.
- `pnpm check:content` (run in `website/`) compares each English lesson with its Bangla twin: same components in the
  same order, same number of `##` sections, code blocks and tables, same header fields. Text is not compared.
  It must pass.

## Page types

| Type | Where | Shape |
| --- | --- | --- |
| **Lesson with a lab** | `s3/`, `iam/`, `lambda/`, `serverless/`, `messaging/`, `observability/`, `terraform/`, later services | header fields, 3 to 5 `##` sections (concept, experiment, real AWS), at least one `<Lab>`, diagrams, callouts, `<Recap>` |
| **Setup or reference guide** | `getting-started/`, `basics/` | header fields, `##` sections, `<Tabs>` for per-OS or per-tool variants, callouts, `<Recap>`. No `<Lab>`: there is nothing to predict. |
| **Plain page** | `learning-plan`, `author` | ordinary markdown, no kit |

## Header fields (frontmatter)

```yaml
---
title: Versioning
description: One sentence shown under the title and in search results.
time: 12 min            # reading + doing; Bangla uses Bengali numerals, e.g. ১২ মিনিট (see below)
needs:                  # lessons or tools required first (titles, not paths)
  - The object model
learn:                  # 3 outcomes; shown as a checklist; keep each under about 70 characters
  - Why a delete on a versioned bucket removes nothing
---
```

`time` is an estimate: about 170 words per minute of prose, plus 5 minutes per `<Lab>` and half a minute per code
block, rounded, minimum 5. Use the same figure in both languages.

`title` and `description` are required, the rest optional but expected on every lesson and guide. Do not write an
eyebrow like "S3 chapter, part 2." in the body: the page header already shows "S3 / lesson 2 of 6".

## Sections

- Every `##` heading is a numbered section (`01 /`, `02 /`... drawn by CSS) and appears as an anchor chip in the
  header. Use descriptive titles ("A key becomes a stack"), not just "Concept". Use `###` for sub-parts.
- A lesson usually reads: **the idea** (prose, a diagram or two, a table), **the experiment** (one or more labs),
  **what changes on real AWS** (callouts), then `<Recap>`.
- Keep the technical content of the existing lesson. Restructure and add components; do not drop facts, change
  commands, or invent behaviour or output. If a lesson already shows expected output, keep it; do not add output
  you did not see.

## Components

All are available in MDX without imports.

### Lab: predict, run, verify

```mdx
<Lab title="versions and a delete" time="~4 min">
  <Predict>
    The question, in prose. **Markdown works** inside.

    <Answer>
      The answer, hidden until the reader opens it.
    </Answer>
  </Predict>
  <Run>
```sh
the commands (a fenced block, starting at column 0)
```
  </Run>
  <Verify>
    - What the reader should see, as a checklist
    - One item per line
  </Verify>
</Lab>
```

- Add `<Output>` inside `<Run>` to show a **Command / Expected output** tab pair. Put the output in a fenced block
  (`text` is fine) after the commands:

  ```mdx
  <Run>
  ```sh
  aws iam list-user-policies --user-name report-bot
  ```
  <Output>
  ```text
  { "PolicyNames": ["TodoRead"] }
  ```
  </Output>
  </Run>
  ```

  Only paste output you saw. If you shorten it (IDs, timestamps, progress lines), say so in a `#` comment on the
  first line, and keep that comment under about 80 characters so it does not scroll. The tabs are plain CSS, so they
  work without JavaScript. The output is the same in both languages.
- Steps are numbered automatically. A lab may have only `<Run>` and `<Verify>` (for example a second, follow-up lab).
- `collapsed` on `<Lab>` makes it a closed disclosure: good for a second lab or an optional extra.
- Put a blank line between a JSX tag and markdown that follows it, and start fenced code blocks at column 0, or MDX
  will not parse the markdown.

### Callouts

```mdx
<RealAws cost title="Noncurrent versions are billed">
  What differs on real AWS. `cost` adds a cost tag; `title` replaces the default label.
</RealAws>

<Destructive>An irreversible or data-losing step.</Destructive>

<Note title="In LocalStack">Anything else worth knowing, such as what LocalStack does not enforce.</Note>
```

Amber (`RealAws`) always means real AWS; red (`Destructive`) means irreversible; `Note` is neutral.

### Figures and diagrams

```mdx
<Figures>
  <Figure tag="before" caption="three versions, GET returns the newest">
    <VersionStack />
  </Figure>
  <Figure tag="after DELETE" caption="a marker on top">
    <VersionStack after />
  </Figure>
</Figures>

<Figure caption="how the CLI picks a setting"><ResolutionLadder /></Figure>
```

`<Figures>` puts two figures side by side (stacked on phones); a lone `<Figure>` also works.

| Diagram | Props | Use it for |
| --- | --- | --- |
| `VersionStack` | `after` | one S3 key as a stack of versions; `after` adds the delete marker |
| `FolderIllusion` | | the console's folder tree versus flat keys (S3 object model) |
| `StorageLadder` | | Standard down to Deep Archive (storage classes) |
| `PresignFlow` | | signing, handing over, and S3 verifying a presigned URL |
| `AccessGates` | | public access block, bucket and IAM policy, ACLs (S3 security) |
| `EventFlow` | | an upload fanning out to Lambda, SQS, SNS, EventBridge |
| `AssumeRole` | | long-lived user keys versus a role and STS temporary credentials |
| `PolicyStatement` | | one policy statement, field by field |
| `IamFlow` | | explicit deny, explicit allow, implicit deny |
| `Arn` | `arn="arn:aws:..."` | colour-codes any ARN; empty fields show as `(empty)` |
| `Gateway` | | client, edge gateway on :4566, service emulators, Lambda containers (LocalStack architecture) |
| `ResolutionLadder` | | flags, environment, config files, defaults (AWS CLI settings) |

Use a diagram only where it explains something the prose cannot show quickly. Replace an existing ASCII diagram with
the matching component; leave other ASCII blocks as fenced code. If you need a diagram that does not exist, do not
draw one in the lesson: ask for it to be added to `website/src/components/diagrams/`.

### Tabs (setup guides)

```mdx
<Tabs items={['macOS', 'Linux', 'Windows']}>
  <Tab value="macOS">
    Markdown and fenced code, as anywhere else.
  </Tab>
  <Tab value="Linux">...</Tab>
  <Tab value="Windows">...</Tab>
</Tabs>
```

Use for alternatives the reader chooses between (operating system, install method), never for steps in a sequence.

### Recap

```mdx
<Recap>

- Three bullets, each a thing to remember.

</Recap>
```

Leave blank lines inside `<Recap>` so the list is parsed as markdown. Always the last element of a lesson or guide.

## MDX pitfalls

- A raw `<` or `{` in prose breaks the page: wrap placeholders in backticks (`` `<BUCKET>` ``). Inside fenced code
  they are fine.
- Fenced code blocks inside a component must start at column 0 and be surrounded by blank lines.
- Markdown after a JSX tag needs a blank line before it. Indent JSX tags freely; do not indent fences.
- Write links as `[text](url)`. A bare `<https://...>` autolink is not valid MDX.
- Header list items (`needs`, `learn`) that contain a colon must be quoted, or YAML reads them as a mapping.
- `pnpm check:content` catches both of these without a full build; `pnpm build` is the real test for everything else.
- Internal links keep the form `/en/s3/03-storage-classes-and-lifecycle/` and `/bn/...`.

## Bangla

- Same structure as the English file: same components in the same order. The text is translated, not the layout.
- Keep technical terms in English (`bucket`, `version`, `IAM`), as the existing lessons do; translate the explanation.
- Address the reader informally ("তুমি"), matching the existing Bangla lessons. Reuse the existing Bangla sentences
  where the English meaning did not change; write new sentences only for new content.
- Numerals in `time` and in prose may be Bengali, as in the existing lessons. Code, commands and ARNs stay as they are.
- The fixed labels ("predict", "run", "verify", "Real AWS", "Recap") come from `website/src/lib/lesson-labels.ts`.
- All Bangla text is a first pass pending native review.

## Verify before you publish

Every `<Verify>` bullet and every comment showing output must be something you saw. Run the lab against LocalStack
(`make up`) before merging. Things that bit this course and are worth remembering:

- `aws s3 cp s3://bucket/key -` on a missing key fails with `404 Not Found` (its HEAD request); `aws s3api get-object`
  fails with `NoSuchKey`.
- `head-object` returns no `StorageClass` for Standard objects; `list-objects-v2` shows `"STANDARD"`.
- `aws sqs get-queue-attributes` needs `--queue-url`, not `--queue-name`.
- S3 sends an `s3:TestEvent` to a queue as soon as a notification is configured, so expect one extra message.
- LocalStack skips signature and expiry checks on presigned URLs unless `S3_SKIP_SIGNATURE_VALIDATION=0`
  (see `.env.example`).
