# AI Marketing Intelligence Analyst

An independent portfolio prototype for multi-channel marketing performance analysis and future evidence-grounded AI decision support.

Sprint 02 extends the deterministic analytics foundation with separate trend and robust anomaly evidence. It provides an executive Intelligence Overview, filterable Campaign Intelligence, and a transparent Methodology view. All KPIs, trends, anomaly scores and evidence records are calculated from source observations in typed business logic.

## Data disclosure

All campaigns, organisations, and 52 weeks of marketing observations are fictional and synthetic. No real customer information or connected marketing platform data is used.

## Current scope

- Five channels: Paid Search, Meta, LinkedIn, Email, and Events
- Five fictional campaigns and 260 weekly source observations
- Deterministic CTR, CPC, CPL, CPQL, qualification rate, conversion rate, CPA, and ROAS
- Portfolio and channel comparison, funnel analysis, campaign filtering, and non-causal period comparisons
- Four-week trend comparisons, rolling median/MAD anomaly detection, minimum-volume guards, and deterministic evidence provenance
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
