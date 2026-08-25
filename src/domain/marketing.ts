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
  percentChange: number | null;
  statement: string;
}

export type TrendDirection = "increasing" | "stable" | "declining";
export type TrendPerformance = "improved" | "weakened" | "not_applicable" | null;
export type AnomalyStatus = "anomaly" | "within_expected_range" | "insufficient_history" | "insufficient_variation" | "insufficient_volume" | "unavailable";

export interface TrendResult {
  metric: MetricKey;
  status: "available" | "unavailable" | "insufficient_history";
  direction: TrendDirection | null;
  performance: TrendPerformance;
  currentValue: number | null;
  previousValue: number | null;
  percentChange: number | null;
  currentPeriods: string[];
  previousPeriods: string[];
}

export interface AnomalyResult {
  metric: MetricKey;
  status: AnomalyStatus;
  score: number | null;
  currentValue: number | null;
  baselineMedian: number | null;
  mad: number | null;
  supportingPeriods: string[];
  reason: string;
}

export interface EvidenceRecord {
  id: string;
  scopeType: "campaign";
  scopeId: string;
  scopeLabel: string;
  metric: MetricKey;
  period: string;
  trend: TrendResult;
  anomaly: AnomalyResult;
  evidenceQuality: "high" | "limited" | "unavailable";
}

export interface OverviewAttentionItem {
  record: EvidenceRecord;
  relatedAnomalyCount: number;
}

export const FEEDBACK_SOURCES = ["campaign_survey", "event_feedback", "enquiry", "follow_up_survey", "website_feedback"] as const;
export type FeedbackSource = (typeof FEEDBACK_SOURCES)[number];

export interface CustomerFeedback {
  id: string;
  date: string;
  source: FeedbackSource;
  campaignId: string;
  text: string;
}
