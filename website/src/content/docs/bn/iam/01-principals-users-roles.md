---
title: Principal, user, role
description: IAM-এর চরিত্রতালিকা — root, user, group, role — এবং কেন temporary credential প্রায় সবসময় long-lived key-কে হারায়।
---

IAM অধ্যায়, পর্ব ১।

## কনসেপ্ট

IAM প্রতিটি API call-এর জন্য একটি প্রশ্নের উত্তর দেয়: **কে জিজ্ঞেস করছে, এবং তার অনুমতি আছে?** তার "কে" হলো **principal**। Principal-এর ধরন:

| Principal              | এটি কী                                          | Credential                                                       |
| ---------------------- | ----------------------------------------------- | ---------------------------------------------------------------- |
| **Root user**          | অ্যাকাউন্টের মালিক — god mode                   | email + password + MFA; শুধু জরুরির জন্য রাখা উচিত               |
| **IAM user**           | এক মানুষ বা এক মেশিনের নামকৃত identity          | **long-lived**: access key জোড়া, ঘোরানো না হলে কখনোই মরে না     |
| **IAM role**           | assume করা যায় এমন identity — মানুষ নয়, পোশাক | **temporary**: STS মেয়াদি credential দেয় (১৫ মিনিট – ১২ ঘণ্টা) |
| **Federated identity** | বাইরের IdP-র (Google, কোম্পানি SSO) মানুষ       | temporary, একটি role-এর মাধ্যমে                                  |

### User বনাম role — সবচেয়ে গুরুত্বপূর্ণ পার্থক্য

IAM **user** স্থায়ী identity, স্থায়ী key সহ। Key যেখানেই যায় (laptop, CI variable, code repo) সেখানেই মেয়াদহীন ঝুঁকির বাসা — চুরি হলে মেয়াদ শেষ হয় না। AWS-এর নিজস্ব incident postmortem-ই ভরা ফাঁস হয়ে যাওয়া user key-তে।

**Role** এমন identity যাতে _কেউ লগইন করে না_। বিশ্বস্ত principal-রা এটি **assume** করে — Security Token Service (STS) হ্যান্ডশেক করে ("এই role-এর _trust policy_ বলে তুমি বিশ্বস্ত — প্রমাণ করো") এবং **temporary credential** ফেরত দেয় যা নিজেই মেয়াদোত্তীর্ণ হয়। Key চুরি হলো? ঘণ্টা শেষে সেটি আগেই মৃত।

Role বাস্তবে কোথায় থাকে:

- **Lambda ফাংশনের একটি role থাকে** — কোড সেই role-এর অনুমতিতে চলে, কোডে কোনো key নেই
- **EC2 instance-এর role থাকে** — instance metadata endpoint ঘূর্ণায়মান credential মেশিনকে সার্ভ করে
- **তুমি** account-এ কাজ করতে role assume করো (`aws sts assume-role`), সাধারণত SSO-র মাধ্যমে

Group মানেই user-দের সংগ্রহ, policy স্কেলে লাগানোর হাতিয়ার — role group-এর সদস্য হয় না।

### শিল্প মিলে যে নিয়মে পৌঁছেছে

> মানুষ ও মেশিন **role + temporary credential** পাবে। Long-lived IAM user key exception, এবং লিখিত যুক্তি ও ঘূর্ণন (rotation) বাধ্যতামূলক।

## LocalStack-এ

LocalStack যেকোনো credential নেয় (`test`/`test`) এবং ডিফল্টে আসল STS token বানায় না — enforcement নেই। IAM API নিজে চলে; actor-রা বানিয়ে _তাদের JSON পড়ো_, কারণ IAM JSON পড়তে পারাই স্থানান্তরযোগ্য দক্ষতা:

```sh
export AWS_PROFILE=localstack

aws iam create-user --user-name report-bot
aws iam create-role --role-name report-reader --assume-role-policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Effect": "Allow",
    "Principal": { "Service": "lambda.amazonaws.com" },
    "Action": "sts:AssumeRole"
  }]
}'
```

Trust policy-টি গদ্যে পড়ো: _Lambda service এই role assume করতে পারে।_ ভবিষ্যতে কোনো Lambda ফাংশন `report-reader` "হয়ে" চলার অনুমতি ঠিক এই বাক্যটিই দেয়। অন্য কেউ — EC2 না, user না — assume করতে পারে না।

## রিয়েল AWS-এ

- অ্যাকাউন্টের আসল সুরক্ষা **root user** থেকে শুরু: MFA চালু, access key নেই, বছরে গুনে রাখার মতো ব্যবহার — দৈনন্দিন সব কাজ তার নিচের IAM user/role দিয়ে
- বাস্তবে মানুষের জন্য IAM user-ই হয় না — **IAM Identity Center (SSO)** কোম্পানির লগইনকে role-এ federate করে
- `aws sts get-caller-identity`-তে হাত পাকাও — _তুমি এই মুহূর্তে কে_ বলে দেয়, আর "AccessDenied" ডিবাগিংয়ের অর্ধেক যাত্রা এখান থেকেই শুরু
