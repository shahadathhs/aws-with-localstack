---
title: Security and encryption
description: Bucket policies, the public-access block, and encryption at rest and in transit — how S3 access control and data protection fit together.
---

S3 chapter, part 5.

## Concept

### Who can touch a bucket — the layered gates

Access to an object passes through several independent gates; **all of them must say yes**:

1. **Public access block** (account level and bucket level) — four master switches that override everything below and block any "public-ish" configuration. Default on new buckets. Most accidental-exposure incidents are this block being turned off
2. **Bucket policy** — a JSON document attached to the bucket (resource-based; travels with the bucket)
3. **IAM policies** — attached to the identities making the request (identity-based)
4. **ACLs** — the legacy mechanism, off by default; know they exist, do not use them

For same-account access: an allow in _either_ the bucket policy or an IAM policy is enough (no explicit deny anywhere). For cross-account: **both** sides must allow. Full evaluation logic is IAM territory — [policies and evaluation](/iam/02-policies-and-evaluation/).

Reading a bucket policy is a language skill. This sentence — _anonymous internet users may GET every object under `public/`_ — looks like:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadPublicPrefixOnly",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::ph1-bucket/public/*"
    }
  ]
}
```

Note the precision: `Principal: *` (anyone), only `GetObject` (not Put, not Delete), only `public/*` (not the whole bucket). Static websites on S3 are exactly this policy — nothing more magical.

### Encryption

**In transit:** HTTPS. Buckets can declare `aws:SecureTransport: false → deny` in their policy, forcing TLS for every request.

**At rest:** every object is encrypted by default (since January 2023 there is no unencrypted state). The flavors:

| Mode                    | Who holds the key                               | When to care                                                                 |
| ----------------------- | ----------------------------------------------- | ---------------------------------------------------------------------------- |
| **SSE-S3** (`AES256`)   | S3 manages everything                           | the default; fine for most data                                              |
| **SSE-KMS** (`aws:kms`) | AWS KMS key, every access logged & permissioned | regulated data; audit trail per object read; KMS request costs + rate limits |
| **SSE-C**               | _you_ hand the key per request                  | exotic; S3 never stores it                                                   |

The mental model: encryption at rest protects against someone stealing raw disks; **access control** (the gates above) protects against everyone else. Encryption never substitutes for IAM.

## Experiment

LocalStack stores these configurations but does **not enforce them** — the skill being trained is reading and writing the documents.

Apply the standard hardening (the four switches), then a read-only-for-everyone-on-`public/`-only policy:

```sh
export AWS_PROFILE=localstack

aws s3api put-public-access-block --bucket ph1-bucket \
  --public-access-block-configuration \
  BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true

aws s3api get-public-access-block --bucket ph1-bucket

aws s3api put-bucket-policy --bucket ph1-bucket --policy '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ReadOnlyPublicPrefix",
    "Effect": "Allow",
    "Principal": "*",
    "Action": "s3:GetObject",
    "Resource": "arn:aws:s3:::ph1-bucket/public/*"
  }]
}'

aws s3api get-bucket-policy --bucket ph1-bucket
# (returns the policy, URL-encoded — pipe through: | python3 -c 'import sys,json,urllib.parse; print(json.dumps(json.loads(urllib.parse.unquote(json.load(sys.stdin)["Policy"])), indent=2))')
```

On real AWS, `put-bucket-policy` with `BlockPublicPolicy=true` and a policy containing `Principal: "*"` is **rejected outright** — the block switch vetoes public policies before they are stored. That interplay is the safety net working; LocalStack will not reproduce it.

## On real AWS

- The [S3 Security Hub / Access Analyzer findings](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) you will meet in real jobs are almost always "public access block disabled" or "policy allows *" — you can now read both
- SSE-KMS adds audit value (CloudTrail logs every decrypt with the key) but adds a KMS API call per read: latency, cost, and throughput limits
- Quiz yourself: which gate stops a policy that allows `Principal: "*"` when the block is on? Which stops an IAM user whose policy says `s3:*` from reading a `financials/` prefix? (Answers: the block vetoes the policy; nothing stops the user — that needs an explicit deny or a different prefix design.)
