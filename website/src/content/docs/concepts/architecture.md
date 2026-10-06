---
title: How LocalStack works — the mental model
description: One gateway port, fake account routing, DNS tricks and sibling Lambda containers — how LocalStack emulates AWS.
---

Official references:

> [Installation](https://docs.localstack.cloud/aws/getting-started/installation/) ·
> [Connecting / AWS CLI](https://docs.localstack.cloud/aws/connecting/aws-cli/) ·
> [Networking](https://docs.localstack.cloud/aws/customization/networking/) ·
> [Credentials](https://docs.localstack.cloud/aws/connecting/credentials/)

## The big picture

LocalStack keeps the **AWS API protocol** but swaps the **destination**. Your tools can't tell the difference — which is why any AWS CLI, SDK, or Terraform code works unchanged, just pointed at `localhost:4566`.

```
                        YOUR MACHINE (everything stays here)
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   $ aws --profile localstack s3 ls                               │
│        │                                                         │
│        │ 1. profile lookup: ~/.aws/config                        │
│        │    → endpoint_url = localhost.localstack.cloud:4566     │
│        │    → credentials  = test/test (never validated!)        │
│        ▼                                                         │
│   localhost.localstack.cloud  ──DNS──►  127.0.0.1                │
│   (LocalStack owns this public DNS wildcard on purpose)          │
│        │                                                         │
│        │ 2. plain HTTP (no internet, no TLS, no real auth)       │
│        ▼                                                         │
│   ┌────────────── LOCALSTACK CONTAINER ────────────────────┐     │
│   │                                                        │     │
│   │   EDGE GATEWAY  :4566   ← ONE port = ALL services      │     │
│   │        │                                               │     │
│   │        │ 3. "which service is this?" — reads it from:  │     │
│   │        │      • URL path       /demo-queue             │     │
│   │        │      • hostname       s3.localhost...         │     │
│   │        │      • SigV4 signature + headers              │     │
│   │        ▼                                               │     │
│   │   ┌─────────┬─────────┬──────────┬──────────┐          │     │
│   │   │   S3    │   SQS   │ DynamoDB │  Lambda  │  ...     │     │
│   │   │buckets  │queues + │tables +  │    │      │          │     │
│   │   │+ files  │messages │items     │    │4.    │          │     │
│   │   └─────────┴─────────┴──────────┘    ▼      │          │     │
│   │   All state in container memory        docker.sock     │     │
│   │   (dies with `make clean`)        → runs your function │     │
│   │                                    in sibling ctrs     │     │
│   └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

## The fake account & region

They're just **labels** LocalStack stamps on everything:

|            | Real AWS                                                   | LocalStack                                                  |
| ---------- | ---------------------------------------------------------- | ----------------------------------------------------------- |
| ARN        | `arn:aws:dynamodb:eu-west-1:123456789012:table/demo-table` | `arn:aws:dynamodb:eu-west-1:000000000000:table/demo-table`  |
| Account ID | your real 12-digit ID                                      | always `000000000000`                                       |
| Region     | actual datacenter                                          | whatever you claim                                          |
| Auth       | IAM, policies, MFA, signing validation                     | none — any credentials accepted (`test/test` is convention) |

The `test/test` credentials exist only because the AWS CLI _refuses_ to send a request without some. Requests are still SigV4-signed — but nothing checks the signature, and the gateway reads the service/region out of it as routing hints.

## The one gateway port

Real AWS spreads services across hundreds of hostnames (`s3.amazonaws.com`, `sqs.eu-west-1.amazonaws.com`, ...). LocalStack serves **everything on one endpoint** (`:4566`) and routes by inspecting each request:

- **URL path** — SQS: `/000000000000/demo-queue`
- **Hostname prefix** — S3 virtual-host style: `demo-bucket.s3.localhost.localstack.cloud`
- **Headers / signature** — DynamoDB uses `X-Amz-Target`, and every SigV4 signature names its service

This is also why `localhost.localstack.cloud` exists: it's a public DNS wildcard (`*.localhost.localstack.cloud` → `127.0.0.1`) owned by LocalStack, so hostname-based addressing works exactly like real AWS without editing `/etc/hosts`.

## Lambda is special: docker.sock

Most services are emulated _inside_ the LocalStack container. Lambda actually **executes your code** — it does that by launching _sibling_ Docker containers through the mounted `/var/run/docker.sock`. That's why the compose file requires the socket mount, and why Lambda functions behave so realistically.

## State and lifetime

- Resources (buckets, queues, tables...) live in **container memory** — they survive `docker compose restart`, die with the container, and `make clean` wipes everything
- Persistence across full restarts is a Pro feature (`PERSISTENCE` env var — on by default in this repo's compose, inactive on the free tier)

## Real vs fake, layer by layer

| Layer      | Real AWS                     | LocalStack                                    |
| ---------- | ---------------------------- | --------------------------------------------- |
| Addressing | `s3.eu-west-1.amazonaws.com` | `localhost.localstack.cloud:4566` → 127.0.0.1 |
| Identity   | IAM users, roles, policies   | everyone is `000000000000`, allow-all         |
| Data plane | Amazon's actual fleets       | service emulators in one container            |
| Billing    | per-request costs            | free                                          |

Prerequisite reading: [AWS CLI basics](/concepts/aws-cli/) — explains the profile/endpoint mechanism LocalStack relies on.
