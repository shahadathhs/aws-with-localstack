# AWS with LocalStack

A local AWS sandbox: run real AWS APIs (S3, SQS, DynamoDB, Lambda, ...) on your machine via [LocalStack](https://localstack.cloud) — free, no AWS account, no costs.

## Prerequisites

Detailed guides live in [`website/src/content/docs/`](website/src/content/docs/) — the same content powers the [documentation site](https://shahadathhs.github.io/aws-with-localstack/):

- [AWS learning plan](website/src/content/docs/curriculum/learning-plan.md) — the curriculum: phases, concepts, experiments
- [Running LocalStack with Docker Compose](website/src/content/docs/getting-started/localstack-compose.md) — based on the [official example](https://docs.localstack.cloud/aws/getting-started/installation/#docker-compose)
- [Installing the AWS CLI (all platforms)](website/src/content/docs/getting-started/install-aws-cli.md) — official AWS installers only
- [AWS CLI basics](website/src/content/docs/concepts/aws-cli.md) — profiles, config files, request flow, SigV4
- [How LocalStack works](website/src/content/docs/concepts/architecture.md) — gateway, fake account, routing: how the magic works

In short: Docker Desktop running + AWS CLI v2:

```sh
curl -fsSL https://awscli.amazonaws.com/v2/install.sh | bash   # AWS CLI v2
cp .env.example .env                                           # local config (git-ignored)
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

- **Version**: the image is pinned to `localstack/localstack:2026.9.0` (current latest) for reproducibility — bump the tag in `compose.yaml` to upgrade. This version requires a free LocalStack account token (`LOCALSTACK_AUTH_TOKEN` in `.env`, see [compose doc](website/src/content/docs/getting-started/localstack-compose.md#getting-your-token)).
- **Persistence**: resources are kept while the container lives; `make down` + `make up` loses them (persistence across restarts is a Pro feature). `make clean` wipes everything.
- **Default region**: change it in `.env` (`AWS_DEFAULT_REGION`), then re-run `make setup-cli` if the profile already exists.

## Roadmap

Track the full curriculum (concepts + experiments per service) in [`learning-plan.md`](website/src/content/docs/learning-plan.md):

- [x] Phase 0 — LocalStack sandbox + AWS CLI (S3, SQS, DynamoDB)
- [ ] Phase 1 — S3 (deep) + IAM theory
- [ ] Phase 2 — Lambda
- [ ] Phase 3 — API Gateway → Lambda → DynamoDB
- [ ] Phase 4 — SQS (deep) + SNS + EventBridge
- [ ] Phase 5 — CloudWatch + Secrets Manager
- [ ] Phase 6 — Terraform
- [ ] Phase 7 — Real AWS (free tier)
