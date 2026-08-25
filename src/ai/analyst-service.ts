import "server-only";
import type { AnalystProvider } from "@/ai/analyst-provider";
import { OpenAIAnalystProvider } from "@/ai/analyst-provider";
import type { FeedbackClassificationProvider } from "@/ai/feedback-classifier";
import { OpenAIFeedbackClassificationProvider } from "@/ai/feedback-classifier";
import { classifyFeedbackIds } from "@/ai/feedback-service";
import { customerReviewSet } from "@/data/customer-feedback";
import { buildEvidencePackage, validateAnalystQuestion, verifyAnalystResponse } from "@/domain/analyst";

export async function runAnalystReview(
  input: { questionId: string; campaignId?: string },
  analystProvider: AnalystProvider = new OpenAIAnalystProvider(),
  classificationProvider: FeedbackClassificationProvider = new OpenAIFeedbackClassificationProvider(),
) {
  const validated = validateAnalystQuestion(input);
  const classifications = validated.questionId === "customer_context"
    ? await classifyFeedbackIds(customerReviewSet.map((item) => item.id), classificationProvider)
    : undefined;
  const evidencePackage = buildEvidencePackage(validated, classifications);
  const raw = await analystProvider.analyse(evidencePackage);
  const analyst = verifyAnalystResponse(raw, evidencePackage);
  return { analyst, evidencePackage };
}
