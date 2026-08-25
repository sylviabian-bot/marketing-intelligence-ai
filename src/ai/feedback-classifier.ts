import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { CustomerFeedback } from "@/domain/marketing";
import { feedbackClassificationBatchSchema } from "@/ai/feedback-schema";
import { buildFeedbackInput, FEEDBACK_CLASSIFICATION_INSTRUCTIONS } from "@/ai/feedback-prompt";

export interface FeedbackClassificationProvider { classify(items: CustomerFeedback[]): Promise<unknown>; }

export class OpenAIFeedbackClassificationProvider implements FeedbackClassificationProvider {
  async classify(items: CustomerFeedback[]): Promise<unknown> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");
    const client = new OpenAI({ apiKey });
    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      store: false,
      instructions: FEEDBACK_CLASSIFICATION_INSTRUCTIONS,
      input: buildFeedbackInput(items),
      text: { format: zodTextFormat(feedbackClassificationBatchSchema, "feedback_classification_batch") },
    });
    if (!response.output_parsed) throw new Error("OPENAI_INVALID_OUTPUT");
    return response.output_parsed;
  }
}
