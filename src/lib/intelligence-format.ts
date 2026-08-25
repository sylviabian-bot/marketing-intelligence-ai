import type { EvidenceRecord, MetricKey } from "@/domain/marketing";
import { formatCurrency, formatMultiple, formatNumber } from "./format";

export const metricLabels: Record<MetricKey, string> = {
  qualifiedLeads: "Qualified leads",
  cpql: "Cost per qualified lead",
  roas: "ROAS",
  spend: "Marketing spend",
};

export function formatMetricValue(metric: MetricKey, value: number | null): string {
  if (value === null) return "Unavailable";
  if (metric === "qualifiedLeads") return formatNumber(value);
  if (metric === "roas") return formatMultiple(value);
  return formatCurrency(value);
}

export function signalType(record: EvidenceRecord): "Trend" | "Anomaly" | "Trend + anomaly" {
  const hasTrend = record.trend.direction !== null && record.trend.direction !== "stable";
  const hasAnomaly = record.anomaly.status === "anomaly";
  return hasTrend && hasAnomaly ? "Trend + anomaly" : hasAnomaly ? "Anomaly" : "Trend";
}

export function trendStatement(record: EvidenceRecord): string {
  if (!record.trend.direction) return `${metricLabels[record.metric]} trend is unavailable.`;
  const percent = record.trend.percentChange === null ? "from a zero baseline" : `${Math.abs(record.trend.percentChange * 100).toFixed(1)}%`;
  const performance = record.trend.performance === "improved" || record.trend.performance === "weakened" ? `; measured performance ${record.trend.performance}` : "";
  return `${metricLabels[record.metric]} is ${record.trend.direction} ${percent}${performance}.`;
}
