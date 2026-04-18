import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("generated asset set includes multiple variations", async ({ request, page }) => {
  const { productId } = await createProductAndRun(request);
  const suggestionsResponse = await request.get(`${BACKEND_BASE}/suggestions?productId=${productId}`);
  const suggestionsPayload = (await suggestionsResponse.json()) as {
    suggestions: Array<{ id: string }>;
  };

  const suggestionId = suggestionsPayload.suggestions[0]?.id;
  expect(suggestionId).toBeTruthy();

  const assetsResponse = await request.get(`${BACKEND_BASE}/assets?suggestionId=${suggestionId}`);
  expect(assetsResponse.ok()).toBeTruthy();
  const assets = (await assetsResponse.json()) as Array<{ id: string; variationOf?: string | null }>;
  expect(assets.length).toBeGreaterThanOrEqual(2);
  expect(assets.some((asset) => Boolean(asset.variationOf))).toBeTruthy();

  await page.goto(`/assets?suggestionId=${suggestionId}`);
  await expect(page.getByText("Asset Studio")).toBeVisible();
});
