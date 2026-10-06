COMPOSE := docker compose

.PHONY: help up down restart logs status setup-cli aws demo clean site-install site-dev site-build site-lint

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-10s\033[0m %s\n", $$1, $$2}'

up: ## Start LocalStack in the background
	$(COMPOSE) up -d --wait
	@echo "LocalStack ready at http://localhost:4566"

down: ## Stop LocalStack
	$(COMPOSE) down

restart: ## Restart LocalStack
	$(COMPOSE) restart

logs: ## Tail LocalStack logs
	$(COMPOSE) logs -f localstack

status: ## Show service health
	@curl -s http://localhost:4566/_localstack/health | python3 -m json.tool

setup-cli: ## Create the 'localstack' AWS CLI profile in ~/.aws (one-time)
	./scripts/setup-aws-profile.sh

aws: ## Run an AWS CLI command against LocalStack, e.g. make aws CMD="s3 ls"
	@AWS_PROFILE=localstack aws $(CMD)

demo: ## Run a guided S3 + SQS + DynamoDB demo
	./scripts/demo.sh

clean: ## Stop LocalStack and DELETE all data
	$(COMPOSE) down -v
	rm -rf volume .localstack-data

site-install: ## Install docs site dependencies (pnpm)
	pnpm --dir website install

site-dev: ## Run docs site dev server at http://localhost:4321
	pnpm --dir website dev

site-build: ## Build docs site into website/dist
	pnpm --dir website build

site-lint: ## Lint + format-check the docs site (oxlint, eslint, prettier)
	pnpm --dir website lint
