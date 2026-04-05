# FinPulse Architecture

## System Overview

FinPulse is a self-hosted personal finance dashboard. It runs as a single Next.js application inside a Docker container with a SQLite database.

```
┌─────────────────────────────────────────────────┐
│                Docker Container                  │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │           Next.js 16 (App Router)         │   │
│  │                                           │   │
│  │  ┌─────────┐  ┌──────────┐  ┌─────────┐ │   │
│  │  │  React   │  │   API    │  │  Auth   │ │   │
│  │  │  Server  │  │  Routes  │  │  (JWT)  │ │   │
│  │  │Components│  │  (REST)  │  │         │ │   │
│  │  └────┬─────┘  └────┬─────┘  └────┬────┘ │   │
│  │       │              │             │       │   │
│  │  ┌────▼──────────────▼─────────────▼────┐ │   │
│  │  │         Prisma ORM (Type-safe)        │ │   │
│  │  └────────────────┬──────────────────────┘ │   │
│  └───────────────────┼────────────────────────┘   │
│                      │                             │
│  ┌───────────────────▼────────────────────────┐   │
│  │        SQLite (Docker Volume: /data)        │   │
│  └─────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────┘
         │
    Port 3000 ──▶ Browser
```

## Layer Architecture

### Layer 1: Presentation (React Components)
- Server Components (default) — fetch data directly via Prisma, no API call needed
- Client Components ("use client") — interactive UI, call API routes for mutations
- Component split pattern: `page.tsx` (server, data fetching) → `*-client.tsx` (client, UI/interactions)

### Layer 2: API (Next.js Route Handlers)
- REST-style endpoints at `src/app/api/`
- All routes authenticate via `auth()` from Auth.js
- Input validation via Zod schemas
- Return JSON with proper HTTP status codes
- Pattern: authenticate → validate → query/mutate → respond

### Layer 3: Data Access (Prisma)
- Singleton client (`src/lib/prisma.ts`)
- Type-safe queries with full relation support
- All queries scoped to authenticated user's data (multi-tenant by userId)
- Aggregate queries for dashboard metrics (not client-side computation)

### Layer 4: Storage (SQLite)
- Single-file database on Docker volume
- Schema managed via Prisma migrations
- Designed for Postgres swap later (avoid SQLite-specific features)

## Authentication Architecture

```
Login Form → POST /api/auth/callback/credentials
  → Auth.js Credentials Provider
  → bcrypt.compare(password, user.passwordHash)
  → JWT token issued (session strategy: "jwt")
  → Stored in secure httpOnly cookie

Subsequent requests:
  → Middleware reads JWT from cookie
  → Validates token
  → Attaches session to request
  → Route handler reads session via auth()
```

- Auth.js v5 with Credentials provider (email/password)
- JWT session strategy (no database sessions)
- Middleware protects all routes except: /login, /register, /api/auth/*, /api/register, static assets
- Session includes user.id for data scoping

## Data Architecture

### Multi-tenancy
Every data model includes a `userId` field. All queries MUST filter by the authenticated user's ID. There is no admin role or cross-user data access.

### Money Representation
All monetary values are stored as integers (cents) to avoid floating-point precision issues.
- `$45.50` → stored as `4550`
- Display: `formatCurrency(4550)` → `"$45.50"`
- Positive amounts = income, negative = expenses
- Account balances: positive for assets (checking/savings/investment), negative for liabilities (credit cards/loans)

### Category Hierarchy
Categories support one level of nesting (parent → children). System defaults have `userId: null`, user-created categories have their `userId` set.

### Date Handling
- Stored as DateTime in SQLite (ISO 8601 strings internally)
- Server components fetch as Date objects from Prisma
- Must be serialized to ISO strings before passing to client components
- Use date-fns for all date manipulation

## Route Architecture

### Route Groups
| Group | Path Pattern | Layout | Auth Required |
|-------|-------------|--------|---------------|
| `(auth)` | /login, /register | Centered, no nav | No |
| `(app)` | /dashboard, /transactions, etc. | Sidebar + content | Yes |
| `api` | /api/* | None (JSON) | Yes (except auth/register) |

### Page Pattern
```
src/app/(app)/feature/
├── page.tsx              # Server component — data fetching
└── feature-client.tsx    # Client component — UI and interactions
```

## State Management

- **Server state**: React Server Components fetch data directly. No client-side cache.
- **Client mutations**: fetch() to API routes, then router.refresh() to revalidate server data
- **Local UI state**: React useState/useReducer for forms, filters, modals
- **Global client state**: Zustand (used for toast notifications; available for future needs)
- **No Redux, no React Query** — keep it simple

## Security Model

- Passwords hashed with bcrypt (10 rounds)
- JWT tokens in httpOnly cookies (managed by Auth.js)
- All API routes verify authentication before processing
- All database queries scoped by userId
- Input validation via Zod at API boundary
- No raw SQL — all queries through Prisma ORM
- CSRF protection via Auth.js
