import { aggregateObservations, buildWhatChanged, deriveKpis } from "@/domain/analytics";
import { CHANNELS } from "@/domain/marketing";
import { CURRENT_PERIOD_END, CURRENT_PERIOD_START, PREVIOUS_PERIOD_END, PREVIOUS_PERIOD_START, observationsBetween } from "@/data/marketing-fixtures";
import { formatCurrency, formatMultiple, formatNumber } from "@/lib/format";

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
