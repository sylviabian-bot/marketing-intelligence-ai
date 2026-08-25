import type { CustomerFeedback, FeedbackSource } from "../domain/marketing";
import { campaigns } from "./marketing-fixtures";

const sourceCycle: FeedbackSource[] = ["campaign_survey", "website_feedback", "enquiry", "follow_up_survey"];
const generalPatterns = [
  "The article was practical and relevant to the decision we are considering.",
  "The information was useful, although I am still comparing available options.",
  "The message was clear enough for me to understand the next step.",
  "The examples helped explain how the service could fit our needs.",
  "I found the content relevant but need more detail before deciding.",
  "The page answered my main question without making unrealistic promises.",
];
const recentMetaPatterns = [
  "The offer is not clear and I could not tell what the next step involved.",
  "I understood the topic, but the proposition and next step were unclear.",
  "The message looked relevant, although I was unsure what was included in the offer.",
];
const eventPatterns = [
  "The event discussion was relevant and the practical examples were useful.",
  "The speakers made the session credible and the discussion quality was strong.",
  "The roundtable was useful, although the follow-up process was not explained.",
];
const followUpPatterns = [
  "The initial conversation was useful, but the follow-up was slower than expected.",
  "I was interested after the event but did not know who would follow up next.",
  "The response eventually helped, although the follow-up steps were unclear.",
];

function isoDate(week: number, item: number): string {
  const date = new Date(Date.UTC(2026, 4, 18 + week * 7 + (item % 6)));
  return date.toISOString().slice(0, 10);
}

export const customerFeedback: CustomerFeedback[] = Array.from({ length: 14 }, (_, week) =>
  Array.from({ length: 24 }, (_, item) => {
    const campaign = campaigns[(week * 3 + item) % campaigns.length];
    const recent = week >= 12;
    const source = campaign.channel === "Events" ? "event_feedback" : sourceCycle[(week + item) % sourceCycle.length];
    let text = generalPatterns[(week + item) % generalPatterns.length];

    if (campaign.id === "meta-awareness" && recent && item % 2 === 0) text = recentMetaPatterns[(week + item) % recentMetaPatterns.length];
    else if (source === "event_feedback") text = eventPatterns[(week + item) % eventPatterns.length];
    else if (source === "follow_up_survey" && item % 3 === 0) text = followUpPatterns[(week + item) % followUpPatterns.length];

    return {
      id: `FB-${String(week + 1).padStart(2, "0")}-${String(item + 1).padStart(2, "0")}`,
      date: isoDate(week, item),
      source,
      campaignId: campaign.id,
      text,
    };
  }),
).flat();

export const CUSTOMER_REVIEW_SET_ID = "recent-prior-balanced";
export const customerReviewSet = [
  ...customerFeedback.filter((item) => item.date >= "2026-08-10").slice(0, 12),
  ...customerFeedback.filter((item) => item.date >= "2026-07-27" && item.date < "2026-08-10").slice(0, 12),
];

export function feedbackByIds(ids: string[]): CustomerFeedback[] {
  const requested = new Set(ids);
  return customerFeedback.filter((item) => requested.has(item.id));
}
