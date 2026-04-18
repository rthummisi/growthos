import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("product input creates a product and generates suggestions", async ({ page, request }) => {
  const { productId } = await createProductAndRun(request);

  const suggestionsResponse = await request.get(`${BACKEND_BASE}/suggestions?productId=${productId}`);
  expect(suggestionsResponse.ok()).toBeTruthy();
  const suggestions = (await suggestionsResponse.json()) as {
    suggestions: Array<unknown>;
    total: number;
  };
  expect(suggestions.total).toBeGreaterThanOrEqual(1);

  await page.goto(`/opportunities?productId=${productId}`);
  await expect(page.getByRole("heading", { name: "Opportunities" })).toBeVisible();
});
