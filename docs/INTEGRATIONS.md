# FinPulse Integrations

## Current Integrations

### Auth.js (NextAuth v5)
- **Purpose**: User authentication
- **Config**: `src/lib/auth.ts`
- **Route**: `src/app/api/auth/[...nextauth]/route.ts`
- **Provider**: Credentials (email + bcrypt-hashed password)
- **Session**: JWT strategy, stored in httpOnly cookie
- **Callbacks**: jwt (attaches user.id to token), session (attaches user.id to session)

### Prisma ORM
- **Purpose**: Type-safe database access
- **Schema**: `prisma/schema.prisma`
- **Client**: `src/lib/prisma.ts` (singleton)
- **Seed**: `prisma/seed.ts`
- **Database**: SQLite at `/data/finpulse.db` (Docker volume)

## Planned Integrations

### CSV Import Parsers (Phase 3)
Bank-specific CSV parsers for transaction import:
- **Bank of America**: Date, Description, Amount, Running Bal
- **American Express**: Date, Description, Card Member, Account #, Amount
- **SoFi**: Variable column format
- **Generic**: User-mapped columns
- Location: `src/lib/csv-parsers/`

### Auto-Categorization Engine (Phase 3)
- **Purpose**: Automatically categorize imported transactions
- **Data**: `CategorizationRule` model in Prisma
- **Logic**: Case-insensitive substring matching, optional regex
- **Rules**: Seeded with 30+ common merchant patterns
- Location: `src/lib/categorizer.ts`

### Financial Calculations (Phase 5)
- **Purpose**: Savings rate, net worth, amortization, affordability
- Location: `src/lib/calculations.ts`
- Functions: savingsRate, netWorth, amortizationSchedule, canIAffordThis

## External Services

FinPulse is fully self-hosted with no external API dependencies. All data stays local.

No third-party APIs are called. No analytics, no telemetry (except Next.js default which can be opted out), no cloud services.
