---
title: Docker Compose দিয়ে LocalStack চালানো
description: অফিসিয়াল LocalStack Docker Compose উদাহরণ, পিন করা ভার্সন ও ব্যাখ্যাসহ — গেটওয়ে, docker.sock, হেলথচেক, ট্রাবলশুটিং।
---

অফিসিয়াল রেফারেন্স: <https://docs.localstack.cloud/aws/getting-started/installation/#docker-compose>
আরও দেখুন: [Docker images](https://docs.localstack.cloud/aws/customization/other-installations/docker-images/) · [কনফিগারেশন অপশন](https://docs.localstack.cloud/aws/customization/configuration-options/) · [Auth Token](https://docs.localstack.cloud/aws/getting-started/auth-token/)

## প্রয়োজনীয়তা

Compose প্লাগিনসহ Docker:

- **macOS / Windows**: [Docker Desktop](https://docs.docker.com/desktop/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/) + [Compose প্লাগিন](https://docs.docker.com/compose/install/linux/)

যাচাই:

```sh
docker --version
docker compose version
```

## অফিসিয়াল উদাহরণ

সরাসরি [অফিসিয়াল ডক](https://docs.localstack.cloud/aws/getting-started/installation/#docker-compose) থেকে:

```yaml
services:
  localstack:
    container_name: '${LOCALSTACK_DOCKER_NAME:-localstack-main}'
    image: localstack/localstack
    ports:
      - '127.0.0.1:4566:4566' # LocalStack Gateway
      - '127.0.0.1:4510-4559:4510-4559' # এক্সটার্নাল সার্ভিস পোর্ট রেঞ্জ
      - '127.0.0.1:443:443' # LocalStack HTTPS Gateway
    environment:
      - LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?} # latest-এর জন্য আবশ্যক
      - DEBUG=${DEBUG:-0}
      - PERSISTENCE=${PERSISTENCE:-0}
    volumes:
      - '${LOCALSTACK_VOLUME_DIR:-./volume}:/var/lib/localstack'
      - '/var/run/docker.sock:/var/run/docker.sock'
```

**গুরুত্বপূর্ণ**: `latest` ইমেজ (2026.x) **LocalStack অ্যাকাউন্ট টোকেন চায়** — `${LOCALSTACK_AUTH_TOKEN:?}` টোকেন ছাড়া `docker compose up` ব্যর্থ করে। টোকেন ছাড়া চালু হলে কন্টেইনার কোড 55 দিয়ে বন্ধ হয় ("License activation failed")।

## এই রিপো কী ব্যবহার করে (কেন সামান্য আলাদা)

আমাদের [`compose.yaml`](https://github.com/shahadathhs/aws-with-localstack/blob/main/compose.yaml) অফিসিয়াল স্ট্রাকচার মেনে চলে, **একটি পার্থক্য** ছাড়া:

| পার্থক্য                                          | কারণ                                                                                                                  |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `image: localstack/localstack:2026.9.0` (পিন করা) | এই মুহূর্তে `latest`-এর সমান, কিন্তু পিন করা থাকায় পুরো টিম একই ভার্সন পায়। আপগ্রেড মানে ইচ্ছাকৃতভাবে ট্যাগ বাড়ানো |

বাকি সব — টোকেন (`${LOCALSTACK_AUTH_TOKEN:?}`), পোর্ট, `DEBUG`, `PERSISTENCE`, volumes — হুবহু অফিসিয়াল উদাহরণের মতো। শুধু **একটি হেলথচেক যোগ** করা আছে, যাতে `docker compose up --wait` LocalStack প্রস্তুত না হওয়া পর্যন্ত অপেক্ষা করে।

### টোকেন কীভাবে পাবেন

1. [app.localstack.cloud](https://app.localstack.cloud)-এ ফ্রি অ্যাকাউন্ট খুলুন
2. Auth token কপি করুন (Account → Auth token)
3. `.env`-এ বসান: `LOCALSTACK_AUTH_TOKEN=ls-...`
4. `make up`

## প্রতিটি অংশ কী করে

| সেটিং                  | কেন                                                                                                                |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `4566`                 | একক **গেটওয়ে পোর্ট** — প্রতিটি AWS সার্ভিস API এখানেই সার্ভ হয় (S3, SQS, DynamoDB, Lambda... সব এক এন্ডপয়েন্টে) |
| `4510-4559`            | অতিরিক্ত এন্ডপয়েন্ট বাঁধা সার্ভিসের পোর্ট রেঞ্জ (যেমন Elasticsearch)। সাধারণত দরকার হয় না                        |
| `443`                  | HTTPS গেটওয়ে (ঐচ্ছিক — মেশিনে 443 ব্যস্ত থাকলে বাদ দিন)                                                           |
| `127.0.0.1:` প্রিফিক্স | পোর্ট শুধু **localhost-এ** বাঁধে — এমুলেটর নেটওয়ার্কে expose করবেন না                                             |
| `docker.sock` মাউন্ট   | **Lambda-র জন্য আবশ্যক** — LocalStack ফাংশন চালাতে sibling container চালায়                                        |
| `volume` মাউন্ট        | কন্টেইনারের অভ্যন্তরীণ state (log, cache) — আপনার তৈরি AWS রিসোর্স নয়                                             |

## চালু / যাচাই / বন্ধ

```sh
docker compose up -d --wait        # চালু (হেলথচেকের জন্য অপেক্ষা)
docker ps                          # STATUS-এ "Up ... (healthy)" দেখা যাবে
curl -s localhost:4566/_localstack/health | python3 -m json.tool
docker compose logs -f localstack  # log ফলো
docker compose down                # বন্ধ
docker compose down -v && rm -rf ./volume   # সম্পূর্ণ মুছে ফেলা
```

সার্ভিস প্রথম ব্যবহারের আগে `available`, ব্যবহারের পরে `running` দেখায়।

## ট্রাবলশুটিং

- **কন্টেইনার (55) বন্ধ — "License activation failed"** → ইমেজ `latest`/2026.x কিন্তু `LOCALSTACK_AUTH_TOKEN` নেই। `2026.9.0` পিন করুন বা টোকেন দিন
- **`docker compose up` ব্যর্থ — "LOCALSTACK_AUTH_TOKEN not set"** → অফিসিয়াল `${...:?}` সিনট্যাক্স টোকেন দাবি করছে
- **পোর্ট ব্যস্ত** (4566 বা 443) → ম্যাপিংয়ের বাম পাশ বদলান, বা `443` লাইন বাদ দিন
- **Lambda চালু হয় না** → `/var/run/docker.sock` মাউন্ট অনুপস্থিত
- **`health: starting`-এ আটকে** → প্রথম বুটে ~১৫ সেকেন্ড দিন; না হলে `docker compose logs localstack` দেখুন
