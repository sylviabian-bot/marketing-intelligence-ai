import { runAnalystReview } from "@/ai/analyst-service";
import { handleAnalystRequest } from "./handler";

export async function POST(request: Request) { return handleAnalystRequest(request, runAnalystReview); }
