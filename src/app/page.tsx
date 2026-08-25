import { aggregateObservations, buildWhatChanged, deriveKpis } from "@/domain/analytics";
import { CHANNELS } from "@/domain/marketing";
import { CURRENT_PERIOD_END, CURRENT_PERIOD_START, PREVIOUS_PERIOD_END, PREVIOUS_PERIOD_START, observationsBetween } from "@/data/marketing-fixtures";
import { campaigns, observations } from "@/data/marketing-fixtures";
import { buildCampaignEvidence, selectOverviewAttention } from "@/domain/intelligence";
import { formatCurrency, formatMultiple, formatNumber } from "@/lib/format";
import { formatMetricValue, metricLabels, signalType, trendStatement } from "@/lib/intelligence-format";

const current = observationsBetween(CURRENT_PERIOD_START, CURRENT_PERIOD_END);
const previous = observationsBetween(PREVIOUS_PERIOD_START, PREVIOUS_PERIOD_END);
const totals = aggregateObservations(current);
const kpis = deriveKpis(totals);
const changes = buildWhatChanged(current, previous);
const channels = CHANNELS.map((channel) => {
  const channelTotals = aggregateObservations(current.filter((row) => row.channel === channel));
  return { channel, totals: channelTotals, kpis: deriveKpis(channelTotals) };
});
const maxQualified = Math.max(...channels.map((row) => row.totals.qualifiedLeads));
const evidence = buildCampaignEvidence(campaigns, observations);
const attentionSignals = selectOverviewAttention(evidence);

export default function IntelligenceOverview() {
  return (
    <>
      <p className="eyebrow">Intelligence overview</p>
      <h1>Performance signals, without the theatre.</h1>
      <p className="lede">A deterministic view of fictional multi-channel marketing performance, built for decisions rather than dashboard volume.</p>
      <p className="snapshot">Selected period · 25 May – 23 Aug 2026 · Synthetic data</p>

      <dl className="metrics">
        <div className="metric"><dt>Marketing spend</dt><dd>{formatCurrency(totals.spend)}</dd></div>
        <div className="metric"><dt>Qualified leads</dt><dd>{formatNumber(totals.qualifiedLeads)}</dd></div>
        <div className="metric"><dt>Cost per qualified lead</dt><dd>{formatCurrency(kpis.cpql)}</dd></div>
        <div className="metric"><dt>Return on ad spend</dt><dd>{formatMultiple(kpis.roas)}</dd></div>
      </dl>

      <hr className="rule" />
      <section aria-labelledby="attention-heading">
        <p className="section-label">Attention signals</p>
        <h2 id="attention-heading">Evidence worth reviewing</h2>
        <p className="lede compact">Deterministic signals identify measured movement and unusual observations. They do not explain why the change occurred or determine business importance.</p>
        <div className="signal-list">
          {attentionSignals.map(({ record, relatedAnomalyCount }) => (
            <article className="signal-item" key={record.id}>
              <div className="signal-meta"><span className={record.anomaly.status === "anomaly" ? "status anomaly" : "status trend"}>{signalType(record)}</span><span>{record.period}</span><span>Evidence · {record.evidenceQuality}</span></div>
              <h3>{record.scopeLabel} · {metricLabels[record.metric]}</h3>
              <p>{trendStatement(record)}</p>
              <div className="evidence-groups">
                <dl className="evidence-line"><div><dt>Trend · trailing 4 weeks</dt><dd>{formatMetricValue(record.metric, record.trend.currentValue)}</dd></div><div><dt>Trend · preceding 4 weeks</dt><dd>{formatMetricValue(record.metric, record.trend.previousValue)}</dd></div></dl>
                <dl className="evidence-line"><div><dt>Anomaly · current week</dt><dd>{formatMetricValue(record.metric, record.anomaly.currentValue)}</dd></div><div><dt>Anomaly · prior 8-week median</dt><dd>{formatMetricValue(record.metric, record.anomaly.baselineMedian)}</dd></div><div><dt>Robust z-score</dt><dd>{record.anomaly.score === null ? "Unavailable" : record.anomaly.score.toFixed(2)}</dd></div></dl>
              </div>
              {relatedAnomalyCount > 0 && <p className="snapshot">{relatedAnomalyCount} additional related metric {relatedAnomalyCount === 1 ? "anomaly" : "anomalies"} available in Campaign Intelligence.</p>}
              <p className="snapshot">Evidence ID · {record.id}</p>
            </article>
          ))}
        </div>
      </section>

      <hr className="rule" />
      <div className="two-column">
        <section>
          <p className="section-label">What changed</p>
          <h2>Measured movement</h2>
          <ul className="change-list">
            {changes.map((change) => (
              <li key={change.metric}>
                <strong className={change.performance ?? "neutral"}>{change.performance ?? (change.direction === "remained stable" ? "Stable" : change.direction)}</strong>
                <span>{change.statement}</span>
              </li>
            ))}
          </ul>
          <p className="snapshot">Comparisons describe observed movement only. They do not infer causation.</p>
        </section>
        <section>
          <p className="section-label">Channel comparison</p>
          <h2>Qualified demand</h2>
          {channels.map(({ channel, totals: channelTotals, kpis: channelKpis }) => (
            <div className="channel-row" key={channel}>
              <span>{channel}</span>
              <div className="bar-track" aria-label={`${channel}: ${channelTotals.qualifiedLeads} qualified leads`}><div className="bar" style={{ width: `${(channelTotals.qualifiedLeads / maxQualified) * 100}%` }} /></div>
              <span>{formatMultiple(channelKpis.roas)}</span>
            </div>
          ))}
          <p className="snapshot">Bar length represents qualified leads · value shows ROAS</p>
        </section>
      </div>
    </>
  );
}
