---
title: সিকিউরিটি ও এনক্রিপশন
description: Bucket policy, public-access block, এবং at-rest/in-transit এনক্রিপশন — S3-র অ্যাক্সেস নিয়ন্ত্রণ ও ডেটা সুরক্ষা কোথায় কোথায় বসে।
---

S3 অধ্যায়, পর্ব ৫।

## কনসেপ্ট

### Bucket-এ কে হাত দিতে পারে — স্তরে স্তরে গেট

Object-এ অ্যাক্সেস কয়েকটি স্বাধীন গেট পার হয়; **সবগুলোকেই হ্যাঁ বলতে হয়**:

1. **Public access block** (account ও bucket স্তরে) — চারটি মাস্টার সুইচ, নিচের সবকিছুকে override করে যেকোনো "public-ঘেঁষা" কনফিগ আটকায়। নতুন bucket-এ ডিফল্ট চালু। দুর্ঘটনাজনিত exposure-এর বেশিরভাগ ঘটনা এই ব্লক বন্ধ থাকার ফল
2. **Bucket policy** — bucket-এ লাগানো JSON ডকুমেন্ট (resource-based; bucket-এর সাথেই থাকে)
3. **IAM policy** — রিকোয়েস্টকারী identity-তে লাগানো (identity-based)
4. **ACL** — পুরোনো মেকানিজম, ডিফল্টে বন্ধ; আছে জানো থাকুক, ব্যবহার করবে না

একই account-এর অ্যাক্সেসে: bucket policy _অথবা_ IAM policy — যেকোনো একটিতে Allow থাকলেই চলে (কোথাও explicit deny না থাকলে)। Cross-account-এ: **দুই** পাশেই Allow লাগে। পূর্ণ evaluation যুক্তি IAM-এর জায়গা — [পলিসি ও evaluation](/bn/iam/02-policies-and-evaluation/)।

Bucket policy পড়া একটি ভাষা-দক্ষতা। এই বাক্য — _নিরনাম্য ইন্টারনেট ব্যবহারকারীরা `public/`-এর সব object GET করতে পারবে_ — JSON-এ যেমন দাঁড়ায়:

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

নিখুঁতি লক্ষ্য করো: `Principal: *` (সবাই), শুধু `GetObject` (Put নয়, Delete নয়), শুধু `public/*` (পুরো bucket নয়)। S3-এ static website ঠিক এই policy-ই — আর কিছু জাদু নেই।

### এনক্রিপশন

**Transit-এ:** HTTPS। Bucket policy-তে `aws:SecureTransport: false → deny` ঘোষণা করলে প্রতিটি রিকোয়েস্টে TLS বাধ্যতামূলক হয়।

**At rest:** প্রতিটি object ডিফল্টেই encrypted (জানুয়ারি ২০২৩ থেকে unencrypted অবস্থা নেইই)। ধরন:

| মোড                     | key কার হাতে                                       | কখন গুরুত্বপূর্ণ                                                          |
| ----------------------- | -------------------------------------------------- | ------------------------------------------------------------------------- |
| **SSE-S3** (`AES256`)   | S3 সব সামলায়                                      | ডিফল্ট; বেশিরভাগ ডেটার জন্য যথেষ্ট                                        |
| **SSE-KMS** (`aws:kms`) | AWS KMS key; প্রতি অ্যাক্সেস logged ও permissioned | regulated ডেটা; প্রতি read-এ audit trail; KMS রিকোয়েস্ট খরচ + rate limit |
| **SSE-C**               | _তুমি_ প্রতি রিকোয়েস্টে key দাও                   | বিরল; S3 কখনো key রাখে না                                                 |

মেন্টাল মডেল: at-rest এনক্রিপশন raw ডিস্ক চুরি থেকে বাঁচায়; **access control** (উপরের গেট) বাকি সবাই থেকে বাঁচায়। এনক্রিপশন কখনো IAM-এর বিকল্প নয়।

## এক্সপেরিমেন্ট

LocalStack কনফিগ সংরক্ষণ করে কিন্তু **enforce করে না** — প্রশিক্ষিত দক্ষতা হলো ডকুমেন্ট পড়া ও লেখা।

স্ট্যান্ডার্ড হার্ডেনিং (চার সুইচ), তারপর শুধু `public/`-এ সবার কাছে read-only policy:

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
# (policy URL-encoded ফেরে — দেখতে: | python3 -c 'import sys,json,urllib.parse; print(json.dumps(json.loads(urllib.parse.unquote(json.load(sys.stdin)["Policy"])), indent=2))')
```

রিয়েল AWS-এ `BlockPublicPolicy=true` অবস্থায় `Principal: "*"`-যুক্ত policy put করলে **সরাসরি প্রত্যাখ্যাত** হয় — block সুইচ public policy সংরক্ষণের আগেই ভেটো দেয়। এই স্তরের সুরক্ষা কাজ করছে বোঝার জায়গাটি এখানেই; LocalStack তা দেখাবে না।

## রিয়েল AWS-এ

- চাকরিতে যে [Security Hub / Access Analyzer finding](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) দেখবে তার বেশিরভাগই "public access block disabled" বা "policy allows *" — দুটোই এখন পড়তে পারো
- SSE-KMS audit মূল্য যোগ করে (প্রতিটি decrypt CloudTrail-এ) কিন্তু প্রতি read-এ একটি KMS API call: latency, খরচ, throughput limit
- নিজেকে পরীক্ষা করো: block চালু থাকলে কোন গেট `Principal: "*"`-policy আটকায়? IAM policy-তে `s3:*` থাকা user-কে `financials/` prefix থেকে কে আটকায়? (উত্তর: block টি policy-তে ভেটো দেয়; দ্বিতীয়টিতে কেউ না — দরকার explicit deny বা আলাদা prefix ডিজাইন।)
