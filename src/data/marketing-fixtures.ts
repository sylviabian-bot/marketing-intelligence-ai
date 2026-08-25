import type { Campaign, MarketingObservation } from "@/domain/marketing";

export const campaigns: Campaign[] = [
  { id: "search-demand", name: "Northstar Demand Capture", channel: "Paid Search", objective: "Capture high-intent solution enquiries", startDate: "2026-01-05", endDate: "2027-01-03" },
  { id: "meta-awareness", name: "Signal & Story", channel: "Meta", objective: "Build consideration among emerging buyers", startDate: "2026-01-05", endDate: "2027-01-03" },
  { id: "linkedin-abm", name: "Executive Growth Forum", channel: "LinkedIn", objective: "Generate qualified enterprise conversations", startDate: "2026-01-05", endDate: "2027-01-03" },
  { id: "email-nurture", name: "Momentum Nurture", channel: "Email", objective: "Progress known prospects toward evaluation", startDate: "2026-01-05", endDate: "2027-01-03" },
  { id: "event-series", name: "Market Futures Series", channel: "Events", objective: "Create high-quality in-person opportunities", startDate: "2026-01-05", endDate: "2027-01-03" },
];

const profiles = {
  "search-demand": { spend: 6200, impressions: 92000, ctr: 0.036, leadRate: 0.075, qualityRate: 0.48, conversionRate: 0.2, value: 8200 },
  "meta-awareness": { spend: 3900, impressions: 240000, ctr: 0.011, leadRate: 0.038, qualityRate: 0.28, conversionRate: 0.12, value: 5700 },
  "linkedin-abm": { spend: 5100, impressions: 76000, ctr: 0.009, leadRate: 0.065, qualityRate: 0.56, conversionRate: 0.19, value: 11200 },
  "email-nurture": { spend: 950, impressions: 52000, ctr: 0.047, leadRate: 0.046, qualityRate: 0.44, conversionRate: 0.18, value: 6900 },
  "event-series": { spend: 8800, impressions: 18000, ctr: 0.018, leadRate: 0.16, qualityRate: 0.62, conversionRate: 0.24, value: 12800 },
} as const;

function isoWeek(index: number): string {
  const date = new Date(Date.UTC(2026, 0, 5 + index * 7));
  return date.toISOString().slice(0, 10);
}

export const observations: MarketingObservation[] = Array.from({ length: 52 }, (_, week) =>
  campaigns.map((campaign, campaignIndex) => {
    const profile = profiles[campaign.id as keyof typeof profiles];
    const seasonality = 1 + Math.sin((week + campaignIndex * 2) / 5) * 0.08;
    const midYearShift = week >= 26 ? 1 + (campaignIndex - 2) * 0.025 : 1;
    const lateYearQuality = week >= 39 ? 1.06 : 1;
    const eventCadence = campaign.channel === "Events" && week % 8 !== 3 ? 0.35 : 1;
    const spend = Math.round(profile.spend * seasonality * eventCadence);
    const impressions = Math.round(profile.impressions * seasonality * eventCadence);
    const clicks = Math.round(impressions * profile.ctr * midYearShift);
    const leads = Math.round(clicks * profile.leadRate);
    const qualifiedLeads = Math.round(leads * profile.qualityRate * lateYearQuality);
    const conversions = Math.round(qualifiedLeads * profile.conversionRate);
    const revenue = conversions * profile.value;

    return { period: isoWeek(week), campaignId: campaign.id, channel: campaign.channel, spend, impressions, clicks, leads, qualifiedLeads, conversions, revenue };
  }),
).flat();

export const currentPeriodStart = "2026-10-05";
export const previousPeriodStart = "2026-07-06";

export function observationsBetween(start: string, end: string): MarketingObservation[] {
  return observations.filter((observation) => observation.period >= start && observation.period <= end);
}
