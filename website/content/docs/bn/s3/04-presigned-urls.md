---
title: Presigned URL
description: প্রাইভেট object-এ সাময়িক, credentialed অ্যাক্সেস — সিগনেচারে কী থাকে, GET ও PUT, এবং presigned URL যা পারে না।
---

S3 অধ্যায়, পর্ব ৪।

## কনসেপ্ট

ডিফল্ট অবস্থা: bucket প্রাইভেট, শুধু credentialed AWS call চলে। তোমার ওয়েব অ্যাপ ইউজারকে রিপোর্ট ডাউনলোড / avatar আপলোড করাতে চায়। আগে দুটি খারাপ পথ:

- Bucket public করা — এখন _সবাই_ সবকিছু, চিরকালের জন্য
- Bytes তোমার সার্ভার দিয়ে proxy করা — সার্ভার bandwidth-ও দেয়, দামী কোনো কাজও করে না

সঠিক হাতিয়ার: **presigned URL**। এটি সাধারণ S3 URL + **SigV4 query signature** — CLI যে সিগনেচার headers-এ পাঠায় ([AWS CLI বেসিক](/bn/basics/aws-cli/)), একইটি query string-এ সরানো:

- **অ্যাকশন** (GET বা PUT, শুধু এই key — listing নেই, প্রতিবেশী নেই)
- **credential scope** (কোন access key এটি অনুমোদন করেছে)
- **expiry** (টাইমস্ট্যাম্প; পার হলে সিগনেচার বাসি)

S3 পৌঁছে-ই সিগনেচার যাচাই করে। ব্রাউজারে credential নেই, bucket public নয়, অ্যাক্সেস সময়সীমায় নিজেই মরে।

মেনে নেওয়া বৈশিষ্ট্য:

- URL **নিজেই** capability — যার হাতে আছে সে-ই কাজ করাতে পারে expiry পর্যন্ত। টাইমারযুক্ত password-এর মতো ব্যবহার করো
- একটি presigned URL **revoked করা যায় না**। প্রতিকার: ছোট expiry, বা object/key ডিলিট
- সর্বোচ্চ expiry: ৭ দিন (SigV4 সীমা; দীর্ঘ হলে temporary-credential workaround)
- Presign কোনো নেটওয়ার্ক call নয় — CLI/SDK তোমার credential থেকে স্থানীয়ভাবেই হিসাব করে
- **PUT presign** আরও বড় অস্ত্র: ব্রাউজার _সরাসরি S3-তে_ আপলোড করে (CORS ছাড়া নিষিদ্ধ), সার্ভার শুধু URL ইস্যু করে। এটিই স্ট্যান্ডার্ড আপলোড আর্কিটেকচার

## এক্সপেরিমেন্ট

অনুমান: bucket প্রাইভেট থেকে `curl` কি সফল হবে? কতক্ষণ?

```sh
export AWS_PROFILE=localstack

# GET — credential ছাড়া ডাউনলোড
aws s3 presign s3://ph1-bucket/docs/notes/today.txt --expires-in 300
# https://ph1-bucket.s3.eu-west-1.localhost.localstack.cloud:4566/...?X-Amz-Algorithm=...&X-Amz-Expires=300&...

URL="<ছাপানো url বসাও>"
curl -s "$URL"                 # -> hello
```

Query parameter পড়ো: `X-Amz-Algorithm=AWS4-HMAC-SHA256`, `X-Amz-Credential` (scope: date/region/service), `X-Amz-Date`, `X-Amz-Expires=300`, `X-Amz-Signature`। এবার মৃত্যু দেখো:

```sh
SHORT=$(aws s3 presign s3://ph1-bucket/docs/notes/today.txt --expires-in 5)
sleep 6 && curl -s "$SHORT"
# <Error><Code>AccessDenied</Code>... Request has expired
```

এবার আপলোড দিক — PUT presign করে curl দিয়ে bytes ঠেলো, AWS CLI ছাড়া:

```sh
# CLI শুধু GET presign করে; SDK-রা PUT করে। Boto3 দিয়ে:
python3 - <<'EOF'
import boto3
s3 = boto3.client("s3", endpoint_url="http://localhost:4566",
                  aws_access_key_id="test", aws_secret_access_key="test",
                  region_name="eu-west-1")
print(s3.generate_presigned_url("put_object",
      Params={"Bucket": "ph1-bucket", "Key": "uploads/report.txt"}, ExpiresIn=300))
EOF
```

URL-টি এখানে বসাও:

```sh
curl -s -X PUT --upload-file /tmp/x.txt "<PRESIGNED_PUT_URL>"
aws s3 ls s3://ph1-bucket/uploads/     # report.txt আছে — curl দিয়েই আপলোড হয়েছে
```

## রিয়েল AWS-এ

- Presigned URL **আসল** credential-এর বিরুদ্ধে তৈরি হয় — ক্ষমতা সেই identity-র IAM অনুমতির মধ্যে সীমাবদ্ধ; presigned URL কখনো signer-ের অধিকার ছাড়িয়ে যেতে পারে না
- ব্রাউজার আপলোডে bucket-এ **CORS configuration** লাগবেই (কোন origin PUT করতে পারে তার ডকুমেন্ট) — "curl-এ চলে, ব্রাউজারে ব্লক" ঘটনার আসল কারণ; ত্রুটি S3-এর নয়, CORS-এর নামে আসে
- Revocable, audited, expiring শেয়ার দরকার হলে সেটি presigning নয় — STS temporary credential বা access-grants স্তর
