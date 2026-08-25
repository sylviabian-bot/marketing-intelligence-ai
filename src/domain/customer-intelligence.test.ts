import { describe, expect, it } from "vitest";
import type { CustomerFeedback } from "@/domain/marketing";
import { aggregateVerifiedClassifications, compareClassificationWindows, feedbackClassificationSchema, validateRequestedFeedback, verifyClassificationBatch, type FeedbackClassification } from "./customer-intelligence";

const source: CustomerFeedback[] = [
  { id: "A", date: "2026-08-12", source: "campaign_survey", campaignId: "meta-awareness", text: "The offer is not clear." },
  { id: "B", date: "2026-08-01", source: "event_feedback", campaignId: "event-series", text: "The event discussion was useful." },
];
const valid = { classifications: [
  { feedbackId: "A", theme: "offer_clarity", sentiment: "negative", journeyStage: "consideration", confidence: "high", evidenceText: "offer is not clear" },
  { feedbackId: "B", theme: "event_experience", sentiment: "positive", journeyStage: "awareness", confidence: "high", evidenceText: "event discussion was useful" },
] };

describe("classification schema and verification", () => {
  it("accepts a valid classification", () => expect(feedbackClassificationSchema.safeParse(valid.classifications[0]).success).toBe(true));
  it("rejects an invalid enum", () => expect(feedbackClassificationSchema.safeParse({ ...valid.classifications[0], theme: "made_up" }).success).toBe(false));
  it("rejects a missing required field", () => { const missing = { ...valid.classifications[0] } as Partial<(typeof valid.classifications)[number]>; delete missing.evidenceText; expect(feedbackClassificationSchema.safeParse(missing).success).toBe(false); });
  it("passes exact evidence excerpts", () => expect(verifyClassificationBatch(source, valid).verified).toBe(true));
  it("rejects paraphrased evidence", () => expect(() => verifyClassificationBatch(source, { classifications: [{ ...valid.classifications[0], evidenceText: "The proposition was confusing." }, valid.classifications[1]] })).toThrow(/exact source excerpt/));
  it("rejects unknown feedback IDs", () => expect(() => verifyClassificationBatch(source, { classifications: [{ ...valid.classifications[0], feedbackId: "X" }, valid.classifications[1]] })).toThrow(/Unknown/));
  it("rejects duplicate feedback IDs", () => expect(() => verifyClassificationBatch(source, { classifications: [valid.classifications[0], valid.classifications[0]] })).toThrow(/Duplicate/));
  it("rejects omitted requested IDs", () => expect(() => verifyClassificationBatch(source, { classifications: [valid.classifications[0]] })).toThrow(/incomplete/));
  it("rejects extra classifications", () => expect(() => verifyClassificationBatch(source.slice(0, 1), valid)).toThrow(/incomplete/));
  it("accepts batches at the 24-record boundary", () => expect(() => validateRequestedFeedback(Array.from({ length: 24 }, (_, index) => ({ ...source[0], id: String(index) })))).not.toThrow());
  it("rejects batches over 24", () => expect(() => validateRequestedFeedback(Array.from({ length: 25 }, (_, index) => ({ ...source[0], id: String(index) })))).toThrow(/at most 24/));
});

describe("deterministic aggregation", () => {
  const batch = verifyClassificationBatch(source, valid);
  it("counts themes", () => expect(aggregateVerifiedClassifications(batch).themes).toMatchObject({ offer_clarity: 1, event_experience: 1 }));
  it("counts sentiments", () => expect(aggregateVerifiedClassifications(batch).sentiments).toMatchObject({ negative: 1, positive: 1 }));
  it("counts journey stages", () => expect(aggregateVerifiedClassifications(batch).journeyStages).toMatchObject({ consideration: 1, awareness: 1 }));
  it("requires verified input by type and contract", () => expect(batch.verified).toBe(true));
  it("returns unavailable comparison when windows are too small", () => expect(compareClassificationWindows(batch, source, "2026-08-10", "offer_clarity", "negative").status).toBe("insufficient_evidence"));
  it("calculates recent and prior counts", () => {
    const expandedSource = Array.from({ length: 8 }, (_, i) => ({ ...source[i % 2], id: String(i), date: i < 4 ? "2026-08-01" : "2026-08-12" }));
    const expanded = { verified: true as const, classifications: expandedSource.map((item, i) => ({ ...valid.classifications[i % 2], feedbackId: item.id }) as FeedbackClassification) };
    expect(compareClassificationWindows(expanded, expandedSource, "2026-08-10", "offer_clarity", "negative")).toMatchObject({ status: "available", recentTotal: 4, priorTotal: 4, recentCount: 2, priorCount: 2 });
  });
});
