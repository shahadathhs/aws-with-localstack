---
title: Running LocalStack with Docker Compose
description: The official LocalStack Docker Compose example, pinned and explained — gateway, docker.sock, healthchecks, troubleshooting.
---

Official reference: <https://docs.localstack.cloud/aws/getting-started/installation/#docker-compose>

> Also useful: [Docker images](https://docs.localstack.cloud/aws/customization/other-installations/docker-images/) · [Configuration options](https://docs.localstack.cloud/aws/customization/configuration-options/) · [Auth Token](https://docs.localstack.cloud/aws/getting-started/auth-token/)

## Prerequisites

Docker with the Compose plugin:

- **macOS / Windows**: [Docker Desktop](https://docs.docker.com/desktop/)
- **Linux**: [Docker Engine](https://docs.docker.com/engine/install/) + [Compose plugin](https://docs.docker.com/compose/install/linux/)

Check with:

```sh
docker --version
docker compose version
```

## The official example

Straight from the [official docs](https://docs.localstack.cloud/aws/getting-started/installation/#docker-compose):

```yaml
services:
  localstack:
    container_name: '${LOCALSTACK_DOCKER_NAME:-localstack-main}'
    image: localstack/localstack
    ports:
      - '127.0.0.1:4566:4566' # LocalStack Gateway
      - '127.0.0.1:4510-4559:4510-4559' # external services port range
      - '127.0.0.1:443:443' # LocalStack HTTPS Gateway
    environment:
      - LOCALSTACK_AUTH_TOKEN=${LOCALSTACK_AUTH_TOKEN:?} # required by latest
      - DEBUG=${DEBUG:-0}
      - PERSISTENCE=${PERSISTENCE:-0}
    volumes:
      - '${LOCALSTACK_VOLUME_DIR:-./volume}:/var/lib/localstack'
      - '/var/run/docker.sock:/var/run/docker.sock'
```

**Important**: the `latest` image (2026.x) **requires a LocalStack account token** — `${LOCALSTACK_AUTH_TOKEN:?}` makes `docker compose up` fail without one. It exits with code 55 ("License activation failed") otherwise.

## What this repo uses (and why it differs slightly)

Our [`compose.yaml`](https://github.com/shahadathhs/aws-with-localstack/blob/main/compose.yaml) is the official example with **one deviation**:

| Deviation                                        | Reason                                                                                                                |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| `image: localstack/localstack:2026.9.0` (pinned) | Same as `latest` right now, but pinned so the whole team gets the same version. Bump the tag deliberately to upgrade. |

Everything else — required token (`${LOCALSTACK_AUTH_TOKEN:?}`), ports, `DEBUG`, `PERSISTENCE`, volumes — matches the official example exactly. We only **add** a healthcheck so `docker compose up --wait` blocks until LocalStack is ready.

### Getting your token

1. Create a free account at [app.localstack.cloud](https://app.localstack.cloud)
2. Copy your auth token (Account → Auth token)
3. Put it in `.env`: `LOCALSTACK_AUTH_TOKEN=ls-...`
4. `make up`

## What each part does

| Setting             | Why                                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| `4566`              | The single **gateway port** — every AWS service API is served here (S3, SQS, DynamoDB, Lambda, ... all on one endpoint) |
| `4510-4559`         | Port range for services that bind extra endpoints (e.g. Elasticsearch). Rarely needed.                                  |
| `443`               | HTTPS gateway (optional — remove if port 443 is taken on your machine)                                                  |
| `127.0.0.1:` prefix | Binds the port to **localhost only** — don't expose your emulator to the network                                        |
| `docker.sock` mount | **Required for Lambda** — LocalStack spins up sibling containers to execute your functions                              |
| `volume` mount      | Container-internal state (logs, cache), not your created AWS resources                                                  |

## Start / verify / stop

```sh
docker compose up -d --wait        # start (waits for the healthcheck)
docker ps                          # STATUS should show "Up ... (healthy)"
curl -s localhost:4566/_localstack/health | python3 -m json.tool
docker compose logs -f localstack  # tail logs
docker compose down                # stop
docker compose down -v && rm -rf ./volume   # full wipe
```

Services report `available` until first use, then `running`.

## Troubleshooting

- **Container exits (55) with "License activation failed"** → the image is `latest`/2026.x without `LOCALSTACK_AUTH_TOKEN`. Either pin `4.9.0` or provide a token.
- **`docker compose up` fails with "LOCALSTACK_AUTH_TOKEN not set"** → that's the official `${...:?}` syntax demanding a token; our version defaults it to empty instead.
- **Port already in use** (4566 or 443) → change the left side of the mapping, or drop the `443` line.
- **Lambda fails to start** → the `/var/run/docker.sock` mount is missing.
- **Startup stuck on `health: starting`** → give it ~15s on first boot; then check `docker compose logs localstack`.
