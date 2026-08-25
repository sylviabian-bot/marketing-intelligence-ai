import { describe, expect, it } from "vitest";
import { customerReviewSet } from "../data/customer-feedback";
import type { VerifiedClassificationBatch } from "./customer-intelligence";
import { ANALYST_QUESTIONS, AnalystContractError, analystResponseSchema, buildEvidencePackage, buildQualitativeEvidence, feedbackEvidenceId, validateAnalystQuestion, verifyAnalystResponse, type AnalystResponse } from "./analyst";

const classifications: VerifiedClassificationBatch = { verified: true, classifications: customerReviewSet.map((item, index) => ({ feedbackId: item.id, theme: index < 6 ? "offer_clarity" : "content_usefulness", sentiment: index < 6 ? "negative" : "positive", journeyStage: "consideration", confidence: "high", evidenceText: item.text.slice(0, 30) })) };

function validResponse(evidence = buildEvidencePackage({ questionId: "portfolio_attention" })): AnalystResponse {
  return { assessment: "evidence_supported", headline: "Measured movement deserves focused review", observations: [{ statement: "Recent efficiency evidence shows weakened performance", evidenceIds: [evidence.evidenceIds[0]], confidence: "high" }], investigationHypotheses: [{ hypothesis: "A change in campaign execution could be investigated", relatedEvidenceIds: [evidence.evidenceIds[0]], missingEvidence: "Creative-level performance is not available" }], limitations: [{ statement: "The evidence does not establish a cause", evidenceIds: [] }], investigationPriorities: [{ question: "Which unavailable execution evidence should be collected?", relatedEvidenceIds: [evidence.evidenceIds[0]] }], causalStatus: "not_applicable" };
}

describe("analyst question contract and evidence retrieval", () => {
  it("accepts supported questions and keeps text server-owned", () => { expect(validateAnalystQuestion({ questionId: "portfolio_attention" }).questionId).toBe("portfolio_attention"); expect(ANALYST_QUESTIONS.portfolio_attention).toContain("deserves attention"); });
  it("rejects unsupported questions", () => expect(() => validateAnalystQuestion({ questionId: "write_anything" })).toThrow(AnalystContractError));
  it("requires a campaign for campaign review", () => expect(() => validateAnalystQuestion({ questionId: "campaign_review" })).toThrow(/Select a campaign/));
  it("rejects an unknown campaign", () => expect(() => validateAnalystQuestion({ questionId: "campaign_review", campaignId: "unknown" })).toThrow(/Unknown campaign/));
  it("selects deterministic portfolio evidence", () => expect(buildEvidencePackage({ questionId: "portfolio_attention" }).evidenceIds).toEqual(buildEvidencePackage({ questionId: "portfolio_attention" }).evidenceIds));
  it("keeps campaign evidence inside the selected campaign", () => expect(buildEvidencePackage({ questionId: "campaign_review", campaignId: "email-nurture" }).quantitativeEvidence.every((item) => item.scopeId === "email-nurture")).toBe(true));
  it("uses Meta evidence for causality review", () => expect(buildEvidencePackage({ questionId: "causality_check" }).quantitativeEvidence.every((item) => item.scopeId === "meta-awareness")).toBe(true));
  it("includes qualitative evidence only for customer context", () => { expect(buildEvidencePackage({ questionId: "portfolio_attention" }).qualitativeEvidence).toHaveLength(0); expect(buildEvidencePackage({ questionId: "customer_context" }, classifications).qualitativeEvidence.length).toBeGreaterThan(0); });
  it("makes unavailable causal evidence explicit", () => expect(buildEvidencePackage({ questionId: "causality_check" }).dataAvailability.filter((item) => item.status === "unavailable").length).toBeGreaterThanOrEqual(5));
});

describe("verified qualitative analyst evidence", () => {
  it("creates deterministic feedback evidence IDs", () => expect(feedbackEvidenceId("FB-13-04")).toBe("EVD-feedback-FB-13-04"));
  it("uses only verified classification records", () => expect(buildQualitativeEvidence(classifications).filter((item) => item.kind === "feedback")).toHaveLength(24));
  it("retains source campaign and exact evidence", () => { const record = buildQualitativeEvidence(classifications)[0]; expect(record.kind).toBe("feedback"); if (record.kind === "feedback") { expect(record.campaignId).toBe(customerReviewSet[0].campaignId); expect(customerReviewSet[0].text).toContain(record.evidenceText); } });
  it("creates deterministic aggregate counts with valid supporting IDs", () => { const records = buildQualitativeEvidence(classifications); const signal = records.find((item) => item.kind === "customer_signal"); expect(signal?.id).toBe("EVD-customer-offer_clarity-negative-recent-vs-prior"); if (signal?.kind === "customer_signal") expect(signal.supportingFeedbackEvidenceIds.every((id) => records.some((item) => item.id === id))).toBe(true); });
});

describe("analyst schema and output verification", () => {
  it("accepts a valid structured response", () => expect(analystResponseSchema.safeParse(validResponse()).success).toBe(true));
  it("rejects invalid enums", () => expect(analystResponseSchema.safeParse({ ...validResponse(), assessment: "certain" }).success).toBe(false));
  it("rejects missing fields", () => { const value = { ...validResponse() } as Record<string, unknown>; delete value.limitations; expect(analystResponseSchema.safeParse(value).success).toBe(false); });
  it("accepts valid citations", () => expect(verifyAnalystResponse(validResponse(), buildEvidencePackage({ questionId: "portfolio_attention" })).verified).toBe(true));
  it("rejects unknown or fabricated citations", () => { const evidence = buildEvidencePackage({ questionId: "portfolio_attention" }); const value = validResponse(evidence); value.observations[0].evidenceIds = ["EVD-NOT-REAL"]; expect(() => verifyAnalystResponse(value, evidence)).toThrow(/outside/); });
  it("rejects observations without evidence", () => { const value = validResponse(); value.observations[0].evidenceIds = []; expect(() => verifyAnalystResponse(value, buildEvidencePackage({ questionId: "portfolio_attention" }))).toThrow(); });
  it("rejects duplicate citations consistently", () => { const evidence = buildEvidencePackage({ questionId: "portfolio_attention" }); const value = validResponse(evidence); value.observations[0].evidenceIds = [evidence.evidenceIds[0], evidence.evidenceIds[0]]; expect(() => verifyAnalystResponse(value, evidence)).toThrow(/Duplicate/); });
  it("allows narrative without numbers", () => expect(verifyAnalystResponse(validResponse(), buildEvidencePackage({ questionId: "portfolio_attention" })).verified).toBe(true));
  it.each(["CPQL increased by 28%", "Current CPQL is $86", "There were 6 signals"])("rejects numeric narrative: %s", (headline) => { const value = { ...validResponse(), headline }; expect(() => verifyAnalystResponse(value, buildEvidencePackage({ questionId: "portfolio_attention" }))).toThrow(/numeric/); });
  it("allows a metric name without a number", () => { const value = { ...validResponse(), headline: "CPQL increased" }; expect(verifyAnalystResponse(value, buildEvidencePackage({ questionId: "portfolio_attention" })).verified).toBe(true); });
  it.each(["Performance weakened because of unclear offers", "Performance weakened due to creative quality", "The change was caused by messaging"])("rejects causal observation: %s", (statement) => { const evidence = buildEvidencePackage({ questionId: "portfolio_attention" }); const value = validResponse(evidence); value.observations[0].statement = statement; expect(() => verifyAnalystResponse(value, evidence)).toThrow(/causal/); });
  it("keeps hypotheses structurally separate", () => expect(validResponse().investigationHypotheses[0].missingEvidence).toContain("not available"));
  it("accepts not-established for the causal trap", () => { const evidence = buildEvidencePackage({ questionId: "causality_check" }); const value = { ...validResponse(evidence), assessment: "insufficient_evidence" as const, causalStatus: "not_established" as const }; expect(verifyAnalystResponse(value, evidence).verified).toBe(true); });
  it("rejects another causal status for the causal trap", () => { const evidence = buildEvidencePackage({ questionId: "causality_check" }); expect(() => verifyAnalystResponse(validResponse(evidence), evidence)).toThrow(/not established/); });
  it("rejects not-established status for non-causal questions", () => { const evidence = buildEvidencePackage({ questionId: "campaign_review", campaignId: "meta-awareness" }); const value = { ...validResponse(evidence), causalStatus: "not_established" as const }; expect(() => verifyAnalystResponse(value, evidence)).toThrow(/not applicable/); });
});
