---
title: অবজেক্ট মডেল
description: Bucket, key, object, prefix বনাম ফোল্ডার, কনসিস্টেন্সি ও durability — S3-র আসল ডেটা মডেল।
---

S3 অধ্যায়, পর্ব ১।

## কনসেপ্ট

S3-র পুরো ডেটা মডেল এক লাইনে:

```
(bucket, key)  →  bytes + metadata
```

### Bucket

- Bucket হলো সর্বোচ্চ স্তরের container। **নাম সব AWS অ্যাকাউন্ট মিলিয়ে globally unique** — কারণ প্রতিটি bucket-এর একটি DNS নাম হয় (`ph1-bucket.s3.eu-west-1.amazonaws.com`), আর DNS নাম unique হতেই হয়
- Bucket ঠিক এক region-এ থাকে; object-রা থাকে না
- ডিফল্ট সীমা: অ্যাকাউন্টপ্রতি ১০০ bucket (soft limit)। উদ্দেশ্যই হলো কম bucket, _অনেক prefix/key_ — প্রজেক্টপ্রতি bucket নয়

### Object

একটি object হলো:

| অংশ              | তথ্য                                                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------ |
| **Key**          | UTF-8 string, সর্বোচ্চ ১০২৪ byte। Slash নিছক অক্ষর                                                           |
| **Value**        | 0 byte – 5 TB। এক PUT-এ সর্বোচ্চ 5 GB — বড় হলে multipart upload (টুকরো করে parallel আপলোড, S3 জোড়া লাগায়) |
| **Metadata**     | system (`Content-Type`, `Last-Modified`) + user-defined key/value                                            |
| **ETag**         | bytes-এর MD5 — _সাধারণ put_-এ। Multipart বা KMS-encrypted-এ নয়; তখন checksum (CRC32, SHA-256)               |
| **StorageClass** | bytes কোন তাকে রাখা — [পরের অধ্যায়](/bn/s3/03-storage-classes-and-lifecycle/)                               |

### ফোল্ডার বলে কিছু নেই

`docs/notes/today.txt` একটি key। `docs/` বা `docs/notes/` S3 কোনো কিছু সংরক্ষণ করে না — এরা **prefix**। Console-এর ট্রি ভিউ আর CLI-র `PRE` লাইন listing-এর সময় key-র নাম থেকে _হিসাব করা_ হয়।

Listing মেকানিজম: `ListObjectsV2` নেয় `Prefix` (ফিল্টার) ও ঐচ্ছিক `Delimiter` (সাধারণত `/`)। Delimiter দিলে S3 key-গুলোকে পরবর্তী segment অনুযায়ী দলবদ্ধ করে **CommonPrefixes** দেয় — "ফোল্ডার listing"-এর পুরো বাস্তবায়ন এটুকুই। এটি key index-এর ওপর একটি scan — তাই এক prefix-এ লাখো key হলে listing ধীর ও paginated, কিন্তু জানা এক key আনা দ্রুত ও constant-time।

### কনসিস্টেন্সি

S3 সব read/write-এ **strongly consistent** (ডিসেম্বর ২০২০ থেকে): সফল write-এর পর যেকোনো read — listing-সহ — সেই ডেটা দেখে। তার আগে নতুন object eventually দেখা যেত। পুরনো লেখা "eventual consistency" বললে সেগুলো পুরোনো তথ্য।

### Durability বনাম availability — গুলিয়ো না

- **Durability 99.999999999%** ("১১ nines") = বছরে সংরক্ষিত object _হারানোর_ সম্ভাবনা। অর্জিত হয় ≥৩টি পৃথক Availability Zone-এ bytes মিরর করে
- **Availability 99.99%** = এখনই S3-তে _পৌঁছাতে_ পারার সম্ভাবনা — durability-র চেয়ে অনেক কম; S3 ক্ষণিক অ্যাক্সেসযোগ্য না হলেও ডেটা হারায় না
- কোনোটিই **backup নয়**। S3 ডিস্ক/ডেটাসেন্টার failure থেকে বাঁচায়, "ভুল prefix ডিলিট হয়ে গেছে" থেকে নয় — সেটি versioning আর আলাদা backup account

## এক্সপেরিমেন্ট: ফোল্ডার ইলিউশন

আগে অনুমান করো: এই কমান্ডগুলোর পরে bucket-এ কয়টি object আছে?

```sh
export AWS_PROFILE=localstack
aws s3 mb s3://ph1-bucket
echo hello > /tmp/today.txt
aws s3 cp /tmp/today.txt s3://ph1-bucket/docs/notes/today.txt
```

CLI-র ট্রি ভিউ আর raw সত্য পাশাপাশি দেখো:

```sh
aws s3 ls s3://ph1-bucket/
# PRE docs/                       <- হিসাব করা prefix, কোনো জিনিস নয়

aws s3api list-objects-v2 --bucket ph1-bucket
# Contents: [ { Key: "docs/notes/today.txt", ETag: "b1946ac92...", ... } ]
```

একটিই object। `ETag` তোমার ৬ byte-এর MD5 (`hello\n`) — যাচাই করো: `md5 -q /tmp/today.txt`। key শুধু bytes-কে নির্দেশ করে।

দ্বিতীয় দৃষ্টি — ট্রি ভিউয়ের পেছনের যন্ত্র:

```sh
aws s3api list-objects-v2 --bucket ph1-bucket --delimiter '/'
# CommonPrefixes: [ { Prefix: "docs/" } ]        <- "ফোল্ডার" = হিসাব করা দল
aws s3api list-objects-v2 --bucket ph1-bucket --prefix 'docs/' --delimiter '/'
# CommonPrefixes: [ { Prefix: "docs/notes/" } ]
```

## রিয়েল AWS-এ

- রিকোয়েস্ট ও bytes প্রতি বিল হয়: PUT/GET/list প্রতিটিরই দাম আছে। ১০ লাখ key-র "ফোল্ডার ওয়াক" মানে ১০ লাখ billed LIST রিকোয়েস্ট
- Bucket নাম সবাই সাধতে পারে — globally unique নেমস্পেস পৃথিবীর সব AWS গ্রাহকের সাথে শেয়ার্ড
- 5 GB single-PUT সীমার কারণে বাস্তবে সবাই multipart ব্যবহার করে; LocalStack বড় single put নেয়, রিয়েল AWS প্রত্যাখ্যান করবে
