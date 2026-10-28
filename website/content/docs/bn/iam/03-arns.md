---
title: ARN
description: Amazon Resource Name — প্রতিটি সার্ভিস, পলিসি ও লগ লাইনের সাধারণ ঠিকানা ব্যবস্থা। একবার পার্স করা শেখো, সব জায়গায় কাজে লাগবে।
---

IAM অধ্যায়, পর্ব ৩ — ছোট, কিন্তু ওজন অনেক।

## কনসেপ্ট

**ARN** (Amazon Resource Name) হলো যেকোনো AWS resource-এর গ্লোবাল ঠিকানা। Policy ARN টার্গেট করে; log ARN উল্লেখ করে; event message ARN বহন করে; CLI আউটপুট এতে ভরা — `make demo`-র দিন থেকেই তুমি পড়ছ:

```
arn:aws:dynamodb:eu-west-1:000000000000:table/demo-table
 │    │      │           │             │        │
 │    │      │           │             │        └─ resource ধরন + id
 │    │      │           │             └─ account ID (LocalStack: সবসময় 000000000000)
 │    │      │           └─ region (কিছু সার্ভিসে থাকে না — নিচে দেখো)
 │    │      └─ partition: aws (বাণিজ্যিক), aws-cn (চীন), aws-us-gov
 │    └─ service namespace
 └─ আক্ষরিকভাবে "arn"
```

সাধারণ রূপ:

```
arn:partition:service:region:account-id:resource
```

`resource` অংশ সার্ভিসভেদে বদলায় — এখানেই লোক হোঁচট খায়:

| সার্ভিস  | Resource অংশ                                        | কেন                                                                                                        |
| -------- | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| DynamoDB | `table/Name` বা `table/Name/index/GSI`              | table _এবং তার index_ আলাদাভাবে addressable                                                                |
| S3       | `bucket` বা `bucket/key/path`                       | **region নেই, account নেই** — bucket নাম already globally unique ([object model](/bn/s3/01-object-model/)) |
| IAM      | `user/Bob`, `role/report-reader`, `policy/TodoRead` | **region নেই** — IAM global; region-less                                                                   |
| SQS      | `queue-name` (কোনো ধরন-প্রিফিক্স নেই)               | কাঁচা — ভুল পড়ার উপকরণ                                                                                    |
| Lambda   | `function:name:version`                             | slash-এর বদলে colon                                                                                        |

Policy-তে wildcard `*`: `arn:aws:s3:::ph1-bucket/public/*` (`public/`-এর সব object), `arn:aws:s3:::*` (অ্যাকাউন্টের সব bucket — সাধারণত গন্ধ খারাপ)।

## এক্সপেরিমেন্ট — API নেই, শুধু চোখ

এই phase-এ তুমি already ARN জমা করেছ। ইতিহাস থেকে তিনটি বের করে হাতে ভেঙে দেখো:

```sh
export AWS_PROFILE=localstack
aws s3api list-buckets --query 'Buckets[].Name'
aws dynamodb list-tables
aws iam list-roles --query 'Roles[].Arn' --output table
```

প্রতিটি ARN-এর জন্য লেখো: partition, service, region (আছে? কেন/কেন না?), account, resource ধরন, resource id। দুটি চেনা মুখ:

- `arn:aws:iam::000000000000:role/report-reader` — region নেই (IAM global)
- `arn:aws:s3:::ph1-bucket` — region _এবং_ account নেই (global নেমস্পেস)

## রিয়েল AWS-এ

- Region-সহ ARN মানে resource-টি regional — `arn:aws:dynamodb:eu-west-1:...` অনুমতি `us-east-1`-এ মূল্যহীন
- Policy-তে ARN-ই _blast radius_ ঠিক করে: `Resource: "arn:aws:s3:::bucket/todo/*"` আর `Resource: "*"`-এর পার্থক্য হলো ছোট ঘটনা আর career-সংজ্ঞায়নকারী দুর্ঘটনার পার্থক্য
- কোনো টুল "the ARN" চাইলে সে সবসময় এই পূর্ণ স্ট্রিংটাই চায় — কখনো শুধু নাম নয়
