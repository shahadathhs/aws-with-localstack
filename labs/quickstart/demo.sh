#!/usr/bin/env bash
# Guided demo: S3 + SQS + DynamoDB on LocalStack
# Requires the `localstack` AWS CLI profile: run `make setup-cli` once.
set -e

CONFIG_FILE="${AWS_CONFIG_DIR:-$HOME/.aws}/config"
if ! grep -q '^\[profile localstack\]' "$CONFIG_FILE" 2>/dev/null; then
  echo "No 'localstack' AWS profile found. Run: make setup-cli"
  exit 1
fi

export AWS_PROFILE=localstack

echo "==> 1. S3: create a bucket and upload a file"
aws s3 mb s3://demo-bucket
echo "hello from LocalStack" > /tmp/demo.txt
aws s3 cp /tmp/demo.txt s3://demo-bucket/hello.txt
echo "-- list objects:"
aws s3 ls s3://demo-bucket
echo

echo "==> 2. SQS: create a queue, send and receive a message"
aws sqs create-queue --queue-name demo-queue
QUEUE_URL=$(aws sqs get-queue-url --queue-name demo-queue --output text --query 'QueueUrl')
aws sqs send-message --queue-url "$QUEUE_URL" --message-body '{"type": "greeting", "text": "hi!"}'
echo "-- receive message:"
aws sqs receive-message --queue-url "$QUEUE_URL" --max-number-of-messages 1
echo
echo

echo "==> 3. DynamoDB: create a table, put and get an item"
aws dynamodb create-table \
  --table-name demo-table \
  --attribute-definitions AttributeName=id,AttributeType=S \
  --key-schema AttributeName=id,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
aws dynamodb put-item \
  --table-name demo-table \
  --item '{"id": {"S": "user-1"}, "name": {"S": "Alice"}}'
echo "-- get item:"
aws dynamodb get-item \
  --table-name demo-table \
  --key '{"id": {"S": "user-1"}}'
echo

echo "==> Done! Inspect everything with:"
echo "    make aws CMD='s3 ls'"
echo "    make aws CMD='sqs list-queues'"
echo "    make aws CMD='dynamodb list-tables'"
