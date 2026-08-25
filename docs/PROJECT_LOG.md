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
- Used a 13-week current period compared with the preceding 13 weeks for the executive change narrative.

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
- Final command results are recorded in the Sprint 01 delivery commit/PR summary.
- Lesson: analytical credibility starts with an explicit metric contract and provenance boundary, not a more elaborate dashboard.

### Deliberately deferred

AI/API capability, anomaly detection, causal interpretation, forecasting, databases, authentication, persistence, integrations, analytics SDKs, deployment, and real data.
