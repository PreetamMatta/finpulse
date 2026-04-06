# FinPulse Development Guide

## Prerequisites

- Docker Desktop (Windows/Mac/Linux)
- GNU Make (`winget install GnuWin32.Make` on Windows)
- Git

Node.js is NOT needed locally — everything runs inside Docker.

## Getting Started

```bash
# Clone and start
git clone <repo-url>
cd finpulse
make start

# Wait for "Ready" in logs
make logs

# Seed demo data
make db-seed

# Open app
# http://localhost:3000
# Login: demo@finpulse.app / password123
```

## Daily Workflow

```bash
# Start your day
make start              # Start containers (idempotent)
make logs               # Watch logs in terminal

# Make code changes — hot reload is automatic

# Database changes
# 1. Edit prisma/schema.prisma
# 2. Push changes:
make db-push

# Check types (run directly inside devcontainer, or via make shell from host)
npx tsc --noEmit

# Reset everything
make db-reset           # Wipe DB + re-seed
```

## Make Commands Reference

### Core
| Command | Description |
|---------|-------------|
| `make start` | Build and start the app container |
| `make stop` | Stop all containers (no-op inside devcontainer — use VS Code) |
| `make restart` | Restart containers (use `make dev` inside devcontainer) |
| `make logs` | Tail container logs (no-op inside devcontainer — server output is in the terminal) |
| `make shell` | Open bash shell inside container (no-op if already in devcontainer) |

### Development
| Command | Description |
|---------|-------------|
| `make install` | Run npm install inside container |
| `make dev` | Start Next.js dev server manually |
| `make build` | Production build |
| `make lint` | Run ESLint |

### Database
| Command | Description |
|---------|-------------|
| `make db-push` | Push schema changes to DB |
| `make db-seed` | Seed demo data |
| `make db-studio` | Open Prisma Studio (port 5555) |
| `make db-reset` | Wipe DB + push schema + seed |
| `make db-migrate` | Generate Prisma migration |

### Cleanup
| Command | Description |
|---------|-------------|
| `make clean` | Stop containers + remove volumes |
| `make nuke` | Full teardown (containers + images) |

## VS Code DevContainer

If you use VS Code:
1. Install the "Dev Containers" extension
2. Open the project folder
3. Click "Reopen in Container" when prompted
4. VS Code builds the image and runs `npm install && prisma generate && prisma db push` automatically
5. Open a terminal inside VS Code and run `make start` to start the dev server

The devcontainer does **not** auto-start the dev server — this gives you the same `make start` / `make stop` workflow as local development. `make` commands detect they're inside a container and run directly (no `docker compose exec` wrapper needed).

Extensions auto-installed: ESLint, Prettier, Prisma, Tailwind IntelliSense, GitLens.

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
```
src/app/api/<feature>/route.ts
```
Follow existing patterns: auth check → Zod validate → Prisma query → JSON response.

### 4. Page
```
src/app/(app)/<feature>/
├── page.tsx              # Server component (data fetching)
└── <feature>-client.tsx  # Client component (UI)
```

### 5. Type Check
```bash
npx tsc --noEmit   # inside devcontainer terminal, or: make shell → npx tsc --noEmit
```

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
netstat -ano | findstr :3000
# Or change port in docker-compose.yml
```

### Node modules issues
```bash
make clean    # Removes node_modules volume
make start    # Fresh install
```
