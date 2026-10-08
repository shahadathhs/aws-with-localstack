---
title: AWS CLI বেসিক — কনফিগারেশনের থিওরি
description: প্রোফাইল, কনফিগ ফাইল, রেজোলিউশন অর্ডার, রিকোয়েস্ট লাইফসাইকেল ও SigV4 — পুরো সেটআপের ভিত্তি।
---

অফিসিয়াল রেফারেন্স:
[কনফিগ ফাইল](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html) ·
[Named profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) ·
[Environment variable](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-envvars.html) ·
[SigV4](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_sigv.html)

## ১. AWS CLI আসলে কী

জাদু নয় — একটি HTTPS ক্লায়েন্ট। প্রতিটি কমান্ড (`aws s3 ls`) একটি **HTTP রিকোয়েস্ট** হয়ে কোনো না কোনো API এন্ডপয়েন্টে যায়, credential দিয়ে signed হয়, আর JSON/XML রেসপন্স পার্স হয়ে টার্মিনালে আসে। AWS Console আর ভাষার SDK-রাও হুবহু একই প্রোটোকল কথা বলে — CLI শুধু ~৩০০ সার্ভিসের API জানা একটি মোড়ক।

## ২. দুটি কনফিগ ফাইল

| ফাইল                 | যা থাকে                                      | প্রকৃতি                                 |
| -------------------- | -------------------------------------------- | --------------------------------------- |
| `~/.aws/config`      | region, output format, `endpoint_url`, ...   | **কোথায়/কীভাবে** কথা বলবে — secret নয় |
| `~/.aws/credentials` | `aws_access_key_id`, `aws_secret_access_key` | **তুমি কে** — secret                    |

এই রিপোর `make setup-cli` দুটিতেই একটি `localstack` profile যোগ করে:

```ini
# ~/.aws/config
[profile localstack]
region=eu-west-1
output=json
endpoint_url = http://localhost.localstack.cloud:4566

# ~/.aws/credentials
[localstack]
aws_access_key_id=test
aws_secret_access_key=test
```

## ৩. মূল ধারণা: profile

**Profile** = নাম দেওয়া সেটিংসের বান্ডেল — `config`-এ একটি সেকশন + `credentials`-এ একই নামের সেকশন। এক মেশিনে অনেকগুলো পাশাপাশি থাকতে পারে:

```ini
[default]               # কিছু না বললে এটি চলে
[profile company-prod]  # রিয়েল AWS, রিয়েল key
[profile localstack]    # নকলটি
```

Profile নির্বাচন:

```sh
aws s3 ls --profile localstack     # একবারের জন্য
export AWS_PROFILE=localstack      # পুরো শেল সেশনের জন্য
aws s3 ls                          # এখন localstack ব্যবহার হবে
```

## ৪. রেজোলিউশন অর্ডার (কে জেতে)

প্রতিটি কমান্ডে CLI সেটিংস জোগাড় করে; পরের উৎস আগেরটিকে override করে:

```
1. CLI flag             --region us-east-1            (সর্বোচ্চ)
2. Environment variable AWS_PROFILE, AWS_DEFAULT_REGION, ...
3. কনফিগ ফাইল           ~/.aws/config + credentials
4. Built-in default     (যেমন us-east-1)
```

`make aws CMD='s3 ls'` কেন কাজ করে: এটি চালায় `AWS_PROFILE=localstack aws s3 ls` — স্তর ২ profile বেছে নেয়, স্তর ৩ region + endpoint দেয়।

## ৫. একটি কমান্ডের জীবন

```
aws s3 ls
  → parse:      service=S3, operation=ListBuckets
  → gather:     region=eu-west-1, creds=test/test, endpoint=localhost:4566
  → build:      HTTPS রিকোয়েস্ট (method, path, query, headers)
  → SIGN (SigV4): credential + service + region headers-এ বসে
  → send:       এন্ডপয়েন্টে যায়
  → parse:      JSON রেসপন্স → সুন্দর আউটপুট
```

**SigV4**-ই AWS-এর আসল নিরাপত্তা সীমানা: সিগনেচার প্রমাণ করে রিকোয়েস্টটি গোপন key-র মালিকের কাছ থেকে এসেছে এবং মাঝপথে বদলায়নি। সাথে এটি _ঘোষণা_ করে কোন service ও region টার্গেট — LocalStack-এর গেটওয়ে ঠিক এটি পড়েই রাউট করে ([কীভাবে LocalStack কাজ করে](/bn/basics/architecture/))।

নিজে হেডার দেখতে:

```sh
aws s3 ls --debug 2>&1 | grep -i authorization
```

## ৬. `endpoint_url` override — LocalStack কেন কাজ করে

স্বাভাবিকভাবে CLI service + region থেকে এন্ডপয়েন্ট _হিসাব করে_: `https://s3.eu-west-1.amazonaws.com`। Profile-এর `endpoint_url` শুধু শেষ ধাপটি বদলায়:

```
রিয়েল AWS:   sign(service, region) → https://s3.eu-west-1.amazonaws.com
localstack:   sign(service, region) → http://localhost:4566        ← শুধু এটাই বদলেছে
```

Signing, parsing, retry, SDK আচরণ — সব একই থাকে। "AWS কোথায়" নিছকই বদলানো যায় এমন একটি স্তর। তাই পরে SDK কোড ও Terraform-এ শুধু এন্ডপয়েন্ট বদলালেই চলে।

## ৭. বাস্তবে আরও যা থাকে

- `aws configure` → এই একই ফাইল লেখা ইন্টারঅ্যাক্টিভ উইজার্ড
- IAM user / SSO / role → _রিয়েল_ credential এখান থেকে আসে (LocalStack কিছু যায় আসে না — যেকোনো string চলে)
- `--output json|yaml|table|text` → শুধু উপস্থাপনা

সম্পর্কিত: [AWS CLI ইনস্টল](/bn/getting-started/install-aws-cli/) · [LocalStack চালানো](/bn/getting-started/localstack-compose/)
