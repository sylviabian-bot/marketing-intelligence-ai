# AI Marketing Intelligence Analyst

An independent portfolio prototype for multi-channel marketing performance analysis and future evidence-grounded AI decision support.

Sprint 01 implements the deterministic analytics foundation only. It provides an executive Intelligence Overview, filterable Campaign Intelligence, and a transparent Methodology view. All KPIs are calculated from source observations in typed business logic.

## Data disclosure

All campaigns, organisations, and 52 weeks of marketing observations are fictional and synthetic. No real customer information or connected marketing platform data is used.

## Current scope

- Five channels: Paid Search, Meta, LinkedIn, Email, and Events
- Five fictional campaigns and 260 weekly source observations
- Deterministic CTR, CPC, CPL, CPQL, qualification rate, conversion rate, CPA, and ROAS
- Portfolio and channel comparison, funnel analysis, campaign filtering, and non-causal period comparisons
- No AI, external API, authentication, database, persistence, integration, forecasting, or deployment

## Run locally

```bash
pnpm install
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Validate

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
