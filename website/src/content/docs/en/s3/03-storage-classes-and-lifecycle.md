---
title: Storage classes and lifecycle
description: The shelves inside S3 — Standard to Deep Archive — retrieval economics, and lifecycle rules that move data for you.
---

S3 chapter, part 3.

## Concept

Every object carries a `StorageClass` — which _shelf_ the bytes sit on. The API is identical across classes; what changes is the money model: price per GB-month, price per request, and what it costs (in money or time) to read the data back.

| Class                          | Access pattern          | Per-GB storage          | Retrieval          | Notes                                                             |
| ------------------------------ | ----------------------- | ----------------------- | ------------------ | ----------------------------------------------------------------- |
| **Standard**                   | hot, frequent           | highest                 | free, instant      | the default                                                       |
| **Standard-IA**                | monthly-ish             | ~half of Standard       | fee per GB         | 30-day minimum billing                                            |
| **One Zone-IA**                | like IA, tolerable risk | cheaper than IA         | fee per GB         | stored in ONE AZ only — a zone event can lose it                  |
| **Glacier Instant Retrieval**  | quarterly               | cheapest instant-access | highest fee per GB | still millisecond GETs                                            |
| **Glacier Flexible Retrieval** | rare (1×/year)          | very cheap              | minutes–hours, fee | "restore" job then download                                       |
| **Glacier Deep Archive**       | compliance/final resort | cheapest of all         | up to 48h, fee     | 180-day minimum                                                   |
| **Intelligent-Tiering**        | unknown/changing        | Standard-level          | free               | auto-moves objects between tiers; small monitoring fee per object |

Two economics traps to internalize:

1. **Minimum storage duration** — delete an IA object after 5 days and you pay for 30. Deep Archive bills 180 days minimum
2. **Retrieval is per GB** — archive a petabyte cheaply, then read it all back once, and the retrieval fee dwarfs months of storage savings

### Lifecycle rules — the automation layer

You do not move objects between classes by hand. A **lifecycle configuration** is a bucket-level JSON of rules evaluated daily by S3 itself:

```json
{
  "Rules": [
    {
      "ID": "logs-aging",
      "Status": "Enabled",
      "Filter": { "Prefix": "logs/" },
      "Transitions": [
        { "Days": 30, "StorageClass": "STANDARD_IA" },
        { "Days": 180, "StorageClass": "GLACIER_IR" }
      ],
      "Expiration": { "Days": 365 }
    }
  ]
}
```

Reading it as prose: _objects whose keys start with `logs/` — after 30 days move to Standard-IA, after 180 to Glacier IR, delete entirely after 365 days._

Beyond transitions, rules can also:

- expire **noncurrent versions** (the billing antidote from [versioning](/en/s3/02-versioning/)): `NoncurrentVersionExpiration: { NoncurrentDays: 30 }`
- `AbortIncompleteMultipartUpload` after N days — recommended on every bucket, aborts orphaned multipart debris

When two rules could apply to the same object, S3 applies the action that **cheapest/free-est for storage** (transition wins over nothing, free always wins over transition). Note transitions only go _down_ the hotness ladder; Standard→IA→Glacier, never back up — lifecycle cannot "un-archive".

## Experiment

Predict: does the transition happen immediately? What does the rule say about objects _not_ under `logs/`?

```sh
export AWS_PROFILE=localstack
aws s3api put-bucket-lifecycle-configuration --bucket ph1-bucket --lifecycle-configuration '{
  "Rules": [{
    "ID": "logs-aging",
    "Status": "Enabled",
    "Filter": { "Prefix": "logs/" },
    "Transitions": [{ "Days": 30, "StorageClass": "STANDARD_IA" }],
    "Expiration": { "Days": 365 }
  }]
}'

aws s3api get-bucket-lifecycle-configuration --bucket ph1-bucket
```

Read back the rule and confirm the filter scope. Then check an object's current class:

```sh
echo data > /tmp/x.txt
aws s3 cp /tmp/x.txt s3://ph1-bucket/logs/x.txt
aws s3api head-object --bucket ph1-bucket --key logs/x.txt --query StorageClass
# -> "STANDARD"      <- transitions are evaluated daily; nothing moves on day 0
```

LocalStack stores and serves the configuration but does **not simulate time passing** — the lesson is the rule model: per-prefix filters, day thresholds, and that `StorageClass` on the object is the thing changing.

## On real AWS

- Pricing lives at [aws.amazon.com/s3/pricing](https://aws.amazon.com/s3/pricing/) — study the Standard vs IA vs Glacier-IR columns for one region until the retrieval-fee pattern is obvious
- **Intelligent-Tiering** is the default recommendation for data lakes with unknown access patterns; its monitoring fee makes it wrong for millions of tiny objects
- Ask in every design review: "what reads this data, how often, and who pays if that guess is wrong?"
