# Skills Configuration — api

Fastify 5, Drizzle ORM, PostgreSQL, better-auth, Zod, React Email + Resend. TypeScript, Biome.

## Active Skills

### Planning & Design
- **`superpowers:brainstorming`** — Before new routes, modules, or schema changes. Aligns design before code.
- **`superpowers:writing-plans`** — Multi-step tasks: new module with schema + routes + auth + email.

### Implementation
- **`superpowers:test-driven-development`** — Before implementing routes, services, or DB operations.
- **`superpowers:systematic-debugging`** — Fastify plugin errors, Drizzle query issues, auth failures, cron bugs.

### Security (high priority here)
- **`security-review`** — Mandatory for: auth middleware, rate-limit config, CORS changes, DB query construction, Zod schema validation at boundaries.

### Quality
- **`superpowers:verification-before-completion`** — Before claiming endpoint works: run server, test route, confirm response.
- **`simplify`** — After implementation: look for duplicated Drizzle queries, route handlers that can be extracted, Zod schema reuse.

## Stack-Specific Rules
- DB schema changes: `pnpm db:push` (`drizzle-kit push`) when data exists, not migrate.
- Env vars loaded via `--env-file=.env` in `tsx watch`; never hardcode secrets.
- Fastify type provider is Zod (`fastify-type-provider-zod`); use Zod schemas for route input/output.
- Email templates live in `src/` using `@react-email/components`; render via `@react-email/render`.
