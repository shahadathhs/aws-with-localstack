---
title: ইভেন্ট নোটিফিকেশন
description: S3 একজন actor হিসেবে — object তৈরি, পরিবর্তন বা মুছে গেলে SQS, SNS বা Lambda ট্রিগার হয়। স্টোরেজ থেকে সার্ভারলেসের সেতু।
---

S3 অধ্যায, পর্ব ৬ — এবং Phase 2-এর সেতু।

## কনসেপ্ট

এতক্ষণ S3 ছিল নিষ্ক্রিয়: তুমি চাও, সে দেয়। **Event notification** এটিকে actor বানায় — object তৈরি, অপসারণ বা restore হলে S3 নিজেই message ঠেলে দেয়:

| টার্গেট         | রূপ                        | কখন                                                                  |
| --------------- | -------------------------- | -------------------------------------------------------------------- |
| **Lambda**      | event-ই invocation payload | আপলোডের সঙ্গে সঙ্গে প্রসেস (thumbnail, virus scan) — Phase 2-র বিষয় |
| **SQS queue**   | message হিসেবে event       | fan-in: অনেক আপলোড, worker pool নিজের গতিতে খায়                     |
| **SNS topic**   | event broadcast            | একসাথে অনেক subscriber-এ fan-out                                     |
| **EventBridge** | সমৃদ্ধ ফিল্টার/রাউটিং      | অনেক rule-এ জটিল routing                                             |

Event আসলে কী — _কী ঘটেছে_ বলা JSON:

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

Consumer-রা **ফাইল নয়, নোটিফিকেশন** পায় — message-এর `key` বলে দেয় কী গিয়ে আনতে হবে।

কনফিগারেশনের নিয়ম:

- ফিল্টার: **prefix** (`uploads/`), **suffix** (`.pdf`) দিয়ে — "ছবি" এক pipeline, "ইনভয়েস" আরেকটি — এভাবেই route হয়
- প্রতি bucket-এ ঠিক এক notification config, সর্বোচ্চ ১০০ rule
- Delivery **at-least-once**: duplicate আসবেই — consumer idempotent ডিজাইন করতে হবে (এই সুর এখান থেকে শুরু, AWS-জুড়ে থাকবে)
- S3 কিছুকাল retry করে; destination বারবার ব্যর্থ হলে event হারাতে পারে — আসল pipeline টার্গেট DLQ দিয়ে রক্ষা করে

## এক্সপেরিমেন্ট

Notification কনফিগে _বিদ্যমান_ টার্গেট লাগে (LocalStack ARN-এর গঠন যাচাই করে)। সস্তা টার্গেট হলো [ডেমো](/bn/getting-started/localstack-compose/)-র সেই SQS:

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

ফিল্টারটি উচ্চস্বরে পড়ো: _শুধু `uploads/`-এর অন্তর্গত, `.txt`-এ শেষ হওয়া নতুন object_। তিনটি কেস টেস্ট করো:

```sh
aws s3 cp /tmp/x.txt s3://ph1-bucket/uploads/match.txt          # notify হবে
aws s3 cp /tmp/x.txt s3://ph1-bucket/uploads/nope.pdf          # ভুল suffix
aws s3 cp /tmp/x.txt s3://ph1-bucket/other/match.txt           # ভুল prefix

QUEUE_URL=$(aws sqs get-queue-url --queue-name s3-events --query 'QueueUrl' --output text)
aws sqs receive-message --queue-url "$QUEUE_URL"
```

প্রত্যাশা: **একটি** message, body-তে উপরের JSON event-ই — `key: "uploads/match.txt"`। বাদ পড়া দুটি আপলোড কিছুই পাঠায় না। তুমি এইমাত্র প্রতিটি "ফাইল এলে কিছু করো" সিস্টেমের কঙ্কাল বানিয়ে ফেলেছ।

## রিয়েল AWS-এ

- প্রথম Lambda ওয়্যার করলে রহস্যজনক ব্যর্থতা আসবে যদি Lambda-র _resource policy_ S3-কে invoke করতে না দেয় — `aws lambda add-permission` দিয়ে AWS সেটি তৈরি করে দেয় (Phase 2-র পাঠ)
- একই key ডিলিট/রি-আপলোডে আরও event (`ObjectRemoved`, `ObjectCreated:Copy`) — consumer-কে event ঝড় সহ্য করতে হয়, যেমন bulk restore
- বড় multipart আপলোডে `ObjectCreated:CompleteMultipartUpload` শেষেই আসে — consumer কখনো টুকরোগুলো দেখে না
