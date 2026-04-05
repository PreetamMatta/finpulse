# ADR-002: SQLite as Primary Database

## Status
Accepted

## Context
Need a database for storing financial data. Options: PostgreSQL, MySQL, SQLite, MongoDB.

## Decision
Use SQLite via Prisma ORM, stored on a Docker volume.

## Rationale
- Zero infrastructure — no separate database server to manage
- Perfect fit for a personal/small-team finance app
- File-based — easy backup (just copy the file)
- Docker volume persistence across container rebuilds
- Prisma abstracts the SQL dialect — schema designed to be Postgres-compatible

## Constraints
- No `mode: "insensitive"` on string filters (SQLite limitation)
- No concurrent write transactions (single-writer)
- No full-text search without extensions
- No enum types at DB level (stored as strings, validated via Zod/TypeScript)

## Migration Path
If scaling beyond single-user, change `datasource` in schema.prisma to postgresql, update DATABASE_URL, and run `prisma migrate dev`. Schema is designed to be compatible.
