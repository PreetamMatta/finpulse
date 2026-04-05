# FinPulse Business Logic

This document describes the core business rules and domain logic. Agents implementing features MUST follow these rules.

## Core Concepts

### Users
- Each user has isolated data — no cross-user data access
- Users authenticate with email + password (bcrypt hashed)
- Default currency is USD (stored per user, configurable)
- Primary use case: W-2 employee paid bi-weekly

### Financial Accounts
Represent real-world bank/financial accounts. Types:
| Type | Balance Sign | Extra Fields | Example |
|------|-------------|--------------|---------|
| CHECKING | Positive | — | BoFA Checking |
| SAVINGS | Positive | interestRate | SoFi HYSA |
| CREDIT_CARD | Negative | creditLimit | Amex Delta Gold |
| INVESTMENT | Positive | — | Robinhood |
| LOAN | Negative | interestRate | Car Loan |
| OTHER | Either | — | — |

**Net Worth** = sum of all account balances (positive accounts minus absolute value of negative accounts).

**Credit Utilization** = |balance| / creditLimit (for credit cards only).

### Transactions
- **Amount sign convention**: positive = income/credit, negative = expense/debit
- All amounts stored as integers (cents): `$45.50` = `4550`
- Each transaction belongs to exactly one Account
- Each transaction optionally belongs to one Category
- Import source tracks origin: MANUAL, CSV_IMPORT, RECURRING_AUTO
- importBatchId groups CSV imports for batch undo

### Categories
- Hierarchical: one level of parent → children
- System defaults (userId: null) available to all users
- Users can create custom categories (userId set)
- Two types: INCOME and EXPENSE
- Each category has a color for UI consistency

### Budgets
- A budget sets a spending limit for a category per period
- Period: MONTHLY or BIWEEKLY
- **Budget progress** = spent / budgeted × 100
- Thresholds: <80% green, 80-100% yellow, >100% red (overspent)
- "Spent" = absolute sum of negative transactions in that category for the period

### Goals
Types and their logic:
| Type | Logic |
|------|-------|
| SAVINGS | Track currentAmount toward targetAmount. Show monthly contribution needed to hit deadline. |
| DEBT_PAYOFF | Track loan paydown. Show amortization schedule, payoff date, total interest. |
| PURCHASE | Save toward a specific purchase. Show progress and monthly needed. |
| EMERGENCY_FUND | Target = N months of expenses. Track savings toward that. |
| CUSTOM | Generic goal with target and current amount. |

**Progress** = currentAmount / targetAmount × 100

### Pay Stubs
- Represent a single paycheck with gross pay, deductions, and net pay
- Deductions categorized by type: TAX, RETIREMENT, INSURANCE, OTHER
- isPreTax flag affects take-home calculation display
- **Effective tax rate** = total tax deductions / gross pay × 100
- **Annual projection** = latest gross pay × 26 (bi-weekly) or × 24 (semi-monthly)

### Subscriptions
- Recurring charges with known frequency (WEEKLY, MONTHLY, YEARLY)
- **Monthly burn rate** = sum of all active subscriptions normalized to monthly
  - Weekly × 4.33, Monthly × 1, Yearly ÷ 12
- Track next billing date for upcoming bill alerts

### Recurring Transactions
- Templates that auto-generate transactions on a schedule
- Frequencies: WEEKLY, BIWEEKLY, MONTHLY, YEARLY
- nextOccurrence tracks when the next transaction should be created
- Used for: rent, car payment, salary deposits, utilities

## Key Calculations

### Savings Rate
```
savingsRate = (totalIncome - totalExpenses) / totalIncome × 100
```
Where totalIncome = sum of positive transactions, totalExpenses = |sum of negative transactions| for the period.

### Net Worth
```
netWorth = Σ account.balance (for all active accounts)
```
Credit cards and loans have negative balances, so they subtract automatically.

### Spending Change
```
change = (thisMonthSpending - lastMonthSpending) / lastMonthSpending × 100
```
Positive = spending increased (bad), negative = spending decreased (good).

### "Can I Afford This?" Calculator (Phase 5)
Inputs: item price, optional financing (APR, term months)
```
monthlyIncome = average monthly positive transactions (last 3 months)
monthlyExpenses = average monthly negative transactions (last 3 months)
monthlySurplus = monthlyIncome - monthlyExpenses
existingDebt = sum of loan/credit card minimum payments

If financing:
  monthlyPayment = PMT(APR/12, termMonths, -price)
  newSurplus = monthlySurplus - monthlyPayment
Else:
  Impact = price / monthlySurplus (months to save)

Recommendation: Can afford if newSurplus > 20% of monthlyIncome
```

## Auto-Categorization Rules (Phase 3)

Rules stored in `CategorizationRule` model:
- `pattern`: substring to match against transaction description (case-insensitive)
- `isRegex`: if true, pattern is treated as a regex
- `priority`: higher priority rules win when multiple match
- `categoryId`: the category to assign

Matching algorithm:
1. Normalize transaction description to lowercase
2. For each rule (ordered by priority desc):
   a. If isRegex: test pattern against description
   b. Else: check if description contains pattern
3. First match wins
4. If no match: leave uncategorized

## CSV Import Logic (Phase 3)

Import flow:
1. User selects account
2. User uploads CSV file
3. System detects format (by column headers) or user selects parser
4. Parse CSV → extract date, description, amount per row
5. Run auto-categorization on each transaction
6. Detect duplicates: same date (±1 day) + same amount + similar description
7. Show preview to user with category assignments and duplicate flags
8. User reviews, adjusts categories, excludes duplicates
9. Import creates transactions with importSource=CSV_IMPORT and shared importBatchId
10. Batch undo: delete all transactions with a given importBatchId

## Notification Rules (Phase 5)

All notifications are in-app (dashboard banners/toasts). No email/push.

| Trigger | Condition | Display |
|---------|-----------|---------|
| Daily reminder | No transactions entered today | Dashboard banner |
| Budget warning | Category spend > 80% of budget | Dashboard card + toast |
| Budget exceeded | Category spend > 100% of budget | Dashboard card (red) |
| Bill upcoming | Subscription/recurring within 3 days | Dashboard section |
| Unreviewed imports | importBatchId exists with unreviewed flag | Badge count |
| Weekly summary | Every 7 days | Dashboard card |
