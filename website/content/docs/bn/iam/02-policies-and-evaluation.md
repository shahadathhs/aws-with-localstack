---
title: পলিসি ও evaluation
description: Policy JSON-এর গঠন, evaluation ক্রম, explicit deny, least privilege — AWS আসলে কীভাবে allow/deny সিদ্ধান্ত নেয়।
---

IAM অধ্যায়, পর্ব ২।

## কনসেপ্ট

**Policy** হলো অনুমতির JSON ডকুমেন্ট। IAM-এর প্রতিটি সিদ্ধান্তের উৎস এসব ডকুমেন্ট; অন্য কোনো জাদু নেই।

### গঠন — এক statement, একটি বাক্য হিসেবে

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "ReadTodoPrefix",
      "Effect": "Allow",
      "Action": ["s3:GetObject", "s3:ListBucket"],
      "Resource": ["arn:aws:s3:::ph1-bucket", "arn:aws:s3:::ph1-bucket/todo/*"],
      "Condition": { "IpAddress": { "aws:SourceIp": "203.0.113.0/24" } }
    }
  ]
}
```

- **Effect** — `Allow` বা `Deny`। "হয়তো" নেই
- **Action** — service-prefixed API অপারেশন (`s3:GetObject`, `dynamodb:PutItem`, `sts:AssumeRole`)। Wildcard চলে: `s3:Get*`
- **Resource** — কোন ARN-এ খাটে। কিছু action resourceless (`s3:ListAllMyBuckets`-এ `Resource: "*"`)
- **Condition** — ঐচ্ছিক অতিরিক্ত গেট: source IP, MFA আছে কি না, tag value, encryption context

খেয়াল করো: `s3:ListBucket` টার্গেট _bucket_ ARN, কিন্তু `s3:GetObject` টার্গেট _object_ ARN (`.../todo/*`) — listing আর reading ভিন্ন action, ভিন্ন resource। S3 policy-র ক্লাসিক ফাঁদ এটিই।

### Policy-র স্বাদ — ডকুমেন্ট কোথায় থাকতে পারে

| ধরন                 | লাগানো হয়                                | উদাহরণ                                                            |
| ------------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| Identity policy     | user / role / group                       | "এই ফাংশন bucket X পড়তে পারবে"                                   |
| Resource policy     | resource নিজে (bucket policy, SQS policy) | "account B এই queue-তে পাঠাতে পারবে"                              |
| Permission boundary | user / role (সীমা টানে)                   | "এই role IAM-এ কখনোই হাত দিতে পারবে না"                           |
| SCP                 | পুরো account (organizations)              | কোম্পানি-স্তরের guardrail                                         |
| Trust policy        | role — _কে assume করতে পারে_              | [principals](/bn/iam/01-principals-users-roles/)-এর Lambda উদাহরণ |

### Evaluation — এক ক্রম, কোনো ব্যতিক্রম নেই

প্রতিটি রিকোয়েস্টে AWS principal ও resource — দুজনের খাটু সব policy জমা করে, তারপর:

1. যেকোনো **explicit `Deny`** → **DENY।** শেষ। কিছুই এটিকে টেক্কা দেয় না
2. নাহলে অন্তত একটি **explicit `Allow`** → **ALLOW**
3. নাহলে → **implicit deny** — **DENY** (কোনো ডকুমেন্টই এই action-এর কথা বলেইনি)

তিন শব্দে মুখস্থ: **explicit deny beats allow beats implicit deny।** দৈনন্দিন লাভ হলো ৩ নম্বরে: অনুমতির অনুপস্থিতিই প্রত্যাখ্যান — "চলারই কথা" কোনো policy নয়।

Same-account বনাম cross-account একটি জিনিস বদলায়: cross-account-এ **দুই** পাশে allow লাগে (identity policy _এবং_ resource policy)। Same-account-এ যেকোনো একটিতে।

### Least privilege — ডিজাইনের শৃঙ্খলা

যতটা কাজ করে ততটাই সরু Action তালিকা ও সরু Resource ARN লেখো। `Action: "*", Resource: "*"` মানে দুর্ঘটনা বিপর্যয়ে রূপ নেওয়া। বাস্তবে iterate করো: একটু চওড়া দিয়ে শুরু, **IAM Access Analyzer** policy generation চালু করো (প্রকৃত ব্যবহার দেখে ন্যূনতম policy প্রস্তাব করে), তারপর শক্ত করো।

## এক্সপেরিমেন্ট

LocalStack IAM policy রাখে কিন্তু enforce করে না — এক্সপেরিমেন্ট মানে পড়া, লেখা আর _মাথায় সিমুলেট_:

```sh
export AWS_PROFILE=localstack

aws iam put-user-policy --user-name report-bot --policy-name TodoRead --policy-document '{
  "Version": "2012-10-17",
  "Statement": [{
    "Sid": "ReadTodoPrefix",
    "Effect": "Allow",
    "Action": ["s3:GetObject", "s3:ListBucket"],
    "Resource": ["arn:aws:s3:::ph1-bucket", "arn:aws:s3:::ph1-bucket/todo/*"]
  }]
}'

aws iam list-user-policies --user-name report-bot
aws iam get-user-policy --user-name report-bot --policy-name TodoRead
```

এবার নিজেকে কুইজ (প্রতিটিতে লেখো allow / explicit-deny / implicit-deny):

1. `report-bot` চালায় `s3:GetObject` — `ph1-bucket/todo/a.txt`
2. `report-bot` চালায় `s3:GetObject` — `ph1-bucket/docs/notes/today.txt`
3. `report-bot` চালায় `s3:PutObject` — `ph1-bucket/todo/b.txt`
4. দ্বিতীয় statement যোগ হলো: `Effect: Deny, Action: s3:GetObject, Resource: ph1-bucket/todo/secret/*` — এখন `todo/secret/k.txt`?

উত্তর: ১ allow (statement মেলে) · ২ implicit deny (ListBucket চলে কিন্তু ওই prefix-এর GetObject কোথাও নেই) · ৩ implicit deny (PutObject-এর কথাই নেই) · ৪ explicit deny — allow মিললেও deny জেতে।

## রিয়েল AWS-এ

- আসল denial ডিবাগ: **AWS CloudTrail** (হুবহু রিকোয়েস্ট + সিদ্ধান্ত দেখায়) ও **IAM Policy Simulator** (`aws iam simulate-principal-policy`) — resource ছোঁয়া ছাড়াই কাল্পনিক action মূল্যায়ন করে
- চাকরিতে `AccessDenied` পেলে: _তুমি কে_ (`sts get-caller-identity`), _কোন policy allow করার কথা_, এবং _explicit deny বা SCP override করছে কি না_ — এই তিনটি দেখো
