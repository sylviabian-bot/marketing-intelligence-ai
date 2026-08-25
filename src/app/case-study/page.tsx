import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Case Study · AI Marketing Intelligence Analyst",
  description: "Recruiter case study for an evidence-grounded marketing intelligence portfolio prototype.",
};

const layers = [
  ["01", "Analytics foundation", "Deterministic KPI calculations, channel comparison and campaign drill-down."],
  ["02", "Change intelligence", "Four-week trend comparison, median/MAD anomaly detection and explicit insufficient-evidence states."],
  ["03", "Customer intelligence", "AI classification of synthetic feedback, strict outputs, exact-excerpt verification and code-owned aggregation."],
  ["04", "AI Analyst", "Server-owned questions, deterministic retrieval, bounded evidence, verified citations and canonical evidence rendering."],
];

const reliability = [
  ["Structured Outputs", "Constrain the shape of model responses."],
  ["Exact excerpt verification", "Confirms that cited qualitative evidence exists in its source feedback."],
  ["Evidence IDs", "Make every observed analyst claim traceable to supplied evidence."],
  ["Numeric narrative boundary", "Rejects model-generated canonical figures."],
  ["Causal language boundary", "Blocks obvious unsupported causal claims in observed findings."],
  ["Server-owned questions", "Keeps the Analyst bounded rather than accepting unrestricted prompts."],
  ["Explicit missing evidence", "Allows the product to return insufficient evidence honestly."],
];

export default function CaseStudyPage() {
  return <>
    <p className="eyebrow">Portfolio case study</p>
    <h1>AI Marketing Intelligence Analyst</h1>
    <p className="lede">An evidence-grounded marketing intelligence prototype combining deterministic analytics, verified customer feedback and bounded AI interpretation.</p>
    <p className="snapshot">Independent portfolio project · AI × Marketing Analytics × Decision Support · Synthetic data</p>

    <hr className="rule" />
    <section className="case-intro"><div><p className="section-label">The problem</p><h2>Evidence is often split across systems.</h2></div><div><p>Marketing teams may have campaign metrics, customer feedback and performance commentary in separate places. A dashboard can show what moved; an LLM can generate an explanation. Neither alone guarantees that the explanation is supported.</p><p className="case-question">How can AI support marketing analysis without becoming the source of quantitative truth?</p></div></section>

    <hr className="rule" />
    <section><p className="section-label">What I built</p><h2>Four deliberate layers</h2><div className="case-layers">{layers.map(([number, title, detail]) => <article key={number}><span>{number}</span><h3>{title}</h3><p>{detail}</p></article>)}</div></section>

    <hr className="rule" />
    <section><p className="section-label">How the system works</p><h2>Interpretation sits above evidence.</h2><div className="architecture-flow" aria-label="System architecture flow"><div className="flow-source"><span>Marketing observations</span><b>↓</b><span>Deterministic analytics</span><b>↓</b><span>Trend + anomaly evidence</span></div><div className="flow-merge"><strong>Evidence layer</strong></div><div className="flow-source reverse"><span>Verified customer feedback</span><b>↑</b><span>AI classification</span></div><div className="flow-output"><span>Evidence package</span><b>↓</b><span>AI interpretation</span><b>↓</b><span>Deterministic verification</span><b>↓</b><span>Analyst brief + canonical evidence</span></div></div></section>

    <hr className="rule" />
    <section className="case-dual"><div><p className="section-label">AI is used for</p><ul className="case-list"><li>Classifying qualitative customer language</li><li>Interpreting a bounded evidence package</li><li>Generating concise, evidence-linked analyst narrative</li></ul></div><div><p className="section-label">AI is not used for</p><ul className="case-list"><li>KPI, aggregation, trend or anomaly calculations</li><li>Evidence selection or canonical numeric facts</li><li>Causal attribution, database actions or campaign optimisation</li></ul></div></section>

    <hr className="rule" />
    <section><p className="section-label">Reliability architecture</p><h2>Guardrails make claims reviewable, not universally correct.</h2><div className="reliability-list">{reliability.map(([title, detail]) => <div key={title}><strong>{title}</strong><span>{detail}</span></div>)}</div><p className="notice">Traceability and provenance do not prove semantic truth. Model classifications remain judgements that require human review.</p></section>

    <hr className="rule" />
    <section><p className="section-label">Key evaluation cases</p><h2>The causal trap</h2><div className="evaluation-case"><div><span>Context</span><p>Measured Meta performance changed while negative offer-clarity feedback was also present.</p></div><div><span>Required boundary</span><p>The system must not claim that offer clarity caused the performance change.</p></div><div><span>Accepted result</span><p><code>assessment = insufficient_evidence</code><br /><code>causalStatus = not_established</code></p></div></div><ul className="evaluation-list"><li>Fabricated citation <strong>Rejected</strong></li><li>Model-generated numeric fact <strong>Rejected</strong></li><li>Unsupported causal wording <strong>Rejected</strong></li><li>Unverified qualitative evidence <strong>Rejected</strong></li></ul></section>

    <hr className="rule" />
    <section className="case-dual"><div><p className="section-label">Product decisions</p><h2>Bounded by design</h2><p>AI handles language interpretation where it adds value. Application code owns quantitative truth, evidence provenance, aggregation and final verification. Questions are predefined; there is no generic chat.</p></div><div><p className="section-label">Limitations</p><h2>What this prototype does not claim</h2><ul className="case-list compact"><li>Synthetic data and bounded feedback sample only</li><li>No ad-platform, CRM or production-system connections</li><li>No creative, audience or landing-page behavioural evidence</li><li>No experimental, incrementality or causal-attribution evidence</li><li>No persistence or authentication</li></ul></div></section>

    <hr className="rule" />
    <section><p className="section-label">Technical stack</p><h2>Small, typed and explainable.</h2><p className="stack-line">Next.js · React · TypeScript · Tailwind CSS · Vitest · OpenAI Responses API · Zod Structured Outputs</p><div className="case-links"><Link href="/analyst">Open the AI Analyst</Link><Link href="/methodology">Read the methodology</Link></div></section>
  </>;
}
