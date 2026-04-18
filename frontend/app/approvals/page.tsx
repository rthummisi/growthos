import { apiGet } from "@frontend/lib/api";
import { ApprovalsClient } from "@frontend/components/approval/ApprovalsClient";

interface SuggestionRow {
  id: string;
  type: string;
  title: string;
  reasoning: string;
  channel: { name: string };
  assets: Array<{ content: string }>;
}

export default async function ApprovalsPage() {
  const data = await apiGet<{ suggestions: SuggestionRow[]; total: number }>("/suggestions?status=pending");
  return <ApprovalsClient initialSuggestions={data.suggestions} />;
}
