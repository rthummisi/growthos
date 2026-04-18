import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("execution is blocked until approval exists", async ({ request }) => {
  const { productId } = await createProductAndRun(request);
  const suggestionsResponse = await request.get(`${BACKEND_BASE}/suggestions?productId=${productId}`);
  const suggestionsPayload = (await suggestionsResponse.json()) as {
    suggestions: Array<{ id: string }>;
  };
  const suggestionId = suggestionsPayload.suggestions[0]?.id;
  expect(suggestionId).toBeTruthy();

  const blockedExecution = await request.post(`${BACKEND_BASE}/execution`, {
    data: { suggestionId }
  });
  expect(blockedExecution.ok()).toBeFalsy();

  const approvalResponse = await request.post(`${BACKEND_BASE}/approvals`, {
    data: { suggestionId, decision: "approved" }
  });
  expect(approvalResponse.ok()).toBeTruthy();

  const queuedExecution = await request.post(`${BACKEND_BASE}/execution`, {
    data: { suggestionId }
  });
  expect(queuedExecution.ok()).toBeTruthy();
});
