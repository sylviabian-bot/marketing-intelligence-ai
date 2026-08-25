import { describe, expect, it } from "vitest";
import { campaigns, observations } from "../data/marketing-fixtures";
import type { MarketingObservation, MetricKey } from "./marketing";
import {
  ANOMALY_Z_THRESHOLD, analyseTrend, buildEvidenceRecord, detectAnomaly, evidenceId, median,
  medianAbsoluteDeviation, passesVolumeGuard, robustZScore,
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

  it("creates stable evidence IDs and correct provenance", () => {
    const campaign = campaigns[0];
    const record = buildEvidenceRecord(campaign, "spend", observations);
    expect(record.id).toBe(evidenceId(campaign.id, "spend", record.period));
    expect(record).toMatchObject({ scopeId: campaign.id, scopeLabel: campaign.name, metric: "spend", baselineType: "rolling_median_8" });
    expect(record.supportingPeriods).toEqual(observations.filter((row) => row.campaignId === campaign.id && row.period < record.period).slice(-8).map((row) => row.period));
  });
});

describe("synthetic scenarios", () => {
  it("detects the intended gradual Meta qualified-lead decline as a trend, not an isolated anomaly", () => {
    const campaign = campaigns.find((item) => item.id === "meta-awareness")!;
    const rows = observations.filter((row) => row.campaignId === campaign.id);
    expect(analyseTrend("qualifiedLeads", rows).direction).toBe("declining");
    expect(buildEvidenceRecord(campaign, "qualifiedLeads", observations).anomalyStatus).not.toBe("anomaly");
  });

  it("detects the intended isolated Paid Search spend deviation", () => {
    const campaign = campaigns.find((item) => item.id === "search-demand")!;
    expect(buildEvidenceRecord(campaign, "spend", observations).anomalyStatus).toBe("anomaly");
  });

  it("detects the intended LinkedIn improvement trend", () => {
    const campaign = campaigns.find((item) => item.id === "linkedin-abm")!;
    const rows = observations.filter((row) => row.campaignId === campaign.id);
    expect(analyseTrend("qualifiedLeads", rows)).toMatchObject({ direction: "increasing", performance: "improved" });
  });
});
