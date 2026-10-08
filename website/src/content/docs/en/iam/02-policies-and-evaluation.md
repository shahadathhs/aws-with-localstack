---
title: Policies and evaluation
description: Policy JSON anatomy, the evaluation order, explicit deny, and least privilege — how AWS actually decides allow or deny.
---

IAM chapter, part 2.

## Concept

A **policy** is a JSON document listing permissions. Everything IAM decides comes from these documents; there is no other magic.

### Anatomy — one statement, read as a sentence

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadTodoPrefix",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::ph1-bucket", "arn:aws:s3:::ph1-bucket/todo/*"],
      "Condition": { "IpAddress": { "aws:SourceIp": "203.0.113.0/24" } }
    }
  ]
}
```

- **Effect** — `Allow` or `Deny`. There is no "maybe"
- **Action** — service-prefixed API operations (`s3:GetObject`, `dynamodb:PutItem`, `sts:AssumeRole`). Wildcards allowed: `s3:Get*`
- **Resource** — ARNs it applies to. Some actions are resourceless (`s3:ListAllMyBuckets` needs `Resource: "*"`)
- **Condition** — optional extra gates: source IP, MFA present, tag values, encryption context

Note `s3:ListBucket` targets the _bucket_ ARN, while `s3:GetObject` targets _object_ ARNs (`.../todo/*`) — listing and reading are different actions on different resources, the classic trap in S3 policies.

### Policy flavors — where documents can live

| Type                | Attached to                                     | Example                                                                  |
| ------------------- | ----------------------------------------------- | ------------------------------------------------------------------------ |
| Identity policy     | user / role / group                             | "this function may read bucket X"                                        |
| Resource policy     | the resource itself (bucket policy, SQS policy) | "account B may send to this queue"                                       |
| Permission boundary | user / role (cap)                               | "this role can NEVER touch IAM, whatever its policies say"               |
| SCP                 | the whole account (organizations)               | company-level guardrails                                                 |
| Trust policy        | a role — _who may assume it_                    | the Lambda example from [principals](/en/iam/01-principals-users-roles/) |

### The evaluation — one order, no exceptions

For every request, AWS collects every policy applying to the principal _and_ the resource, then:

1. Any **explicit `Deny`** → **DENY.** The end. Nothing overrides it
2. Otherwise, at least one **explicit `Allow`** → **ALLOW**
3. Otherwise → **implicit deny** — **DENY** (no document even mentions this action)

Memorize the three-word form: **explicit deny beats allow beats implicit deny.** The subtle daily-payoff is #3: absence of permission is denial — "it should work" is not a policy.

Same-account vs cross-account changes one thing: cross-account needs an allow on **both** sides (identity policy _and_ resource policy). Same-account needs either.

### Least privilege — the design discipline

Write the narrowest Action list and the narrowest Resource ARNs that make the thing work. `Action: "*", Resource: "*"` is how breaches become disasters. In practice you iterate: start slightly wider, enable **IAM Access Analyzer** policy generation (it observes actual usage and proposes the minimal policy), tighten.

## Experiment

LocalStack stores IAM policies but enforces nothing — the experiment is reading, writing, and _simulating in your head_:

```sh
export AWS_PROFILE=localstack

aws iam put-user-policy --user-name report-bot --policy-name TodoRead --policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ReadTodoPrefix",
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::ph1-bucket", "arn:aws:s3:::ph1-bucket/todo/*"]
  }]
}'

aws iam list-user-policies --user-name report-bot
aws iam get-user-policy --user-name report-bot --policy-name TodoRead
```

Then quiz yourself (write down allow / explicit-deny / implicit-deny for each):

1. `report-bot` runs `s3:GetObject` on `ph1-bucket/todo/a.txt`
2. `report-bot` runs `s3:GetObject` on `ph1-bucket/docs/notes/today.txt`
3. `report-bot` runs `s3:PutObject` on `ph1-bucket/todo/b.txt`
4. Someone adds a second statement: `Effect: Deny, Action: s3:GetObject, Resource: ph1-bucket/todo/secret/*` — now `todo/secret/k.txt`?

Answers: 1 allow (statement matches) · 2 implicit deny (ListBucket is allowed but GetObject on that prefix is nowhere) · 3 implicit deny (PutObject never mentioned) · 4 explicit deny, even though the allow still matches — deny wins.

## On real AWS

- Debug real denials with **AWS CloudTrail** (shows the exact request + decision) and the **IAM Policy Simulator** (`aws iam simulate-principal-policy`) — it evaluates hypothetical actions without touching resources
- When you hit `AccessDenied` in a job: check _who you are_ (`sts get-caller-identity`), _which policy should allow it_, and _whether an explicit deny or an SCP is overriding_
