# FinPulse Project Structure

## Root Directory

```
finpulse/
├── .claude/                    # Claude Code config
│   └── launch.json             # Dev server launch configs
├── .devcontainer/              # Docker development environment
│   ├── Dockerfile              # Node 20 Debian image
│   ├── devcontainer.json       # VS Code DevContainer config
│   └── docker-compose.yml      # Container orchestration
├── docs/                       # Project documentation
│   ├── adr/                    # Architecture Decision Records
│   ├── ARCHITECTURE.md
│   ├── BUSINESS_LOGIC.md
│   ├── DEVELOPMENT.md
│   ├── FEATURE_TRACKER.md
│   ├── INTEGRATIONS.md
│   ├── PROJECT_STRUCTURE.md
│   └── STACK.md
├── prisma/                     # Database layer
│   ├── schema.prisma           # Data models, relations, indexes
│   └── seed.ts                 # Demo data seeder
├── src/                        # Application source code
│   ├── app/                    # Next.js App Router pages
│   ├── components/             # React components
│   ├── lib/                    # Shared utilities and config
│   ├── types/                  # TypeScript type definitions
│   └── middleware.ts           # Auth middleware
├── AGENTS.md                   # AI agent instructions
├── CLAUDE.md                   # Points to AGENTS.md
├── Makefile                    # Docker/dev task runner
├── package.json
└── tsconfig.json
```

## Source Directory (`src/`)

### `src/app/` — Next.js App Router

```
src/app/
├── layout.tsx                  # Root layout: fonts, providers, dark mode
├── page.tsx                    # Root redirect → /dashboard or /login
├── globals.css                 # Tailwind v4 imports, CSS custom properties
├── (auth)/                     # Auth route group (no sidebar)
│   ├── layout.tsx              # Centered layout for auth pages
│   ├── login/page.tsx          # Login form (client component)
│   └── register/page.tsx       # Registration form (client component)
├── (app)/                      # Protected route group (sidebar layout)
│   ├── layout.tsx              # Auth check + AppShell wrapper
│   ├── dashboard/
│   │   ├── page.tsx            # Server: fetch metrics, accounts, transactions
│   │   └── dashboard-client.tsx # Client: charts, cards, interactive UI
│   ├── transactions/
│   │   ├── page.tsx            # Server: fetch transactions with pagination
│   │   └── transactions-client.tsx # Client: table, filters, add dialog
│   ├── accounts/
│   │   ├── page.tsx            # Server: fetch accounts
│   │   └── accounts-client.tsx # Client: account cards, CRUD dialogs
│   ├── import/page.tsx         # [Placeholder] CSV import
│   ├── pay/page.tsx            # [Placeholder] Pay stubs
│   ├── budgets/page.tsx        # [Placeholder] Budget management
│   ├── goals/page.tsx          # [Placeholder] Financial goals
│   ├── subscriptions/page.tsx  # [Placeholder] Subscription tracker
│   ├── insights/page.tsx       # [Placeholder] Reports & analytics
│   └── settings/page.tsx       # [Placeholder] User settings
└── api/                        # REST API routes
    ├── auth/[...nextauth]/route.ts  # Auth.js handler
    ├── register/route.ts       # User registration
    ├── accounts/
    │   ├── route.ts            # GET (list) + POST (create)
    │   └── [id]/route.ts       # GET + PUT + DELETE
    ├── transactions/
    │   ├── route.ts            # GET (paginated) + POST (create)
    │   └── [id]/route.ts       # PUT + DELETE
    └── categories/route.ts     # GET (list) + POST (create)
```

### `src/components/` — React Components

```
src/components/
├── providers.tsx               # SessionProvider wrapper
├── layout/
│   ├── app-shell.tsx           # Sidebar + content layout (client)
│   └── mobile-nav.tsx          # Bottom nav bar for mobile (client)
└── ui/                         # Reusable UI primitives
    ├── avatar.tsx              # Avatar with image + fallback
    ├── badge.tsx               # Status/label badges
    ├── button.tsx              # Button with variants (CVA)
    ├── card.tsx                # Card container components
    ├── dialog.tsx              # Modal dialog (portal-based)
    ├── dropdown-menu.tsx       # Dropdown menu
    ├── input.tsx               # Text input
    ├── label.tsx               # Form label
    ├── progress.tsx            # Progress bar (0-100)
    ├── select.tsx              # Custom dropdown select
    ├── sheet.tsx               # Slide-out panel
    ├── skeleton.tsx            # Loading skeleton
    ├── table.tsx               # Data table components
    ├── tabs.tsx                # Tab navigation
    └── toast.tsx               # Toast notifications (Zustand)
```

### `src/lib/` — Shared Utilities

```
src/lib/
├── auth.ts                     # Auth.js config (providers, callbacks)
├── prisma.ts                   # Prisma client singleton
└── utils.ts                    # Helpers: cn, formatCurrency, formatDate, etc.
```

### Planned directories (not yet created):
```
src/lib/
├── csv-parsers/                # Bank-specific CSV parsers
│   ├── bofa.ts
│   ├── amex.ts
│   ├── sofi.ts
│   └── generic.ts
├── categorizer.ts              # Auto-categorization engine
└── calculations.ts             # Financial math helpers

src/components/
├── charts/                     # Recharts wrapper components
├── forms/                      # Feature-specific forms
└── shared/                     # Cross-feature shared components

src/hooks/                      # Custom React hooks
```

## Naming Conventions

| Item | Convention | Example |
|------|-----------|---------|
| Files | kebab-case | `app-shell.tsx`, `mobile-nav.tsx` |
| Components | PascalCase | `AppShell`, `MobileNav` |
| API routes | kebab-case directories | `api/transactions/route.ts` |
| Prisma models | PascalCase | `Transaction`, `PayStub` |
| DB fields | camelCase | `userId`, `payDate`, `isActive` |
| CSS classes | Tailwind utilities | `bg-zinc-900 text-zinc-50` |
| Types | PascalCase | `AccountType`, `GoalType` |
| Utilities | camelCase | `formatCurrency()`, `cn()` |

## Feature Implementation Pattern

When building a new feature, create files in this order:

1. **Schema** (`prisma/schema.prisma`) — if new models needed
2. **API route** (`src/app/api/<feature>/route.ts`) — CRUD endpoints
3. **Server page** (`src/app/(app)/<feature>/page.tsx`) — data fetching
4. **Client component** (`src/app/(app)/<feature>/<feature>-client.tsx`) — UI
5. **Tests** — when test framework is added
