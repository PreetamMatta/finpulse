# FinPulse Feature Tracker

> This file is the single source of truth for feature development.
> Agents MUST read this before starting work and update it when completing features.

## How to Use This File

### For Agents
1. **Before starting**: Read the feature entry to understand scope, requirements, and dependencies
2. **Claim work**: Change status from `PLANNED` to `IN_PROGRESS`
3. **On completion**: Change status to `DONE`, fill in the completion date and files changed
4. **If blocked**: Change status to `BLOCKED` and add a note explaining why

### Status Legend
| Status | Meaning |
|--------|---------|
| `DONE` | Feature is complete and working |
| `IN_PROGRESS` | Currently being built |
| `PLANNED` | Specified and ready to build |
| `BLOCKED` | Cannot proceed — see notes |
| `DEFERRED` | Postponed to a later phase |

---

## Phase 1: Foundation — `DONE`

### F-001: DevContainer Setup
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: Docker dev environment with Node 20, SQLite, volume persistence
- **Files**: `.devcontainer/Dockerfile`, `.devcontainer/devcontainer.json`, `.devcontainer/docker-compose.yml`, `Makefile`

### F-002: Prisma Schema & Seed
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: Full database schema with all models, relations, indexes. Seed script with demo user, categories, accounts, goals, categorization rules.
- **Files**: `prisma/schema.prisma`, `prisma/seed.ts`

### F-003: Authentication
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: Auth.js v5 with Credentials provider, JWT sessions, login/register pages, route protection middleware
- **Files**: `src/lib/auth.ts`, `src/middleware.ts`, `src/app/(auth)/login/page.tsx`, `src/app/(auth)/register/page.tsx`, `src/app/api/auth/[...nextauth]/route.ts`, `src/app/api/register/route.ts`

### F-004: App Shell & Navigation
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: Sidebar navigation (desktop), mobile bottom nav, responsive layout, dark mode
- **Files**: `src/components/layout/app-shell.tsx`, `src/components/layout/mobile-nav.tsx`, `src/app/(app)/layout.tsx`

### F-005: UI Component Library
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: 15 custom shadcn-style components (Button, Card, Dialog, Select, Table, etc.)
- **Files**: `src/components/ui/*.tsx`

---

## Phase 2: Core Data — `DONE`

### F-006: Account Management
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: CRUD for financial accounts. Cards with balance, type badges, credit utilization, interest rates. Add/edit/delete dialogs.
- **Files**: `src/app/(app)/accounts/page.tsx`, `src/app/(app)/accounts/accounts-client.tsx`, `src/app/api/accounts/route.ts`, `src/app/api/accounts/[id]/route.ts`
- **API**: `GET/POST /api/accounts`, `GET/PUT/DELETE /api/accounts/:id`

### F-007: Transaction Management
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: Transaction table with search, filters (account, category, date range), sorting, pagination. Add transaction dialog.
- **Files**: `src/app/(app)/transactions/page.tsx`, `src/app/(app)/transactions/transactions-client.tsx`, `src/app/api/transactions/route.ts`, `src/app/api/transactions/[id]/route.ts`
- **API**: `GET/POST /api/transactions`, `PUT/DELETE /api/transactions/:id`

### F-008: Category Management
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: System default + user-custom categories. Hierarchical (parent/child). API for listing and creating.
- **Files**: `src/app/api/categories/route.ts`
- **API**: `GET/POST /api/categories`
- **Note**: Full settings UI for category management is part of F-019.

### F-009: Dashboard Overview
- **Status**: `DONE`
- **Completed**: 2026-04-05
- **Description**: Metric cards (net income, spending, savings rate, net worth), account balances, income vs expenses bar chart, budget progress, recent transactions, goals overview.
- **Files**: `src/app/(app)/dashboard/page.tsx`, `src/app/(app)/dashboard/dashboard-client.tsx`

---

## Phase 3: Import — `PLANNED`

### F-010: CSV Import System
- **Status**: `PLANNED`
- **Priority**: HIGH
- **Dependencies**: F-007 (transactions), F-008 (categories)
- **Description**: Upload CSV files from banks, preview parsed data, review and import transactions.
- **Requirements**:
  - File upload UI with drag-and-drop
  - Account selection (which account is this CSV from?)
  - Preview table showing first 20 rows
  - Column mapping (auto-detect + manual override)
  - Import creates transactions with `importSource: "CSV_IMPORT"` and shared `importBatchId`
  - Batch undo (delete all transactions by importBatchId)
- **Files to create**:
  - `src/app/(app)/import/page.tsx` (replace placeholder)
  - `src/app/(app)/import/import-client.tsx`
  - `src/app/api/import/route.ts`
  - `src/app/api/import/[batchId]/route.ts` (for undo)
- **Acceptance criteria**:
  - [ ] Can upload a CSV file
  - [ ] Preview shows parsed data correctly
  - [ ] Column mapping auto-detects date/description/amount
  - [ ] Transactions are created with correct importBatchId
  - [ ] Can undo an entire import batch

### F-011: Bank-Specific CSV Parsers
- **Status**: `PLANNED`
- **Priority**: HIGH
- **Dependencies**: F-010
- **Description**: Parsers that understand specific bank CSV formats
- **Requirements**:
  - Bank of America: columns Date, Description, Amount, Running Bal
  - American Express: columns Date, Description, Card Member, Account #, Amount
  - SoFi: variable format
  - Generic: user manually maps columns
  - Handle: different date formats, negative amounts with parentheses or minus, quoted fields, BOM characters
- **Files to create**:
  - `src/lib/csv-parsers/bofa.ts`
  - `src/lib/csv-parsers/amex.ts`
  - `src/lib/csv-parsers/sofi.ts`
  - `src/lib/csv-parsers/generic.ts`
  - `src/lib/csv-parsers/index.ts` (parser registry)
- **Acceptance criteria**:
  - [ ] BoFA CSV parses correctly
  - [ ] Amex CSV parses correctly
  - [ ] SoFi CSV parses correctly
  - [ ] Generic parser works with manual column mapping
  - [ ] Handles edge cases (BOM, quoted fields, negative amounts)

### F-012: Auto-Categorization Engine
- **Status**: `PLANNED`
- **Priority**: HIGH
- **Dependencies**: F-010, F-008
- **Description**: Automatically categorize transactions based on description matching rules
- **Requirements**:
  - Load rules from `CategorizationRule` table
  - Case-insensitive substring matching (default)
  - Regex matching (when `isRegex: true`)
  - Priority-based: highest priority rule wins
  - Apply during CSV import preview
  - User can override before final import
  - 30+ rules already seeded in demo data
- **Files to create**:
  - `src/lib/categorizer.ts`
- **Acceptance criteria**:
  - [ ] Categorizes "STARBUCKS" → Food > Coffee
  - [ ] Categorizes "AMAZON" → Shopping > Amazon
  - [ ] Higher priority rules win
  - [ ] Regex rules work
  - [ ] Uncategorized transactions left as null

### F-013: Duplicate Detection
- **Status**: `PLANNED`
- **Priority**: MEDIUM
- **Dependencies**: F-010
- **Description**: Flag potential duplicate transactions during CSV import
- **Requirements**:
  - Detect: same date (±1 day) + same amount + similar description
  - Show duplicates in import preview with warning badge
  - User can exclude flagged duplicates before importing
- **Acceptance criteria**:
  - [ ] Duplicates are flagged in import preview
  - [ ] User can exclude duplicates
  - [ ] Non-duplicates with same amount but different dates are not flagged

---

## Phase 4: Dashboard & Visualization — `PLANNED`

### F-014: Budget Management
- **Status**: `PLANNED`
- **Priority**: HIGH
- **Dependencies**: F-007, F-008
- **Description**: Set monthly spending limits per category, track progress
- **Requirements**:
  - CRUD for budgets (category + amount + period)
  - Visual progress bars: green (<80%), yellow (80-100%), red (>100%)
  - Month-over-month comparison
  - Rollover toggle (unspent rolls to next month)
  - Alert when >80% spent
- **Files to create**:
  - `src/app/(app)/budgets/page.tsx` (replace placeholder)
  - `src/app/(app)/budgets/budgets-client.tsx`
  - `src/app/api/budgets/route.ts`
  - `src/app/api/budgets/[id]/route.ts`
- **Acceptance criteria**:
  - [ ] Can create/edit/delete budgets
  - [ ] Progress bars show correct spent/budgeted ratio
  - [ ] Colors change at 80% and 100% thresholds
  - [ ] Dashboard shows budget progress section

---

## Phase 5: Advanced Features — `PLANNED`

### F-015: Pay Stub Tracking
- **Status**: `PLANNED`
- **Priority**: MEDIUM
- **Dependencies**: F-003
- **Description**: Enter and analyze pay stubs with deduction breakdown
- **Requirements**:
  - Form: pay date, period, gross pay, dynamic deduction rows (name, amount, type, isPreTax)
  - Auto-calculate net pay
  - History table of all pay stubs
  - Pay analysis: pie chart (where gross pay goes), net pay trend, YTD totals, effective tax rate, annual projection
- **Files to create**:
  - `src/app/(app)/pay/page.tsx` (replace placeholder)
  - `src/app/(app)/pay/pay-client.tsx`
  - `src/app/api/paystubs/route.ts`
  - `src/app/api/paystubs/[id]/route.ts`
- **Acceptance criteria**:
  - [ ] Can add a pay stub with deductions
  - [ ] Net pay auto-calculated
  - [ ] Pay history displays correctly
  - [ ] Deduction pie chart renders
  - [ ] Effective tax rate calculated correctly

### F-016: Financial Goals
- **Status**: `PLANNED`
- **Priority**: MEDIUM
- **Dependencies**: F-006
- **Description**: Track savings goals, debt payoff, purchases with projections
- **Requirements**:
  - Goal cards with progress rings/bars
  - DEBT_PAYOFF: amortization projections, payoff date, total interest
  - SAVINGS/PURCHASE: monthly contribution needed for deadline
  - "Can I Afford This?" calculator (item price, optional APR/term, shows impact on cash flow)
- **Files to create**:
  - `src/app/(app)/goals/page.tsx` (replace placeholder)
  - `src/app/(app)/goals/goals-client.tsx`
  - `src/app/api/goals/route.ts`
  - `src/app/api/goals/[id]/route.ts`
  - `src/lib/calculations.ts`
- **Acceptance criteria**:
  - [ ] Can create/edit/delete goals
  - [ ] Progress visualization works for all goal types
  - [ ] Debt payoff shows amortization schedule
  - [ ] "Can I Afford This?" calculator works
  - [ ] Monthly contribution needed is calculated correctly

### F-017: Subscription Tracker
- **Status**: `PLANNED`
- **Priority**: LOW
- **Dependencies**: F-006
- **Description**: Track recurring subscriptions, billing dates, total burn rate
- **Requirements**:
  - List active subscriptions with cost and frequency
  - Total monthly burn rate (normalize weekly/yearly to monthly)
  - Calendar view of billing dates
  - Mark as cancelled
  - Flag price increases
- **Files to create**:
  - `src/app/(app)/subscriptions/page.tsx` (replace placeholder)
  - `src/app/(app)/subscriptions/subscriptions-client.tsx`
  - `src/app/api/subscriptions/route.ts`
  - `src/app/api/subscriptions/[id]/route.ts`
- **Acceptance criteria**:
  - [ ] Can add/edit/cancel subscriptions
  - [ ] Monthly burn rate calculated correctly
  - [ ] Next billing dates shown
  - [ ] Calendar view works

### F-018: Insights & Reports
- **Status**: `PLANNED`
- **Priority**: MEDIUM
- **Dependencies**: F-007, F-008, F-006
- **Description**: Spending trends, top merchants, day-of-week analysis, net worth over time
- **Requirements**:
  - Spending trends: line chart by category over time
  - Top merchants: ranked list of where you spend most
  - Day-of-week analysis: which days you spend most
  - Savings rate trend: monthly savings rate chart
  - Cash flow forecast: project next 3 months based on recurring transactions
  - Net worth over time: monthly tracking chart
  - Year-in-review: annual summary
- **Files to create**:
  - `src/app/(app)/insights/page.tsx` (replace placeholder)
  - `src/app/(app)/insights/insights-client.tsx`
  - `src/app/api/insights/route.ts`
  - `src/components/charts/` (reusable chart components)
- **Acceptance criteria**:
  - [ ] Spending trends chart renders with real data
  - [ ] Top merchants list is accurate
  - [ ] Net worth chart tracks over time
  - [ ] Cash flow forecast projects correctly

### F-019: Settings & Category Management UI
- **Status**: `PLANNED`
- **Priority**: LOW
- **Dependencies**: F-008
- **Description**: Full settings page with profile, categories, auto-categorization rules, data export/import
- **Requirements**:
  - Profile management (name, email, currency)
  - Category CRUD UI (add/edit/delete custom categories)
  - Auto-categorization rule management (add/edit/delete rules)
  - Recurring transaction template management
  - Data export (JSON/CSV backup)
  - Data import from backup
- **Files to create**:
  - `src/app/(app)/settings/page.tsx` (replace placeholder)
  - `src/app/(app)/settings/settings-client.tsx`
  - `src/app/api/settings/route.ts`
  - `src/app/api/export/route.ts`
- **Acceptance criteria**:
  - [ ] Can update profile info
  - [ ] Can manage custom categories
  - [ ] Can manage auto-categorization rules
  - [ ] Can export data as JSON
  - [ ] Can import data from backup

### F-020: Reminders & Notifications
- **Status**: `PLANNED`
- **Priority**: LOW
- **Dependencies**: F-007, F-014, F-017
- **Description**: In-app notifications for budgets, bills, daily logging
- **Requirements**:
  - "Log your spending" banner if no transactions today
  - Weekly summary card
  - Budget >80% warning toast
  - Upcoming bills (next 3 days) in dashboard
  - Unreviewed import badge count
- **Files to create**:
  - `src/components/shared/reminders.tsx`
  - `src/app/api/notifications/route.ts`
- **Acceptance criteria**:
  - [ ] Daily reminder shows when no transactions entered
  - [ ] Budget alerts appear at 80% and 100%
  - [ ] Upcoming bills shown in dashboard

---

## Implementation Priority Order

For agents picking up work, build features in this order:

1. **F-014** Budget Management (high value, core feature)
2. **F-010** CSV Import System (critical for real usage)
3. **F-011** Bank-Specific Parsers (needed with F-010)
4. **F-012** Auto-Categorization (needed with F-010)
5. **F-013** Duplicate Detection (needed with F-010)
6. **F-015** Pay Stub Tracking
7. **F-016** Financial Goals
8. **F-018** Insights & Reports
9. **F-017** Subscription Tracker
10. **F-019** Settings & Category Management UI
11. **F-020** Reminders & Notifications

---

## Changelog

| Date | Feature | Agent | Notes |
|------|---------|-------|-------|
| 2026-04-05 | F-001 through F-009 | Claude Opus 4.6 | Initial build — Phase 1 & 2 complete |
