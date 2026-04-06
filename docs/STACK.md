# FinPulse Technology Stack

## Core Framework

| Technology | Version | Role | Documentation |
|-----------|---------|------|---------------|
| Next.js | 16.2.2 | Full-stack React framework | `node_modules/next/dist/docs/` |
| React | 19.2.4 | UI library | reactjs.org |
| TypeScript | 5.x | Type safety (strict mode) | tsconfig.json |

## Frontend

| Technology | Version | Role | Notes |
|-----------|---------|------|-------|
| Tailwind CSS | 4.x | Utility-first CSS | PostCSS plugin, v4 syntax |
| Recharts | 3.x | Chart library | Used for dashboard visualizations |
| Lucide React | 1.x | Icon library | Tree-shakeable SVG icons |
| class-variance-authority | 0.7.x | Component variant management | Used in UI components |
| clsx + tailwind-merge | - | Class name utilities | Combined in `cn()` helper |

## Backend

| Technology | Version | Role | Notes |
|-----------|---------|------|-------|
| Prisma | 5.22.0 | ORM + migrations | Type-safe database access |
| SQLite | 3.x | Database | File-based, on Docker volume |
| Auth.js (NextAuth) | 5.x beta | Authentication | Credentials provider, JWT sessions |
| bcryptjs | 3.x | Password hashing | 10 rounds |
| Zod | 4.x | Runtime validation | API input validation |
| date-fns | 4.x | Date utilities | Lightweight, tree-shakeable |

## Infrastructure

| Technology | Role | Notes |
|-----------|------|-------|
| Docker | Container runtime | Node 20 Debian Bookworm base; image defined in `Dockerfile` at project root |
| Docker Compose | Container orchestration | `docker-compose.yml` (root) for regular use; `.devcontainer/docker-compose.yml` for VS Code DevContainer |
| GNU Make | Task runner | `Makefile` in project root |
| VS Code DevContainers | IDE integration | `.devcontainer/devcontainer.json` |

## State Management

| Technology | Version | Role | Notes |
|-----------|---------|------|-------|
| React Server Components | - | Server-side data | Default for all pages |
| Zustand | 5.x | Client-side state | Currently used for toast system |

## Key Architectural Choices

### Why SQLite over Postgres?
- Zero infrastructure — single file, no separate database server
- Perfect for single-user / small-team personal finance app
- Schema designed to be Postgres-compatible if migration needed later
- Docker volume ensures persistence across container rebuilds

### Why custom UI components over Radix/shadcn?
- No Radix UI dependency — components are self-contained
- Simpler, fewer dependencies, easier to customize
- Built specifically for this app's dark-mode-first design
- Located in `src/components/ui/`

### Why JWT sessions over database sessions?
- Simpler — no session table needed
- Faster — no DB query per request for session validation
- Stateless — works well with single-container deployment

### Why Zod v4?
- Installed via latest npm, ships v4 by default
- API compatible with v3 except: use `.issues` instead of `.errors` on ZodError
- Better performance and smaller bundle

### Why integer cents over decimal/float?
- JavaScript floating-point: `0.1 + 0.2 !== 0.3`
- Integer arithmetic is exact
- Industry standard for financial applications
- `Intl.NumberFormat` handles display formatting
