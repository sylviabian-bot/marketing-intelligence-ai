import { z } from "zod";
import { ClassificationVerificationError, MAX_CLASSIFICATION_BATCH } from "../../../../domain/customer-intelligence";

const requestSchema = z.object({ feedbackIds: z.array(z.string().min(1)).min(1).max(MAX_CLASSIFICATION_BATCH) }).strict();
type Classify = (ids: string[]) => Promise<unknown>;

export async function handleClassificationRequest(request: Request, classify: Classify) {
  try {
    const body = requestSchema.safeParse(await request.json());
    if (!body.success) return Response.json({ error: "Select between 1 and 24 valid feedback records." }, { status: 400 });
    return Response.json(await classify(body.data.feedbackIds));
  } catch (error) {
    if (error instanceof ClassificationVerificationError) return Response.json({ error: "AI output failed evidence verification and was not used." }, { status: 502 });
    if (error instanceof Error && error.message === "INVALID_FEEDBACK_IDS") return Response.json({ error: "One or more feedback records are not available in this review set." }, { status: 400 });
    if (error instanceof Error && error.message === "OPENAI_NOT_CONFIGURED") return Response.json({ error: "Live AI classification is not configured in this environment." }, { status: 503 });
    return Response.json({ error: "Customer feedback could not be classified. No unverified output was used." }, { status: 502 });
  }
}
