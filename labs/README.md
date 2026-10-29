# Labs

Runnable experiments that go with the lessons. Each lab is a folder of scripts you run against LocalStack (`make up` first).

| Lab | What it does | Run |
| --- | --- | --- |
| [quickstart](quickstart/) | Guided S3 + SQS + DynamoDB demo | `make demo` |
| [terraform](terraform/) | Working directory for the Terraform lessons (Terraform runs in Docker) | `make tf CMD="plan"` |

Add a folder per service (`labs/s3`, `labs/lambda`, ...) as the [learning plan](../website/content/docs/en/learning-plan.md) phases are completed.
