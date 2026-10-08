---
title: Event notifications
description: S3 as an actor — objects appearing, changing, or disappearing can trigger SQS, SNS, or Lambda. The bridge from storage to serverless.
---

S3 chapter, part 6 — and the bridge to Phase 2.

## Concept

Until now S3 has been passive: you ask, it answers. **Event notifications** flip it into an actor — when objects are created, removed, or restored, S3 can push a message to:

| Target          | Shape                                    | Use it for                                                                |
| --------------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| **Lambda**      | the event becomes the invocation payload | process uploads immediately (thumbnails, virus scans) — Phase 2 territory |
| **SQS queue**   | event as a message                       | fan-in: many uploads, a worker pool consumes at its own pace              |
| **SNS topic**   | event broadcast                          | fan-out to many subscribers at once                                       |
| **EventBridge** | richer filtering/routing                 | complex routing across many rules                                         |

What an event actually is — a JSON document describing _what happened_:

```json
{
  "Records": [
    {
      "eventTime": "2026-10-06T12:00:00.000Z",
      "eventName": "ObjectCreated:Put",
      "s3": {
        "bucket": { "name": "ph1-bucket" },
        "object": { "key": "uploads/report.pdf", "size": 1048576, "etag": "..." }
      }
    }
  ]
}
```

Consumers receive _the notification, not the file_ — the `key` in the message tells them what to go fetch.

Rules the configuration obeys:

- Filters: by **prefix** (`uploads/`), by **suffix** (`.pdf`) — how you route "images" to one pipeline and "invoices" to another
- Exactly one notification config per bucket, containing up to 100 rules
- Delivery is **at-least-once**: consumers may see duplicates — design them idempotent (this refrain starts here and never stops in AWS)
- S3 retries deliveries for a while; if the destination keeps failing, events can be lost — real pipelines protect the target with a DLQ

## Experiment

Configuring a notification requires a _existing_ target (LocalStack validates the ARN shape). A queue is the cheapest target we already know from the [demo](/en/getting-started/localstack-compose/):

```sh
export AWS_PROFILE=localstack

aws sqs create-queue --queue-name s3-events
QUEUE_ARN=$(aws sqs get-queue-attributes --queue-name s3-events \
  --attribute-names QueueArn --query 'Attributes.QueueArn' --output text)

aws s3api put-bucket-notification-configuration --bucket ph1-bucket \
  --notification-configuration '{
    "QueueConfigurations": [{
      "QueueArn": "'"$QUEUE_ARN"'",
      "Events": ["s3:ObjectCreated:*"],
      "Filter": { "Key": { "FilterRules": [
        { "Name": "prefix", "Value": "uploads/" },
        { "Name": "suffix", "Value": ".txt" }
      ]}}
    }]
  }'
```

Read that filter aloud: _only objects created under `uploads/` ending in `.txt`_. Test all three cases:

```sh
aws s3 cp /tmp/x.txt s3://ph1-bucket/uploads/match.txt          # should notify
aws s3 cp /tmp/x.txt s3://ph1-bucket/uploads/nope.pdf          # wrong suffix
aws s3 cp /tmp/x.txt s3://ph1-bucket/other/match.txt           # wrong prefix

QUEUE_URL=$(aws sqs get-queue-url --queue-name s3-events --query 'QueueUrl' --output text)
aws sqs receive-message --queue-url "$QUEUE_URL"
```

Expected: **one** message, whose body is the JSON event above with `key: "uploads/match.txt"`. The two filtered-out uploads produce nothing. You have just built the skeleton of every "do something when a file arrives" system on AWS.

## On real AWS

- The firstLambda you wire to this will fail mysteriously if the Lambda's _resource policy_ does not allow S3 to invoke it — AWS creates that permission for you via `aws lambda add-permission` (Phase 2 material)
- Deleting or re-uploading the same key fires more events (`ObjectRemoved`, `ObjectCreated:Copy`) — consumers must tolerate event storms, e.g. bulk restores
- Large multipart uploads fire `ObjectCreated:CompleteMultipartUpload` only at the end — consumers never see the parts
