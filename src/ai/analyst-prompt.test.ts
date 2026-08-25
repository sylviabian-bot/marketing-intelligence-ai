import { describe, expect, it } from "vitest";
import { ANALYST_INSTRUCTIONS, buildAnalystInput } from "./analyst-prompt";
import { buildEvidencePackage } from "../domain/analyst";

describe("analyst prompt contract", () => {
  it("receives a server-built evidence package", () => expect(JSON.parse(buildAnalystInput(buildEvidencePackage({ questionId: "portfolio_attention" }))).questionId).toBe("portfolio_attention"));
  it("prohibits numeric narrative and invented citations", () => { expect(ANALYST_INSTRUCTIONS).toMatch(/no digits/); expect(ANALYST_INSTRUCTIONS).toMatch(/Never invent an evidence ID/); });
  it("separates observations from hypotheses and rejects causality", () => { expect(ANALYST_INSTRUCTIONS).toMatch(/Investigation hypotheses are possible explanations only/); expect(ANALYST_INSTRUCTIONS).toMatch(/Coexistence is not causality/); });
  it("requires the causal trap to acknowledge insufficient evidence", () => { expect(ANALYST_INSTRUCTIONS).toMatch(/causalStatus not_established AND assessment insufficient_evidence/); });
});
