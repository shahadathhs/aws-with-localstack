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

1. [Running LocalStack with Docker Compose](/en/getting-started/localstack-compose/) — the official example, pinned; gateway port, docker.sock, healthchecks, troubleshooting
2. [Installing the AWS CLI](/en/getting-started/install-aws-cli/) — official installers for macOS, Linux, Windows; updates; the `awslocal` story
3. [AWS CLI basics](/en/basics/aws-cli/) — config files, profiles, resolution order, SigV4, the `endpoint_url` override
4. [How LocalStack works](/en/basics/architecture/) — one gateway port, fake account routing, the DNS trick, Lambda sibling containers

## Phase 1 — Storage + identity: S3 (deep) + IAM (theory)

S3:

1. [The object model](/en/s3/01-object-model/) — flat key-value store; the folder illusion; consistency; durability vs availability
2. [Versioning](/en/s3/02-versioning/) — delete markers, restores, noncurrent-version billing
3. [Storage classes and lifecycle](/en/s3/03-storage-classes-and-lifecycle/) — Standard to Deep Archive; retrieval economics; lifecycle rules
4. [Presigned URLs](/en/s3/04-presigned-urls/) — signed GET and PUT; expiry; the CORS trap
5. [Security and encryption](/en/s3/05-security-and-encryption/) — access gates, policy-as-prose, SSE-S3 vs SSE-KMS
6. [Event notifications](/en/s3/06-events/) — S3 as an actor; prefix/suffix filters; at-least-once delivery

IAM:

7. [Principals, users, roles](/en/iam/01-principals-users-roles/) — long-lived keys vs STS temporary credentials
8. [Policies and evaluation](/en/iam/02-policies-and-evaluation/) — policy JSON; explicit deny > allow > implicit deny; least privilege
9. [ARNs](/en/iam/03-arns/) — parse any resource address; service quirks

## Phase 2 — Compute: Lambda

10. [The execution model](/en/lambda/01-execution-model/) — a handler in a sandbox; cold vs warm; concurrency as separate instances; timeout and memory
11. [The event object](/en/lambda/02-the-event-object/) — why the function was invoked; manual vs S3 events; synchronous vs asynchronous calls; logs
12. [SQS triggers](/en/lambda/03-sqs-triggers/) — event source mappings; batch size; reporting partial failures; retries without end

Experiments: deploy a Lambda and invoke it manually; prove warmth with a global counter; wire a bucket (upload → Lambda); consume SQS messages in a batch and retry only the poisoned one.

## Phase 3 — The serverless chain: API Gateway → Lambda → DynamoDB

13. [DynamoDB is fast by key](/en/serverless/01-dynamodb-keys/) — partition and sort keys; query vs scan; secondary indexes
14. [API Gateway turns HTTP into an event](/en/serverless/02-api-gateway/) — routes, stages, the proxy contract; why 403 and 502
15. [The tasks API](/en/serverless/03-tasks-api/) — the whole chain driven with curl; idempotent deletes

Everything here uses the REST API flavour of API Gateway, because that is what LocalStack runs. Experiments: build a tasks API (`POST/GET/DELETE /tasks`) and hit it with curl; query by key vs full scan; add a GSI and query by a non-key attribute.

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
