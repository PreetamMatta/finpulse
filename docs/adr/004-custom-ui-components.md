# ADR-004: Custom UI Components over Radix UI

## Status
Accepted

## Context
Need accessible, themeable UI components. Options: install shadcn/ui + Radix UI primitives, or build custom lightweight components.

## Decision
Build custom UI components inspired by shadcn/ui patterns but without Radix UI dependencies.

## Rationale
- Fewer dependencies — no @radix-ui/* packages
- Full control over component behavior and styling
- Simpler — no complex accessibility primitives we don't fully need
- Components in `src/components/ui/` are self-contained
- Tailwind v4 compatible from the start

## Components Built
Button, Input, Label, Card, Badge, Select, Dialog, Table, DropdownMenu, Avatar, Progress, Skeleton, Toast, Sheet, Tabs

## Trade-offs
- Less comprehensive accessibility than Radix (acceptable for personal tool)
- Must build any new primitives ourselves
- No automatic focus trapping in modals (simplified implementation)

## Rules
- Do NOT install @radix-ui packages
- Do NOT use shadcn CLI (`npx shadcn@latest add`)
- Add new components manually in `src/components/ui/`
- Follow existing patterns: "use client", forwardRef where needed, cn() for class merging
