import "server-only";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { EvidencePackage } from "@/domain/analyst";
import { analystResponseSchema } from "@/domain/analyst";
import { ANALYST_INSTRUCTIONS, buildAnalystInput } from "@/ai/analyst-prompt";

export interface AnalystProvider { analyse(evidence: EvidencePackage): Promise<unknown>; }

export class OpenAIAnalystProvider implements AnalystProvider {
  async analyse(evidence: EvidencePackage): Promise<unknown> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("OPENAI_NOT_CONFIGURED");
    const client = new OpenAI({ apiKey });
    const response = await client.responses.parse({
      model: process.env.OPENAI_MODEL || "gpt-5.6-terra",
      store: false,
      instructions: ANALYST_INSTRUCTIONS,
      input: buildAnalystInput(evidence),
      text: { format: zodTextFormat(analystResponseSchema, "evidence_grounded_analyst_response") },
    });
    if (!response.output_parsed) throw new Error("OPENAI_INVALID_OUTPUT");
    return response.output_parsed;
  }
}
