---
title: ভার্সনিং
description: ভার্সনিং চালু হলে কী বদলায় — delete marker, restore, noncurrent version এবং এটি কেন one-way door।
---

S3 অধ্যায়, পর্ব ২।

## কনসেপ্ট

Versioning ছাড়া একই key-তে লেখা মানে আগের bytes **উপরে লিখে ধ্বংস**। undo নেই। ক্ষতির দিনটির আগে কেউ খেয়াল করে না।

Versioning চালু থাকলে মডেল বদলায়: প্রতিটি write একটি নতুন অপরিবর্তনীয় **version** তৈরি করে, `VersionId` দিয়ে চিহ্নিত। একটি key হয়ে যায় ভার্সনের _স্তূপ_।

Versioning চালু অবস্থায় প্রতিটি অপারেশনের অর্থ:

| অপারেশন                 | Versioning ছাড়া | Versioning-সহ                                         |
| ----------------------- | ---------------- | ----------------------------------------------------- |
| একই key-তে PUT          | bytes বদলে যায়  | ওপরে নতুন version যোগ হয়                             |
| DELETE key              | bytes শেষ        | একটি **delete marker** বসে — পুরনো version থেকেই যায় |
| GET key                 | bytes দেয়       | _নতুনতম non-deleted_ version দেয়                     |
| `?versionId=` দিয়ে GET | n/a              | ঠিক সেই version দেয়                                  |

Delete marker নিজেও key-র একটি version। "মুছে যাওয়া" object ফিরিয়ে আনা = delete marker ডিলিট করা, তখন পুরনো ডেটা ফিরে আসে।

নিয়ম ও ফল:

- Versioning bucket-স্তরের সুইচ: `Enabled` / `Suspended` / never-set। **কখনোই ফিরে যেতে পারবে না never-set-এ** — suspended অবস্থাতেও enabled থাকাকালীন জমা ভার্সন থেকে যায়
- প্রতিটি সংরক্ষিত version **billed**। একই key ১০০০ বার লেখা = ১০০০ version (lifecycle rule noncurrent version expire করতে পারে — [স্টোরেজ ক্লাস ও লাইফসাইকেল](/bn/s3/03-storage-classes-and-lifecycle/))
- MFA Delete আছে (version স্থায়ীভাবে ডিলিটে MFA লাগে) — বিরল, নামটুকু জানা থাকুক

## এক্সপেরিমেন্ট

আগে অনুমান: এই ক্রমের পর কয়টি version, আর সাধারণ GET কী দেয়?

```sh
export AWS_PROFILE=localstack

aws s3api put-bucket-versioning --bucket ph1-bucket \
  --versioning-configuration Status=Enabled

echo v1 > /tmp/f.txt && aws s3 cp /tmp/f.txt s3://ph1-bucket/v/f.txt
echo v2 > /tmp/f.txt && aws s3 cp /tmp/f.txt s3://ph1-bucket/v/f.txt
echo v3 > /tmp/f.txt && aws s3 cp /tmp/f.txt s3://ph1-bucket/v/f.txt

aws s3api list-object-versions --bucket ph1-bucket --prefix v/
```

তিনটি `Versions` দেখবে, নতুনগুলো আগে (`v3`-এর জন্য `IsLatest: true`), প্রতিটির নিজস্ব `VersionId`। পুরোনোটির ID কপি করে সরাসরি আনো:

```sh
aws s3api get-object --bucket ph1-bucket --key v/f.txt \
  --version-id <OLDEST_VERSION_ID> /tmp/old.txt
cat /tmp/old.txt        # -> v1
```

সময় ভ্রমণ সম্পন্ন। এবার ডিলিট:

```sh
aws s3 rm s3://ph1-bucket/v/f.txt
aws s3api list-object-versions --bucket ph1-bucket --prefix v/
```

সাধারণ listing থেকে key সরে গেছে, কিন্তু আউটপুটে এখন `DeleteMarkers` এন্ট্রি `IsLatest: true`-সহ — নিচে তিনটি version অক্ষত। Restore মানে marker-টি ডিলিট করা (marker-কে _version ID দিয়ে_ টার্গেট করতেই হবে, নাহলে DELETE আরেকটি marker জমায়):

```sh
aws s3api delete-object --bucket ph1-bucket --key v/f.txt \
  --version-id <DELETE_MARKER_VERSION_ID>
aws s3 ls s3://ph1-bucket/v/        # f.txt ফিরে এসেছে (v3 দেখাচ্ছে)
```

## রিয়েল AWS-এ

- Versioning + `aws s3 rm --recursive` মানুষকে ছয় অঙ্কের S3 বিল এনে দেয়: কিছুই মুক্ত হয় না, সব noncurrent version হয়ে যায়। আসল পরিষ্কার করে lifecycle-এর `NoncurrentVersionExpiration`
- Ransomware-প্রমাণ করার স্ট্যান্ডার্ড প্যাটার্ন: versioning + MFA delete + আলাদা account
- Version ID শুধু key-র ভিতরে unique — কখনো গ্লোবাল ID ভাববে না
