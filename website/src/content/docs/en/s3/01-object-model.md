---
title: The object model
description: Buckets, keys, objects, prefixes vs folders, consistency, and durability — S3's actual data model.
---

S3 chapter, part 1.

## Concept

S3's entire data model fits in one line:

```
(bucket, key)  →  bytes + metadata
```

### Buckets

- A bucket is the top-level container. **Names are globally unique across all AWS accounts** — not because of a shared database, but because every bucket gets a DNS name (`ph1-bucket.s3.eu-west-1.amazonaws.com`), and DNS names must be unique
- A bucket lives in exactly one region; objects do not
- Default limit: 100 buckets per account (soft — you can request more). You are meant to use few buckets and _many prefixes/keys_, not a bucket per project

### Objects

An object is:

| Part             | Facts                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------- |
| **Key**          | UTF-8 string, up to 1024 bytes. Slashes are just characters                                                                |
| **Value**        | 0 bytes to 5 TB. A single PUT caps at 5 GB — larger needs multipart upload (pieces uploaded in parallel, assembled by S3)  |
| **Metadata**     | system (`Content-Type`, `Last-Modified`) + user-defined key/value pairs                                                    |
| **ETag**         | MD5 of the bytes — _for simple puts_. Not for multipart or KMS-encrypted objects; use checksums (CRC32, SHA-256) for those |
| **StorageClass** | which shelf the bytes live on — [next chapters](/en/s3/03-storage-classes-and-lifecycle/)                                  |

### Folders do not exist

`docs/notes/today.txt` is one key. `docs/` and `docs/notes/` are not things S3 stores — they are **prefixes**. The console's tree view and the CLI's `PRE` lines are computed at listing time from key names.

Listing mechanics worth knowing: `ListObjectsV2` takes a `Prefix` (filter) and an optional `Delimiter` (usually `/`). With a delimiter, S3 groups keys by the next segment and returns **CommonPrefixes** instead of those keys — that is the entire "folder listing" implementation. It is a scan over the key index, which is why listing millions of keys under one prefix is slow and paginated, while fetching one known key is fast and constant-time.

### Consistency

S3 is **strongly consistent** for all reads and writes (since December 2020): after a successful write, any read — including listings — sees that data, from any location. Before that date, new objects were only eventually visible. Old articles still describe eventual consistency; they are outdated.

### Durability vs availability — do not confuse them

- **Durability 99.999999999%** ("11 nines") = the chance a stored object is _lost_ in a year. Achieved by mirroring bytes across ≥3 physically separated Availability Zones
- **Availability 99.99%** = the chance you can _reach_ S3 right now. This is much lower than durability — S3 being briefly unreachable does not lose your data
- Neither is **backup**. S3 protects against disk/datacenter failure, not against "someone deleted the wrong prefix" — versioning and separate backup accounts protect against that

## Experiment: the folder illusion

Predict first: after these commands, how many objects exist?

```sh
export AWS_PROFILE=localstack
aws s3 mb s3://ph1-bucket
echo hello > /tmp/today.txt
aws s3 cp /tmp/today.txt s3://ph1-bucket/docs/notes/today.txt
```

Now look from the CLI's tree view, then the raw truth:

```sh
aws s3 ls s3://ph1-bucket/
# PRE docs/                       <- a computed prefix, not a thing

aws s3api list-objects-v2 --bucket ph1-bucket
# Contents: [ { Key: "docs/notes/today.txt", ETag: "b1946ac92...", ... } ]
```

One object. The `ETag` is the MD5 of your 6 bytes (`hello\n`) — verify: `md5 -q /tmp/today.txt`. The key points at bytes; nothing else was stored.

Second look — the machine behind the tree view:

```sh
aws s3api list-objects-v2 --bucket ph1-bucket --delimiter '/'
# CommonPrefixes: [ { Prefix: "docs/" } ]        <- "folder" = computed group
aws s3api list-objects-v2 --bucket ph1-bucket --prefix 'docs/' --delimiter '/'
# CommonPrefixes: [ { Prefix: "docs/notes/" } ]
```

## On real AWS

- Requests and bytes are billed per bucket: PUT/GET/list requests each cost money, GB-month storage too. A "folder walk" of 1M keys is 1M billed LIST requests
- Bucket names are squat-able — the globally-unique namespace is shared with every AWS customer on earth
- 5 GB single-PUT limit means any real uploader uses multipart; LocalStack accepts large single puts, real AWS will reject them
