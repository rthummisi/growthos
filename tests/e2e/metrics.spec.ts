import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("metrics refresh populates channel metrics", async ({ request, page }) => {
  const { productId } = await createProductAndRun(request);
  const refreshResponse = await request.post(`${BACKEND_BASE}/metrics/refresh`, {
    data: { productId }
  });
  expect(refreshResponse.ok()).toBeTruthy();
  const metrics = (await refreshResponse.json()) as Array<{ metricValue: number }>;
  expect(metrics.length).toBeGreaterThan(0);
  expect(metrics.some((metric) => metric.metricValue > 0)).toBeTruthy();

  const shortFormResponse = await request.post(`${BACKEND_BASE}/metrics/refresh`, {
    data: { productId, channelSlug: "youtube-shorts" }
  });
  expect(shortFormResponse.ok()).toBeTruthy();
  const shortFormMetrics = (await shortFormResponse.json()) as Array<{
    channelSlug?: string;
    rawData?: { views?: number; completionRate?: number };
  }>;
  const shortsMetric = shortFormMetrics.find((metric) => metric.channelSlug === "youtube-shorts");
  expect(shortsMetric?.rawData?.views).toBeGreaterThan(0);
  expect(shortsMetric?.rawData?.completionRate).toBeGreaterThan(0);

  await page.goto(`/tracking?productId=${productId}`);
  await expect(page.getByText("Short-Form Video Metrics")).toBeVisible();
});
