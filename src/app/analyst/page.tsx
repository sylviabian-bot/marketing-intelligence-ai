import { campaigns } from "@/data/marketing-fixtures";
import AnalystReview from "./review";

export default function AnalystPage() {
  return <>
    <p className="eyebrow">AI Analyst</p>
    <h1>Evidence-grounded interpretation.</h1>
    <p className="lede">Choose a bounded analyst question. The server retrieves canonical evidence, AI interprets it, and application code verifies every citation before rendering the underlying facts.</p>
    <p className="snapshot">Synthetic portfolio demonstration · No arbitrary prompts or conversation history</p>
    <AnalystReview campaigns={campaigns.map(({ id, name, channel }) => ({ id, name, channel }))} />
  </>;
}
