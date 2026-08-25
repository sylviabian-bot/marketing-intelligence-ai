# AI Marketing Intelligence Analyst

An independent portfolio prototype for multi-channel marketing performance analysis and future evidence-grounded AI decision support.

Sprint 03 adds one bounded genuine-AI capability: classifying synthetic customer feedback into reviewable qualitative evidence. Quantitative KPIs, trends, anomaly scores, evidence verification, classification counts and comparisons remain deterministic application logic.

## Data disclosure

All campaigns, organisations, 52 weeks of marketing observations and 336 customer-feedback records are fictional and synthetic. No real customer information or connected marketing platform data is used.

## Current scope

- Five channels: Paid Search, Meta, LinkedIn, Email, and Events
- Five fictional campaigns and 260 weekly source observations
- Deterministic CTR, CPC, CPL, CPQL, qualification rate, conversion rate, CPA, and ROAS
- Portfolio and channel comparison, funnel analysis, campaign filtering, and non-causal period comparisons
- Four-week trend comparisons, rolling median/MAD anomaly detection, minimum-volume guards, and deterministic evidence provenance
- Customer Intelligence with a fixed 24-record AI review set, strict Structured Outputs, exact-excerpt verification, and deterministic aggregation
- No chatbot, causal AI analysis, authentication, database, persistence, connected marketing systems, forecasting, or deployment

## Run locally

```bash
pnpm install
pnpm dev
```

Live classification requires an ignored `.env.local` containing `OPENAI_API_KEY`. `OPENAI_MODEL` is optional and defaults to `gpt-5.6-terra`; see `.env.example`. The key is used only by the server route and must never use a `NEXT_PUBLIC_` prefix.

Open [http://localhost:3000](http://localhost:3000).

## Validate

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```
