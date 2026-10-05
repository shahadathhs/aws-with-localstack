# AWS with LocalStack

A local AWS sandbox: run real AWS APIs (S3, SQS, DynamoDB, Lambda, ...) on your machine via [LocalStack](https://localstack.cloud) — free, no AWS account, no costs.

## Prerequisites

Detailed setup guides live in [`docs/`](docs/):

- [Running LocalStack with Docker Compose](docs/localstack-docker-compose.md) — based on the [official example](https://docs.localstack.cloud/aws/getting-started/installation/#docker-compose)
- [Installing the AWS CLI (all platforms)](docs/aws-cli-install.md) — official AWS installers only

In short: Docker Desktop running + AWS CLI v2:

```sh
curl -fsSL https://awscli.amazonaws.com/v2/install.sh | bash   # AWS CLI v2
```

## Quick start

```sh
make up          # start LocalStack at http://localhost:4566
make setup-cli   # one-time: create the 'localstack' AWS CLI profile in ~/.aws
make demo        # guided demo: S3 + SQS + DynamoDB
make help        # all commands
```

## Everyday commands

| Command | What it does |
|---|---|
| `make up` | Start LocalStack in the background |
| `make down` | Stop it |
| `make logs` | Tail LocalStack logs |
| `make status` | Show which services are available |
| `make setup-cli` | One-time: write the `localstack` AWS profile into `~/.aws` |
| `make aws CMD='s3 ls'` | Run any AWS CLI command against LocalStack |
| `make clean` | Stop and **delete all data** |

## Using the AWS CLI

No wrapper needed — a plain AWS CLI profile points `aws` at LocalStack ([official approach](https://docs.localstack.cloud/aws/connecting/aws-cli/#configuring-a-custom-profile)):

```sh
aws --profile localstack s3 mb s3://my-bucket
aws --profile localstack s3 cp file.txt s3://my-bucket/
aws --profile localstack sqs create-queue --queue-name my-queue
aws --profile localstack dynamodb list-tables
```

Or drop the flag with `export AWS_PROFILE=localstack` (in another terminal: `make aws CMD='...'` does this for you).

Equivalent without a profile (e.g. for SDKs):

- **Endpoint**: `http://localhost:4566`
- **Region**: `eu-west-1` (see `.env`)
- **Credentials**: any values work, e.g. `test` / `test`

> The old `awslocal` pip wrapper is deprecated by LocalStack — the profile approach replaces it.

## Notes

- **Version pinning**: the image is pinned to `localstack/localstack:4.9.0` because newer releases (2026.x) require an auth token even for community use. See the [compose doc](docs/localstack-docker-compose.md#what-this-repo-uses-and-why-it-differs-slightly) for the exact difference vs the official example and how to switch.
- **Persistence**: resources are kept while the container lives; `make down` + `make up` loses them (persistence across restarts is a Pro feature). `make clean` wipes everything.
- **Default region**: change it in `.env` (`AWS_DEFAULT_REGION`), then re-run `make setup-cli` if the profile already exists.

## Roadmap

- [x] LocalStack sandbox (S3, SQS, DynamoDB, ...)
- [ ] Terraform against LocalStack (`terraform` + local provider endpoints)
- [ ] App code (SDK) talking to LocalStack in dev
