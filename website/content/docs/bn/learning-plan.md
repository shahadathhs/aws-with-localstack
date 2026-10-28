---
title: AWS লার্নিং প্ল্যান
description: S3 থেকে Terraform পর্যন্ত হাতে-কলমে কারিকুলাম — প্রতিটি লেসনে কনসেপ্ট, এক্সপেরিমেন্ট ও রিয়েল-AWS নোট।
---

> লক্ষ্য: শুধু CLI কমান্ড নয় — **সার্ভিসগুলো নিজে** বোঝা: কনসেপ্ট, গ্যারান্টি, failure mode, খরচের হিসাব। CLI কমান্ড হলো ল্যাব যন্ত্র, লেসন নয়।
>
> প্রতিটি টপিকের চক্র: **কনসেপ্ট পড়ুন → আচরণ অনুমান করুন → LocalStack-এ এক্সপেরিমেন্ট করুন → অনুমান যাচাই করুন**।

LocalStack কভারেজ: নিচের সবকিছু কমিউনিটি এডিশনেই চলে, শুধু IAM **enforce করা হয় না** (থিওরি হিসেবে শিখুন) এবং CloudWatch metrics আংশিক।

## Phase 0 — টুলিং

স্যান্ডবক্স সেটআপ ও বোঝা:

1. [Docker Compose দিয়ে LocalStack চালানো](/bn/getting-started/localstack-compose/) — অফিসিয়াল উদাহরণ, পিন করা ভার্সন; গেটওয়ে পোর্ট, docker.sock, হেলথচেক, ট্রাবলশুটিং
2. [AWS CLI ইনস্টল](/bn/getting-started/install-aws-cli/) — macOS, Linux, Windows-এর অফিসিয়াল ইনস্টলার; আপডেট; `awslocal`-এর গল্প
3. [AWS CLI বেসিক](/bn/basics/aws-cli/) — কনফিগ ফাইল, প্রোফাইল, রেজোলিউশন অর্ডার, SigV4, `endpoint_url` override
4. [LocalStack কীভাবে কাজ করে](/bn/basics/architecture/) — একটি গেটওয়ে পোর্ট, নকল অ্যাকাউন্ট রাউটিং, DNS ট্রিক, Lambda sibling container

## Phase 1 — স্টোরেজ ও আইডেন্টিটি: S3 (ডিপ) + IAM (থিওরি)

S3:

1. [অবজেক্ট মডেল](/bn/s3/01-object-model/) — ফ্ল্যাট key-value স্টোর; ফোল্ডার ইলিউশন; কনসিস্টেন্সি; durability বনাম availability
2. [ভার্সনিং](/bn/s3/02-versioning/) — delete marker, restore, noncurrent-version বিলিং
3. [স্টোরেজ ক্লাস ও লাইফসাইকেল](/bn/s3/03-storage-classes-and-lifecycle/) — Standard থেকে Deep Archive; retrieval অর্থনীতি; লাইফসাইকেল রুল
4. [Presigned URL](/bn/s3/04-presigned-urls/) — signed GET ও PUT; expiry; CORS ফাঁদ
5. [সিকিউরিটি ও এনক্রিপশন](/bn/s3/05-security-and-encryption/) — অ্যাক্সেস গেট, policy-as-prose, SSE-S3 বনাম SSE-KMS
6. [ইভেন্ট নোটিফিকেশন](/bn/s3/06-events/) — S3 একজন actor হিসেবে; prefix/suffix ফিল্টার; at-least-once delivery

IAM:

7. [Principal, user, role](/bn/iam/01-principals-users-roles/) — long-lived key বনাম STS temporary credential
8. [পলিসি ও evaluation](/bn/iam/02-policies-and-evaluation/) — policy JSON; explicit deny > allow > implicit deny; least privilege
9. [ARN](/bn/iam/03-arns/) — যেকোনো রিসোর্স অ্যাড্রেস পার্স করা; সার্ভিসভেদে পার্থক্য

## Phase 2 — কম্পিউট: Lambda

লেসন পেজগুলো ধাপে ধাপে লেখা হবে — ততক্ষণ লক্ষ্যগুলো:

- Execution model: উষ্ণ sandboxed microVM; cold বনাম warm start; concurrency = instance pool
- **ইভেন্ট অবজেক্ট**: ফাংশনটি _কেন_ invoke হলো তার JSON বর্ণনা — একই ফাংশন, অনেক trigger shape
- সীমা: সর্বোচ্চ ১৫ মিনিট, memory slider (memory CPU স্কেল করে), payload ক্যাপ
- Trigger: S3 event ও SQS message (batch size, retry, partial batch failure)

এক্সপেরিমেন্ট: Lambda ডিপ্লয় করে ম্যানুয়ালি invoke; global counter দিয়ে warmth প্রমাণ; Phase-1 bucket ওয়্যার করা (আপলোড → Lambda); SQS message consume (batch size 1, তারপর 10)।

## Phase 3 — সার্ভারলেস চেইন: API Gateway → Lambda → DynamoDB

- API Gateway: route, stage, HTTP → event-JSON রূপান্তর, throttling
- DynamoDB-র paradigm shift: **শুধু key দিয়েই দ্রুত** — partition key shard ঠিক করে; query আগে ভেবে টেবিল ডিজাইন
- Partition key + sort key; GSI / LSI — অতিরিক্ত খরচে বিকল্প query view
- RCU / WCU: throughput প্রতি টেবিলে কেনা হয় — "DynamoDB bills per access"-এর উৎস
- DynamoDB modeling ≠ MongoDB modeling: join নেই, ad-hoc query নেই

এক্সপেরিমেন্ট: tasks API বানানো (`POST/GET/DELETE /tasks`) curl দিয়ে টেস্ট; key দিয়ে query বনাম full scan; GSI যোগ করে non-key attribute দিয়ে query।

## Phase 4 — মেসেজিং: SQS (ডিপ) + SNS + EventBridge

- SQS গ্যারান্টি: **at-least-once delivery** → duplicate হবেই → consumer idempotent হতে হবে
- Visibility timeout: প্রসেসিংয়ের সময় লুকানো, ডিলিট না করলে আবার দেখা যায়
- Standard বনাম FIFO; DLQ — N বার ব্যর্থতার পর parking lot
- SNS fan-out বনাম SQS point-to-point; EventBridge routing

এক্সপেরিমেন্ট: visibility timeout শেষে re-delivery দেখা; poison message DLQ-তে পাঠানো; একটি SNS publish দুটি queue-তে; order API → SNS → দুটি worker Lambda।

## Phase 5 — Observability ও কনফিগ: CloudWatch + Secrets Manager

- Log একটি প্রোডাক্ট: log group বনাম stream, retention, Insights query
- Metrics ও alarm; scale-এ structured (JSON) logging
- Runtime config বনাম build-time config; secret কখনো env var-এ baked থাকবে না

এক্সপেরিমেন্ট: Phase-3 API-তে structured logging, `logs filter-log-events` দিয়ে query; secret রেখে Lambda থেকে runtime-এ পড়া।

## Phase 6 — Infrastructure as Code: Terraform

- Declarative বনাম imperative: desired state বনাম actual state; state file; plan/apply; drift
- Provider, resource, variable, output, remote state

এক্সপেরিমেন্ট: `tflocal` দিয়ে Phase-3 API পুনর্নির্মাণ; LocalStack-এ হাতে পরিবর্তন করে `terraform plan`-এ drift দেখা; `destroy` করে ৬০ সেকেন্ডে পুনর্গঠন।

## Phase 7 — গ্র্যাজুয়েশন: রিয়েল AWS (free tier)

- একই Terraform রিয়েল অ্যাকাউন্টে: IAM প্রকৃতপক্ষে enforce হয়, CloudWatch আসল, বিল আসল
- আলাদা `~/.aws` profile, MFA ও budget alarm — সবার আগে
- LocalStack যা সিমুলেট করতে পারেনি তা চোখে হাতে দেখা: denial, quota, latency

---

আনুমানিক সময়: Phase 1–3 ≈ আড়িমে ২ সপ্তাহ · 4–5 ≈ আরও ২ · 6 ≈ ১ সপ্তাহ।
