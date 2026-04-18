export interface ApprovalDecisionInput {
  suggestionId: string;
  decision: "approved" | "rejected" | "deferred";
  modifiedBody?: string;
  reason?: string;
}
