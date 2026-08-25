import { aggregateObservations, calculateCpql, calculateRoas } from "./analytics";
import type {
  AnomalyResult, Campaign, EvidenceRecord, MarketingObservation, MetricKey, OverviewAttentionItem, TrendPerformance, TrendResult,
} from "./marketing";

export const TREND_STABILITY_THRESHOLD = 0.05;
export const ANOMALY_Z_THRESHOLD = 3.5;
export const ANOMALY_BASELINE_SIZE = 8;

export const VOLUME_GUARDS = {
  qualifiedLeads: { minimumLeads: 15 },
  cpql: { minimumQualifiedLeads: 5 },
  roas: { minimumSpend: 500 },
  spend: { minimumSpend: 500 },
} as const;

export function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

export function medianAbsoluteDeviation(values: number[]): number | null {
  const centre = median(values);
  return centre === null ? null : median(values.map((value) => Math.abs(value - centre)));
}

export function robustZScore(current: number, baseline: number[]): number | null {
  const centre = median(baseline);
  const mad = medianAbsoluteDeviation(baseline);
  return centre === null || mad === null || mad === 0 ? null : 0.6745 * (current - centre) / mad;
}

export function metricValue(metric: MetricKey, observations: MarketingObservation[]): number | null {
  const totals = aggregateObservations(observations);
  if (metric === "qualifiedLeads") return totals.qualifiedLeads;
  if (metric === "spend") return totals.spend;
  if (metric === "cpql") return calculateCpql(totals.spend, totals.qualifiedLeads);
  return calculateRoas(totals.revenue, totals.spend);
}

function trendPerformance(metric: MetricKey, direction: "increasing" | "stable" | "declining"): TrendPerformance {
  if (direction === "stable") return null;
  if (metric === "spend") return "not_applicable";
  const higherIsBetter = metric !== "cpql";
  return (direction === "increasing") === higherIsBetter ? "improved" : "weakened";
}

export function analyseTrend(metric: MetricKey, observations: MarketingObservation[]): TrendResult {
  const sorted = [...observations].sort((a, b) => a.period.localeCompare(b.period));
  if (sorted.length < 8) {
    return { metric, status: "insufficient_history", direction: null, performance: null, currentValue: null, previousValue: null, percentChange: null, currentPeriods: [], previousPeriods: [] };
  }
  const current = sorted.slice(-4);
  const previous = sorted.slice(-8, -4);
  const currentValue = metricValue(metric, current);
  const previousValue = metricValue(metric, previous);
  if (currentValue === null || previousValue === null) {
    return { metric, status: "unavailable", direction: null, performance: null, currentValue, previousValue, percentChange: null, currentPeriods: current.map((row) => row.period), previousPeriods: previous.map((row) => row.period) };
  }
  const percentChange = previousValue === 0 ? null : (currentValue - previousValue) / Math.abs(previousValue);
  const direction = previousValue === 0
    ? currentValue === 0 ? "stable" : "increasing"
    : Math.abs(percentChange ?? 0) < TREND_STABILITY_THRESHOLD ? "stable" : currentValue > previousValue ? "increasing" : "declining";
  return {
    metric, status: "available", direction, performance: trendPerformance(metric, direction), currentValue, previousValue,
    percentChange, currentPeriods: current.map((row) => row.period), previousPeriods: previous.map((row) => row.period),
  };
}

export function passesVolumeGuard(metric: MetricKey, observation: MarketingObservation): boolean {
  if (metric === "qualifiedLeads") return observation.leads >= VOLUME_GUARDS.qualifiedLeads.minimumLeads;
  if (metric === "cpql") return observation.qualifiedLeads >= VOLUME_GUARDS.cpql.minimumQualifiedLeads;
  if (metric === "roas") return observation.spend >= VOLUME_GUARDS.roas.minimumSpend;
  return observation.spend >= VOLUME_GUARDS.spend.minimumSpend;
}

function weeklyMetricValue(metric: MetricKey, observation: MarketingObservation): number | null {
  return metricValue(metric, [observation]);
}

export function detectAnomaly(metric: MetricKey, history: MarketingObservation[], current: MarketingObservation): AnomalyResult {
  const currentValue = weeklyMetricValue(metric, current);
  if (currentValue === null) return { metric, status: "unavailable", score: null, currentValue: null, baselineMedian: null, mad: null, supportingPeriods: [], reason: "The current metric is unavailable." };
  if (!passesVolumeGuard(metric, current)) return { metric, status: "insufficient_volume", score: null, currentValue, baselineMedian: null, mad: null, supportingPeriods: [], reason: "The current observation does not meet the metric's minimum-volume guard." };

  const valid = history
    .filter((row) => row.period < current.period && passesVolumeGuard(metric, row))
    .sort((a, b) => a.period.localeCompare(b.period))
    .map((row) => ({ period: row.period, value: weeklyMetricValue(metric, row) }))
    .filter((row): row is { period: string; value: number } => row.value !== null)
    .slice(-ANOMALY_BASELINE_SIZE);
  if (valid.length < ANOMALY_BASELINE_SIZE) return { metric, status: "insufficient_history", score: null, currentValue, baselineMedian: null, mad: null, supportingPeriods: valid.map((row) => row.period), reason: `Fewer than ${ANOMALY_BASELINE_SIZE} valid prior observations are available.` };

  const values = valid.map((row) => row.value);
  const baselineMedian = median(values);
  const mad = medianAbsoluteDeviation(values);
  if (baselineMedian === null || mad === null || mad === 0) return { metric, status: "insufficient_variation", score: null, currentValue, baselineMedian, mad, supportingPeriods: valid.map((row) => row.period), reason: "The baseline has no usable median absolute deviation." };
  const score = robustZScore(currentValue, values);
  if (score === null) return { metric, status: "insufficient_variation", score: null, currentValue, baselineMedian, mad, supportingPeriods: valid.map((row) => row.period), reason: "A robust anomaly score cannot be calculated." };
  return {
    metric, status: Math.abs(score) >= ANOMALY_Z_THRESHOLD ? "anomaly" : "within_expected_range", score, currentValue,
    baselineMedian, mad, supportingPeriods: valid.map((row) => row.period),
    reason: Math.abs(score) >= ANOMALY_Z_THRESHOLD ? "The robust z-score meets the deterministic anomaly threshold." : "The observation remains within the deterministic anomaly threshold.",
  };
}

export function evidenceId(scopeId: string, metric: MetricKey, period: string): string {
  return `EVD-campaign-${scopeId}-${metric}-${period}`;
}

export function buildEvidenceRecord(campaign: Campaign, metric: MetricKey, observations: MarketingObservation[]): EvidenceRecord {
  const sorted = [...observations].filter((row) => row.campaignId === campaign.id).sort((a, b) => a.period.localeCompare(b.period));
  const current = sorted.at(-1);
  if (!current) throw new Error(`No observations exist for campaign ${campaign.id}.`);
  const trend = analyseTrend(metric, sorted);
  const anomaly = detectAnomaly(metric, sorted.slice(0, -1), current);
  const evidenceQuality = anomaly.status === "anomaly" || anomaly.status === "within_expected_range" ? "high" : anomaly.status === "unavailable" ? "unavailable" : "limited";
  return {
    id: evidenceId(campaign.id, metric, current.period), scopeType: "campaign", scopeId: campaign.id, scopeLabel: campaign.name,
    metric, period: current.period, trend, anomaly, evidenceQuality,
  };
}

export function buildCampaignEvidence(campaigns: Campaign[], observations: MarketingObservation[]): EvidenceRecord[] {
  const metrics: MetricKey[] = ["qualifiedLeads", "cpql", "roas", "spend"];
  return campaigns.flatMap((campaign) => metrics.map((metric) => buildEvidenceRecord(campaign, metric, observations)));
}

export function selectOverviewAttention(records: EvidenceRecord[], maximumAnomalies = 3): OverviewAttentionItem[] {
  const anomalies = records.filter((record) => record.anomaly.status === "anomaly");
  const primaryByScope = new Map<string, EvidenceRecord>();
  for (const record of anomalies) {
    if (!primaryByScope.has(record.scopeId)) primaryByScope.set(record.scopeId, record);
    if (primaryByScope.size === maximumAnomalies) break;
  }
  const selected = [...primaryByScope.values()].map((record) => ({
    record,
    relatedAnomalyCount: Math.max(0, anomalies.filter((candidate) => candidate.scopeId === record.scopeId).length - 1),
  }));
  const selectedScopes = new Set(selected.map((item) => item.record.scopeId));
  const weakenedTrend = records.find((record) => record.anomaly.status !== "anomaly" && record.trend.performance === "weakened" && !selectedScopes.has(record.scopeId))
    ?? records.find((record) => record.anomaly.status !== "anomaly" && record.trend.performance === "weakened");
  if (weakenedTrend) selected.push({ record: weakenedTrend, relatedAnomalyCount: 0 });
  return selected;
}
