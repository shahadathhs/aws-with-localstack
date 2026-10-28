---
title: ARNs
description: The Amazon Resource Name — the addressing system every service, policy, and log line shares. Learn to parse it once, use it everywhere.
---

IAM chapter, part 3 — short but load-bearing.

## Concept

An **ARN** (Amazon Resource Name) is the global address of any AWS resource. Policies target ARNs; logs cite ARNs; event messages carry ARNs; CLI output is full of them — you have been reading them since `make demo`:

```
arn:aws:dynamodb:eu-west-1:000000000000:table/demo-table
 │    │      │           │             │        │
 │    │      │           │             │        └─ resource type + id
 │    │      │           │             └─ account ID (LocalStack: always 000000000000)
 │    │      │           └─ region (some services omit it — see below)
 │    │      └─ partition: aws (commercial), aws-cn (China), aws-us-gov
 │    └─ service namespace
 └─ literally "arn"
```

The general form:

```
arn:partition:service:region:account-id:resource
```

The `resource` part varies by service — this is where people trip:

| Service  | Resource portion                                    | Why                                                                                                                |
| -------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| DynamoDB | `table/Name` or `table/Name/index/GSI`              | tables _and their indexes_ are separately addressable                                                              |
| S3       | `bucket` or `bucket/key/path`                       | **no region, no account** — bucket names are already globally unique (see [object model](/en/s3/01-object-model/)) |
| IAM      | `user/Bob`, `role/report-reader`, `policy/TodoRead` | **no region** — IAM is global; region-less                                                                         |
| SQS      | `queue-name` (no type prefix)                       | bare, easy to misread                                                                                              |
| Lambda   | `function:name:version`                             | colons instead of slashes                                                                                          |

Wildcards in policies use `*`: `arn:aws:s3:::ph1-bucket/public/*` (every object under `public/`), `arn:aws:s3:::*` (every bucket in the account — usually a smell).

## Experiment — no API, just eyes

You have already collected ARNs in this phase. Pull three from your own history and decompose them by hand:

```sh
export AWS_PROFILE=localstack
aws s3api list-buckets --query 'Buckets[].Name'
aws dynamodb list-tables
aws iam list-roles --query 'Roles[].Arn' --output table
```

For each ARN printed, write down: partition, service, region (present? why/why not?), account, resource type, resource id. Two you will meet:

- `arn:aws:iam::000000000000:role/report-reader` — no region (IAM is global)
- `arn:aws:s3:::ph1-bucket` — no region _and_ no account (global namespace)

## On real AWS

- Region-full ARNs mean the resource is regional — a policy granting `arn:aws:dynamodb:eu-west-1:...` grants nothing in `us-east-1`
- In policies, ARNs are the _scope of blast radius_: the difference between `Resource: "arn:aws:s3:::bucket/todo/*"` and `Resource: "*"` is the difference between a small incident and a career-defining one
- When a tool asks for "the ARN" it always means this full string — never a name
