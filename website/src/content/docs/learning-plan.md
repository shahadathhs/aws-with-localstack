---
title: AWS learning plan
description: A hands-on curriculum from S3 to Terraform — concepts plus LocalStack experiments, tracked with checkboxes.
---

> Goal: understand the **services themselves** — concepts, guarantees, failure modes, cost drivers. CLI commands are the lab instrument, not the lesson.
>
> Loop per topic: **read concept → predict behavior → experiment in LocalStack → verify prediction**.
>
> Progress tracking: tick the boxes as you go. `- [ ]` concept, `* [ ]` experiment.

LocalStack coverage: all phases below work in the community edition, except IAM is **not enforced** (learn as theory) and CloudWatch metrics are partial.

---

## Phase 0 — Tooling ✅ (done)

- [x] Docker Compose LocalStack sandbox
- [x] AWS CLI installed + `localstack` profile
- [x] First S3 / SQS / DynamoDB commands (`make demo`)
- [x] Understand: profiles, endpoint_url, gateway routing, fake account (see [AWS CLI basics](concepts/aws-cli/), [How LocalStack works](concepts/architecture/))

## Phase 1 — Storage + identity: S3 (deep) + IAM (theory)

Concepts:

- [ ] Object model: flat key-value store — "folders" are just key prefixes, no hierarchy
- [ ] Strong consistency (since 2020); durability "11 nines" = replication, NOT backups
- [ ] Storage classes (Standard vs IA vs Glacier) + lifecycle rules; why Glacier restores take hours
- [ ] Presigned URLs: bucket stays private, the URL carries temporary permission (expires)
- [ ] Bucket policies vs ACLs; public access is blocked by default for a reason
- [ ] IAM theory: principals, users vs **roles** (assumed temporary credentials, no long-lived keys)
- [ ] Policy JSON structure: Effect/Action/Resource; evaluation = explicit deny wins, then allow required
- [ ] ARN anatomy — spot it in every API response you've already seen

Experiments:

- [ ] Upload with key prefixes (`s3 cp` to `s3://bucket/a/b/c.txt`) then `s3 ls` at each level — see the prefix illusion
- [ ] Enable versioning, overwrite an object, list versions, restore a previous one
- [ ] Generate a presigned URL (`presign`), download with plain `curl`, watch it expire
- [ ] Host a static site from a bucket and open it in a browser

## Phase 2 — Compute: Lambda

Concepts:

- [ ] Execution model: code runs in a sandboxed microVM that STAYS WARM between invocations (globals persist!)
- [ ] Cold vs warm start; what triggers a cold start (scale-out, idle timeout, redeploy)
- [ ] One request = one sandbox instance at a time; concurrency = pool of instances
- [ ] The **event object**: handler receives JSON describing _why_ it was invoked — same function, many trigger shapes
- [ ] Limits: 15 min max, memory slider (memory scales CPU), payload caps
- [ ] Triggers need config: SQS batch size, retry behavior, partial batch failures

Experiments:

- [ ] Deploy a Lambda (`make aws CMD='lambda create-function ...'` or via zip upload) invoked manually with a test event
- [ ] Prove warmth: increment a global variable across two invocations
- [ ] Wire the Phase-1 bucket: S3 upload → Lambda logs the event (`awslocal logs tail /aws/lambda/...`)
- [ ] Send an SQS message → Lambda consumes it (batch size 1, then 10)

## Phase 3 — The serverless chain: API Gateway → Lambda → DynamoDB

Concepts:

- [ ] API Gateway: routes, stages, the HTTP → event-JSON translation, throttling
- [ ] DynamoDB paradigm shift: **fast only by key** — partition key picks the shard; design tables around queries first
- [ ] Partition key + sort key; composite queries (`begins_with`, ranges)
- [ ] GSIs / LSIs: alternate query views with their own cost
- [ ] RCU / WCU: throughput is purchased per-table — the origin of "DynamoDB bills per access"
- [ ] Why DynamoDB modeling ≠ MongoDB modeling: no joins, no ad-hoc queries, single-table design exists for a reason

Experiments:

- [ ] Build a tasks API: `POST/GET/DELETE /tasks` backed by DynamoDB — call it with curl
- [ ] Query by partition + sort key vs full scan — compare responses
- [ ] Add a GSI and query by a non-key attribute

## Phase 4 — Messaging: SQS (deep) + SNS + EventBridge

Concepts:

- [ ] SQS guarantees: **at-least-once delivery** → duplicates WILL happen → consumers need idempotency
- [ ] Visibility timeout: message hidden while processing; reappears if not deleted (re-delivery!)
- [ ] Standard (best-effort order, dupes) vs FIFO (true order, dedupe, slower, pricier)
- [ ] Dead-letter queues: parking lot after N failed receives; why every real queue has one
- [ ] SNS fan-out (one message → many subscribers) vs SQS point-to-point
- [ ] EventBridge: rules, content filtering, the event bus pattern

Experiments:

- [ ] Send 5 messages, consume without deleting, wait out the visibility timeout — watch re-delivery
- [ ] Set `maxReceiveCount` + DLQ, poison a message, watch it land in the DLQ
- [ ] SNS topic with two SQS subscriptions — one publish, both queues receive
- [ ] Wire Phase 4 into Phase 3: order API → SNS → two worker Lambdas

## Phase 5 — Observability + config: CloudWatch + Secrets Manager

Concepts:

- [ ] Logs are a product: log groups vs streams, retention, Insights queries
- [ ] Metrics = numeric time series per service; alarms = thresholds → actions
- [ ] Structured logging (JSON lines) and why `console.log` debugging dies at scale
- [ ] Runtime config vs build-time config; why secrets don't belong in baked env vars

Experiments:

- [ ] Add structured logging to the Phase-3 API, query it with `logs filter-log-events`
- [ ] Store a secret, read it from Lambda at runtime (not env)

## Phase 6 — Infrastructure as Code: Terraform

Concepts:

- [ ] Declarative vs imperative: describe DESIRED state, Terraform diffs against ACTUAL (state file = source of truth)
- [ ] plan → apply cycle; what "drift" means
- [ ] Providers, resources, variables, outputs; remote state (why teams need it)

Experiments:

- [ ] Recreate the Phase-3 API entirely in Terraform (`tflocal` wrapper for LocalStack)
- [ ] Change something by hand in LocalStack, run `terraform plan`, observe the drift
- [ ] `terraform destroy` — then rebuild in 60 seconds; feel the power

## Phase 7 — Graduation: real AWS (free tier)

- [ ] Same Terraform, real account: IAM actually enforced, CloudWatch real, bills real
- [ ] Configure separate `~/.aws` profile, MFA, budget alarm FIRST
- [ ] Notice what LocalStack couldn't simulate (IAM denials, quotas, latency)

---

Rough effort: Phases 1–3 ≈ 2 weeks casual · 4–5 ≈ 2 more · 6 ≈ 1 week.
