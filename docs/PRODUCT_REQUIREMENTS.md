# AI Marketing Intelligence Analyst — Product Requirements

Version 0.2 · Sprint 02

## Product vision

Create a portfolio-quality decision-support workspace that helps marketing managers understand multi-channel performance changes while maintaining a strict separation between quantitative truth and interpretation.

## Primary user and problem

The primary user is a marketing manager or analyst responsible for multi-channel campaign performance. Source data is often fragmented across platforms, KPI definitions vary, and dashboards can overwhelm users without clarifying where measured performance changed.

## Sprint 01 value proposition

Provide a coherent, deterministic analytical foundation: consistent KPI calculations, portfolio and channel summaries, campaign drill-down, and careful period-over-period language that describes change without claiming causation.

## Information architecture

- Intelligence Overview — executive portfolio performance and deterministic change summary.
- Campaign Intelligence — channel filtering, funnel, derived KPIs, and campaign comparison.
- Methodology — source/derived distinction, formula contract, interpretation boundary, and data disclosure.

## Data and metric contract

Fixtures store weekly source observations only: spend, impressions, clicks, leads, qualified leads, conversions, and revenue. CTR, CPC, CPL, CPQL, qualification rate, conversion rate, CPA, and ROAS are derived through typed deterministic functions. Zero denominators produce an unavailable value.

## Acceptance criteria

- The interface is coherent, responsive, accessible, and portfolio-ready.
- All campaign and observation data is recognisably synthetic.
- Approximately 52 weeks cover Paid Search, Meta, LinkedIn, Email, and Events.
- Overview presents spend, qualified leads, CPQL, ROAS, channel comparison, and non-causal change statements.
- Campaign Intelligence supports meaningful filtering and funnel/KPI drill-down.
- Methodology explains source data, deterministic calculations, causal limits, and future evidence-grounded AI architecture.
- Focused tests cover all formulas, zero denominators, aggregation, comparisons, and narrative rules.
- Lint, type checking, tests, production build, and diff integrity pass.

## Sprint 02 — Change and anomaly intelligence

Sprint 02 extends the accepted foundation with two separate deterministic concepts:

- Trend compares the trailing four completed weekly observations with the preceding four using a 5% stability threshold.
- Anomaly compares a current weekly observation with the previous eight valid observations using rolling median, MAD, and an inclusive absolute robust z-score threshold of 3.5.

Qualified leads and ROAS use higher-is-better trend semantics; CPQL uses lower-is-better; spend remains directional. Volume guards prevent low-evidence observations from becoming anomaly claims. Insufficient history, unavailable metrics, and zero MAD remain explicit unavailable states. Stable evidence records preserve scope, metric, period, baseline and supporting-period provenance for future human-reviewed interpretation.

Sprint 02 acceptance requires useful Overview attention signals, campaign-level investigation, understandable methodology, scenario coverage for gradual trend and isolated anomaly, and no causal or AI claims.

## Out of scope

AI or external APIs, authentication, databases, persistence, integrations, analytics SDKs, billing, deployment, real customer data, forecasting, causal attribution, and machine-learning models.

## Future direction

A later separately authorised sprint may add evidence-grounded, human-reviewable AI interpretation over the deterministic analytical layer. Deterministic metrics remain the source of quantitative truth.
