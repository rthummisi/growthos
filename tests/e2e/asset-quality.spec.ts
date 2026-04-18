import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("generated assets contain no placeholder strings", async ({ request, page }) => {
  const { productId } = await createProductAndRun(request);
  const suggestionsResponse = await request.get(`${BACKEND_BASE}/suggestions?productId=${productId}`);
  const suggestionsPayload = (await suggestionsResponse.json()) as {
    suggestions: Array<{ id: string }>;
  };
  const suggestionId = suggestionsPayload.suggestions[0]?.id;
  expect(suggestionId).toBeTruthy();

  const assetsResponse = await request.get(`${BACKEND_BASE}/assets?suggestionId=${suggestionId}`);
  const assets = (await assetsResponse.json()) as Array<{ content: string }>;
  expect(assets.length).toBeGreaterThan(0);
  expect(
    assets.every(
      (asset) =>
        !asset.content.includes("[") &&
        !asset.content.toLowerCase().includes("your product")
    )
  ).toBeTruthy();

  await page.goto(`/placements?productId=${productId}`);
  await expect(page.getByText("Add to Approval Queue").first()).toBeVisible();
});
