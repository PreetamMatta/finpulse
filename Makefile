COMPOSE := docker compose -f .devcontainer/docker-compose.yml
EXEC    := $(COMPOSE) exec app
APP     := finpulse-dev

.PHONY: help start stop restart logs shell \
        install dev build lint \
        db-push db-seed db-studio db-reset db-migrate \
        clean nuke

# ─── Core ──────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Build and start the app (http://localhost:3000)
	$(COMPOSE) up --build -d
	@echo ""
	@echo "  FinPulse is starting up..."
	@echo "  App:            http://localhost:3000"
	@echo "  Prisma Studio:  make db-studio (port 5555)"
	@echo "  Logs:           make logs"
	@echo "  Shell:          make shell"
	@echo ""

stop: ## Stop all containers
	$(COMPOSE) down

restart: ## Restart all containers
	$(COMPOSE) restart

logs: ## Tail container logs
	$(COMPOSE) logs -f app

shell: ## Open a bash shell inside the container
	$(EXEC) bash

# ─── Development ───────────────────────────────────────

install: ## Run npm install inside the container
	$(EXEC) npm install

dev: ## Start Next.js dev server (if container is running but server isn't)
	$(EXEC) npm run dev -- -H 0.0.0.0

build: ## Run a production build inside the container
	$(EXEC) npm run build

lint: ## Run ESLint
	$(EXEC) npm run lint

# ─── Database ──────────────────────────────────────────

db-push: ## Push Prisma schema to the database
	$(EXEC) npx prisma db push

db-seed: ## Seed the database with demo data
	$(EXEC) npx tsx prisma/seed.ts

db-studio: ## Open Prisma Studio (http://localhost:5555)
	$(EXEC) npx prisma studio --browser none --hostname 0.0.0.0

db-reset: ## Reset the database (wipe + push schema + seed)
	$(EXEC) bash -c "rm -f /data/finpulse.db && npx prisma db push && npx tsx prisma/seed.ts"

db-migrate: ## Generate and apply a Prisma migration
	$(EXEC) npx prisma migrate dev

# ─── Cleanup ───────────────────────────────────────────

clean: ## Stop containers and remove volumes
	$(COMPOSE) down -v

nuke: ## Full reset — remove containers, volumes, and images
	$(COMPOSE) down -v --rmi local
	@echo "Run 'make start' to rebuild from scratch."
