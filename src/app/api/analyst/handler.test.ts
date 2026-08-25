import { describe, expect, it, vi } from "vitest";
import { AnalystContractError } from "../../../domain/analyst";
import { handleAnalystRequest } from "./handler";

const request = (body: unknown) => new Request("http://localhost/api/analyst", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

describe("analyst route handler", () => {
  it("returns a safe invalid-question error", async () => { const response = await handleAnalystRequest(request({ questionId: "unknown" }), async () => { throw new AnalystContractError("INVALID_QUESTION", "detail"); }); expect(response.status).toBe(400); });
  it("returns a safe invalid-campaign error", async () => { const response = await handleAnalystRequest(request({ questionId: "campaign_review", campaignId: "unknown" }), async () => { throw new AnalystContractError("INVALID_CAMPAIGN", "detail"); }); expect(response.status).toBe(400); });
  it("returns a safe missing-key error", async () => { const response = await handleAnalystRequest(request({ questionId: "portfolio_attention" }), async () => { throw new Error("OPENAI_NOT_CONFIGURED"); }); expect(response.status).toBe(503); expect(JSON.stringify(await response.json())).not.toContain("OPENAI_API_KEY"); });
  it("sanitises analyst provider failures", async () => { const response = await handleAnalystRequest(request({ questionId: "portfolio_attention" }), async () => { throw new Error("raw provider detail"); }); expect(response.status).toBe(502); expect(JSON.stringify(await response.json())).not.toContain("raw provider detail"); });
  it("returns a safe customer-classification failure", async () => { const response = await handleAnalystRequest(request({ questionId: "customer_context" }), async () => { const error = new Error("untrusted classification detail"); error.name = "ClassificationVerificationError"; throw error; }); expect(response.status).toBe(502); expect(JSON.stringify(await response.json())).not.toContain("untrusted classification detail"); });
  it("rejects unverified output without returning it", async () => { const response = await handleAnalystRequest(request({ questionId: "portfolio_attention" }), async () => { throw new AnalystContractError("ANALYST_VERIFICATION_FAILED", "untrusted prose"); }); expect(response.status).toBe(502); expect(JSON.stringify(await response.json())).not.toContain("untrusted prose"); });
  it("passes only validated request fields to the service", async () => { const run = vi.fn(async () => ({ ok: true })); const response = await handleAnalystRequest(request({ questionId: "portfolio_attention" }), run); expect(response.status).toBe(200); expect(run).toHaveBeenCalledWith({ questionId: "portfolio_attention" }); });
});
