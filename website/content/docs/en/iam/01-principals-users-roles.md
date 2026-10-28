---
title: Principals, users, roles
description: The cast of IAM — root, users, groups, and roles — and why temporary credentials beat long-lived keys almost always.
---

IAM chapter, part 1.

## Concept

IAM answers one question for every API call: **who is asking, and are they allowed?** Its "who" is a **principal**. The principal types:

| Principal              | What it is                                        | Credentials                                                         |
| ---------------------- | ------------------------------------------------- | ------------------------------------------------------------------- |
| **Root user**          | the account owner — god mode                      | email + password + MFA; should exist only for emergencies           |
| **IAM user**           | a named identity for one human or one machine     | **long-lived**: an access key pair that never expires until rotated |
| **IAM role**           | an assumable identity — a costume, not a person   | **temporary**: STS issues credentials that expire (15 min – 12 h)   |
| **Federated identity** | humans from an external IdP (Google, company SSO) | temporary, via a role                                               |

### Users vs roles — the distinction that matters

An IAM **user** is a permanent identity with permanent keys. Every place those keys land (laptop, CI variable, code repo) becomes a breach risk with no expiry. AWS's own incident postmortems are littered with leaked user keys.

A **role** is an identity that _nobody signs in as_. Instead, trusted principals **assume** it — the Security Token Service (STS) does a handshake ("prove you're trusted by this role's _trust policy_") and hands back **temporary credentials** that auto-expire. Keys leak? They are already dead in an hour.

Where roles show up in practice:

- A **Lambda function has a role** — the code runs with that role's permissions, no keys anywhere in code
- An **EC2 instance has a role** — the instance metadata endpoint serves rotating credentials to the machine
- **You** assume roles to work in accounts (`aws sts assume-role`), typically via SSO

Groups are just user-collections for attaching policies at scale — roles are not members of groups.

### The rule the whole industry converged on

> Humans and machines get **roles with temporary credentials**. Long-lived IAM user keys are the exception you justify in writing — and rotate.

## In LocalStack

LocalStack accepts any credentials (`test`/`test`) and mints no real STS tokens by default — it simulates none of this enforcement. The IAM API itself works though; create the actors and _read their JSON_, because reading IAM JSON is the transferable skill:

```sh
export AWS_PROFILE=localstack

aws iam create-user --user-name report-bot
aws iam create-role --role-name report-reader --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'
```

Read that trust policy as prose: _the Lambda service may assume this role._ That sentence is what lets a future Lambda function run "as" `report-reader`. Nothing else may assume it — not EC2, not users.

## On real AWS

- The account's real protection starts at the **root user**: MFA on, no access keys, used a handful of times a year — everything daily happens through IAM users/roles under it
- Real setups rarely use IAM users for humans at all — **IAM Identity Center (SSO)** federates your company login to roles
- Get comfortable with `aws sts get-caller-identity` — it tells you _who you currently are_, and half of all "AccessDenied" debugging starts there
