# AI Marketing Intelligence Analyst

An evidence-grounded marketing intelligence prototype that combines deterministic analytics, verified qualitative evidence and bounded AI interpretation.

## Why I built it

Marketing performance metrics, customer feedback and commentary often live separately. Dashboards show what moved, while language models can produce plausible explanations without proving that those explanations are supported. This independent portfolio project explores how AI can assist interpretation without becoming the source of quantitative truth.

## What it demonstrates

- Marketing measurement across Paid Search, Meta, LinkedIn, Email and Events
- Deterministic KPI, funnel and period-comparison logic
- Four-week trends and robust median/MAD anomaly evidence
- AI classification of synthetic customer feedback with exact-excerpt provenance verification
- A bounded AI Analyst with server-owned questions, verified citations and explicit insufficient-evidence outcomes
- Product boundaries that separate observations, hypotheses and unsupported causal claims

## Architecture

```text
Synthetic marketing observations → deterministic analytics → trend/anomaly evidence
Synthetic customer feedback → AI classification → deterministic provenance verification
Verified evidence → bounded EvidencePackage → AI interpretation → deterministic output verification
Verified analyst brief → canonical facts rendered by application code
```

AI is used for qualitative language classification, selecting short supporting excerpts, and concise evidence-linked interpretation. Application code owns source-record retrieval, Analyst evidence-package retrieval, quantitative evidence selection, KPI calculations, aggregation, evidence IDs, provenance verification, canonical numbers and final verification.

## Key reliability decisions

- Structured Outputs constrain response shape but do not prove semantic correctness.
- Qualitative evidence excerpts must exist exactly in their synthetic source feedback.
- Every observed analyst claim cites an evidence ID supplied by the application.
- Model narrative containing canonical numbers is rejected; facts are rendered from evidence records.
- Obvious causal overreach is rejected, and the causal-trap preset must return insufficient evidence and causality not established.
- There is no generic chatbot, arbitrary prompt endpoint or conversation history.

## Core product surfaces

- **Intelligence Overview** — portfolio performance and restrained deterministic attention signals
- **Campaign Intelligence** — funnel, KPI, trend and anomaly investigation by campaign
- **Customer Intelligence** — verified qualitative classifications and code-derived aggregates
- **AI Analyst** — bounded evidence-grounded interpretation with inspectable citations
- **Case Study** — recruiter-facing product, architecture, reliability and evaluation story
- **Methodology** — detailed analytical and AI boundaries

## Run locally

Requirements: Node.js 22 and pnpm 11.19.0.

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Live customer classification and Analyst reviews require an ignored `.env.local`:

```text
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
```

Use a local key value only. The key remains server-side and must never use a `NEXT_PUBLIC_` prefix. Normal tests and CI do not require OpenAI access or make live model calls.

## Validation

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
git diff --check
```

GitHub Actions runs the same non-live validation on pull requests and pushes to `main`.

## Synthetic-data disclosure

All campaign names, organisations, 52 weeks of performance observations and 336 customer-feedback records are fictional and synthetic. No real customer information, platform account data or production marketing system is used.

## Limitations

- No connected advertising platforms, CRM, persistence or authentication
- No creative-level, audience-level or landing-page behavioural evidence
- No experimental or incrementality evidence and no causal attribution
- Customer intelligence uses a bounded review sample
- Model classifications remain semantic judgements even after provenance verification
- This is a portfolio prototype, not a deployed production SaaS product

See the [portfolio case study](docs/PORTFOLIO_CASE_STUDY.md) and [product requirements](docs/PRODUCT_REQUIREMENTS.md) for more detail.
