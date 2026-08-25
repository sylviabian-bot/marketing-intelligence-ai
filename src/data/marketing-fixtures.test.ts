import { describe, expect, it } from "vitest";
import { DATASET_END, DATASET_START, campaigns, observations } from "./marketing-fixtures";

describe("synthetic fixture integrity", () => {
  it("contains 52 weekly source observations for every campaign", () => {
    expect(campaigns).toHaveLength(5);
    expect(observations).toHaveLength(260);
    for (const campaign of campaigns) {
      expect(observations.filter((row) => row.campaignId === campaign.id)).toHaveLength(52);
    }
  });

  it("stores source values and no derived KPI fields", () => {
    expect(Object.keys(observations[0]).sort()).toEqual([
      "campaignId", "channel", "clicks", "conversions", "impressions", "leads", "period",
      "qualifiedLeads", "revenue", "spend",
    ]);
  });

  it("covers exactly 52 unique weekly periods in the completed reporting year", () => {
    const periods = [...new Set(observations.map((row) => row.period))];
    expect(periods).toHaveLength(52);
    expect(periods[0]).toBe(DATASET_START);
    expect(periods.at(-1)).toBe("2026-08-17");
    expect(DATASET_END).toBe("2026-08-23");
  });

  it("keeps all numeric source values finite, non-negative, and funnel-coherent", () => {
    const numericFields = ["spend", "impressions", "clicks", "leads", "qualifiedLeads", "conversions", "revenue"] as const;

    for (const observation of observations) {
      for (const field of numericFields) {
        expect(Number.isFinite(observation[field])).toBe(true);
        expect(observation[field]).toBeGreaterThanOrEqual(0);
      }
      expect(observation.conversions).toBeLessThanOrEqual(observation.qualifiedLeads);
      expect(observation.qualifiedLeads).toBeLessThanOrEqual(observation.leads);
      expect(observation.leads).toBeLessThanOrEqual(observation.clicks);
      expect(observation.clicks).toBeLessThanOrEqual(observation.impressions);
    }
  });

  it("keeps observation campaign references and channels consistent", () => {
    const campaignsById = new Map(campaigns.map((campaign) => [campaign.id, campaign]));
    for (const observation of observations) {
      const campaign = campaignsById.get(observation.campaignId);
      expect(campaign).toBeDefined();
      expect(observation.channel).toBe(campaign?.channel);
    }
  });

  it("contains no duplicate campaign and period pairs", () => {
    const pairs = observations.map((row) => `${row.campaignId}:${row.period}`);
    expect(new Set(pairs).size).toBe(pairs.length);
  });
});
