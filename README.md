# FinPulse

**Personal Finance Dashboard -- Take control of your money**

FinPulse is a self-hosted personal finance dashboard, built as an alternative to Mint and YNAB. It is built with Next.js and uses SQLite for zero-configuration storage. Track your income, expenses, budgets, financial goals, and investments all in one place.

---

## Features

### Built

- [x] Authentication (email/password login, multi-user support)
- [x] Dashboard with financial overview, charts, and key metrics
- [x] Account management (checking, savings, credit cards, investments, loans)
- [x] Transaction tracking with search, filters, and pagination
- [x] Category system (hierarchical, fully customizable)

### Planned

- [ ] CSV Import (Bank of America, Amex, SoFi parsers)
- [ ] Auto-categorization engine (keyword and regex matching rules)
- [ ] Pay stub tracking with deduction analysis
- [ ] Budget management with progress tracking
- [ ] Financial goals with projections
- [ ] Subscription tracker
- [ ] Insights and reports (spending trends, net worth, cash flow forecast)
- [ ] "Can I Afford This?" calculator

---

## Quick Start

### Regular Terminal (Docker)

Prerequisites: Docker Desktop, Make, Git. Node.js is NOT needed locally.

```bash
git clone <repo-url>
cd finpulse
make start        # Builds image, sets up DB, starts dev server
# Open http://localhost:3000
make db-seed      # Load demo data
# Login: demo@finpulse.app / password123
```

`make start` runs in detached mode. Use `make logs` to follow output and `make stop` to shut down.

### VS Code DevContainer

Prerequisites: Docker Desktop, VS Code + "Dev Containers" extension.

1. Open the project in VS Code
1. Click **Reopen in Container** when prompted (or run `Dev Containers: Reopen in Container` from the command palette)
1. VS Code builds the image and runs `npm install && prisma generate && prisma db push` automatically
1. Open the integrated terminal, start the dev server, and seed demo data:

```bash
make dev          # Start Next.js dev server
make db-seed      # Load demo data (first time only)
```

1. Open `http://localhost:3000` — VS Code forwards the port automatically

Inside the devcontainer, `make dev` starts the server directly — no Docker wrapper needed. Stop it with `Ctrl+C` and restart with `make dev`.

---

## Make Commands

| Command           | Description                                          |
|-------------------|------------------------------------------------------|
| `make start`      | Build image, set up DB, start dev server (detached)  |
| `make stop`       | Stop running containers                              |
| `make restart`    | Restart containers                                   |
| `make logs`       | Tail container logs                                  |
| `make shell`      | Open a shell inside the running container            |
| `make dev`        | Start Next.js dev server (use inside devcontainer)   |
| `make install`    | Install npm dependencies                             |
| `make build`      | Run a production build                               |
| `make lint`       | Run ESLint                                           |
| `make db-push`    | Push Prisma schema changes to the database           |
| `make db-seed`    | Seed the database with demo data                     |
| `make db-studio`  | Open Prisma Studio on port 5555                      |
| `make db-reset`   | Drop and recreate the database, then re-seed         |
| `make db-migrate` | Run Prisma migrations                                |
| `make clean`      | Stop containers and remove volumes                   |
| `make nuke`       | Full teardown: containers, volumes, images           |

---

## Tech Stack

| Technology      | Role                                     |
|-----------------|------------------------------------------|
| Next.js 16      | App Router, server/client components     |
| TypeScript      | Strict mode across the codebase          |
| Tailwind CSS v4 | Styling with zinc palette, dark mode     |
| Prisma + SQLite | ORM and zero-config database             |
| Auth.js v5      | Authentication (Credentials provider)    |
| Recharts        | Charts and data visualization            |
| Zod             | Runtime schema validation                |
| date-fns        | Date formatting and manipulation         |

---

## Project Structure

```
src/
  app/
    (auth)/          # Login and register pages
    (app)/           # Protected app pages (dashboard, accounts, transactions, etc.)
    api/             # API routes for mutations
  components/
    layout/          # App shell, sidebar, mobile nav
    ui/              # Reusable UI primitives (Button, Card, Table, Dialog, etc.)
  lib/               # auth.ts, prisma.ts, utils.ts
  types/             # Shared TypeScript types
prisma/
  schema.prisma      # Database schema
  seed.ts            # Demo data seeder
docker-compose.yml   # App container for regular terminal use
.devcontainer/       # VS Code DevContainer configuration
docs/                # Architecture and feature tracking
```

---

## Development

All monetary values are stored as integers (cents). `$45.50` is stored as `4550`.

**Type checking** (run inside container shell or devcontainer terminal):

```bash
npx tsc --noEmit
```

**Get a shell inside the running container** (regular terminal workflow):

```bash
make shell
```

---

## Contributing

- AI agents: read `AGENTS.md` for complete coding guidelines and architecture details.
- Humans: see `docs/` for architecture documentation and the feature tracker.

---

## License

MIT
