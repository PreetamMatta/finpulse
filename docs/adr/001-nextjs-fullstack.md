# ADR-001: Next.js as Full-Stack Framework

## Status
Accepted

## Context
We need a framework for building a personal finance dashboard that handles both frontend UI and backend API. Options considered: Next.js, Remix, separate React + Express, SvelteKit.

## Decision
Use Next.js 16 with App Router as the single full-stack framework.

## Rationale
- Single deployment unit — no separate frontend/backend
- React Server Components reduce client bundle and simplify data fetching
- API routes handle all backend logic without a separate server
- Vercel-ready for future cloud deployment
- Large ecosystem and community support
- TypeScript first-class support

## Consequences
- Tied to Next.js release cycle and conventions
- Must follow App Router patterns (route groups, server/client split)
- Next.js 16 has breaking changes from earlier versions — agents must read `node_modules/next/dist/docs/`
- Middleware convention deprecated in favor of proxy
