# AI Marketing Intelligence Analyst — Product Requirements

Version 0.4 · Sprint 04

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
- Customer Intelligence — bounded AI classification of synthetic feedback, verified evidence, and deterministic qualitative aggregation.
- AI Analyst — bounded evidence-grounded interpretation with server-owned questions and canonical evidence rendering.

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

## Sprint 03 — Customer intelligence

Sprint 03 introduces the first genuine AI capability through a narrow workflow: synthetic customer feedback → OpenAI structured classification → deterministic evidence verification → verified classifications → deterministic aggregation. A maximum of 24 server-resolved fixture records enters one request. Every requested ID must return exactly once and every evidence excerpt must be an exact source substring; otherwise the entire batch is rejected.

AI classifies theme, sentiment, journey stage and categorical model confidence. Application code calculates all frequencies and recent/prior comparisons. Customer signals remain non-causal and cannot modify Sprint 01/02 quantitative truth. Acceptance requires a recruiter-readable Customer Intelligence page, safe failure states, server-only secrets, deterministic tests without live API access, and a small successful live smoke test using synthetic feedback.

## Sprint 04 — Evidence-grounded AI Analyst

Sprint 04 adds four server-owned analyst questions rather than arbitrary chat. The server validates scope, retrieves deterministic Sprint 02 evidence, prepares verified Sprint 03 qualitative evidence only when required, and constructs a bounded EvidencePackage. The OpenAI Responses API returns strict structured interpretation; application code rejects unknown citations, numeric narrative and obvious causal overreach before rendering.

Observed findings must cite supplied evidence. Hypotheses remain structurally separate and name missing evidence. Causality review must return `not_established`. Canonical metric values, dates, counts, trend provenance and anomaly provenance are rendered from evidence records rather than model prose. Acceptance requires deterministic evaluation cases, normal tests without live calls, four-question live QA, and no chatbot, persistence, RAG or execution capability.

## Out of scope

Generic chat, arbitrary prompts, conversation history, action recommendations or causal conclusions, authentication, databases, persistence, integrations, billing, deployment, real customer data, forecasting, predictive modelling, RAG, embeddings, vector databases, web/file search, Agents SDK, and action execution.

## Future direction

A later separately authorised sprint may add evidence-grounded, human-reviewable AI interpretation over the deterministic analytical layer. Deterministic metrics remain the source of quantitative truth.
