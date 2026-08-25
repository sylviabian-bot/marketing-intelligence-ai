const formulas = [
  ["Click-through rate", "clicks ÷ impressions"], ["Cost per click", "spend ÷ clicks"],
  ["Cost per lead", "spend ÷ leads"], ["Cost per qualified lead", "spend ÷ qualified leads"],
  ["Qualification rate", "qualified leads ÷ leads"], ["Conversion rate", "conversions ÷ leads"],
  ["Cost per acquisition", "spend ÷ conversions"], ["Return on ad spend", "revenue ÷ spend"],
];

export default function Methodology() {
  return (
    <>
      <p className="eyebrow">Methodology</p>
      <h1>Quantitative truth before interpretation.</h1>
      <p className="lede">The architecture combines deterministic quantitative analysis, source-grounded classification of synthetic feedback and bounded AI interpretation. Metrics and aggregates remain calculated through tested application logic.</p>
      <p className="section-label">Quantitative foundation</p>
      <div className="method-grid">
        <article><h3>Source observations</h3><p>Weekly spend, delivery, funnel and revenue values are stored as synthetic records. No derived KPI is embedded in the fixture data.</p></article>
        <article><h3>Deterministic engine</h3><p>Aggregation and KPI formulas are isolated from presentation. Zero denominators return no value rather than misleading infinity or fabricated zero; unavailable KPIs are omitted from period-change claims.</p></article>
        <article><h3>Calculation boundary</h3><p>Period comparisons describe measured movement without causality. AI never calculates KPIs, aggregates, trends or anomaly scores.</p></article>
      </div>
      <hr className="rule" />
      <section><p className="section-label">KPI definitions</p><h2>One calculation contract</h2><div className="formula-list">{formulas.map(([name, formula]) => <div key={name}><span>{name}</span><code>{formula}</code></div>)}</div></section>
      <hr className="rule" />
      <section>
        <p className="section-label">Change intelligence</p><h2>Trend is not anomaly</h2>
        <div className="method-grid">
          <article><h3>Trend · 4 + 4 weeks</h3><p>The trailing four completed weekly observations are compared with the preceding four. Movement below 5% is stable. Qualified leads and ROAS use higher-is-better semantics, CPQL uses lower-is-better, and spend remains directional only.</p></article>
          <article><h3>Anomaly · median + MAD</h3><p>The current week is compared with the previous eight valid observations for the same campaign and metric. A robust z-score at or beyond ±3.5 is flagged. The current point never enters its own baseline.</p></article>
          <article><h3>Evidence boundaries</h3><p>An unusual observation does not explain causation and is not automatically important. Evidence records keep 4-vs-4 trend provenance separate from current-week vs prior-8 anomaly provenance.</p></article>
        </div>
      </section>
      <hr className="rule" />
      <section>
        <p className="section-label">Statistical safeguards</p><h2>When the system stays silent</h2>
        <div className="formula-list">
          <div><span>Rolling baseline</span><code>previous 8 valid weeks</code></div>
          <div><span>Robust score</span><code>0.6745 × (current − median) ÷ MAD</code></div>
          <div><span>Qualified leads</span><code>≥15 upstream leads</code></div>
          <div><span>CPQL</span><code>≥5 qualified leads</code></div>
          <div><span>ROAS</span><code>≥$500 positive spend</code></div>
          <div><span>Spend</span><code>≥$500</code></div>
        </div>
        <p className="notice">Fewer than eight valid prior weeks, a failed volume guard, an unavailable KPI, or MAD = 0 produces an explicit insufficient-evidence state—not an anomaly and not a fabricated score.</p>
      </section>
      <hr className="rule" />
      <section><p className="section-label">Qualitative evidence</p><h2>AI classification, deterministic provenance boundary</h2><div className="method-grid"><article><h3>Constrained classification</h3><p>The OpenAI Responses API classifies synthetic feedback using a strict theme, sentiment, journey-stage and categorical-confidence schema. Schema compliance constrains shape but does not prove grounding.</p></article><article><h3>Provenance verification</h3><p>Every short model-provided excerpt must occur exactly in its source feedback, and every requested ID must return exactly once. A failed batch is rejected in full.</p></article><article><h3>Counts remain deterministic</h3><p>Theme frequencies, sentiment mix, journey-stage mix and period comparisons are calculated in application code from verified classifications only. The model does not generate these numbers.</p></article></div><p className="notice">Exact-excerpt verification proves that cited evidence exists in the source feedback. It does not independently prove that the model selected the correct semantic classification. Categorical model confidence is review context, not a calibrated probability, and customer signals do not establish campaign causality.</p></section>
      <hr className="rule" />
      <section><p className="section-label">AI interpretation</p><h2>A bounded brief, not a chatbot</h2><div className="method-grid"><article><h3>Deterministic retrieval</h3><p>Users choose a server-owned question preset. The server selects accepted quantitative evidence and, only where required, qualitative evidence that passed Sprint 03 provenance verification.</p></article><article><h3>Evidence package</h3><p>The model receives a bounded package rather than unrestricted raw data. Every observed claim must cite a supplied evidence ID; citations prove traceability to the package, not universal truth.</p></article><article><h3>Canonical rendering</h3><p>Model narrative cannot contain canonical numbers. Metric values, dates, counts, trends and anomaly baselines are rendered by application code from cited records.</p></article></div><div className="method-grid"><article><h3>Observed versus possible</h3><p>Supported observations and investigation hypotheses are separate structures. Every hypothesis names evidence that is still missing.</p></article><article><h3>Defensive verification</h3><p>Unknown citations, numeric narrative and obvious causal overreach reject the entire response. Partially trusted output is never displayed.</p></article><article><h3>Insufficient evidence is valid</h3><p>The Analyst can return insufficient evidence. The causal-review preset must state that causality is not established by this synthetic evidence.</p></article></div></section>
      <hr className="rule" />
      <section><p className="section-label">Reliability boundaries</p><h2>Traceable does not mean infallible.</h2><p className="notice">Structured schemas, exact excerpts and evidence citations make outputs reviewable. They do not independently prove that a semantic classification is correct, nor do coexisting signals establish causality.</p></section>
      <hr className="rule" />
      <section><p className="section-label">Synthetic data disclosure</p><h2>Fictional by design</h2><p>All campaign names, organisations, 52 weeks of performance observations and 336 customer-feedback records are synthetic. No real customer, platform account or marketing data is used.</p></section>
    </>
  );
}
