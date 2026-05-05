# GrowthOS — Claude Code Instructions

## Versioning mandate (non-negotiable)

Every commit to this repo **must** include a version bump in the root `package.json`. No exceptions.

| Change type | Bump | Example |
|---|---|---|
| New feature or page | **minor** | 1.7.0 → 1.8.0 |
| Bug fix, improvement, refactor | **patch** | 1.8.0 → 1.8.1 |
| Breaking change to API/schema/shared types | **major** | 1.8.0 → 2.0.0 |

**How to apply it:**
1. Edit `package.json` `"version"` field before staging.
2. Include the new version in the commit message subject (e.g. `feat: add X in v1.8.0`).
3. Stage `package.json` along with the changed files.

The previous commits (v1.4.x–v1.7.0) followed this convention — stay consistent.

## Commit style

- Subject line: `<type>: <description> in v<version>`
- Types: `feat`, `fix`, `chore`, `refactor`, `docs`, `test`
- Body: bullet list of what is included and why it was needed

## Prisma migrations

- Schema changes require a matching migration SQL file in `prisma/migrations/<timestamp>_<name>/migration.sql`
- Run `npx prisma migrate deploy` and `npx prisma generate` after adding a migration
- Nullable columns use `ALTER TABLE ... ADD COLUMN ... TYPE` (no `NOT NULL`) for safe deploys

## Architecture notes

- Agents live in `/agents/` — they call external APIs (Firecrawl, Anthropic) and return typed results
- Backend is a Next.js app in `/backend/` — API routes in `app/api/`
- Frontend is a Next.js app in `/frontend/` — pages in `app/`, components in `components/`
- Shared types live in `/shared/types/` — always prefer these over duplicating interfaces
- Demo/seed data lives in `backend/lib/demo-data.ts` — every page that has a live-data API route must have a corresponding demo fallback exported from here

## Key rules

- Never duplicate types between service and UI — put them in `/shared/types/`
- Never return empty `{}` from an API with no product — return demo data so the page is always populated
- Sentiment classification must handle negation (see `visibility.service.ts` for the pattern)
- SOV comparisons must use equal query depth for all players — no structural advantage for the brand
