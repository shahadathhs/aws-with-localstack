---
title: AWS CLI basics — how it's configured
description: Profiles, config files, resolution order, request lifecycle and SigV4 — the theory the whole setup rides on.
---

Official references:

> [Config files](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) ·
> [Named profiles](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) ·
> [Environment variables](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) ·
> [SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

## 1. What the AWS CLI really is

Not magic — an HTTPS client. Every command (`aws s3 ls`) becomes an **HTTP request to an API endpoint**, signed with your credentials, and the JSON/XML response is parsed back to your terminal. The AWS Console and language SDKs speak the exact same protocol — the CLI is just a wrapper that knows the APIs of ~300 services.

## 2. The two configuration files

| File                 | Contains                                     | Nature                             |
| -------------------- | -------------------------------------------- | ---------------------------------- |
| `~/.aws/config`      | region, output format, `endpoint_url`, ...   | **where/how** to talk — not secret |
| `~/.aws/credentials` | `aws_access_key_id`, `aws_secret_access_key` | **who** you are — secret           |

This repo's `make setup-cli` adds a `localstack` profile to both:

```ini
# ~/.aws/config
[profile localstack]
region=eu-west-1
output=json
endpoint_url = http://localhost.localstack.cloud:4566

# ~/.aws/credentials
[localstack]
aws_access_key_id=test
aws_secret_access_key=test
```

## 3. The key concept: profiles

A **profile** is a named bundle of settings — one section in `config` + one section in `credentials` sharing the same name. A machine can hold many side by side:

```ini
[default]               # used when you specify nothing
[profile company-prod]  # real AWS, real keys
[profile localstack]    # the fake one
```

Selecting a profile:

```sh
aws s3 ls --profile localstack     # one-off
export AWS_PROFILE=localstack      # for the whole shell session
aws s3 ls                          # now uses localstack
```

## 4. Resolution order (who wins)

For every command the CLI gathers settings; later sources override earlier ones:

```
1. CLI flags            --region us-east-1            (highest)
2. Environment vars     AWS_PROFILE, AWS_DEFAULT_REGION, ...
3. Config files         ~/.aws/config + credentials
4. Built-in defaults    (e.g. us-east-1)
```

That's why `make aws CMD='s3 ls'` works: it runs `AWS_PROFILE=localstack aws s3 ls` — layer 2 selects the profile, then layer 3 supplies region + endpoint.

## 5. Life of a command

```
aws s3 ls
  → parse:      service=S3, operation=ListBuckets
  → gather:     region=eu-west-1, creds=test/test, endpoint=localhost:4566
  → build:      HTTPS request (method, path, query, headers)
  → SIGN (SigV4): credentials + service name + region baked into headers
  → send:       to the endpoint
  → parse:      JSON response → pretty-print
```

**SigV4** is AWS's real security boundary: the signature proves the request came from someone holding the secret key, and wasn't tampered with. It also _declares_ which service and region it targets — which is how LocalStack's gateway knows where to route (see [How LocalStack works](architecture/)).

See the actual headers yourself:

```sh
aws s3 ls --debug 2>&1 | grep -i authorization
```

## 6. The `endpoint_url` override — why LocalStack works

Normally the CLI _computes_ the endpoint from service + region: `https://s3.eu-west-1.amazonaws.com`. A profile's `endpoint_url` overrides only that final step:

```
real AWS:   sign(service, region) → https://s3.eu-west-1.amazonaws.com
localstack: sign(service, region) → http://localhost:4566        ← only this changed
```

Signing, parsing, retry logic, SDK behavior — all identical. "Where AWS is" is just a swappable layer. That's why later your app SDK code and Terraform need zero changes beyond the endpoint.

## 7. In real life you'd also have

- `aws configure` → the interactive wizard writing these same files
- IAM users / SSO / roles → where _real_ credentials come from (LocalStack doesn't care — any string works)
- `--output json|yaml|table|text` → presentation only

Related: [Installing the AWS CLI](../guides/install-aws-cli/) · [Running LocalStack](../guides/localstack-compose/)
