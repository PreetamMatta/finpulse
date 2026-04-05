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

Prerequisites: Docker Desktop, Make, Git

```bash
git clone <repo-url>
cd finpulse
make start        # Builds container, sets up DB, starts app
# Open http://localhost:3000
# Demo: demo@finpulse.app / password123 (after make db-seed)
```

---

## Make Commands

| Command           | Description                                          |
|-------------------|------------------------------------------------------|
| `make start`      | Build container, set up database, start the app      |
| `make stop`       | Stop running containers                              |
| `make restart`    | Stop and restart containers                          |
| `make logs`       | Tail container logs                                  |
| `make shell`      | Open a shell inside the running container            |
| `make install`    | Install npm dependencies inside the container        |
| `make dev`        | Start Next.js in development mode                    |
| `make build`      | Run a production build                               |
| `make lint`       | Run ESLint                                           |
| `make db-push`    | Push Prisma schema changes to the database           |
| `make db-seed`    | Seed the database with demo data                     |
| `make db-studio`  | Open Prisma Studio on port 5555                      |
| `make db-reset`   | Drop and recreate the database, then re-seed         |
| `make db-migrate` | Run Prisma migrations                                |
| `make clean`      | Remove build artifacts and node_modules volume       |
| `make nuke`       | Full teardown: containers, volumes, images, database |

---

## Tech Stack

| Technology      | Role                              |
|-----------------|-----------------------------------|
| Next.js 16      | App Router, server/client components |
| TypeScript      | Strict mode across the codebase   |
| Tailwind CSS v4 | Styling with zinc palette, dark mode |
| Prisma + SQLite | ORM and zero-config database      |
| Auth.js v5      | Authentication (Credentials provider) |
| Recharts        | Charts and data visualization     |
| Zod             | Runtime schema validation         |
| date-fns        | Date formatting and manipulation  |

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
docs/                # Architecture and feature tracking
```

---

## Development

- The app runs inside a Docker container (Node 20, Debian Bookworm) with SQLite.
- VS Code DevContainers are supported for a seamless development experience.
- Dark mode is enabled by default.
- All monetary values are stored as integers (cents). `$45.50` is stored as `4550`.

To get a shell inside the container:

```bash
make shell
```

From there you can run type checks, Prisma commands, or anything else:

```bash
npx tsc --noEmit
npx prisma studio
```

---

## Contributing

- AI agents: read `AGENTS.md` for complete coding guidelines and architecture details.
- Humans: see `docs/` for architecture documentation and the feature tracker.

---

## License

MIT
