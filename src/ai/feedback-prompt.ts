import type { CustomerFeedback } from "@/domain/marketing";

export const FEEDBACK_CLASSIFICATION_PROMPT_VERSION = "feedback-classification-v1";
export const FEEDBACK_CLASSIFICATION_INSTRUCTIONS = `You classify fictional customer feedback for a marketing analyst. Classify only from supplied text. Do not infer facts, causes, recommendations, performance explanations, or strategy. evidenceText must be a short exact contiguous excerpt copied from the feedback text, never a paraphrase. Use other or unknown when evidence is insufficient. Theme and sentiment describe language only and never establish campaign causality. Return every supplied feedbackId exactly once and no other IDs.`;

export function buildFeedbackInput(items: CustomerFeedback[]): string {
  return JSON.stringify(items.map(({ id, text }) => ({ feedbackId: id, feedbackText: text })));
}
