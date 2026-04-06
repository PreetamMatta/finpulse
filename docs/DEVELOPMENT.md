# FinPulse Development Guide

## Prerequisites

- Docker Desktop (Windows / Mac / Linux)
- GNU Make (`winget install GnuWin32.Make` on Windows)
- Git

Node.js is NOT needed locally — everything runs inside Docker.

---

## Workflow 1: Regular Terminal (Docker)

This is the recommended workflow for users who are not using VS Code DevContainers.
`make start` runs the app container in detached mode — `make logs` streams the output.

```bash
# Clone and start
git clone <repo-url>
cd finpulse
make start          # Build image, set up DB, start dev server in background
make logs           # Stream logs (Ctrl+C to stop tailing, app keeps running)

# Seed demo data (first time only)
make db-seed

# Open http://localhost:3000
# Login: demo@finpulse.app / password123
```

### Daily Workflow

```bash
make start          # Start containers (idempotent — safe to run again)
make logs           # Watch logs in terminal

# Code changes trigger hot reload automatically.

# Schema changes:
# 1. Edit prisma/schema.prisma
make db-push        # Push schema to DB

# Run type checks inside the container:
make shell
npx tsc --noEmit

# Full DB reset:
make db-reset       # Wipe + push schema + seed
```

### Stopping

```bash
make stop           # Stop containers (data is preserved on Docker volume)
make clean          # Stop + remove volumes (deletes DB data)
make nuke           # Full teardown: containers, volumes, images
```

---

## Workflow 2: VS Code DevContainer

This workflow opens the project inside a container managed by VS Code.
The container stays alive so VS Code can attach to it — you start the dev server manually from the integrated terminal.

### Setup

1. Install the **Dev Containers** extension in VS Code
2. Open the project folder
3. Click **Reopen in Container** when prompted
4. VS Code builds the image and automatically runs:

   ```bash
   npm install && npx prisma generate && npx prisma db push
   ```

5. In the integrated terminal, start the dev server:

   ```bash
   make dev        # Starts npm run dev directly (no Docker wrapper)
   ```

6. Seed demo data if needed:

   ```bash
   make db-seed
   ```

7. VS Code forwards port 3000 automatically — open `http://localhost:3000`

### Daily Workflow (inside devcontainer)

```bash
make dev            # Start dev server (Ctrl+C to stop, re-run to restart)
make db-push        # After schema changes
npx tsc --noEmit    # Type check directly in terminal
make db-reset       # Wipe + reseed
```

> `make start` inside the devcontainer is equivalent to `make dev` — it detects `IN_CONTAINER=1`
> and runs `npm run dev` directly. Either command works.

### Extensions auto-installed

ESLint, Prettier, Prisma, Tailwind IntelliSense, GitLens.

---

## Make Commands Reference

### Core

| Command        | Regular terminal                    | Inside devcontainer                   |
|----------------|-------------------------------------|---------------------------------------|
| `make start`   | Build + start container (detached)  | Start dev server directly             |
| `make dev`     | Start dev server via `exec`         | Start dev server directly             |
| `make stop`    | Stop containers                     | No-op (VS Code manages the container) |
| `make restart` | Restart containers                  | No-op — use `Ctrl+C` + `make dev`     |
| `make logs`    | Tail container logs                 | No-op — output is in your terminal    |
| `make shell`   | Open bash inside container          | No-op — you are in the container      |

### Development

| Command        | Description                   |
|----------------|-------------------------------|
| `make install` | Run `npm install`             |
| `make build`   | Production build              |
| `make lint`    | Run ESLint                    |

### Database

| Command           | Description                        |
|-------------------|------------------------------------|
| `make db-push`    | Push schema changes to DB          |
| `make db-seed`    | Seed demo data                     |
| `make db-studio`  | Open Prisma Studio (port 5555)     |
| `make db-reset`   | Wipe DB + push schema + seed       |
| `make db-migrate` | Generate Prisma migration          |

### Cleanup

| Command       | Description                                   |
|---------------|-----------------------------------------------|
| `make clean`  | Stop containers + remove volumes (deletes DB) |
| `make nuke`   | Full teardown: containers, volumes, images    |

---

## Adding a New Feature

### 1. Plan

Read `docs/FEATURE_TRACKER.md` for the feature spec and status.

### 2. Schema (if needed)

```prisma
// prisma/schema.prisma
model NewFeature {
  id     String @id @default(cuid())
  userId String
  // ... fields
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@index([userId])
}
```

Then: `make db-push`

### 3. API Route

```text
src/app/api/<feature>/route.ts
```

Follow existing patterns: auth check → Zod validate → Prisma query → JSON response.

### 4. Page

```text
src/app/(app)/<feature>/
├── page.tsx              # Server component (data fetching)
└── <feature>-client.tsx  # Client component (UI)
```

### 5. Type Check

```bash
npx tsc --noEmit   # Inside devcontainer terminal, or: make shell → npx tsc --noEmit
```

---

## Troubleshooting

### Container won't start

```bash
make nuke    # Full reset
make start   # Rebuild from scratch
```

### Database issues

```bash
make db-reset   # Wipe and reseed
```

### Port 3000 already in use

```bash
# Find what's using it
lsof -i :3000
# Or: docker ps  — another finpulse container may be running
make stop
```

### Node modules issues

```bash
make clean    # Removes node_modules volume
make start    # Fresh install on next startup
```
