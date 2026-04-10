# FinPulse Backend

FastAPI + SQLModel service that handles all data persistence and business logic for FinPulse.

## Architecture

```
Next.js (port 3000)  →  FastAPI (port 8000)  →  SQLite (/data/finpulse.db)
```

**Auth boundary**: Next.js validates the user session (JWT via Auth.js), then passes identity to the backend via internal headers:

| Header | Value |
|--------|-------|
| `X-API-Key` | Shared secret from `INTERNAL_API_KEY` env var |
| `X-User-Id` | Authenticated user's UUID |
| `X-User-Role` | `USER` or `ADMIN` |

The backend trusts these headers only when `X-API-Key` matches — never trust user-supplied IDs directly.

## Endpoints

### Public (API key only)
- `POST /api/auth/verify` — verify email/password, return user info to Auth.js
- `POST /api/register` — create a new user account

### User (API key + X-User-Id)
- `GET/POST /api/accounts`
- `PUT/DELETE /api/accounts/{id}`
- `GET/POST /api/transactions`
- `PUT/DELETE /api/transactions/{id}`
- `GET/POST /api/categories`
- `GET /api/budgets`
- `GET /api/goals`

### Admin (API key + X-User-Role: ADMIN)
- `GET/POST /api/admin/users`
- `DELETE /api/admin/users/{id}`

## Data Model

All monetary values are stored as **integers (cents)**. `$45.50 → 4550`.

Key models: `User`, `Account`, `Transaction`, `Category`, `Budget`, `Goal`, `PayStub`, `Subscription`, `RecurringTransaction`, `CategorizationRule`.

See `models.py` for full schema.

## Development

Run via Docker Compose from the project root:

```bash
make start       # start frontend + backend
make logs        # tail all logs
make shell       # shell into frontend container
```

To get a Python shell inside the backend container:

```bash
docker compose exec backend python
```

Seed demo data:

```bash
docker compose exec backend python seed.py
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `sqlite:////data/finpulse.db` | SQLAlchemy connection string |
| `INTERNAL_API_KEY` | `finpulse-internal-key` | Shared secret with Next.js frontend |
| `SQL_ECHO` | `false` | Set to `true` to log all SQL queries |

## Dependencies

Managed with [uv](https://github.com/astral-sh/uv). See `pyproject.toml`.

- `fastapi` — web framework
- `sqlmodel` — ORM (SQLAlchemy + Pydantic)
- `uvicorn` — ASGI server
- `passlib[bcrypt]` — password hashing
- `pydantic-settings` — env var config
- `python-dotenv` — `.env` file loading
