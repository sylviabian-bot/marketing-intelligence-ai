import { campaigns } from "@/data/marketing-fixtures";
import AnalystReview from "./review";

export default function AnalystPage() {
  return <>
    <p className="eyebrow">AI Analyst</p>
    <h1>Evidence-grounded interpretation.</h1>
    <p className="lede">This is a bounded decision-support brief, not a chatbot. Choose a predefined question; the server retrieves evidence before AI interpretation and verifies every citation before showing a result.</p>
    <p className="snapshot">Synthetic portfolio demonstration · Numbers come from application logic · Insufficient evidence is a valid result</p>
    <AnalystReview campaigns={campaigns.map(({ id, name, channel }) => ({ id, name, channel }))} />
  </>;
}
