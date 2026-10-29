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

10. [এক্সিকিউশন মডেল](/bn/lambda/01-execution-model/) — sandbox-এ handler; cold বনাম warm; আলাদা instance হিসেবে concurrency; timeout ও memory
11. [Event object](/bn/lambda/02-the-event-object/) — ফাংশন কেন invoke হলো; ম্যানুয়াল বনাম S3 event; synchronous বনাম asynchronous কল; লগ
12. [SQS trigger](/bn/lambda/03-sqs-triggers/) — event source mapping; batch size; আংশিক ব্যর্থতা জানানো; অন্তহীন retry

এক্সপেরিমেন্ট: Lambda ডিপ্লয় করে ম্যানুয়ালি invoke; global counter দিয়ে warmth প্রমাণ; একটি bucket ওয়্যার করা (আপলোড → Lambda); SQS message batch আকারে consume করে শুধু বিষাক্তটি retry করানো।

## Phase 3 — সার্ভারলেস শৃঙ্খল: API Gateway → Lambda → DynamoDB

13. [DynamoDB key দিয়েই দ্রুত](/bn/serverless/01-dynamodb-keys/) — partition ও sort key; query বনাম scan; secondary index
14. [API Gateway HTTP-কে event বানায়](/bn/serverless/02-api-gateway/) — route, stage, proxy চুক্তি; কেন 403 ও 502
15. [Tasks API](/bn/serverless/03-tasks-api/) — পুরো শৃঙ্খল curl দিয়ে চালানো; idempotent delete

এখানে সবকিছু API Gateway-র REST API ধরন ব্যবহার করে, কারণ LocalStack সেটিই চালায়। এক্সপেরিমেন্ট: একটি tasks API বানানো (`POST/GET/DELETE /tasks`) আর curl দিয়ে ডাকা; key দিয়ে query বনাম পুরো scan; GSI যোগ করে non-key attribute-এ query।

## Phase 4 — মেসেজিং: SQS (গভীর) + SNS + EventBridge

16. [SQS delivery ও visibility](/bn/messaging/01-sqs-delivery/) — at-least-once; visibility timeout; standard বনাম FIFO
17. [Dead-letter queue](/bn/messaging/02-dead-letter-queues/) — redrive policy; poison message পার্ক করা; Lambda-র retry চক্র শেষ করা
18. [SNS fan-out](/bn/messaging/03-sns-fan-out/) — একটি publish, অনেক queue; filter policy; raw delivery
19. [EventBridge routing](/bn/messaging/04-eventbridge/) — bus, rule ও pattern; SNS না EventBridge

এক্সপেরিমেন্ট: visibility timeout-এর পর re-delivery দেখা; poison message DLQ-তে পাঠানো; একটি SNS publish দুটি queue-তে fan-out; EventBridge rule দিয়ে বিষয়বস্তু দেখে event route করা।

## Phase 5 — Observability ও config: CloudWatch + Secrets Manager

20. [Product হিসেবে লগ](/bn/observability/01-logs/) — log group ও stream; কাঠামোবদ্ধ লগ; Logs Insights; retention
21. [Metric ও alarm](/bn/observability/02-metrics-and-alarms/) — period-এর ওপর statistics; threshold ও alarm state
22. [Config ও secret](/bn/observability/03-config-and-secrets/) — secret version; runtime-এ পড়া ও cache; Parameter Store

এই সেটআপে LocalStack CloudWatch Logs-এর filter pattern বা metric filter প্রয়োগ করে না, তাই পাঠগুলো লগ query করে Logs Insights দিয়ে। এক্সপেরিমেন্ট: কাঠামোবদ্ধ লগ লিখে query করা; একটি metric publish করে alarm বাজানো; একটি secret রেখে Lambda থেকে runtime-এ পড়া।

## Phase 6 — Infrastructure as Code: Terraform

23. [Desired state](/bn/terraform/01-desired-state/) — declarative বনাম imperative; provider ও resource; init, plan, apply
24. [State ও drift](/bn/terraform/02-state-and-drift/) — state ফাইল; হাতে করা বদল ধরা; destroy ও rebuild
25. [Variable ও remote state](/bn/terraform/03-variables-and-remote-state/) — variable ও output; forces replacement; S3 backend

Terraform Compose দিয়ে Docker-এ চলে (`make tf CMD="plan"`), তাই কিছু install করতে হয় না। এক্সপেরিমেন্ট: একটি ফাইল থেকে bucket, queue ও table বানানো; হাতে LocalStack বদলে `terraform plan`-এ drift ধরা দেখা; destroy করে ফাইল থেকে আবার বানানো; state S3-তে সরানো।

## Phase 7 — গ্র্যাজুয়েশন: রিয়েল AWS (free tier)

- একই Terraform রিয়েল অ্যাকাউন্টে: IAM প্রকৃতপক্ষে enforce হয়, CloudWatch আসল, বিল আসল
- আলাদা `~/.aws` profile, MFA ও budget alarm — সবার আগে
- LocalStack যা সিমুলেট করতে পারেনি তা চোখে হাতে দেখা: denial, quota, latency

---

আনুমানিক সময়: Phase 1–3 ≈ আড়িমে ২ সপ্তাহ · 4–5 ≈ আরও ২ · 6 ≈ ১ সপ্তাহ।
