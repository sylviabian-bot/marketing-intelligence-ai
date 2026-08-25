import { campaigns } from "@/data/marketing-fixtures";
import { customerFeedback, customerReviewSet } from "@/data/customer-feedback";
import CustomerIntelligenceReview from "./review";

export default function CustomerIntelligencePage() {
  const campaignNames = Object.fromEntries(campaigns.map((campaign) => [campaign.id, campaign.name]));
  const dates = customerReviewSet.map((item) => item.date).sort();
  const sources = new Set(customerReviewSet.map((item) => item.source));
  const coveredCampaigns = new Set(customerReviewSet.map((item) => item.campaignId));
  return <>
    <p className="eyebrow">Customer intelligence</p>
    <h1>Language, structured with evidence.</h1>
    <p className="lede">Review a bounded set of fictional customer feedback. AI classifies language; application code verifies every excerpt and calculates every count.</p>
    <p className="snapshot">Synthetic feedback demonstration · No connected customer systems</p>
    <dl className="review-summary">
      <div><dt>Available feedback</dt><dd>{customerFeedback.length} synthetic records</dd></div>
      <div><dt>AI review set</dt><dd>{customerReviewSet.length} records · maximum 24</dd></div>
      <div><dt>Date window</dt><dd>{dates[0]} – {dates.at(-1)}</dd></div>
      <div><dt>Coverage</dt><dd>{sources.size} sources · {coveredCampaigns.size} campaigns</dd></div>
    </dl>
    <CustomerIntelligenceReview feedback={customerReviewSet} campaignNames={campaignNames} />
  </>;
}
