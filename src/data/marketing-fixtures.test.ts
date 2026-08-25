import { describe, expect, it } from "vitest";
import { campaigns, observations } from "./marketing-fixtures";

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
});
