# FinPulse -- Agent Instructions

> Read this file completely before making any code changes.

## Quick Reference

- **Stack**: Next.js 16 (App Router), TypeScript strict, Tailwind CSS v4, Auth.js v5
- **Backend Stack**: FastAPI (Python), SQLModel, SQLite, uv for dependency management
- **Run locally**: `make start` from repo root (starts app via `docker-compose.yml`)
- **Inside devcontainer**: Use `make dev` for Next.js, and run the Python backend separately via `uv run uvicorn main:app`
- **Type check**: `npx tsc --noEmit` (inside devcontainer, or `make shell` then run it)
- **Lint**: `make lint`
- **Architecture docs**: `docs/ARCHITECTURE.md`
- **Feature tracker**: `docs/FEATURE_TRACKER.md`

## Critical Rules

1. **Next.js 16 breaking changes**: This is NOT the Next.js from your training data. Read `node_modules/next/dist/docs/` before writing any code. The `middleware` convention is deprecated in favor of `proxy`.
2. **Money is integers**: ALL monetary values are stored as cents (integer). `$45.50` = `4550`. Use `formatCurrency()` from `@/lib/utils` for display.
3. **SQLite constraints**: No concurrent writes.
4. **Tailwind v4**: Use standard utility classes. For dark mode use `dark:` prefix. Use zinc palette (`bg-zinc-900`, `text-zinc-50`, `border-zinc-800`). Do NOT use CSS variable-based color classes like `bg-background`.
5. **Server vs Client components**: Default to Server Components. Only add `"use client"` when you need state, effects, event handlers, or browser APIs.
6. **Auth pattern**: Use `auth()` from `@/lib/auth` in server components and API routes. Use `useSession()` from `next-auth/react` in client components.
7. **Zod v4**: Use `.issues` not `.errors` on ZodError objects.
8. **Decoupled Architecture**: Next.js uses `fetchBackend()` to retrieve data from the FastAPI service. There is no Prisma ORM.

## Architecture Overview

### Request Flow

```
Browser -> Next.js App Router -> Middleware (auth check)
  |-- Server Component -> fetchBackend() -> FastAPI Backend -> SQLModel -> SQLite
  |-- API Route -> Zod validation -> fetchBackend() -> FastAPI Backend -> SQLModel -> SQLite
```

### Route Groups

- `(auth)` -- Login and register pages. No sidebar, centered layout.
- `(app)` -- Protected routes. Has sidebar, requires auth. Layout checks session and redirects to `/login` if missing.

### Component Pattern

Each feature page follows this pattern:

- `page.tsx` -- Server component. Fetches data via `fetchBackend()`, passes to client.
- `*-client.tsx` -- Client component. Renders UI, handles interactions, calls API routes for mutations.

### API Route Pattern

```typescript
// POST -- create/update
const body = await request.json()
const validated = schema.parse(body) // Zod validation
const data = await fetchBackend("/api/feature", { method: "POST", body: JSON.stringify(validated) })
return NextResponse.json(data)
```

### Key Files

| File | Purpose |
|------|---------|
| `backend/models.py` | Database schema -- SQLModel definitions |
| `backend/main.py` | FastAPI application and endpoints |
| `src/lib/api.ts` | `fetchBackend()` helper to call FastAPI |
| `src/lib/auth.ts` | Auth.js config with Credentials provider |
| `src/lib/utils.ts` | Helpers: `cn()`, `formatCurrency()`, `formatDate()`, etc. |
| `src/middleware.ts` | Route protection |
| `src/components/ui/` | Reusable UI components (shadcn-style) |
| `src/components/layout/` | App shell, sidebar, mobile nav |
| `src/app/(app)/layout.tsx` | Protected layout wrapper |
| `src/types/index.ts` | Shared TypeScript types |

## Adding a New Feature

Follow this checklist:

1. **Check `docs/FEATURE_TRACKER.md`** for the feature's status and requirements.
2. **Schema changes?** Edit `backend/models.py` and implement FastAPI endpoints in `backend/main.py`.
3. **Create API routes** at `src/app/api/<feature>/route.ts` -- use Zod for input validation and proxy to `fetchBackend()`.
4. **Create page** at `src/app/(app)/<feature>/page.tsx` (server) + `<feature>-client.tsx` (client).
5. **Reuse UI components** from `src/components/ui/` -- don't create new primitives unless necessary.
6. **Update `docs/FEATURE_TRACKER.md`** -- mark feature as complete.
7. **Type check**: `npx tsc --noEmit`.

## Available UI Components

Located in `src/components/ui/`:

Button, Input, Label, Card (+ Header/Title/Content/Footer), Badge, Select (+ Trigger/Value/Content/Item), Dialog (+ Trigger/Content/Header/Title/Footer), Table (+ Header/Body/Row/Head/Cell), DropdownMenu, Avatar, Progress, Skeleton, Toast (`useToast` hook), Sheet (slide-out panel), Tabs (+ List/Trigger/Content)

## Database

- **ORM**: SQLModel (Python) with SQLite
- **Models**: User, Account, Transaction, Category, PayStub, PayStubDeduction, Subscription, Budget, Goal, RecurringTransaction, CategorizationRule
- **All amounts in cents** (integer)
- **Dates**: DateTime fields, handled by FastAPI automatically.
- **Admin Role**: System includes a `USER` and `ADMIN` role.

## Environment

- Runs in Docker container (Node 20, Debian Bookworm)
- SQLite DB stored on a Docker volume at `/data/finpulse.db` (persists across rebuilds)
- `node_modules` also on a Docker volume for performance
- Port 3000 forwarded for the app, 5555 for Prisma Studio

## Don'ts

- Don't import `PrismaClient` -- the architecture is decoupled.
- Don't use CSS variable color classes (Tailwind v4)
- Don't use `error.errors` on ZodError -- use `error.issues`
- Don't add Radix UI dependencies -- the UI components are custom-built
- Don't use `middleware` file convention without checking Next.js 16 docs
- Don't store money as floats -- always integers (cents)
- Don't forget to serialize Date objects before passing server to client
