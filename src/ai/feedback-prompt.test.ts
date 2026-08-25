import { describe, expect, it } from "vitest";
import { buildFeedbackInput, FEEDBACK_CLASSIFICATION_INSTRUCTIONS } from "./feedback-prompt";

describe("feedback prompt boundary", () => {
  it("sends only IDs and feedback text", () => { const input = buildFeedbackInput([{ id: "A", date: "2026-01-01", source: "enquiry", campaignId: "x", text: "Useful content." }]); expect(JSON.parse(input)).toEqual([{ feedbackId: "A", feedbackText: "Useful content." }]); });
  it("requires exact evidence and prohibits causality", () => { expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/exact contiguous excerpt/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/never establish campaign causality/); });
});
