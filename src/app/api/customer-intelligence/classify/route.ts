import { classifyFeedbackIds } from "../../../../ai/feedback-service";
import { handleClassificationRequest } from "./handler";

export async function POST(request: Request) { return handleClassificationRequest(request, classifyFeedbackIds); }
