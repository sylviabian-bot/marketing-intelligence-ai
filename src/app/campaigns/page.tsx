import { aggregateObservations, deriveKpis } from "@/domain/analytics";
import { CURRENT_PERIOD_END, CURRENT_PERIOD_START, campaigns, observationsBetween } from "@/data/marketing-fixtures";
import { observations } from "@/data/marketing-fixtures";
import { buildEvidenceRecord } from "@/domain/intelligence";
import type { MetricKey } from "@/domain/marketing";
import { formatCurrency, formatMultiple, formatNumber, formatPercent } from "@/lib/format";
import { formatMetricValue, metricLabels, signalType, trendStatement } from "@/lib/intelligence-format";

export default async function CampaignIntelligence({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams;
  const selectedChannel = typeof params.channel === "string" ? params.channel : "All channels";
  const period = observationsBetween(CURRENT_PERIOD_START, CURRENT_PERIOD_END);
  const visibleCampaigns = campaigns.filter((campaign) => selectedChannel === "All channels" || campaign.channel === selectedChannel);
  const visible = period.filter((row) => visibleCampaigns.some((campaign) => campaign.id === row.campaignId));
  const totals = aggregateObservations(visible);
  const kpis = deriveKpis(totals);
  const metrics: MetricKey[] = ["qualifiedLeads", "cpql", "roas", "spend"];
  const intelligence = visibleCampaigns.flatMap((campaign) => metrics.map((metric) => buildEvidenceRecord(campaign, metric, observations)));

  return (
    <>
      <p className="eyebrow">Campaign intelligence</p>
      <h1>Follow the funnel from reach to revenue.</h1>
      <p className="lede">Compare campaign efficiency using one consistent KPI engine. Filter selections update every total below.</p>
      <form className="filter-form">
        <label>Channel
          <select name="channel" defaultValue={selectedChannel}>
            <option>All channels</option>
            {[...new Set(campaigns.map((campaign) => campaign.channel))].map((channel) => <option key={channel}>{channel}</option>)}
          </select>
        </label>
        <button type="submit">Apply filter</button>
        <span className="snapshot">25 May – 23 Aug 2026</span>
      </form>

      <section aria-labelledby="funnel-heading">
        <p className="section-label">Selected portfolio</p><h2 id="funnel-heading">Funnel</h2>
        <div className="funnel">
          <div><small>Impressions</small><strong>{formatNumber(totals.impressions)}</strong></div>
          <div><small>Clicks</small><strong>{formatNumber(totals.clicks)}</strong></div>
          <div><small>Leads</small><strong>{formatNumber(totals.leads)}</strong></div>
          <div><small>Qualified leads</small><strong>{formatNumber(totals.qualifiedLeads)}</strong></div>
          <div><small>Conversions</small><strong>{formatNumber(totals.conversions)}</strong></div>
        </div>
      </section>

      <hr className="rule" />
      <section aria-labelledby="intelligence-heading">
        <p className="section-label">Recent intelligence</p><h2 id="intelligence-heading">Trend and anomaly evidence</h2>
        <p className="lede compact">Each trend compares the trailing four completed weeks with the preceding four. Anomaly status uses the current week against eight valid prior observations.</p>
        <div className="intelligence-table">
          {intelligence.map((record) => (
            <article className="intelligence-row" key={record.id}>
              <div><small>{record.scopeLabel}</small><strong>{metricLabels[record.metric]}</strong></div>
              <div><small>4-week trend</small><span>{trendStatement(record)}</span></div>
              <div><small>Current / median</small><span>{formatMetricValue(record.metric, record.currentValue)} / {formatMetricValue(record.metric, record.baselineValue)}</span></div>
              <div><small>Signal</small><span className={record.anomalyStatus === "anomaly" ? "status anomaly" : "status trend"}>{record.anomalyStatus === "anomaly" ? signalType(record) : record.anomalyStatus.replaceAll("_", " ")}</span></div>
              <details><summary>Evidence</summary><p>Baseline periods: {record.supportingPeriods.join(", ") || "Insufficient valid history"}</p><p>Evidence ID: {record.id}</p></details>
            </article>
          ))}
        </div>
      </section>

      <dl className="metrics">
        <div className="metric"><dt>CTR</dt><dd>{formatPercent(kpis.ctr)}</dd></div>
        <div className="metric"><dt>Cost per lead</dt><dd>{formatCurrency(kpis.cpl)}</dd></div>
        <div className="metric"><dt>Qualification rate</dt><dd>{formatPercent(kpis.qualificationRate)}</dd></div>
        <div className="metric"><dt>ROAS</dt><dd>{formatMultiple(kpis.roas)}</dd></div>
      </dl>

      <hr className="rule" />
      <section>
        <p className="section-label">Campaign comparison</p><h2>Efficiency by campaign</h2>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Campaign</th><th>Channel</th><th>Spend</th><th>Qualified leads</th><th>CPQL</th><th>Conversion rate</th><th>ROAS</th></tr></thead>
            <tbody>{visibleCampaigns.map((campaign) => {
              const campaignTotals = aggregateObservations(period.filter((row) => row.campaignId === campaign.id));
              const campaignKpis = deriveKpis(campaignTotals);
              return <tr key={campaign.id}><td><strong>{campaign.name}</strong></td><td>{campaign.channel}</td><td>{formatCurrency(campaignTotals.spend)}</td><td>{formatNumber(campaignTotals.qualifiedLeads)}</td><td>{formatCurrency(campaignKpis.cpql)}</td><td>{formatPercent(campaignKpis.conversionRate)}</td><td>{formatMultiple(campaignKpis.roas)}</td></tr>;
            })}</tbody>
          </table>
        </div>
      </section>
    </>
  );
}
