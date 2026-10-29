# Contributing to AWS with LocalStack

This repo is a hands-on AWS learning path that runs on [LocalStack](https://localstack.cloud), plus the bilingual (English/Bangla) docs site that publishes it. Start with the [learning plan](website/content/docs/en/learning-plan.md) to see what is covered and what is planned.

## Setup

You need Docker, the AWS CLI v2, Node 22+, [pnpm](https://pnpm.io) (version pinned in `website/package.json`), and `make`.

```sh
cp .env.example .env      # add your free LOCALSTACK_AUTH_TOKEN
make up                   # LocalStack at http://localhost:4566
make setup-cli            # one-time: 'localstack' AWS CLI profile
make site-install && make site-dev   # docs site at http://localhost:3000
make help                 # every command
```

## Before you open a PR

| Changed                    | Do                                                     |
| -------------------------- | ------------------------------------------------------ |
| Lesson in `website/content`| Run every command against LocalStack; update both `en` and `bn` |
| `website/src` or config    | `make site-lint` and `make site-build`                 |
| `infra/`, `labs/` | `make clean && make up && make demo`                   |

## House rules

- **Commands must work.** Never document output you did not see. Say what you verified and how.
- **Per-service folders.** Lessons live in `website/content/docs/<lang>/<service>/`; keep English and Bangla in step.
- **Pin versions.** The LocalStack image tag is pinned in `infra/compose.yaml`; bump it deliberately.
- **No secrets.** `.env` is git-ignored. Use `test`/`test` credentials in examples.
- **Stay in scope.** Features that need real AWS (or LocalStack Pro) must say so in the lesson.

## Branching, commits, and PRs

- Work on `dev` and open a PR into `main`.
- Use **Conventional Commits**: `feat:`, `fix:`, `docs:`, `chore:`, `ci:`, with an optional scope, e.g. `docs(s3): add presigned URL lesson`. Keep the subject imperative and under about 72 characters.
- One logical change per commit and per PR; describe how you tested it.

## Reporting issues

Use the issue templates. For security problems see [SECURITY.md](SECURITY.md). Everyone is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## Repository layout

| Path | What it holds |
| --- | --- |
| `website/` | Bilingual docs site (Next.js + Fumadocs) and the lessons in `content/docs/<lang>/<service>/` |
| `infra/` | `compose.yaml` and one-time setup scripts for LocalStack |
| `labs/` | Runnable per-service experiments that go with the lessons |
| `docs/` | Design principles, tokens, and mockups for the site |
| `.github/` | CI, issue and PR templates, Dependabot |
