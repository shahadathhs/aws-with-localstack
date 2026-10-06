---
title: Presigned URLs
description: Temporary, credentialed access to private objects — how the signature works, GET and PUT, and what presigned URLs cannot do.
---

S3 chapter, part 4.

## Concept

Default state: bucket private, only credentialed AWS calls allowed. Your web app needs to let users download a report / upload an avatar. Two bad options first:

- Make the bucket public — now _everyone_ has everything, forever
- Proxy bytes through your server — your server pays bandwidth and does zero-value work

The correct tool: a **presigned URL**. It is a normal S3 URL plus a **SigV4 query signature** — the _same signature mechanism_ your CLI uses in headers (see [AWS CLI basics](/basics/aws-cli/)), moved into the query string. It encodes:

- the **action** (GET or PUT, this one key, no listing, no neighbors)
- the **credentials scope** (which access key authorized it)
- the **expiry** (a timestamp; after it, the signature is stale)

S3 verifies the signature on arrival. No credentials in the browser, no bucket public, access self-destructs at the deadline.

Properties to internalize:

- The URL **is** the capability — anyone holding it can act until expiry. Treat it like a password with a timer
- You **cannot revoke** one presigned URL. Mitigations: short expiries, or delete the object/key
- Max expiry: 7 days (SigV4 limit; longer needs temporary-credential workarounds)
- Presigning needs no network call — the CLI/SDK computes it locally from your credentials
- **PUT presigning** is the bigger deal: browsers upload _directly to S3_ (forbidden by CORS otherwise), your server only issues the URL. This is the standard upload architecture

## Experiment

Predict: with the bucket private, will `curl` succeed? For how long?

```sh
export AWS_PROFILE=localstack

# GET — download without credentials
aws s3 presign s3://ph1-bucket/docs/notes/today.txt --expires-in 300
# https://ph1-bucket.s3.eu-west-1.localhost.localstack.cloud:4566/docs/notes/today.txt?X-Amz-Algorithm=...&X-Amz-Expires=300&...

URL="<paste the printed url>"
curl -s "$URL"                 # -> hello
```

Read the query parameters: `X-Amz-Algorithm=AWS4-HMAC-SHA256`, `X-Amz-Credential` (scope: date/region/service), `X-Amz-Date`, `X-Amz-Expires=300`, `X-Amz-Signature`. Then watch it die:

```sh
SHORT=$(aws s3 presign s3://ph1-bucket/docs/notes/today.txt --expires-in 5)
sleep 6 && curl -s "$SHORT"
# <Error><Code>AccessDenied</Code>... Request has expired
```

Now the upload direction — presign a PUT, then push bytes with curl, no AWS CLI involved:

```sh
PUT_URL=$(aws s3 presign s3://ph1-bucket/uploads/report.txt --expires-in 300 2>/dev/null \
  || aws s3api presign 2>/dev/null)
# the s3 presign command only makes GETs; SDKs generate PUTs:
aws s3api presign not-a-real-command 2>/dev/null || true
```

The CLI cannot presign PUT (`aws s3 presign` is GET-only) — SDKs do it. Quick Boto3 one-liner to feel it:

```sh
python3 - <<'EOF'
import boto3
s3 = boto3.client("s3", endpoint_url="http://localhost:4566",
                  aws_access_key_id="test", aws_secret_access_key="test",
                  region_name="eu-west-1")
print(s3.generate_presigned_url("put_object",
      Params={"Bucket": "ph1-bucket", "Key": "uploads/report.txt"}, ExpiresIn=300))
EOF
```

Paste that URL into:

```sh
curl -s -X PUT --upload-file /tmp/x.txt "<PRESIGNED_PUT_URL>"
aws s3 ls s3://ph1-bucket/uploads/     # report.txt is there — uploaded via curl
```

## On real AWS

- Presigned URLs are generated against **real** credentials — their power is capped by that identity's IAM permissions; a presigned URL can never exceed its signer's rights
- For browser uploads, combine with a **CORS configuration** on the bucket (a document saying which origins may PUT) — a frequent "works in curl, blocked in browser" trap; the failure surfaces as a CORS error, not an S3 error
- If you need revocable, audited, expiring shares: that is not presigning — that is STS temporary credentials or an access-grants layer
