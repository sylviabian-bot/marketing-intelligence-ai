"use client";

import { useState } from "react";
import type { AnalystQuestionId, AnalystResponse, CustomerSignalEvidence, EvidencePackage, FeedbackEvidenceRecord } from "@/domain/analyst";
import type { EvidenceRecord } from "@/domain/marketing";
import { formatMetricValue, metricLabels } from "@/lib/intelligence-format";

type Result = { analyst: { verified: true; response: AnalystResponse }; evidencePackage: EvidencePackage };
const questionOptions: Array<{ id: AnalystQuestionId; label: string }> = [
  { id: "portfolio_attention", label: "What deserves attention across current performance?" },
  { id: "customer_context", label: "Which customer signals are relevant alongside performance?" },
  { id: "causality_check", label: "Does evidence establish why Meta performance changed?" },
  { id: "campaign_review", label: "What changed in a selected campaign?" },
];
const human = (value: string) => value.replaceAll("_", " ");

function EvidenceCard({ id, evidence }: { id: string; evidence: EvidencePackage }) {
  const quantitative = evidence.quantitativeEvidence.find((item) => item.id === id);
  if (quantitative) return <QuantitativeEvidence record={quantitative} />;
  const qualitative = evidence.qualitativeEvidence.find((item) => item.id === id);
  if (qualitative?.kind === "feedback") return <FeedbackEvidence record={qualitative} />;
  if (qualitative?.kind === "customer_signal") return <CustomerSignal record={qualitative} />;
  const availability = evidence.dataAvailability.find((item) => item.id === id);
  return availability ? <details className="analyst-evidence"><summary>{availability.label} · unavailable</summary><p>{availability.detail}</p><code>{availability.id}</code></details> : null;
}

function QuantitativeEvidence({ record }: { record: EvidenceRecord }) {
  return <details className="analyst-evidence"><summary>{record.scopeLabel} · {metricLabels[record.metric]}</summary><dl><div><dt>Trend · trailing / preceding</dt><dd>{formatMetricValue(record.metric, record.trend.currentValue)} / {formatMetricValue(record.metric, record.trend.previousValue)}</dd></div><div><dt>Anomaly · current / baseline median</dt><dd>{formatMetricValue(record.metric, record.anomaly.currentValue)} / {formatMetricValue(record.metric, record.anomaly.baselineMedian)}</dd></div><div><dt>Evidence quality</dt><dd>{record.evidenceQuality}</dd></div><div><dt>Evidence ID</dt><dd>{record.id}</dd></div></dl></details>;
}
function FeedbackEvidence({ record }: { record: FeedbackEvidenceRecord }) {
  return <details className="analyst-evidence"><summary>{human(record.theme)} · {human(record.sentiment)} feedback</summary><blockquote>“{record.evidenceText}”</blockquote><p>{human(record.source)} · {record.date} · {record.confidence} model confidence</p><code>{record.id}</code></details>;
}
function CustomerSignal({ record }: { record: CustomerSignalEvidence }) {
  return <details className="analyst-evidence"><summary>{human(record.theme)} · deterministic customer signal</summary><p>Recent: {record.recentCount} of {record.recentTotal} · preceding: {record.priorCount} of {record.priorTotal}</p><p>{record.supportingFeedbackEvidenceIds.length} verified excerpts support this bounded signal.</p><code>{record.id}</code></details>;
}

export default function AnalystReview({ campaigns }: { campaigns: Array<{ id: string; name: string; channel: string }> }) {
  const [questionId, setQuestionId] = useState<AnalystQuestionId>("portfolio_attention");
  const [campaignId, setCampaignId] = useState(campaigns[0].id);
  const [state, setState] = useState<"ready" | "loading" | "complete" | "error">("ready");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  async function run() {
    setState("loading"); setResult(null); setError("");
    try {
      const body = questionId === "campaign_review" ? { questionId, campaignId } : { questionId };
      const response = await fetch("/api/analyst", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const payload = await response.json() as Result | { error: string };
      if (!response.ok || !("analyst" in payload)) throw new Error("error" in payload ? payload.error : "Review failed safely.");
      setResult(payload); setState("complete");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Review failed safely."); setState("error"); }
  }
  const response = result?.analyst.response;
  return <>
    <section className="analyst-controls" aria-labelledby="question-heading"><p className="section-label">Analyst question</p><h2 id="question-heading">Choose the decision to support</h2><div className="analyst-control-row"><label>Question<select value={questionId} onChange={(event) => setQuestionId(event.target.value as AnalystQuestionId)}>{questionOptions.map((option) => <option key={option.id} value={option.id}>{option.label}</option>)}</select></label>{questionId === "campaign_review" && <label>Campaign<select value={campaignId} onChange={(event) => setCampaignId(event.target.value)}>{campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.name} · {campaign.channel}</option>)}</select></label>}<button type="button" onClick={run} disabled={state === "loading"}>{state === "loading" ? "Reviewing evidence…" : "Run analyst review"}</button></div><p className="snapshot">The server owns question wording, evidence retrieval and model configuration.</p>{state === "error" && <p className="error-message" role="alert">{error} No unverified analyst output was displayed.</p>}</section>
    {!result && state !== "error" && <section className="pre-analysis"><p>The brief will appear only after Structured Output, citation, numeric and causal-boundary verification pass.</p></section>}
    {result && response && <>
      <hr className="rule" /><section className="analyst-assessment"><p className="section-label">Assessment · {human(response.assessment)}</p><h2>{response.headline}</h2><p className="status trend">Causality · {human(response.causalStatus)}</p></section>
      <hr className="rule" /><section><p className="section-label">Observed evidence</p><h2>What the supplied evidence supports</h2><div className="analyst-findings">{response.observations.map((item, index) => <article key={`${item.statement}-${index}`}><p className="finding-index">Observed · {item.confidence} confidence</p><h3>{item.statement}</h3><div>{item.evidenceIds.map((id) => <EvidenceCard key={id} id={id} evidence={result.evidencePackage} />)}</div></article>)}</div></section>
      <hr className="rule" /><section className="analyst-columns"><div><p className="section-label">Investigation hypotheses</p><h2>Possible, not established</h2>{response.investigationHypotheses.length === 0 ? <p>No evidence-grounded hypothesis was proposed.</p> : response.investigationHypotheses.map((item, index) => <article className="hypothesis" key={`${item.hypothesis}-${index}`}><h3>{item.hypothesis}</h3><p><strong>Evidence needed:</strong> {item.missingEvidence}</p>{item.relatedEvidenceIds.map((id) => <EvidenceCard key={id} id={id} evidence={result.evidencePackage} />)}</article>)}</div><div><p className="section-label">Limitations</p><h2>What remains unknown</h2><ul className="plain-list analyst-list">{response.limitations.map((item) => <li key={item.statement}>{item.statement}</li>)}</ul><p className="section-label analyst-subhead">Investigation priorities</p><ol className="analyst-list">{response.investigationPriorities.map((item) => <li key={item.question}>{item.question}</li>)}</ol></div></section>
      <hr className="rule" /><section><p className="section-label">Evidence register</p><h2>Canonical facts supplied to the model</h2><p className="lede compact">Narrative contains no canonical numbers. The facts below are rendered from deterministic evidence records.</p><div className="evidence-register">{result.evidencePackage.quantitativeEvidence.map((item) => <QuantitativeEvidence key={item.id} record={item} />)}{result.evidencePackage.qualitativeEvidence.map((item) => item.kind === "feedback" ? <FeedbackEvidence key={item.id} record={item} /> : <CustomerSignal key={item.id} record={item} />)}{result.evidencePackage.dataAvailability.map((item) => <details className="analyst-evidence" key={item.id}><summary>{item.label} · {item.status}</summary><p>{item.detail}</p><code>{item.id}</code></details>)}</div></section>
    </>}
  </>;
}
