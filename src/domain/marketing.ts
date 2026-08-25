export const CHANNELS = ["Paid Search", "Meta", "LinkedIn", "Email", "Events"] as const;

export type Channel = (typeof CHANNELS)[number];

export interface Campaign {
  id: string;
  name: string;
  channel: Channel;
  objective: string;
  startDate: string;
  endDate: string;
}

export interface MarketingObservation {
  period: string;
  campaignId: string;
  channel: Channel;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  conversions: number;
  revenue: number;
}

export type MetricKey = "spend" | "qualifiedLeads" | "cpql" | "roas";

export interface MarketingTotals {
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  qualifiedLeads: number;
  conversions: number;
  revenue: number;
}

export interface MarketingKpis {
  ctr: number | null;
  cpc: number | null;
  cpl: number | null;
  cpql: number | null;
  qualificationRate: number | null;
  conversionRate: number | null;
  cpa: number | null;
  roas: number | null;
}

export interface PeriodChange {
  metric: MetricKey;
  direction: "increased" | "decreased" | "remained stable";
  performance: "improved" | "weakened" | null;
  percentChange: number;
  statement: string;
}
