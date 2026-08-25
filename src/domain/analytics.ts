import type { MarketingKpis, MarketingObservation, MarketingTotals, MetricKey, PeriodChange } from "./marketing";

export function safeDivide(numerator: number, denominator: number): number | null {
  return denominator === 0 ? null : numerator / denominator;
}

export const calculateCtr = (clicks: number, impressions: number) => safeDivide(clicks, impressions);
export const calculateCpc = (spend: number, clicks: number) => safeDivide(spend, clicks);
export const calculateCpl = (spend: number, leads: number) => safeDivide(spend, leads);
export const calculateCpql = (spend: number, qualifiedLeads: number) => safeDivide(spend, qualifiedLeads);
export const calculateQualificationRate = (qualifiedLeads: number, leads: number) => safeDivide(qualifiedLeads, leads);
export const calculateConversionRate = (conversions: number, leads: number) => safeDivide(conversions, leads);
export const calculateCpa = (spend: number, conversions: number) => safeDivide(spend, conversions);
export const calculateRoas = (revenue: number, spend: number) => safeDivide(revenue, spend);

export function aggregateObservations(observations: MarketingObservation[]): MarketingTotals {
  return observations.reduce<MarketingTotals>(
    (total, observation) => ({
      spend: total.spend + observation.spend,
      impressions: total.impressions + observation.impressions,
      clicks: total.clicks + observation.clicks,
      leads: total.leads + observation.leads,
      qualifiedLeads: total.qualifiedLeads + observation.qualifiedLeads,
      conversions: total.conversions + observation.conversions,
      revenue: total.revenue + observation.revenue,
    }),
    { spend: 0, impressions: 0, clicks: 0, leads: 0, qualifiedLeads: 0, conversions: 0, revenue: 0 },
  );
}

export function deriveKpis(totals: MarketingTotals): MarketingKpis {
  return {
    ctr: calculateCtr(totals.clicks, totals.impressions),
    cpc: calculateCpc(totals.spend, totals.clicks),
    cpl: calculateCpl(totals.spend, totals.leads),
    cpql: calculateCpql(totals.spend, totals.qualifiedLeads),
    qualificationRate: calculateQualificationRate(totals.qualifiedLeads, totals.leads),
    conversionRate: calculateConversionRate(totals.conversions, totals.leads),
    cpa: calculateCpa(totals.spend, totals.conversions),
    roas: calculateRoas(totals.revenue, totals.spend),
  };
}

export function compareMetric(metric: MetricKey, current: number, previous: number, stabilityThreshold = 0.02): PeriodChange {
  const change = previous === 0 ? (current === 0 ? 0 : 1) : (current - previous) / Math.abs(previous);
  const stable = Math.abs(change) < stabilityThreshold;
  const direction = stable ? "remained stable" : change > 0 ? "increased" : "decreased";
  const lowerIsBetter = metric === "cpql";
  const performance = stable ? "neutral" : (change > 0) !== lowerIsBetter ? "improved" : "weakened";
  const labels: Record<MetricKey, string> = {
    spend: "Marketing spend",
    qualifiedLeads: "Qualified leads",
    cpql: "Cost per qualified lead",
    roas: "ROAS",
  };

  return {
    metric,
    direction,
    performance,
    percentChange: change,
    statement: stable
      ? `${labels[metric]} remained stable versus the previous period.`
      : `${labels[metric]} ${direction} ${Math.abs(change * 100).toFixed(1)}% versus the previous period; measured performance ${performance}.`,
  };
}

export function buildWhatChanged(current: MarketingObservation[], previous: MarketingObservation[]): PeriodChange[] {
  const currentTotals = aggregateObservations(current);
  const previousTotals = aggregateObservations(previous);
  const currentKpis = deriveKpis(currentTotals);
  const previousKpis = deriveKpis(previousTotals);

  return [
    compareMetric("qualifiedLeads", currentTotals.qualifiedLeads, previousTotals.qualifiedLeads),
    compareMetric("cpql", currentKpis.cpql ?? 0, previousKpis.cpql ?? 0),
    compareMetric("roas", currentKpis.roas ?? 0, previousKpis.roas ?? 0),
    compareMetric("spend", currentTotals.spend, previousTotals.spend),
  ];
}
