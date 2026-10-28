---
title: Versioning
description: What changes when versioning is enabled — delete markers, restores, noncurrent versions, and why it is a one-way door.
---

S3 chapter, part 2.

## Concept

Without versioning, writing to an existing key **overwrites and destroys** the previous bytes. There is no undo. This surprises nobody until the day it matters.

With versioning on, the model changes: every write creates a new immutable **version** of the object, identified by a `VersionId`. A key becomes a _stack_ of versions.

What each operation means with versioning on:

| Operation              | Without versioning | With versioning                                  |
| ---------------------- | ------------------ | ------------------------------------------------ |
| PUT same key           | replaces bytes     | adds a new version on top                        |
| DELETE key             | bytes gone         | adds a **delete marker** — older versions remain |
| GET key                | returns bytes      | returns the _newest non-deleted_ version         |
| GET with `?versionId=` | n/a                | returns exactly that version                     |

A delete marker is itself a version of the key. Restoring a "deleted" object = deleting the delete marker (which requires versioning credentials/actions), and the old data resurfaces.

Rules and consequences:

- Versioning is a bucket-level switch: `Enabled` / `Suspended` / never-set. **You can never return to never-set** — suspended still keeps versions accumulated while it was enabled
- Every stored version is **billed**. Churning the same key 1000 times with versioning on stores 1000 versions (lifecycle rules can expire noncurrent versions — [storage classes and lifecycle](/en/s3/03-storage-classes-and-lifecycle/))
- MFA Delete exists (requires MFA to permanently delete versions) — rarely used, know it exists

## Experiment

Predict before running: after this sequence, how many versions exist, and what does a plain GET return?

```sh
export AWS_PROFILE=localstack

aws s3api put-bucket-versioning --bucket ph1-bucket \
  --versioning-configuration Status=Enabled

echo v1 > /tmp/f.txt && aws s3 cp /tmp/f.txt s3://ph1-bucket/v/f.txt
echo v2 > /tmp/f.txt && aws s3 cp /tmp/f.txt s3://ph1-bucket/v/f.txt
echo v3 > /tmp/f.txt && aws s3 cp /tmp/f.txt s3://ph1-bucket/v/f.txt

aws s3api list-object-versions --bucket ph1-bucket --prefix v/
```

You should see three `Versions`, newest first (check `IsLatest: true` on the `v3` one), each with its own `VersionId`. Copy the oldest `VersionId` and fetch it explicitly:

```sh
aws s3api get-object --bucket ph1-bucket --key v/f.txt \
  --version-id <OLDEST_VERSION_ID> /tmp/old.txt
cat /tmp/old.txt        # -> v1
```

Time travel achieved. Now the delete:

```sh
aws s3 rm s3://ph1-bucket/v/f.txt
aws s3api list-object-versions --bucket ph1-bucket --prefix v/
```

The key vanished from normal listings, but the output now shows a `DeleteMarkers` entry with `IsLatest: true` — and the three versions still underneath. Restore by deleting the marker (you must address the marker _by version ID_, otherwise DELETE just stacks another marker):

```sh
aws s3api delete-object --bucket ph1-bucket --key v/f.txt \
  --version-id <DELETE_MARKER_VERSION_ID>
aws s3 ls s3://ph1-bucket/v/        # f.txt is back (showing v3)
```

## On real AWS

- Versioning + `aws s3 rm --recursive` is how people receive six-figure S3 bills: nothing is freed, everything became a noncurrent version. Real cleanup needs lifecycle rules for `NoncurrentVersionExpiration`
- Ransomware/anecdote-proofing: versioning + MFA delete + separate account is the standard "S3 as backup target" pattern
- Version IDs are only unique within a key — never treat them as global IDs
