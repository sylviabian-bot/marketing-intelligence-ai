import { describe, expect, it, vi } from "vitest";
import { handleClassificationRequest } from "./handler";

const request = (body: unknown) => new Request("http://localhost/api/customer-intelligence/classify", { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });

describe("customer intelligence route", () => {
  it("rejects oversized batches before a provider call", async () => { const classify = vi.fn(async () => ({})); const response = await handleClassificationRequest(request({ feedbackIds: Array.from({ length: 25 }, (_, i) => String(i)) }), classify); expect(response.status).toBe(400); expect(classify).not.toHaveBeenCalled(); });
  it("returns a safe missing-key error", async () => { const response = await handleClassificationRequest(request({ feedbackIds: ["FB-01-01"] }), async () => { throw new Error("OPENAI_NOT_CONFIGURED"); }); expect(response.status).toBe(503); expect(await response.json()).toEqual({ error: "Live AI classification is not configured in this environment." }); });
  it("returns a safe invalid-ID error", async () => { const response = await handleClassificationRequest(request({ feedbackIds: ["UNKNOWN"] }), async () => { throw new Error("INVALID_FEEDBACK_IDS"); }); expect(response.status).toBe(400); expect(await response.json()).toEqual({ error: "One or more feedback records are not available in this review set." }); });
  it("sanitises provider errors", async () => { const response = await handleClassificationRequest(request({ feedbackIds: ["FB-01-01"] }), async () => { throw new Error("secret provider detail"); }); expect(response.status).toBe(502); expect(JSON.stringify(await response.json())).not.toContain("secret provider detail"); });
  it("does not return unverified classifications", async () => { const { ClassificationVerificationError } = await import("../../../../domain/customer-intelligence"); const response = await handleClassificationRequest(request({ feedbackIds: ["FB-01-01"] }), async () => { throw new ClassificationVerificationError(); }); expect(response.status).toBe(502); expect(await response.json()).toEqual({ error: "AI output failed evidence verification and was not used." }); });
});
