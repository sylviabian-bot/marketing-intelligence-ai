# Project Log

## Sprint 01 — Analytics Foundation

### Initial assumptions

- A marketing manager needs a compact executive view and enough campaign detail to investigate measured movement.
- Synthetic weekly observations can demonstrate analytical reasoning without customer privacy risk or platform integrations.
- Period comparisons can create decision value before introducing anomaly detection or AI interpretation.

### Product decisions

- Established deterministic source-of-truth boundaries: fixtures contain source observations; KPI functions calculate all derived values.
- Used non-causal language limited to increased, decreased, remained stable, improved, and weakened.
- Chose three routes only: Overview, Campaign Intelligence, and Methodology.
- Used the completed synthetic reporting year 25 Aug 2025 – 23 Aug 2026, with 25 May – 23 Aug compared against 23 Feb – 24 May 2026.

### Architecture decisions

- Next.js App Router, React, TypeScript, Tailwind CSS, and Vitest provide a small typed frontend stack.
- Domain models, analytics logic, fixture generation, formatting, and UI are separate modules.
- The dataset contains 260 observations: five fictional campaigns across 52 weekly periods.
- Variation uses deterministic seasonality, cadence, and period shifts in source metrics. These patterns are not labelled as causes or anomalies.

### Design decisions

- Adopted Editorial Analytics × Executive Intelligence: paper-toned background, dark institutional ink, restrained semantic colour, typography-led hierarchy, dividers, and minimal charts.
- Avoided generic admin templates, excessive KPI cards, pie charts, AI decoration, and dense charting.
- Used an accessible table with horizontal containment and a stacked mobile funnel.

### Validation and lessons

- Focused tests cover KPI formulas, denominator safety, aggregation, fixture integrity, comparison semantics, and non-causal narrative output.
- Spend comparisons remain directional rather than evaluative, while unavailable CPQL/ROAS values are omitted instead of fabricated as zero.
- Final command results are recorded in the Sprint 01 delivery commit/PR summary.
- Lesson: analytical credibility starts with an explicit metric contract and provenance boundary, not a more elaborate dashboard.

### Deliberately deferred

AI/API capability, anomaly detection, causal interpretation, forecasting, databases, authentication, persistence, integrations, analytics SDKs, deployment, and real data.

## Sprint 02 — Change & Anomaly Intelligence

### Product decisions

- Kept trend and anomaly separate: an eight-week grouped comparison describes direction, while a rolling robust baseline identifies unusual individual observations.
- Kept spend directional and prevented statistical unusualness from being presented as causal explanation or automatic business importance.
- Added a restrained attention section and campaign evidence investigation rather than a dense alert dashboard.

### Analytical architecture

- Trend compares trailing four versus preceding four completed weeks with a domain-owned 5% stability threshold and Sprint 01 zero/unavailable semantics.
- Anomaly uses the previous eight valid same-campaign observations, rolling median, MAD, and `0.6745 × deviation ÷ MAD`; absolute scores of 3.5 or more are flagged.
- Centralised volume guards: qualified-lead anomalies require 15 upstream leads without suppressing low outcomes; CPQL separately requires 5 qualified leads; ROAS and spend require at least $500 spend.
- Insufficient history, insufficient volume, unavailable KPIs and zero MAD return explicit non-anomaly states.
- Typed evidence records use deterministic IDs and separate complete 4-vs-4 trend provenance from current-week vs prior-8 anomaly provenance.
- Anomaly history is sorted inside the domain rule before selecting the latest eight valid prior observations, so caller order cannot alter evidence.
- Overview applies a simple executive selection rule: at most one primary anomaly per campaign, a related-anomaly count, and one weakened non-anomaly trend when available. Detailed metric evidence remains in Campaign Intelligence.

### Synthetic scenarios

- Preserved 260 source observations. Minimal deterministic modifiers create a gradual Meta qualified-lead decline, a late LinkedIn improvement, and one isolated Paid Search spend deviation.
- Scenario labels describe measured data behaviour only and encode no causal explanation.

### Validation and lessons

- Added focused trend, robust statistics, boundary, guard, provenance, scenario and existing fixture-invariant coverage.
- Lesson: separating sustained movement from unusual individual points creates clearer investigation without requiring AI or causal inference.

### Deliberately deferred

AI/API interpretation, forecasting, causal attribution, machine learning, authentication, databases, persistence, integrations, analytics SDKs, billing, deployment and Sprint 03.

## Sprint 03 — Customer Intelligence

### Product and architecture decisions

- Chose customer-feedback classification as the first genuine AI capability because language classification handles qualitative ambiguity while quantitative truth remains deterministic.
- Added 336 deterministic synthetic feedback records across five feedback sources and limited each request to 24 server-resolved fixture records. The client supplies IDs only, never prompts or model configuration.
- Isolated the official OpenAI Responses API behind a server-only provider/service boundary using strict Zod Structured Outputs, `store: false`, configurable `OPENAI_MODEL`, and `gpt-5.6-terra` fallback.
- Enforced whole-batch verification after schema parsing: requested and returned IDs match exactly once and each short evidence excerpt is an exact source substring. Unverified output is rejected rather than repaired.
- Theme, sentiment, journey-stage frequencies and recent/prior comparisons consume only verified classifications and run in deterministic domain logic.

### UI and human-review boundary

- Added Customer Intelligence within the existing Editorial Analytics × Executive Intelligence system without a chatbot or decorative AI panel.
- The page explains the bounded review set, discloses synthetic sources, exposes verified excerpts, keeps source feedback inspectable, and uses safe loading/error states.
- Categorical model confidence is review context, not a calibrated probability. Customer signals remain explicitly non-causal and cannot update quantitative evidence or connected systems.

### Testing and validation

- Normal tests use deterministic inputs and an injected route handler; they never call OpenAI.
- Coverage includes schema failures, exact evidence, full ID reconciliation, batch limits, deterministic counts/comparisons, fixture integrity, and sanitised server errors.
- Live smoke QA passed locally on 25 Aug 2026 using one four-record synthetic batch: a clear negative offer-clarity comment, clear positive event feedback, a mixed/ambiguous comment, and a content-usefulness comment. Structured Output parsed, all four IDs returned exactly once, every evidence excerpt passed exact-source verification, and no causal output was requested or returned. No secret or raw provider response was logged.

### Deliberately deferred

AI recommendations, causal analysis, chatbot, forecasting, RAG, embeddings, Agents SDK, database, authentication, persistence, connected marketing platforms, deployment, and Sprint 04.
