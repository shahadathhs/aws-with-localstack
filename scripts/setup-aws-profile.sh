#!/usr/bin/env zsh
# Configures the `localstack` AWS CLI profile — the official way to point the
# AWS CLI at LocalStack without any wrapper:
# https://docs.localstack.cloud/aws/connecting/aws-cli/#configuring-a-custom-profile
set -e

REGION=$(grep -E '^AWS_DEFAULT_REGION=' .env 2>/dev/null | cut -d= -f2)
REGION=${REGION:-eu-west-1}

AWS_DIR="${AWS_CONFIG_DIR:-$HOME/.aws}"
CONFIG_FILE="$AWS_DIR/config"
CRED_FILE="$AWS_DIR/credentials"
mkdir -p "$AWS_DIR"
touch "$CONFIG_FILE" "$CRED_FILE"

if grep -q '^\[profile localstack\]' "$CONFIG_FILE"; then
  echo "==> [profile localstack] already exists in $CONFIG_FILE — skipping"
else
  cat >> "$CONFIG_FILE" <<EOF

[profile localstack]
region=$REGION
output=json
endpoint_url = http://localhost.localstack.cloud:4566
EOF
  echo "==> added [profile localstack] to $CONFIG_FILE"
fi

if grep -q '^\[localstack\]' "$CRED_FILE"; then
  echo "==> [localstack] credentials already exist in $CRED_FILE — skipping"
else
  cat >> "$CRED_FILE" <<EOF

[localstack]
aws_access_key_id=test
aws_secret_access_key=test
EOF
  echo "==> added [localstack] credentials to $CRED_FILE"
fi

echo
echo "Done! Test with:"
echo "  aws --profile localstack s3 ls"
echo "  (or: export AWS_PROFILE=localstack, then plain 'aws ...')"
