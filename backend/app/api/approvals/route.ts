import { NextRequest } from "next/server";
import { json } from "@backend/lib/api";
import { createApproval } from "@backend/services/approval.service";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    suggestionId: string;
    decision: "approved" | "rejected" | "deferred";
    modifiedBody?: string;
    reason?: string;
  };

  const approval = await createApproval(body);
  return json(approval, 201);
}
