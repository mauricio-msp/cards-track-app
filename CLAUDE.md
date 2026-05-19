# Skills Configuration — card-track monorepo

Monorepo: pnpm workspaces. Packages: `api` (Fastify/Drizzle), `web` (React/Vite).

## Active Skills

### Planning & Design
- **`superpowers:brainstorming`** — Before any new feature, API endpoint, or UI component. Explores requirements before touching code.
- **`superpowers:writing-plans`** — Multi-step tasks spanning api + web (e.g., new entity end-to-end, auth changes).
- **`superpowers:executing-plans`** — Executing written plans in isolated sessions with checkpoints.

### Implementation
- **`superpowers:test-driven-development`** — Before writing implementation code for any feature or bugfix.
- **`superpowers:subagent-driven-development`** — When api and web tasks are independent and can run in parallel.
- **`superpowers:using-git-worktrees`** — Before starting feature work that needs isolation from main.
- **`superpowers:dispatching-parallel-agents`** — 2+ independent tasks (e.g., migrate schema + update frontend types).

### Debugging
- **`superpowers:systematic-debugging`** — Any bug, test failure, or unexpected behavior before proposing fixes.

### Quality & Review
- **`superpowers:verification-before-completion`** — Before claiming any work is done. Run verification, confirm output.
- **`superpowers:requesting-code-review`** — After implementing features or before merging.
- **`superpowers:receiving-code-review`** — When receiving review feedback. Verify before blindly applying.
- **`security-review`** — Auth flows (better-auth), DB queries, rate limiting, CORS config changes.
- **`simplify`** — After implementing: check for reuse, quality, efficiency. Fix what's found.
- **`review`** — PR reviews on this repo.

### Tooling
- **`fewer-permission-prompts`** — When permission prompts become excessive; scan and allowlist safe read-only calls.
- **`update-config`** — Settings changes, hooks, permissions in `.claude/settings.json`.

## DB Rules
- Schema changes → `drizzle-kit push` (not migrate) when DB has data. See project memory.
- Never commit during implementation; user reviews and commits manually.
