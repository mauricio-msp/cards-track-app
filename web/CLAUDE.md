# Skills Configuration — web

React 19, Vite, TanStack Router, TanStack Query, Tailwind CSS v4, Radix UI, Zod, react-hook-form, Zustand, Recharts, Biome.

## Active Skills

### Planning & Design
- **`superpowers:brainstorming`** — Before new pages, complex components, or state design decisions.
- **`frontend-design`** — Building UI components, pages, dashboards, or any visual element. Avoids generic AI aesthetics — use for production-quality output.

### Implementation
- **`superpowers:test-driven-development`** — Before implementing components or hooks with non-trivial logic.
- **`superpowers:systematic-debugging`** — TanStack Query cache issues, router mismatches, form validation bugs, Zustand store problems.

### Browser Testing
- **`agent-browser`** — Testing UI in the browser after implementing features. Golden path + edge cases. Start dev server first (`pnpm dev`). Use for: verifying forms, navigation, charts, responsive layout, auth flows.

### Quality
- **`superpowers:verification-before-completion`** — Before claiming UI works: open browser, test the feature, check for regressions.
- **`simplify`** — After implementation: check for component duplication, unnecessary re-renders, oversized components.
- **`security-review`** — Auth client config (better-auth), token storage, protected route guards.

## Stack-Specific Rules
- UI components: always use shadcn/ui as base. Add via `pnpm dlx shadcn@latest add <component>`. Never build from scratch what shadcn covers.
- Router: TanStack Router (file-based). New routes → add file under `src/routes/`.
- Data fetching: TanStack Query only. No direct fetch in components. All API calls go through query/mutation hooks.
- Forms: react-hook-form + `@hookform/resolvers` + Zod schemas shared with api where possible.
- Horizontal `ScrollArea`: always add `after:` spacer in flex container (project memory).
- State: Zustand for client-only global state; server state via TanStack Query.
- Styling: Tailwind CSS v4 — no config file, use CSS variables and `@theme`.
- Charts: Recharts (pinned to 2.15.4).
