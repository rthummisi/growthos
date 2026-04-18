import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("competitor endpoint returns ranked gaps", async ({ request, page }) => {
  const { productId } = await createProductAndRun(request);
  const competitorResponse = await request.get(`${BACKEND_BASE}/competitors?productId=${productId}`);
  expect(competitorResponse.ok()).toBeTruthy();
  const payload = (await competitorResponse.json()) as {
    competitors: Array<unknown>;
    gaps: Array<{ competitorScore: number }>;
  };
  expect(payload.competitors.length).toBeGreaterThan(0);
  expect(payload.gaps.length).toBeGreaterThan(0);
  expect(payload.gaps.some((gap) => gap.competitorScore > 0)).toBeTruthy();

  await page.goto(`/competitors?productId=${productId}`);
  await expect(page.getByText("Competitor Intelligence")).toBeVisible();
});
