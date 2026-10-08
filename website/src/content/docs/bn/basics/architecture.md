---
title: LocalStack কীভাবে কাজ করে — মেন্টাল মডেল
description: একটি গেটওয়ে পোর্ট, নকল অ্যাকাউন্ট রাউটিং, DNS ট্রিক ও sibling Lambda container — LocalStack কীভাবে AWS নকল করে।
---

অফিসিয়াল রেফারেন্স:
[ইনস্টলেশন](https://docs.localstack.cloud/aws/getting-started/installation/) ·
[সংযোগ / AWS CLI](https://docs.localstack.cloud/aws/connecting/aws-cli/) ·
[নেটওয়ার্কিং](https://docs.localstack.cloud/aws/customization/networking/) ·
[Credentials](https://docs.localstack.cloud/aws/connecting/credentials/)

## বড় ছবি

LocalStack **AWS API প্রোটোকল** রাখে, শুধু **গন্তব্য** বদলায়। টুলগুলো পার্থক্য টের পায় না — তাই যেকোনো AWS CLI, SDK বা Terraform কোড অপরিবর্তিত থেকে `localhost:4566`-এ কাজ করে।

```
                        তোমার মেশিন (সবকিছু এখানেই থাকে)
┌──────────────────────────────────────────────────────────────────┐
│                                                                  │
│   $ aws --profile localstack s3 ls                               │
│        │                                                         │
│        │ 1. profile লুকআপ: ~/.aws/config                         │
│        │    → endpoint_url = localhost.localstack.cloud:4566     │
│        │    → credentials  = test/test (কখনো যাচাই হয় না!)       │
│        ▼                                                         │
│   localhost.localstack.cloud  ──DNS──►  127.0.0.1                │
│   (এই পাবলিক DNS wildcard ইচ্ছা করেই LocalStack-এর)              │
│        │                                                         │
│        │ 2. সাধারণ HTTP (ইন্টারনেট নেই, TLS নেই, আসল auth নেই)   │
│        ▼                                                         │
│   ┌────────────── LOCALSTACK CONTAINER ────────────────────┐     │
│   │                                                        │     │
│   │   EDGE GATEWAY  :4566   ← এক পোর্ট = সব সার্ভিস         │     │
│   │        │                                               │     │
│   │        │ 3. "কোন সার্ভিস?" — পড়ে যেখান থেকে:           │     │
│   │        │      • URL path       /demo-queue             │     │
│   │        │      • hostname       s3.localhost...         │     │
│   │        │      • SigV4 সিগনেচার + headers               │     │
│   │        ▼                                               │     │
│   │   ┌─────────┬─────────┬──────────┬──────────┐          │     │
│   │   │   S3    │   SQS   │ DynamoDB │  Lambda  │  ...     │     │
│   │   │bucket   │queue +  │table +   │    │      │          │     │
│   │   │+ ফাইল   │message  │item      │    │4.    │          │     │
│   │   └─────────┴─────────┴──────────┘    ▼      │          │     │
│   │   সব state কন্টেইনার মেমরিতে            docker.sock     │     │
│   │   (`make clean`-এ মুছে যায়)        → তোমার ফাংশন      │     │
│   │                                    sibling ctr-এ চলে  │     │
│   └────────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────────┘
```

## নকল অ্যাকাউন্ট ও region — এগুলো নিছক _লেবেল_

|            | রিয়েল AWS                                                 | LocalStack                                                 |
| ---------- | ---------------------------------------------------------- | ---------------------------------------------------------- |
| ARN        | `arn:aws:dynamodb:eu-west-1:123456789012:table/demo-table` | `arn:aws:dynamodb:eu-west-1:000000000000:table/demo-table` |
| Account ID | তোমার আসল ১২ ডিজিট                                         | সবসময় `000000000000`                                      |
| Region     | আসল ডেটাসেন্টার                                            | তুমি যা দাবি করো                                           |
| Auth       | IAM, policy, MFA, সিগনেচার যাচাই                           | কিছুই না — যেকোনো credential চলে (`test/test` প্রচলিত)     |

`test/test` credential আছে শুধু কারণ AWS CLI credential ছাড়া রিকোয়েস্ট পাঠাতেই রাজি নয়। রিকোয়েস্ট তবুও SigV4-signed — কিন্তু কেউ সিগনেচার যাচাই করে না, গেটওয়ে তা থেকে শুধু service/region পড়ে নেয়।

## একটি গেটওয়ে পোর্ট

রিয়েল AWS-এ শত শত hostname-এ সার্ভিস ছড়ানো (`s3.amazonaws.com`, `sqs.eu-west-1.amazonaws.com`...)। LocalStack **সবকিছু এক এন্ডপয়েন্টে** (`:4566`) সার্ভ করে এবং প্রতিটি রিকোয়েস্ট দেখে রাউট করে:

- **URL path** — SQS: `/000000000000/demo-queue`
- **Hostname prefix** — S3 virtual-host style: `demo-bucket.s3.localhost.localstack.cloud`
- **Header / সিগনেচার** — DynamoDB `X-Amz-Target` ব্যবহার করে, আর প্রতিটি SigV4 সিগনেচারে service-এর নাম থাকে

`localhost.localstack.cloud` কেন আছে তার উত্তর এখানেই: এটি LocalStack-এর মালিকানাধীন পাবলিক DNS wildcard (`*.localhost.localstack.cloud` → `127.0.0.1`), যাতে hostname-ভিত্তিক addressing রিয়েল AWS-এর মতোই কাজ করে — `/etc/hosts` স্পর্শ ছাড়াই।

## Lambda ব্যতিক্রম: docker.sock

বেশিরভাগ সার্ভিস LocalStack কন্টেইনারের _ভিতরেই_ এমুলেট হয়। Lambda কিন্তু তোমার **কোড সত্যিই চালায়** — সেটি করে mounted `/var/run/docker.sock` দিয়ে _sibling_ Docker container লঞ্চ করে। তাই compose ফাইলে socket মাউন্ট লাগে, আর Lambda এত বাস্তববোধ দেয়।

## State ও জীবনকাল

- Bucket, queue, table... কন্টেইনার **মেমরিতে** থাকে — `docker compose restart`-এ টিকে, container মরলে মরে, `make clean` সব মুছে দেয়
- সম্পূর্ণ রিস্টার্ট জুড়ে persistence হলো Pro ফিচার (`PERSISTENCE` env — এই রিপোর compose-এ আছে, ফ্রি টিয়ারে নিষ্ক্রিয়)

## রিয়েল বনাম নকল, স্তরে স্তরে

| স্তর       | রিয়েল AWS                   | LocalStack                                    |
| ---------- | ---------------------------- | --------------------------------------------- |
| Addressing | `s3.eu-west-1.amazonaws.com` | `localhost.localstack.cloud:4566` → 127.0.0.1 |
| Identity   | IAM user, role, policy       | সবাই `000000000000`, allow-all                |
| Data plane | Amazon-এর আসল বহু            | এক container-এ service emulator               |
| বিলিং      | প্রতি রিকোয়েস্টে খরচ        | বিনামূল্যে                                    |

পূর্বশর্ত পাঠ: [AWS CLI বেসিক](/bn/basics/aws-cli/) — LocalStack যে profile/endpoint মেকানিজমের ওপর দাঁড়িয়ে তার ব্যাখ্যা।
