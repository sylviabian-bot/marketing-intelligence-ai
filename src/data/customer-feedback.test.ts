import { describe, expect, it } from "vitest";
import { campaigns } from "./marketing-fixtures";
import { customerFeedback, customerReviewSet } from "./customer-feedback";

describe("synthetic customer feedback fixtures", () => {
  it("contains 300 to 400 records with unique IDs", () => { expect(customerFeedback.length).toBeGreaterThanOrEqual(300); expect(customerFeedback.length).toBeLessThanOrEqual(400); expect(new Set(customerFeedback.map((item) => item.id)).size).toBe(customerFeedback.length); });
  it("uses valid campaign references and ISO dates", () => { const ids = new Set(campaigns.map((item) => item.id)); expect(customerFeedback.every((item) => ids.has(item.campaignId) && /^2026-\d{2}-\d{2}$/.test(item.date))).toBe(true); });
  it("uses a bounded 24-record review set", () => expect(customerReviewSet).toHaveLength(24));
  it("contains intended synthetic language scenarios", () => { const text = customerFeedback.map((item) => item.text).join(" ").toLowerCase(); expect(text).toContain("offer is not clear"); expect(text).toContain("event discussion was relevant"); expect(text).toContain("follow-up was slower"); expect(text).toContain("content relevant"); });
  it("contains no customer identity fields", () => expect(customerFeedback.every((item) => !Reflect.has(item, "customerName") && !Reflect.has(item, "organisation"))).toBe(true));
});
