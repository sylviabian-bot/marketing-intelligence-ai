import { z } from "zod";
import type { EvidenceRecord, FeedbackSource } from "./marketing";
import type { VerifiedClassificationBatch } from "./customer-intelligence";
import { campaigns, observations } from "../data/marketing-fixtures";
import { customerReviewSet } from "../data/customer-feedback";
import { buildCampaignEvidence, selectOverviewAttention } from "./intelligence";
import { compareClassificationWindows } from "./customer-intelligence";

export const ANALYST_QUESTIONS = {
  portfolio_attention: "What deserves attention across current marketing performance?",
  customer_context: "What customer signals are relevant alongside recent measured performance changes?",
  causality_check: "Does the available evidence establish why Meta performance changed?",
  campaign_review: "What changed in this campaign and what should be investigated next?",
} as const;
export type AnalystQuestionId = keyof typeof ANALYST_QUESTIONS;

export interface FeedbackEvidenceRecord {
  kind: "feedback";
  id: string;
  feedbackId: string;
  campaignId: string;
  date: string;
  source: FeedbackSource;
  theme: string;
  sentiment: string;
  journeyStage: string;
  confidence: string;
  evidenceText: string;
}

export interface CustomerSignalEvidence {
  kind: "customer_signal";
  id: string;
  theme: string;
  sentiment: string;
  scope: string;
  recentCount: number;
  recentTotal: number;
  priorCount: number;
  priorTotal: number;
  supportingFeedbackEvidenceIds: string[];
  evidenceQuality: "bounded_review_set";
}

export interface DataAvailability {
  id: string;
  label: string;
  status: "available" | "unavailable";
  detail: string;
}

export interface EvidencePackage {
  questionId: AnalystQuestionId;
  question: string;
  scope: { type: "portfolio" | "campaign"; id: string; label: string };
  quantitativeEvidence: EvidenceRecord[];
  qualitativeEvidence: Array<FeedbackEvidenceRecord | CustomerSignalEvidence>;
  dataAvailability: DataAvailability[];
  evidenceIds: string[];
}

const confidenceSchema = z.enum(["high", "medium", "limited"]);
export const analystResponseSchema = z.object({
  assessment: z.enum(["evidence_supported", "mixed_evidence", "insufficient_evidence"]),
  headline: z.string().min(1).max(180),
  observations: z.array(z.object({ statement: z.string().min(1).max(320), evidenceIds: z.array(z.string()).min(1), confidence: confidenceSchema }).strict()).min(1).max(5),
  investigationHypotheses: z.array(z.object({ hypothesis: z.string().min(1).max(280), relatedEvidenceIds: z.array(z.string()), missingEvidence: z.string().min(1).max(280) }).strict()).max(4),
  limitations: z.array(z.object({ statement: z.string().min(1).max(280), evidenceIds: z.array(z.string()) }).strict()).min(1).max(5),
  investigationPriorities: z.array(z.object({ question: z.string().min(1).max(280), relatedEvidenceIds: z.array(z.string()) }).strict()).min(1).max(5),
  causalStatus: z.enum(["not_established", "not_applicable"]),
}).strict();
export type AnalystResponse = z.infer<typeof analystResponseSchema>;
export type VerifiedAnalystResponse = { verified: true; response: AnalystResponse };

export class AnalystContractError extends Error {
  constructor(public code: "INVALID_QUESTION" | "INVALID_CAMPAIGN" | "ANALYST_VERIFICATION_FAILED", message: string) { super(message); this.name = "AnalystContractError"; }
}

const unavailableEvidence: DataAvailability[] = [
  { id: "AVAIL-creative", label: "Creative-level performance", status: "unavailable", detail: "Creative-level history is not present in this synthetic dataset." },
  { id: "AVAIL-audience", label: "Audience-segment quality", status: "unavailable", detail: "Audience-segment evidence is not available." },
  { id: "AVAIL-landing", label: "Landing-page behaviour", status: "unavailable", detail: "No landing-page behavioural data is connected." },
  { id: "AVAIL-experiment", label: "Experimental or incrementality evidence", status: "unavailable", detail: "No controlled experiment or incrementality evidence exists." },
  { id: "AVAIL-attribution", label: "Attribution quality", status: "unavailable", detail: "Attribution-quality evidence is outside the prototype." },
  { id: "AVAIL-competitor", label: "Competitor activity", status: "unavailable", detail: "Competitor activity is not observed." },
];

export function validateAnalystQuestion(input: { questionId: string; campaignId?: string }): { questionId: AnalystQuestionId; campaignId?: string } {
  if (!(input.questionId in ANALYST_QUESTIONS)) throw new AnalystContractError("INVALID_QUESTION", "Unsupported analyst question.");
  const questionId = input.questionId as AnalystQuestionId;
  if (questionId === "campaign_review" && !input.campaignId) throw new AnalystContractError("INVALID_CAMPAIGN", "Select a campaign for campaign review.");
  if (input.campaignId && !campaigns.some((campaign) => campaign.id === input.campaignId)) throw new AnalystContractError("INVALID_CAMPAIGN", "Unknown campaign.");
  return { questionId, campaignId: input.campaignId };
}

export function feedbackEvidenceId(feedbackId: string): string { return `EVD-feedback-${feedbackId}`; }

export function buildQualitativeEvidence(batch: VerifiedClassificationBatch): Array<FeedbackEvidenceRecord | CustomerSignalEvidence> {
  const sourceById = new Map(customerReviewSet.map((item) => [item.id, item]));
  const feedbackRecords: FeedbackEvidenceRecord[] = batch.classifications.map((classification) => {
    const source = sourceById.get(classification.feedbackId);
    if (!source) throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Verified classification is outside the review set.");
    return { kind: "feedback", id: feedbackEvidenceId(source.id), feedbackId: source.id, campaignId: source.campaignId, date: source.date, source: source.source, theme: classification.theme, sentiment: classification.sentiment, journeyStage: classification.journeyStage, confidence: classification.confidence, evidenceText: classification.evidenceText };
  });
  const comparison = compareClassificationWindows(batch, customerReviewSet, "2026-08-10", "offer_clarity", "negative");
  if (comparison.status !== "available") return feedbackRecords;
  const supporting = feedbackRecords.filter((item) => item.theme === "offer_clarity" && item.sentiment === "negative").map((item) => item.id);
  return [...feedbackRecords, { kind: "customer_signal", id: "EVD-customer-offer_clarity-negative-recent-vs-prior", theme: "offer_clarity", sentiment: "negative", scope: "bounded customer review set", recentCount: comparison.recentCount, recentTotal: comparison.recentTotal, priorCount: comparison.priorCount, priorTotal: comparison.priorTotal, supportingFeedbackEvidenceIds: supporting, evidenceQuality: "bounded_review_set" }];
}

export function buildEvidencePackage(input: { questionId: string; campaignId?: string }, classifications?: VerifiedClassificationBatch): EvidencePackage {
  const validated = validateAnalystQuestion(input);
  const all = buildCampaignEvidence(campaigns, observations);
  let quantitativeEvidence: EvidenceRecord[];
  let scope: EvidencePackage["scope"];
  if (validated.questionId === "campaign_review") {
    const campaign = campaigns.find((item) => item.id === validated.campaignId)!;
    quantitativeEvidence = all.filter((item) => item.scopeId === campaign.id);
    scope = { type: "campaign", id: campaign.id, label: campaign.name };
  } else if (validated.questionId === "causality_check" || validated.questionId === "customer_context") {
    const meta = campaigns.find((item) => item.id === "meta-awareness")!;
    quantitativeEvidence = all.filter((item) => item.scopeId === meta.id);
    scope = { type: "campaign", id: meta.id, label: meta.name };
  } else {
    quantitativeEvidence = selectOverviewAttention(all).map((item) => item.record);
    scope = { type: "portfolio", id: "portfolio", label: "Current marketing portfolio" };
  }
  const qualitativeEvidence = validated.questionId === "customer_context"
    ? classifications ? buildQualitativeEvidence(classifications) : []
    : [];
  if (validated.questionId === "customer_context" && !classifications) throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Verified customer classifications are required.");
  const evidenceIds = [...quantitativeEvidence.map((item) => item.id), ...qualitativeEvidence.map((item) => item.id), ...unavailableEvidence.map((item) => item.id)];
  return { questionId: validated.questionId, question: ANALYST_QUESTIONS[validated.questionId], scope, quantitativeEvidence, qualitativeEvidence, dataAvailability: unavailableEvidence, evidenceIds };
}

const numericPattern = /[0-9%$]/;
const causalPattern = /\b(caused(?: by)?|because of|due to|led to|resulted in|driven by|responsible for)\b/i;

function narrativeFields(response: AnalystResponse): string[] {
  return [response.headline, ...response.observations.map((item) => item.statement), ...response.investigationHypotheses.flatMap((item) => [item.hypothesis, item.missingEvidence]), ...response.limitations.map((item) => item.statement), ...response.investigationPriorities.map((item) => item.question)];
}

export function verifyAnalystResponse(input: unknown, evidence: EvidencePackage): VerifiedAnalystResponse {
  const response = analystResponseSchema.parse(input);
  if (narrativeFields(response).some((text) => numericPattern.test(text))) throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Model narrative contains canonical numeric content.");
  if ([response.headline, ...response.observations.map((item) => item.statement)].some((text) => causalPattern.test(text))) throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Observed narrative contains unsupported causal language.");
  if (evidence.questionId === "causality_check" && response.causalStatus !== "not_established") throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Causality is not established by this evidence package.");
  if (evidence.questionId !== "causality_check" && response.causalStatus !== "not_applicable") throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Causal status is not applicable to this analyst question.");
  const allowed = new Set(evidence.evidenceIds);
  const citations = [...response.observations.flatMap((item) => item.evidenceIds), ...response.investigationHypotheses.flatMap((item) => item.relatedEvidenceIds), ...response.limitations.flatMap((item) => item.evidenceIds), ...response.investigationPriorities.flatMap((item) => item.relatedEvidenceIds)];
  if (citations.some((id) => !allowed.has(id))) throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Model cited evidence outside the supplied package.");
  const citationGroups = [...response.observations.map((item) => item.evidenceIds), ...response.investigationHypotheses.map((item) => item.relatedEvidenceIds), ...response.limitations.map((item) => item.evidenceIds), ...response.investigationPriorities.map((item) => item.relatedEvidenceIds)];
  if (citationGroups.some((ids) => new Set(ids).size !== ids.length)) throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "Duplicate evidence citations are not accepted.");
  return { verified: true, response };
}
