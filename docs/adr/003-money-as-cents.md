# ADR-003: Store Money as Integer Cents

## Status
Accepted

## Context
Standard floating-point numbers in both JavaScript and Python (IEEE 754) suffer from precision issues (e.g., `0.1 + 0.2 = 0.30000000000000004`). Additionally, SQLite does not have a true, exact-precision `DECIMAL` data type; it stores decimals as floats (`REAL`). Therefore, storing financial values as integer cents is practically necessary to guarantee no precision loss or rounding errors. Financial applications require exact arithmetic.

## Decision
Store all monetary values as integers representing cents.

## Examples
- `$45.50` → `4550`
- `$1,234.00` → `123400`
- `-$18.99` → `-1899`

## Display
Use `formatCurrency()` from `src/lib/utils.ts`:
```typescript
formatCurrency(4550) // → "$45.50"
formatCurrency(-1899) // → "-$18.99"
```

## Consequences
- All API inputs must accept/return cents (not dollars)
- Frontend forms must convert user input (dollars) to cents before API calls
- All Prisma fields for money are `Int` type
- Aggregate calculations (sums, averages) remain exact
