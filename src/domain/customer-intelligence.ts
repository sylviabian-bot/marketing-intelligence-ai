import { z } from "zod";
import type { CustomerFeedback } from "./marketing";

export const MAX_CLASSIFICATION_BATCH = 24;
export const THEMES = ["offer_clarity", "message_relevance", "value_perception", "trust_credibility", "signup_or_form_friction", "follow_up_experience", "event_experience", "content_usefulness", "product_fit", "other"] as const;
export const SENTIMENTS = ["positive", "neutral", "negative", "mixed"] as const;
export const JOURNEY_STAGES = ["awareness", "consideration", "conversion", "post_conversion", "unknown"] as const;
export const CLASSIFICATION_CONFIDENCE = ["high", "medium", "low"] as const;

export const feedbackClassificationSchema = z.object({
  feedbackId: z.string().min(1),
  theme: z.enum(THEMES),
  sentiment: z.enum(SENTIMENTS),
  journeyStage: z.enum(JOURNEY_STAGES),
  confidence: z.enum(CLASSIFICATION_CONFIDENCE),
  evidenceText: z.string().min(1).max(240),
}).strict();

export const feedbackClassificationBatchSchema = z.object({
  classifications: z.array(feedbackClassificationSchema).min(1).max(MAX_CLASSIFICATION_BATCH),
}).strict();

export type FeedbackClassification = z.infer<typeof feedbackClassificationSchema>;
export type VerifiedClassificationBatch = { verified: true; classifications: FeedbackClassification[] };

export class ClassificationVerificationError extends Error {
  constructor(message = "AI classification evidence could not be verified.") { super(message); this.name = "ClassificationVerificationError"; }
}

export function validateRequestedFeedback(feedback: CustomerFeedback[]): void {
  if (feedback.length === 0) throw new Error("Select at least one feedback record.");
  if (feedback.length > MAX_CLASSIFICATION_BATCH) throw new Error(`A review batch may contain at most ${MAX_CLASSIFICATION_BATCH} records.`);
  if (new Set(feedback.map((item) => item.id)).size !== feedback.length) throw new Error("Feedback IDs must be unique.");
}

export function verifyClassificationBatch(source: CustomerFeedback[], input: unknown): VerifiedClassificationBatch {
  validateRequestedFeedback(source);
  const parsed = feedbackClassificationBatchSchema.parse(input);
  const sourceById = new Map(source.map((item) => [item.id, item]));
  const returnedIds = parsed.classifications.map((item) => item.feedbackId);
  if (new Set(returnedIds).size !== returnedIds.length) throw new ClassificationVerificationError("Duplicate feedback classification returned.");
  if (returnedIds.length !== source.length) throw new ClassificationVerificationError("The classification batch is incomplete.");
  for (const classification of parsed.classifications) {
    const feedback = sourceById.get(classification.feedbackId);
    if (!feedback) throw new ClassificationVerificationError("Unknown feedback classification returned.");
    if (!feedback.text.includes(classification.evidenceText)) throw new ClassificationVerificationError("Classification evidence is not an exact source excerpt.");
  }
  return { verified: true, classifications: parsed.classifications };
}

export function aggregateVerifiedClassifications(batch: VerifiedClassificationBatch) {
  return {
    total: batch.classifications.length,
    themes: Object.fromEntries(THEMES.map((value) => [value, batch.classifications.filter((item) => item.theme === value).length])),
    sentiments: Object.fromEntries(SENTIMENTS.map((value) => [value, batch.classifications.filter((item) => item.sentiment === value).length])),
    journeyStages: Object.fromEntries(JOURNEY_STAGES.map((value) => [value, batch.classifications.filter((item) => item.journeyStage === value).length])),
  };
}

export function compareClassificationWindows(batch: VerifiedClassificationBatch, source: CustomerFeedback[], boundary: string, theme: typeof THEMES[number], sentiment: typeof SENTIMENTS[number]) {
  const dates = new Map(source.map((item) => [item.id, item.date]));
  const matching = (recent: boolean) => batch.classifications.filter((item) => (dates.get(item.feedbackId)! >= boundary) === recent);
  const recent = matching(true); const prior = matching(false);
  if (recent.length < 4 || prior.length < 4) return { status: "insufficient_evidence" as const, recentCount: 0, recentTotal: recent.length, priorCount: 0, priorTotal: prior.length };
  const filter = (items: FeedbackClassification[]) => items.filter((item) => item.theme === theme && item.sentiment === sentiment).length;
  return { status: "available" as const, recentCount: filter(recent), recentTotal: recent.length, priorCount: filter(prior), priorTotal: prior.length };
}
