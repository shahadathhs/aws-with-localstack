# Security Policy

## Supported versions

Only the latest code on `main` is supported.

## Reporting a vulnerability

Do **not** open a public issue. Use GitHub's private vulnerability reporting: open the repository's **Security** tab and choose **Report a vulnerability**. Include what it is, where, how to reproduce it, and what an attacker could do with it.

You will get a reply within a week. Once fixed, your report is credited in the release notes if you want.

## Scope

- `infra/`, `labs/`, and the `Makefile`: anything that could expose the host or leak credentials.
- The docs site in `website/`.
- Lesson content that teaches an unsafe practice (for example, committing real credentials).

## Known non-issues

- LocalStack accepts any credentials (`test` / `test`) by design; it is a local sandbox, not a real AWS account.
- Never put a real AWS key or your `LOCALSTACK_AUTH_TOKEN` in an issue or PR. If you did, rotate it.
