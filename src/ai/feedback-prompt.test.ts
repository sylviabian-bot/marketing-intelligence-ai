import { describe, expect, it } from "vitest";
import { buildFeedbackInput, FEEDBACK_CLASSIFICATION_INSTRUCTIONS } from "./feedback-prompt";

describe("feedback prompt boundary", () => {
  it("sends only IDs and feedback text", () => { const input = buildFeedbackInput([{ id: "A", date: "2026-01-01", source: "enquiry", campaignId: "x", text: "Useful content." }]); expect(JSON.parse(input)).toEqual([{ feedbackId: "A", feedbackText: "Useful content." }]); });
  it("defines the theme taxonomy", () => { expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/offer_clarity: clarity of the offer/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/content_usefulness: usefulness, practicality/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/other: no listed theme/); });
  it("requires one primary theme for mixed feedback", () => { expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/Select exactly one primary theme/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/do not add a second theme/); });
  it("defines categorical confidence without probability claims", () => { expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/high means direct, explicit language/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/medium means strong support/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/low means the text is ambiguous/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/not a calibrated probability/); });
  it("requires exact evidence and prohibits causality", () => { expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/exact contiguous excerpt/); expect(FEEDBACK_CLASSIFICATION_INSTRUCTIONS).toMatch(/never establish campaign causality/); });
});
