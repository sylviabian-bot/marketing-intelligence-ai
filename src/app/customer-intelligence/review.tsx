"use client";

import { useMemo, useState } from "react";
import type { CustomerFeedback } from "@/domain/marketing";
import { aggregateVerifiedClassifications, compareClassificationWindows, type FeedbackClassification, type VerifiedClassificationBatch } from "@/domain/customer-intelligence";

type ReviewState = "ready" | "loading" | "complete" | "error";
const labels: Record<string, string> = { offer_clarity: "Offer clarity", message_relevance: "Message relevance", value_perception: "Value perception", trust_credibility: "Trust & credibility", signup_or_form_friction: "Signup or form friction", follow_up_experience: "Follow-up experience", event_experience: "Event experience", content_usefulness: "Content usefulness", product_fit: "Product fit", post_conversion: "Post-conversion" };
const display = (value: string) => labels[value] ?? value.replaceAll("_", " ");

export default function CustomerIntelligenceReview({ feedback, campaignNames }: { feedback: CustomerFeedback[]; campaignNames: Record<string, string> }) {
  const [state, setState] = useState<ReviewState>("ready");
  const [batch, setBatch] = useState<VerifiedClassificationBatch | null>(null);
  const [error, setError] = useState("");
  const sourceById = useMemo(() => new Map(feedback.map((item) => [item.id, item])), [feedback]);
  const aggregates = batch ? aggregateVerifiedClassifications(batch) : null;
  const comparison = batch ? compareClassificationWindows(batch, feedback, "2026-08-10", "offer_clarity", "negative") : null;
  const themes = aggregates ? Object.entries(aggregates.themes).filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]) : [];
  async function analyse() {
    setState("loading"); setError(""); setBatch(null);
    try {
      const response = await fetch("/api/customer-intelligence/classify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ feedbackIds: feedback.map((item) => item.id) }) });
      const payload = await response.json() as VerifiedClassificationBatch | { error: string };
      if (!response.ok || !("verified" in payload)) throw new Error("error" in payload ? payload.error : "Classification failed.");
      setBatch(payload); setState("complete");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Classification failed safely."); setState("error"); }
  }
  return <>
    <hr className="rule" />
    <section aria-labelledby="review-heading"><p className="section-label">AI review set</p><h2 id="review-heading">Classify a bounded evidence set</h2><p className="lede compact">One request classifies 24 selected synthetic comments. Unverified model output is rejected in full and never enters the counts below.</p><button type="button" onClick={analyse} disabled={state === "loading"}>{state === "loading" ? "Classifying feedback…" : "Run AI classification"}</button><p className="snapshot">Model confidence is categorical and not a calibrated probability.</p>{state === "error" && <p className="error-message" role="alert">{error} Your source feedback was not changed.</p>}</section>
    {!batch && <section className="pre-analysis" aria-label="Before classification"><p>Customer signals will appear only after AI output passes exact evidence and batch-completeness verification.</p></section>}
    {batch && aggregates && <>
      <hr className="rule" /><section aria-labelledby="signals-heading"><p className="section-label">Verified customer signals</p><h2 id="signals-heading">Classification counts, calculated in code</h2><div className="classification-grid"><div><h3>Theme frequency</h3>{themes.map(([theme, count]) => <p key={theme}><span>{display(theme)}</span><strong>{count}</strong></p>)}</div><div><h3>Sentiment mix</h3>{Object.entries(aggregates.sentiments).filter(([, count]) => count > 0).map(([sentiment, count]) => <p key={sentiment}><span>{display(sentiment)}</span><strong>{count}</strong></p>)}</div><div><h3>Journey-stage mix</h3>{Object.entries(aggregates.journeyStages).filter(([, count]) => count > 0).map(([stage, count]) => <p key={stage}><span>{display(stage)}</span><strong>{count}</strong></p>)}</div></div></section>
      <hr className="rule" /><section aria-labelledby="comparison-heading"><p className="section-label">Deterministic comparison</p><h2 id="comparison-heading">Recent and preceding feedback</h2>{comparison?.status === "available" ? <p className="signal-statement">Negative offer-clarity classifications changed from <strong>{comparison.priorCount} of {comparison.priorTotal}</strong> preceding comments to <strong>{comparison.recentCount} of {comparison.recentTotal}</strong> recent comments.</p> : <p>There is insufficient verified feedback for a period comparison.</p>}<p className="notice">This customer signal is relevant for investigation alongside campaign performance evidence, but the available data does not establish causality.</p></section>
      <hr className="rule" /><section aria-labelledby="evidence-heading"><p className="section-label">Verified evidence</p><h2 id="evidence-heading">Inspect verified source evidence</h2><div className="feedback-evidence-list">{batch.classifications.slice(0, 10).map((classification: FeedbackClassification) => { const source = sourceById.get(classification.feedbackId)!; return <article key={classification.feedbackId}><div className="signal-meta"><span className={`grounding ${classification.sentiment}`}>{display(classification.sentiment)}</span><span>{display(classification.theme)}</span><span>{classification.confidence} model confidence</span></div><blockquote>“{classification.evidenceText}”</blockquote><p>{campaignNames[source.campaignId]} · {display(source.source)} · {source.date}</p><details><summary>View synthetic source feedback</summary><p>{source.text}</p></details></article>; })}</div><p className="snapshot">Showing 10 of {batch.classifications.length} verified classifications. All aggregate counts use the complete verified batch.</p></section>
    </>}
  </>;
}
