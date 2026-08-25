import { z } from "zod";
import { AnalystContractError } from "../../../domain/analyst";

const requestSchema = z.object({ questionId: z.string().min(1), campaignId: z.string().min(1).optional() }).strict();
type RunReview = (input: { questionId: string; campaignId?: string }) => Promise<unknown>;

export async function handleAnalystRequest(request: Request, runReview: RunReview) {
  try {
    const body = requestSchema.safeParse(await request.json());
    if (!body.success) return Response.json({ error: "Choose a supported analyst question." }, { status: 400 });
    return Response.json(await runReview(body.data));
  } catch (error) {
    if (error instanceof AnalystContractError && error.code === "INVALID_QUESTION") return Response.json({ error: "Choose a supported analyst question." }, { status: 400 });
    if (error instanceof AnalystContractError && error.code === "INVALID_CAMPAIGN") return Response.json({ error: "Choose a valid campaign for this review." }, { status: 400 });
    if (error instanceof AnalystContractError) return Response.json({ error: "The analyst output failed deterministic verification and was not displayed." }, { status: 502 });
    if (error instanceof Error && error.message === "OPENAI_NOT_CONFIGURED") return Response.json({ error: "Live AI analysis is not configured in this environment." }, { status: 503 });
    if (error instanceof Error && (error.name === "ClassificationVerificationError" || error.message === "OPENAI_INVALID_OUTPUT")) return Response.json({ error: "Verified customer evidence could not be prepared for analysis." }, { status: 502 });
    return Response.json({ error: "The analyst review could not be completed. No unverified output was displayed." }, { status: 502 });
  }
}
