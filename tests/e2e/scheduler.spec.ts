import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("scheduler config and calendar persistence work", async ({ request, page }) => {
  const { productId } = await createProductAndRun(request);

  const patchResponse = await request.patch(`${BACKEND_BASE}/scheduler`, {
    data: {
      channelSlug: "github",
      cadence: "weekly",
      active: true
    }
  });
  expect(patchResponse.ok()).toBeTruthy();

  const schedulerResponse = await request.get(`${BACKEND_BASE}/scheduler`);
  expect(schedulerResponse.ok()).toBeTruthy();
  const channels = (await schedulerResponse.json()) as Array<{ slug: string; cadence: string }>;
  expect(channels.some((channel) => channel.slug === "github" && channel.cadence === "weekly")).toBeTruthy();

  const calendarSave = await request.post(`${BACKEND_BASE}/calendar`, {
    data: {
      productId,
      entries: [
        {
          channelSlug: "github",
          phase: "awareness",
          scheduledAt: new Date().toISOString()
        }
      ]
    }
  });
  expect(calendarSave.ok()).toBeTruthy();

  const calendarFetch = await request.get(`${BACKEND_BASE}/calendar?productId=${productId}`);
  expect(calendarFetch.ok()).toBeTruthy();
  const calendar = (await calendarFetch.json()) as Array<{ channelSlug: string }>;
  expect(calendar.some((entry) => entry.channelSlug === "github")).toBeTruthy();

  await page.goto(`/scheduler?productId=${productId}`);
  await expect(page.getByText("Channel Cadence")).toBeVisible();
});
