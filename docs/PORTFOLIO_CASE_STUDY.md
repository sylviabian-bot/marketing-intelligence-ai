# AI Marketing Intelligence Analyst

## Project

An independently designed portfolio prototype combining marketing analytics, verified qualitative evidence and bounded AI decision support. All product records and feedback are fictional and synthetic.

## Problem

Marketing teams often review campaign metrics, customer feedback and performance commentary in separate places. A dashboard can show what moved, and an LLM can generate an explanation, but neither alone guarantees that the explanation is supported by evidence.

The product question was: **How can AI support marketing analysis without becoming the source of quantitative truth?**

## My approach

The product was built in four layers:

1. A deterministic analytics foundation for KPI, funnel and period comparison.
2. Explainable change intelligence using four-week trends and robust median/MAD anomaly detection.
3. AI classification of synthetic feedback with strict output schemas and exact-excerpt verification.
4. A bounded AI Analyst that interprets a server-built evidence package and must cite application-owned evidence.

## Architecture

```text
Marketing observations → deterministic analytics → trend and anomaly evidence
Synthetic customer feedback → AI classification → deterministic provenance verification → verified qualitative evidence
Quantitative + verified qualitative evidence → bounded EvidencePackage
EvidencePackage → AI interpretation → citation/numeric/causal verification
Verified brief → canonical evidence rendered by application code
```

AI handles language interpretation and may select a short supporting excerpt during qualitative classification. Application code owns source-record retrieval, Analyst evidence-package retrieval, quantitative evidence selection, calculations, counts, evidence identifiers, provenance verification, canonical numeric display and final verification.

## Key decisions

- Use server-owned analyst questions instead of free-text chat.
- Keep trend and anomaly provenance separate and reproducible.
- Treat unavailable or low-volume evidence explicitly rather than fabricating values.
- Separate observed findings from investigation hypotheses.
- Preserve spend as directional context rather than inherently good or bad.
- Make insufficient evidence an accepted product outcome.

## AI reliability design

- **Structured Outputs** constrain response shape.
- **Exact source excerpts** verify qualitative provenance.
- **Evidence IDs** make analyst observations traceable.
- **Numeric narrative rejection** prevents the model from supplying canonical figures.
- **Causal-language checks** block obvious unsupported causal claims.
- **Whole-response rejection** prevents partially trusted output from being displayed.

These controls improve traceability and reviewability; they do not prove that every semantic classification is correct. Provenance is not the same as semantic truth.

## Evaluation

The central evaluation is a causal trap. Meta performance evidence and negative offer-clarity feedback coexist in the supplied package. The Analyst must not turn coexistence into causal proof. The accepted response requires:

```text
assessment = insufficient_evidence
causalStatus = not_established
```

Additional deterministic evaluation cases reject fabricated evidence IDs, model-generated numeric facts, unsupported causal wording and unverified qualitative evidence. These are product contract tests, not model benchmarking.

## Limitations

- Synthetic data and a bounded feedback sample only
- No advertising-platform or CRM integrations
- No creative, audience or landing-page behavioural evidence
- No experiment, incrementality or causal-attribution evidence
- No persistence or authentication
- AI classifications remain semantic judgements requiring human review
- No production deployment

## Tech stack

Next.js, React, TypeScript, Tailwind CSS, Vitest, OpenAI Responses API and Zod Structured Outputs. GitHub Actions runs linting, type checking, deterministic tests and the production build without an API key.
