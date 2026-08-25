import { describe, expect, it } from "vitest";
import {
  aggregateObservations, buildWhatChanged, calculateConversionRate, calculateCpa, calculateCpc,
  calculateCpl, calculateCpql, calculateCtr, calculateQualificationRate, calculateRoas, compareMetric, deriveKpis,
} from "./analytics";
import type { MarketingObservation } from "./marketing";

const row = (overrides: Partial<MarketingObservation> = {}): MarketingObservation => ({
  period: "2026-01-05", campaignId: "demo", channel: "Paid Search", spend: 100,
  impressions: 1000, clicks: 100, leads: 20, qualifiedLeads: 10, conversions: 5, revenue: 400, ...overrides,
});

describe("KPI engine", () => {
  it("calculates every KPI formula", () => {
    expect(calculateCtr(100, 1000)).toBe(0.1);
    expect(calculateCpc(100, 100)).toBe(1);
    expect(calculateCpl(100, 20)).toBe(5);
    expect(calculateCpql(100, 10)).toBe(10);
    expect(calculateQualificationRate(10, 20)).toBe(0.5);
    expect(calculateConversionRate(5, 20)).toBe(0.25);
    expect(calculateCpa(100, 5)).toBe(20);
    expect(calculateRoas(400, 100)).toBe(4);
  });

  it("returns null for every zero denominator", () => {
    expect(calculateCtr(1, 0)).toBeNull();
    expect(calculateCpc(1, 0)).toBeNull();
    expect(calculateCpl(1, 0)).toBeNull();
    expect(calculateCpql(1, 0)).toBeNull();
    expect(calculateQualificationRate(1, 0)).toBeNull();
    expect(calculateConversionRate(1, 0)).toBeNull();
    expect(calculateCpa(1, 0)).toBeNull();
    expect(calculateRoas(1, 0)).toBeNull();
  });

  it("aggregates source observations before deriving KPIs", () => {
    const totals = aggregateObservations([row(), row({ spend: 50, revenue: 100 })]);
    expect(totals).toEqual({ spend: 150, impressions: 2000, clicks: 200, leads: 40, qualifiedLeads: 20, conversions: 10, revenue: 500 });
    expect(deriveKpis(totals).roas).toBeCloseTo(3.3333, 3);
  });
});

describe("period comparisons", () => {
  it("uses lower-is-better semantics for CPQL", () => {
    expect(compareMetric("cpql", 80, 100).performance).toBe("improved");
    expect(compareMetric("cpql", 120, 100).performance).toBe("weakened");
  });

  it("uses higher-is-better semantics for qualified leads and ROAS", () => {
    expect(compareMetric("qualifiedLeads", 120, 100).performance).toBe("improved");
    expect(compareMetric("roas", 3, 4).performance).toBe("weakened");
  });

  it("calls small changes stable", () => {
    expect(compareMetric("spend", 101, 100).direction).toBe("remained stable");
  });

  it("describes spend increases without performance judgement", () => {
    const change = compareMetric("spend", 110, 100);
    expect(change.direction).toBe("increased");
    expect(change.performance).toBeNull();
    expect(change.statement).toBe("Marketing spend increased 10.0% versus the previous period.");
  });

  it("describes spend decreases without performance judgement", () => {
    const change = compareMetric("spend", 90, 100);
    expect(change.direction).toBe("decreased");
    expect(change.performance).toBeNull();
    expect(change.statement).toBe("Marketing spend decreased 10.0% versus the previous period.");
  });

  it("builds deterministic, non-causal change statements", () => {
    const changes = buildWhatChanged([row({ qualifiedLeads: 12 })], [row({ qualifiedLeads: 10 })]);
    expect(changes).toHaveLength(4);
    expect(changes.every((change) => !/because|caused|due to/i.test(change.statement))).toBe(true);
  });

  it("omits unavailable CPQL and ROAS comparisons instead of fabricating zero", () => {
    const unavailable = row({ spend: 0, qualifiedLeads: 0, revenue: 0 });
    const changes = buildWhatChanged([unavailable], [unavailable]);

    expect(changes.map((change) => change.metric)).toEqual(["qualifiedLeads", "spend"]);
    expect(changes.every((change) => !/100\.0%|0\.0%/.test(change.statement))).toBe(true);
  });

  it("does not compare CPQL when only one period has a valid denominator", () => {
    const changes = buildWhatChanged([row({ qualifiedLeads: 0 })], [row()]);
    expect(changes.some((change) => change.metric === "cpql")).toBe(false);
  });

  it("does not compare ROAS when only one period has valid spend", () => {
    const changes = buildWhatChanged([row({ spend: 0, revenue: 0 })], [row()]);
    expect(changes.some((change) => change.metric === "roas")).toBe(false);
  });
});
