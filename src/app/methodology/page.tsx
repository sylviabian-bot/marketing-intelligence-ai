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
      <p className="lede">Sprint 01 establishes a transparent analytical foundation. Every displayed KPI is calculated from source observations through deterministic, tested functions.</p>
      <div className="method-grid">
        <article><h3>Source observations</h3><p>Weekly spend, delivery, funnel and revenue values are stored as synthetic records. No derived KPI is embedded in the fixture data.</p></article>
        <article><h3>Deterministic engine</h3><p>Aggregation and KPI formulas are isolated from presentation. Zero denominators return no value rather than misleading infinity or fabricated zero.</p></article>
        <article><h3>Interpretation boundary</h3><p>Period comparisons state what increased, decreased or remained stable. Sprint 01 intentionally excludes causal interpretation and AI-generated conclusions.</p></article>
      </div>
      <hr className="rule" />
      <section><p className="section-label">KPI definitions</p><h2>One calculation contract</h2><div className="formula-list">{formulas.map(([name, formula]) => <div key={name}><span>{name}</span><code>{formula}</code></div>)}</div></section>
      <hr className="rule" />
      <section><p className="section-label">Future architecture</p><h2>Evidence-grounded AI, later</h2><p className="notice">A future authorised sprint may add a human-reviewable interpretation layer over the deterministic evidence. AI will not replace source metrics, calculate canonical KPIs, or make unsupported causal claims.</p></section>
      <hr className="rule" />
      <section><p className="section-label">Data disclosure</p><h2>Fictional by design</h2><p>All campaign names, organisations and 52 weeks of performance observations are synthetic. No real customer, platform account or marketing data is used.</p></section>
    </>
  );
}
