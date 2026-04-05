# ADR-005: Credentials Auth with JWT Sessions

## Status
Accepted

## Context
Need multi-user authentication. Options: OAuth providers, magic link, email/password with database sessions, email/password with JWT.

## Decision
Use Auth.js v5 with Credentials provider (email + bcrypt password) and JWT session strategy.

## Rationale
- Self-hosted app — no dependency on external OAuth providers
- JWT sessions: no session table needed, stateless, fast
- bcrypt: industry-standard password hashing
- Auth.js handles CSRF, cookies, token rotation

## Configuration
- Provider: Credentials (email/password)
- Session strategy: JWT
- Password hashing: bcrypt with 10 rounds
- Login page: /login
- Session includes: user.id, user.email, user.name

## Consequences
- No "forgot password" flow yet (add later if needed)
- No OAuth social login (can add providers to auth.ts later)
- JWT tokens can't be revoked server-side (acceptable for personal app)
