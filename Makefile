COMPOSE := docker compose
APP     := finpulse

# Detect if we're already running inside a Docker container (e.g. devcontainer).
# If so, commands run directly; otherwise they go through "docker compose exec app".
IN_CONTAINER := $(shell [ -f /.dockerenv ] && echo 1 || echo 0)
ifeq ($(IN_CONTAINER),1)
  EXEC :=
else
  EXEC := $(COMPOSE) exec app
endif

.PHONY: help start stop restart logs shell \
        install dev build lint \
        db-push db-seed db-studio db-reset db-migrate \
        clean nuke

# ─── Core ──────────────────────────────────────────────

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

start: ## Build and start the app (http://localhost:3000)
ifeq ($(IN_CONTAINER),1)
	@echo ""
	@echo "  Running inside devcontainer — starting dev server directly..."
	@echo "  App:            http://localhost:3000"
	@echo "  Prisma Studio:  make db-studio (port 5555)"
	@echo ""
	npm run dev -- -H 0.0.0.0
else
	$(COMPOSE) up --build -d
	@echo ""
	@echo "  FinPulse is starting up (npm install + db setup + dev server)..."
	@echo "  App:            http://localhost:3000"
	@echo "  Prisma Studio:  make db-studio (port 5555)"
	@echo "  Logs:           make logs"
	@echo ""
endif

stop: ## Stop all containers (no-op inside devcontainer)
ifeq ($(IN_CONTAINER),1)
	@echo "  Inside devcontainer — use VS Code to stop the container."
else
	$(COMPOSE) down
endif

restart: ## Restart all containers (no-op inside devcontainer)
ifeq ($(IN_CONTAINER),1)
	@echo "  Inside devcontainer — restart the dev server with 'make dev'."
else
	$(COMPOSE) restart
endif

logs: ## Tail container logs
ifeq ($(IN_CONTAINER),1)
	@echo "  Inside devcontainer — you are the container. Check your terminal output."
else
	$(COMPOSE) logs -f app
endif

shell: ## Open a bash shell inside the container
ifeq ($(IN_CONTAINER),1)
	@echo "  You are already inside the container shell."
else
	$(COMPOSE) exec app bash
endif

# ─── Development ───────────────────────────────────────

install: ## Run npm install
	$(EXEC) npm install

dev: ## Start Next.js dev server
	$(EXEC) npm run dev -- -H 0.0.0.0

build: ## Run a production build
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
ifeq ($(IN_CONTAINER),1)
	@echo "  Cannot run 'clean' from inside the devcontainer. Run from your host terminal."
else
	$(COMPOSE) down -v
endif

nuke: ## Full reset — remove containers, volumes, and images
ifeq ($(IN_CONTAINER),1)
	@echo "  Cannot run 'nuke' from inside the devcontainer. Run from your host terminal."
else
	$(COMPOSE) down -v --rmi local
	@echo "Run 'make start' to rebuild from scratch."
endif
