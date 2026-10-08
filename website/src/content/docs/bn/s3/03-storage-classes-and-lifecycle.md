---
title: স্টোরেজ ক্লাস ও লাইফসাইকেল
description: S3-র তাকগুলো — Standard থেকে Deep Archive — retrieval অর্থনীতি, এবং lifecycle rule যা নিজেই ডেটা সরায়।
---

S3 অধ্যায়, পর্ব ৩।

## কনসেপ্ট

প্রতিটি object `StorageClass` বহন করে — bytes কোন _তাকে_ আছে। API সব ক্লাসে এক; বদলায় অর্থের হিসাব: প্রতি GB-মাসে দাম, প্রতি রিকোয়েস্টে দাম, আর ডেটা ফেরত আনতে কী লাগে (টাকা বা সময়)।

| ক্লাস                          | অ্যাক্সেস প্যাটার্ন  | GB-স্টোরেজ            | Retrieval        | নোট                                                   |
| ------------------------------ | -------------------- | --------------------- | ---------------- | ----------------------------------------------------- |
| **Standard**                   | hot, ঘন ঘন           | সর্বোচ্চ              | ফ্রি, instant    | ডিফল্ট                                                |
| **Standard-IA**                | মাসে-মাসে            | Standard-এর ~অর্ধেক   | প্রতি GB ফি      | ৩০ দিনের ন্যূনতম বিল                                  |
| **One Zone-IA**                | IA-র মতো, ঝুঁকি সহ্য | IA-র চেয়ে সস্তা      | প্রতি GB ফি      | এক AZ-এই থাকে — zone event-এ হারাতে পারে              |
| **Glacier Instant Retrieval**  | ত্রৈমাসিক            | সবচেয়ে সস্তা instant | সর্বোচ্চ GB ফি   | তবুও millisecond GET                                  |
| **Glacier Flexible Retrieval** | বিরল (বছরে ১×)       | খুব সস্তা             | মিনিট–ঘণ্টা, ফি  | "restore" job তারপর ডাউনলোড                           |
| **Glacier Deep Archive**       | compliance/শেষ ভরসা  | সবচেয়ে সস্তা         | ৪৮ ঘণ্টা পর্যন্ত | ১৮০ দিনের ন্যূনতম                                     |
| **Intelligent-Tiering**        | অজানা/বদলানো         | Standard স্তরের       | ফ্রি             | object auto-সরায়; প্রতি object সামান্য monitoring ফি |

দুটি অর্থনৈতিক ফাঁদ মুখস্থ করো:

1. **ন্যূনতম স্টোরেজ মেয়াদ** — IA object ৫ দিনে ডিলিট করলেও বিল হয় ৩০ দিনের। Deep Archive-এর ন্যূনতম ১৮০ দিন
2. **Retrieval প্রতি GB** — পেটাবাইট সস্তায় archive করো, একবার সব পড়তে গেলে retrieval ফি মাসের স্টোরেজ স্যাভিংসকে হার মানায়

### Lifecycle rule — অটোমেশন স্তর

Object হাতে সরানো হয় না। **Lifecycle configuration** হলো bucket-স্তরের JSON, S3 নিজেই প্রতিদিন মূল্যায়ন করে:

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

গদ্যে পড়ো: _`logs/` দিয়ে শুরু হওয়া key — ৩০ দিন পরে Standard-IA, ১৮০ পরে Glacier IR, ৩৬৫ পরে সম্পূর্ণ ডিলিট।_

Rule আরও করতে পারে:

- **noncurrent version** expire করা ([versioning](/bn/s3/02-versioning/)-এর বিলের প্রতিষেধক): `NoncurrentVersionExpiration: { NoncurrentDays: 30 }`
- `AbortIncompleteMultipartUpload` — প্রতিটি bucket-এ রাখার মতো, orphan multipart ধ্বংসাবশেষ পরিষ্কার করে

দুটি rule একই object-এ লাগলে S3 যেটি স্টোরেজে **সবচেয়ে সস্তা/ফ্রি** সেটি প্রয়োগ করে। Transition শুধু _নিচের_ দিকে: Standard→IA→Glacier — lifecycle "un-archive" করতে পারে না।

## এক্সপেরিমেন্ট

অনুমান: transition কি সঙ্গে সঙ্গে হয়? rule `logs/`-এর বাইরের object-দের কী করে?

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

Rule পড়ে ফিল্টারের সীমা নিশ্চিত করো। তারপর object-এর বর্তমান ক্লাস দেখো:

```sh
echo data > /tmp/x.txt
aws s3 cp /tmp/x.txt s3://ph1-bucket/logs/x.txt
aws s3api head-object --bucket ph1-bucket --key logs/x.txt --query StorageClass
# -> "STANDARD"      <- transition দৈনিক মূল্যায়ন হয়; শূন্য দিনে কিছু সরে না
```

LocalStack কনফিগ রাখে ও সার্ভ করে, কিন্তু **সময় প্রবাহিত করে না** — শেখার বিষয় হলো rule মডেল: prefix ফিল্টার, দিনের সীমা, আর object-এর `StorageClass`-ই বদলানো জিনিস।

## রিয়েল AWS-এ

- দাম: [aws.amazon.com/s3/pricing](https://aws.amazon.com/s3/pricing/) — এক region-এর Standard vs IA vs Glacier-IR কলাম পড়ে retrieval-ফি প্যাটার্নটা চোখে বসাও
- অজানা access pattern-এর data lake-এ **Intelligent-Tiering** ডিফল্ট সুপারিশ; লাখো ছোট object-এ monitoring ফি-র কারণে অনুপযুক্ত
- প্রতিটি ডিজাইন রিভিউ-র প্রশ্ন: "এই ডেটা কে পড়ে, কত ঘন ঘন, ভুল হলে কে দাম দেয়?"
