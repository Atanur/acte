#!/usr/bin/env make
# ─────────────────────────────────────────────────────────
# Makefile – Acte Monorepo
# ─────────────────────────────────────────────────────────
# Quick reference for common commands.
# Usage: make <target>
# ─────────────────────────────────────────────────────────

.DEFAULT_GOAL := help

# ── Development ──────────────────────────────────────────

.PHONY: dev
dev:           ## Start all dev servers (Turborepo)
	bun run dev

.PHONY: build
build:         ## Build all packages & apps
	bun run build

.PHONY: test
test:          ## Run all tests
	bun run test

.PHONY: lint
lint:          ## Lint all projects (Biome)
	bun run lint

.PHONY: lint-fix
lint-fix:      ## Auto-fix lint issues
	bun run lint:fix

.PHONY: format
format:        ## Format all source files (Biome)
	bun run format

.PHONY: clean
clean:         ## Remove build artifacts
	bun run clean

.PHONY: typecheck
typecheck:     ## Run TypeScript type checking across all packages
	bun run check-types

# ── Setup ─────────────────────────────────────────────────

.PHONY: setup
setup:         ## Install dependencies and start Docker services
	bun install && make db-up

# ── Database (Docker) ─────────────────────────────────────

.PHONY: db-up
db-up:         ## Start PostgreSQL & Redis via Docker Compose
	docker compose -f docker/docker-compose.yml up -d

.PHONY: db-down
db-down:       ## Stop Docker services
	docker compose -f docker/docker-compose.yml down

.PHONY: db-reset
db-reset:      ## Wipe volumes and restart Docker services
	docker compose -f docker/docker-compose.yml down -v && docker compose -f docker/docker-compose.yml up -d

# ── Database (Drizzle) ────────────────────────────────────

.PHONY: db-migrate
db-migrate:    ## Run database migrations
	cd packages/db && bun run db:migrate

.PHONY: db-generate
db-generate:   ## Generate Drizzle schema / migrations
	cd packages/db && bun run db:generate

.PHONY: db-studio
db-studio:     ## Open Drizzle Studio (DB GUI)
	cd packages/db && bun run db:studio

.PHONY: db-seed
db-seed:       ## Seed the database with test data
	cd packages/db && bun run db:seed

# ── Deployment ────────────────────────────────────────────

.PHONY: deploy
deploy:        ## Deploy to production VPS (via SSH + Docker)
	./scripts/deploy.sh

# ── Help ──────────────────────────────────────────────────

.PHONY: help
help:          ## Show this help message
	@printf '\n\033[1mActe – Makefile\033[0m\n'
	@printf 'Usage: make \033[36m<target>\033[0m\n\n'
	@awk 'BEGIN {FS = ":.*##"; printf "\033[1m%-16s %s\033[0m\n", "TARGET", "DESCRIPTION"} /^[a-zA-Z_-]+:.*?##/ { printf "\033[36m%-16s\033[0m %s\n", $$1, $$2 }' $(MAKEFILE_LIST)
	@printf '\n'
