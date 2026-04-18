import { test, expect } from "@playwright/test";
import { BACKEND_BASE } from "./helpers";

test("in-the-wild endpoint returns live opportunities", async ({ request, page }) => {
  const response = await request.get(`${BACKEND_BASE}/in-the-wild`);
  expect(response.ok()).toBeTruthy();
  const items = (await response.json()) as Array<{ title: string }>;
  expect(items.length).toBeGreaterThanOrEqual(3);

  await page.goto("/in-the-wild");
  await expect(page.getByRole("heading", { name: "In The Wild" })).toBeVisible();
});
