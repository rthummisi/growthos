import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("short-form video suggestions create a full planning asset packet", async ({ request, page }) => {
  const { productId } = await createProductAndRun(request);

  const createSuggestion = await request.post(`${BACKEND_BASE}/suggestions`, {
    data: {
      productId,
      channelSlug: "youtube-shorts",
      type: "short-form-video",
      title: "YouTube Shorts demo angle",
      body: "Create a 30 second workflow demo that opens on the pain point, shows the product in three beats, and ends with a direct trial CTA.",
      reasoning: "A short visual proof sequence makes the product easier to understand and share."
    }
  });

  expect(createSuggestion.ok()).toBeTruthy();
  const suggestion = (await createSuggestion.json()) as { id: string };

  const assetsResponse = await request.get(`${BACKEND_BASE}/assets?suggestionId=${suggestion.id}`);
  expect(assetsResponse.ok()).toBeTruthy();
  const assets = (await assetsResponse.json()) as Array<{ type: string; variationOf?: string | null }>;

  expect(assets.some((asset) => asset.type === "video-script")).toBeTruthy();
  expect(assets.some((asset) => asset.type === "storyboard")).toBeTruthy();
  expect(assets.some((asset) => asset.type === "shot-list")).toBeTruthy();
  expect(assets.some((asset) => asset.type === "caption-track")).toBeTruthy();
  expect(assets.some((asset) => asset.type === "hook-set")).toBeTruthy();
  expect(assets.some((asset) => asset.type === "thumbnail-copy")).toBeTruthy();
  expect(assets.some((asset) => Boolean(asset.variationOf))).toBeTruthy();

  await page.goto(`/assets?suggestionId=${suggestion.id}`);
  await expect(page.getByRole("heading", { name: "Asset List" })).toBeVisible();
  await expect(page.getByText("YouTube Shorts script for YouTube Shorts demo angle").first()).toBeVisible();
});
