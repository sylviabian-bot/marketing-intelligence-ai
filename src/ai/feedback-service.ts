import "server-only";
import type { FeedbackClassificationProvider } from "@/ai/feedback-classifier";
import { OpenAIFeedbackClassificationProvider } from "@/ai/feedback-classifier";
import { feedbackByIds } from "@/data/customer-feedback";
import { validateRequestedFeedback, verifyClassificationBatch } from "@/domain/customer-intelligence";

export async function classifyFeedbackIds(ids: string[], provider: FeedbackClassificationProvider = new OpenAIFeedbackClassificationProvider()) {
  if (new Set(ids).size !== ids.length) throw new Error("INVALID_FEEDBACK_IDS");
  const source = feedbackByIds(ids);
  if (source.length !== ids.length) throw new Error("INVALID_FEEDBACK_IDS");
  validateRequestedFeedback(source);
  const output = await provider.classify(source);
  return verifyClassificationBatch(source, output);
}
