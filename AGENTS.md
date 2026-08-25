# marketing-intelligence-ai Repository Instructions

## Scope and authorisation

- Work only on explicitly authorised sprint scope. Discussion, discovery, or PRD work does not imply implementation approval.
- Use clearly recognisable synthetic/demo data only. Never commit secrets, real customer information, credentials, or local environment files.
- Preserve accepted product behaviour unless explicitly changed. Avoid speculative refactors, dependency upgrades, or adjacent features.

## Sources and context

1. Read `AGENTS.md` first.
2. Search `docs/PRODUCT_REQUIREMENTS.md` and `docs/PROJECT_LOG.md` for task-relevant terms.
3. Read only relevant sections and necessary surrounding context; surface conflicts instead of silently choosing.

## Analytics and AI boundaries

- Deterministic metrics are the quantitative source of truth. Fixtures contain source observations only; derived KPIs belong in tested business logic.
- Never describe AI as calculating deterministic KPIs. Future AI conclusions must be evidence-grounded, human-reviewable, and separate from source data.
- Do not make unsupported causal claims. Describe observed changes without claiming why they occurred.

## Architecture, design, and quality

- Prefer simple, maintainable, typed architecture. Keep fixtures, business logic, and UI separate; avoid unnecessary dependencies.
- Use focused tests for formulas, aggregation, comparisons, and deterministic narrative rules. Do not claim checks that were not run.
- Preserve the professional Editorial Analytics × Executive Intelligence direction: calm, credible, responsive, accessible, and information-led.
- Avoid generic AI aesthetics, excessive gradients, glassmorphism, decorative AI panels, dashboard clutter, and unnecessary chart overload.
- Keep diffs and final reporting concise; stop when acceptance criteria are satisfied.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
