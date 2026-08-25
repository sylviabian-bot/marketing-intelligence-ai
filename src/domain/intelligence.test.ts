import { describe, expect, it } from "vitest";
import { campaigns, observations } from "../data/marketing-fixtures";
import type { MarketingObservation, MetricKey } from "./marketing";
import {
  ANOMALY_Z_THRESHOLD, analyseTrend, buildCampaignEvidence, buildEvidenceRecord, detectAnomaly, evidenceId, median,
  medianAbsoluteDeviation, passesVolumeGuard, robustZScore, selectOverviewAttention,
} from "./intelligence";

function weekly(period: string, spend: number, overrides: Partial<MarketingObservation> = {}): MarketingObservation {
  return { period, campaignId: "test", channel: "Paid Search", spend, impressions: 1000, clicks: 100, leads: 30, qualifiedLeads: 10, conversions: 2, revenue: spend * 3, ...overrides };
}

function series(values: number[], metric: MetricKey = "spend"): MarketingObservation[] {
  return values.map((value, index) => {
    const period = `2026-0${Math.floor(index / 4) + 1}-${String((index % 4) * 7 + 1).padStart(2, "0")}`;
    if (metric === "qualifiedLeads") return weekly(period, 1000, { qualifiedLeads: value, conversions: Math.min(2, value) });
    return weekly(period, value);
  });
}

describe("trend analysis", () => {
  it("detects increasing, declining, and stable trends", () => {
    expect(analyseTrend("qualifiedLeads", series([10, 10, 10, 10, 14, 14, 14, 14], "qualifiedLeads")).direction).toBe("increasing");
    expect(analyseTrend("qualifiedLeads", series([14, 14, 14, 14, 10, 10, 10, 10], "qualifiedLeads")).direction).toBe("declining");
    expect(analyseTrend("qualifiedLeads", series([10, 10, 10, 10, 10, 10, 10, 10], "qualifiedLeads")).direction).toBe("stable");
  });

  it("applies higher-is-better and lower-is-better performance semantics", () => {
    expect(analyseTrend("qualifiedLeads", series([10, 10, 10, 10, 14, 14, 14, 14], "qualifiedLeads")).performance).toBe("improved");
    const cpqlDecline = series([1000, 1000, 1000, 1000, 800, 800, 800, 800]);
    expect(analyseTrend("cpql", cpqlDecline).performance).toBe("improved");
  });

  it("keeps spend directional without performance judgement", () => {
    const trend = analyseTrend("spend", series([1000, 1000, 1000, 1000, 1400, 1400, 1400, 1400]));
    expect(trend.direction).toBe("increasing");
    expect(trend.performance).toBe("not_applicable");
  });

  it("keeps zero-baseline percentage undefined", () => {
    const trend = analyseTrend("qualifiedLeads", series([0, 0, 0, 0, 10, 10, 10, 10], "qualifiedLeads"));
    expect(trend).toMatchObject({ direction: "increasing", percentChange: null, performance: "improved" });
  });

  it("returns unavailable when a grouped KPI lacks a denominator", () => {
    const rows = series(Array(8).fill(1000)).map((row) => ({ ...row, qualifiedLeads: 0 }));
    expect(analyseTrend("cpql", rows).status).toBe("unavailable");
  });
});

describe("median and MAD anomaly detection", () => {
  const baselineValues = [900, 950, 1000, 1000, 1000, 1050, 1100, 1000];

  it("calculates median, MAD, and robust z-score", () => {
    expect(median(baselineValues)).toBe(1000);
    expect(medianAbsoluteDeviation(baselineValues)).toBe(25);
    expect(robustZScore(1200, baselineValues)).toBeCloseTo(5.396, 3);
  });

  it("uses the inclusive threshold boundary", () => {
    const thresholdCurrent = 1000 + (ANOMALY_Z_THRESHOLD * 25) / 0.6745;
    expect(Math.abs(robustZScore(thresholdCurrent, baselineValues) ?? 0)).toBeCloseTo(ANOMALY_Z_THRESHOLD, 10);
    expect(detectAnomaly("spend", series(baselineValues), weekly("2026-03-01", thresholdCurrent)).status).toBe("anomaly");
  });

  it("detects positive and negative anomalies", () => {
    const history = series(baselineValues);
    expect(detectAnomaly("spend", history, weekly("2026-03-01", 1200)).status).toBe("anomaly");
    expect(detectAnomaly("spend", history, weekly("2026-03-01", 800)).status).toBe("anomaly");
  });

  it("returns insufficient history and zero-MAD states safely", () => {
    expect(detectAnomaly("spend", series(baselineValues.slice(0, 7)), weekly("2026-03-01", 1200)).status).toBe("insufficient_history");
    expect(detectAnomaly("spend", series(Array(8).fill(1000)), weekly("2026-03-01", 1200)).status).toBe("insufficient_variation");
  });

  it("excludes the current observation from its baseline", () => {
    const current = weekly("2026-03-01", 1200);
    const result = detectAnomaly("spend", [...series(baselineValues), current], current);
    expect(result.supportingPeriods).not.toContain(current.period);
    expect(result.baselineMedian).toBe(1000);
  });

  it("produces identical anomaly evidence from shuffled history", () => {
    const sorted = series(baselineValues);
    const shuffled = [sorted[5], sorted[1], sorted[7], sorted[0], sorted[4], sorted[2], sorted[6], sorted[3]];
    const current = weekly("2026-03-01", 1200);
    const expected = detectAnomaly("spend", sorted, current);
    const actual = detectAnomaly("spend", shuffled, current);
    expect(actual.supportingPeriods).toEqual(expected.supportingPeriods);
    expect(actual.baselineMedian).toBe(expected.baselineMedian);
    expect(actual.mad).toBe(expected.mad);
    expect(actual.score).toBe(expected.score);
    expect(actual.status).toBe(expected.status);
  });
});

describe("volume guards and evidence", () => {
  it("passes and fails explicit volume guards", () => {
    expect(passesVolumeGuard("qualifiedLeads", weekly("2026-01-01", 1000))).toBe(true);
    expect(passesVolumeGuard("qualifiedLeads", weekly("2026-01-01", 1000, { leads: 5, qualifiedLeads: 2 }))).toBe(false);
  });

  it("does not label a failed volume guard as an anomaly", () => {
    const result = detectAnomaly("qualifiedLeads", series(Array(8).fill(1000)), weekly("2026-03-01", 1000, { leads: 4, qualifiedLeads: 2 }));
    expect(result.status).toBe("insufficient_volume");
    expect(result.score).toBeNull();
  });

  it("keeps an unusually low qualified-lead outcome eligible when upstream lead volume is sufficient", () => {
    const history = series([8, 9, 10, 10, 10, 11, 12, 10], "qualifiedLeads");
    const result = detectAnomaly("qualifiedLeads", history, weekly("2026-03-01", 1000, { leads: 40, qualifiedLeads: 2, conversions: 1 }));
    expect(result.status).toBe("anomaly");
    expect(result.score).toBeLessThan(-3.5);
  });

  it("still rejects qualified-lead anomalies with low upstream lead volume", () => {
    const history = series([8, 9, 10, 10, 10, 11, 12, 10], "qualifiedLeads");
    expect(detectAnomaly("qualifiedLeads", history, weekly("2026-03-01", 1000, { leads: 8, qualifiedLeads: 2 })).status).toBe("insufficient_volume");
  });

  it("retains low qualified-lead outcomes in the qualified-lead baseline", () => {
    const history = series([2, 8, 9, 10, 10, 11, 12, 10], "qualifiedLeads");
    const result = detectAnomaly("qualifiedLeads", history, weekly("2026-03-01", 1000, { leads: 40, qualifiedLeads: 6 }));
    expect(result.supportingPeriods).toEqual(history.map((row) => row.period));
  });

  it("retains the CPQL qualified-lead denominator guard", () => {
    expect(passesVolumeGuard("cpql", weekly("2026-01-01", 1000, { leads: 40, qualifiedLeads: 2 }))).toBe(false);
  });

  it("creates stable evidence IDs and correct provenance", () => {
    const campaign = campaigns[0];
    const record = buildEvidenceRecord(campaign, "spend", observations);
    expect(record.id).toBe(evidenceId(campaign.id, "spend", record.period));
    expect(record).toMatchObject({ scopeId: campaign.id, scopeLabel: campaign.name, metric: "spend" });
    expect(record.trend.currentPeriods).toHaveLength(4);
    expect(record.trend.previousPeriods).toHaveLength(4);
    expect(record.anomaly.supportingPeriods).toEqual(observations.filter((row) => row.campaignId === campaign.id && row.period < record.period).slice(-8).map((row) => row.period));
  });

  it("keeps trend and anomaly provenance independently verifiable", () => {
    const record = buildEvidenceRecord(campaigns[0], "spend", observations);
    expect(record.trend.currentValue).not.toBe(record.anomaly.currentValue);
    expect(record.trend.currentPeriods).not.toEqual(record.anomaly.supportingPeriods);
    expect(record.anomaly.baselineMedian).not.toBe(record.trend.previousValue);
  });

  it("selects at most one primary anomaly per campaign and retains a weakened non-anomaly trend", () => {
    const records = buildCampaignEvidence(campaigns, observations);
    const attention = selectOverviewAttention(records);
    const anomalyItems = attention.filter((item) => item.record.anomaly.status === "anomaly");
    expect(new Set(anomalyItems.map((item) => item.record.scopeId)).size).toBe(anomalyItems.length);
    expect(attention.some((item) => item.record.anomaly.status !== "anomaly" && item.record.trend.performance === "weakened")).toBe(true);
    expect(attention.some((item) => item.relatedAnomalyCount > 0)).toBe(true);
  });
});

describe("synthetic scenarios", () => {
  it("detects the intended gradual Meta qualified-lead decline as a trend, not an isolated anomaly", () => {
    const campaign = campaigns.find((item) => item.id === "meta-awareness")!;
    const rows = observations.filter((row) => row.campaignId === campaign.id);
    expect(analyseTrend("qualifiedLeads", rows).direction).toBe("declining");
    expect(buildEvidenceRecord(campaign, "qualifiedLeads", observations).anomaly.status).not.toBe("anomaly");
  });

  it("detects the intended isolated Paid Search spend deviation", () => {
    const campaign = campaigns.find((item) => item.id === "search-demand")!;
    expect(buildEvidenceRecord(campaign, "spend", observations).anomaly.status).toBe("anomaly");
  });

  it("detects the intended LinkedIn improvement trend", () => {
    const campaign = campaigns.find((item) => item.id === "linkedin-abm")!;
    const rows = observations.filter((row) => row.campaignId === campaign.id);
    expect(analyseTrend("qualifiedLeads", rows)).toMatchObject({ direction: "increasing", performance: "improved" });
  });
});
