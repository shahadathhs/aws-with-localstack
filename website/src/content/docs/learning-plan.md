---
title: AWS learning plan
description: A hands-on curriculum from S3 to Terraform — each lesson is a page with concept, experiment, and real-AWS notes.
---

> Goal: understand the **services themselves** — concepts, guarantees, failure modes, cost drivers. CLI commands are the lab instrument, not the lesson.
>
> Loop per topic: **read concept → predict behavior → experiment in LocalStack → verify prediction**.

LocalStack coverage: everything below works in the community edition, except IAM is **not enforced** (learn as theory) and CloudWatch metrics are partial.

## Phase 0 — Tooling

Set up and understand the sandbox:

1. [Running LocalStack with Docker Compose](/getting-started/localstack-compose/) — the official example, pinned; gateway port, docker.sock, healthchecks, troubleshooting
2. [Installing the AWS CLI](/getting-started/install-aws-cli/) — official installers for macOS, Linux, Windows; updates; the `awslocal` story
3. [AWS CLI basics](/basics/aws-cli/) — config files, profiles, resolution order, SigV4, the `endpoint_url` override
4. [How LocalStack works](/basics/architecture/) — one gateway port, fake account routing, the DNS trick, Lambda sibling containers

## Phase 1 — Storage + identity: S3 (deep) + IAM (theory)

S3:

1. [The object model](/s3/01-object-model/) — flat key-value store; the folder illusion; consistency; durability vs availability
2. [Versioning](/s3/02-versioning/) — delete markers, restores, noncurrent-version billing
3. [Storage classes and lifecycle](/s3/03-storage-classes-and-lifecycle/) — Standard to Deep Archive; retrieval economics; lifecycle rules
4. [Presigned URLs](/s3/04-presigned-urls/) — signed GET and PUT; expiry; the CORS trap
5. [Security and encryption](/s3/05-security-and-encryption/) — access gates, policy-as-prose, SSE-S3 vs SSE-KMS
6. [Event notifications](/s3/06-events/) — S3 as an actor; prefix/suffix filters; at-least-once delivery

IAM:

7. [Principals, users, roles](/iam/01-principals-users-roles/) — long-lived keys vs STS temporary credentials
8. [Policies and evaluation](/iam/02-policies-and-evaluation/) — policy JSON; explicit deny > allow > implicit deny; least privilege
9. [ARNs](/iam/03-arns/) — parse any resource address; service quirks

## Phase 2 — Compute: Lambda

Lesson pages are written as we go — until then, the targets:

- Execution model: warm sandboxed microVMs; cold vs warm starts; concurrency = instance pool
- The **event object**: JSON describing _why_ the function was invoked — same function, many trigger shapes
- Limits: 15 min max, memory slider (memory scales CPU), payload caps
- Triggers: S3 events and SQS messages (batch size, retries, partial batch failures)

Experiments: deploy a Lambda and invoke manually; prove warmth with a global counter; wire the Phase-1 bucket (upload → Lambda); consume SQS messages (batch size 1, then 10).

## Phase 3 — The serverless chain: API Gateway → Lambda → DynamoDB

- API Gateway: routes, stages, the HTTP → event-JSON translation, throttling
- DynamoDB paradigm shift: **fast only by key** — partition key picks the shard; design tables around queries first
- Partition key + sort key; GSIs / LSIs as paid alternate query views
- RCU / WCU: throughput is purchased per table — the origin of "DynamoDB bills per access"
- Why DynamoDB modeling ≠ MongoDB modeling: no joins, no ad-hoc queries

Experiments: build a tasks API (`POST/GET/DELETE /tasks`) and hit it with curl; query by key vs full scan; add a GSI and query by a non-key attribute.

## Phase 4 — Messaging: SQS (deep) + SNS + EventBridge

- SQS guarantees: **at-least-once delivery** → duplicates happen → consumers need idempotency
- Visibility timeout: hidden while processing, reappears if not deleted
- Standard vs FIFO; dead-letter queues as the parking lot after N failures
- SNS fan-out vs SQS point-to-point; EventBridge routing

Experiments: watch re-delivery after the visibility timeout; poison a message into a DLQ; fan out one SNS publish to two queues; wire an order API → SNS → two worker Lambdas.

## Phase 5 — Observability + config: CloudWatch + Secrets Manager

- Logs as a product: log groups vs streams, retention, Insights queries
- Metrics and alarms; structured (JSON) logging at scale
- Runtime config vs build-time config; secrets never baked into env vars

Experiments: structured logging on the Phase-3 API queried via `logs filter-log-events`; store a secret and read it from Lambda at runtime.

## Phase 6 — Infrastructure as Code: Terraform

- Declarative vs imperative: desired state vs actual state; the state file; plan/apply; drift
- Providers, resources, variables, outputs, remote state

Experiments: recreate the Phase-3 API with `tflocal`; mutate LocalStack by hand and watch `terraform plan` detect the drift; `destroy` then rebuild in 60 seconds.

## Phase 7 — Graduation: real AWS (free tier)

- Same Terraform against a real account: IAM enforced, CloudWatch real, bills real
- Separate `~/.aws` profile, MFA, and a budget alarm — before anything else
- Notice what LocalStack could not simulate: denials, quotas, latency

---

Rough effort: Phases 1–3 ≈ 2 weeks casual · 4–5 ≈ 2 more · 6 ≈ 1 week.
