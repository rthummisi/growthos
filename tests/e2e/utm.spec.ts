import { test, expect } from "@playwright/test";
import { BACKEND_BASE, createProductAndRun } from "./helpers";

test("utm lifecycle tracks click and signup events", async ({ request }) => {
  const { productId } = await createProductAndRun(request);
  const utmResponse = await request.post(`${BACKEND_BASE}/utm`, {
    data: { productId, channelSlug: "github" }
  });
  expect(utmResponse.ok()).toBeTruthy();
  const utm = (await utmResponse.json()) as { utmContent: string };
  expect(utm.utmContent).toBeTruthy();

  const clickResponse = await request.post(`${BACKEND_BASE}/utm/event`, {
    data: { utmContent: utm.utmContent, event: "click" }
  });
  const signupResponse = await request.post(`${BACKEND_BASE}/utm/event`, {
    data: { utmContent: utm.utmContent, event: "signup" }
  });
  expect(clickResponse.ok()).toBeTruthy();
  expect(signupResponse.ok()).toBeTruthy();

  const reportResponse = await request.get(`${BACKEND_BASE}/utm/report?productId=${productId}`);
  expect(reportResponse.ok()).toBeTruthy();
  const report = (await reportResponse.json()) as Array<{ channelSlug: string; roi: number }>;
  expect(Array.isArray(report)).toBeTruthy();
});
