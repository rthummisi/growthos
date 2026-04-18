import { chromium } from "playwright";
import path from "path";
import fs from "fs";
import type { DemoStep } from "./narration-script.agent";

export interface CapturedFrame {
  stepIndex: number;
  screenshotPath: string;
  durationMs: number;
  narration: string;
}

export async function captureFrames(
  steps: DemoStep[],
  outputDir: string,
  viewportWidth = 1280,
  viewportHeight = 720
): Promise<CapturedFrame[]> {
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: viewportWidth, height: viewportHeight });

  const frames: CapturedFrame[] = [];

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];

    switch (step.action) {
      case "goto":
        await page.goto(step.url!, { waitUntil: "networkidle", timeout: 15_000 });
        break;
      case "click":
        if (step.selector) await page.click(step.selector).catch(() => {});
        break;
      case "type":
        if (step.selector && step.value) {
          await page.click(step.selector).catch(() => {});
          await page.fill(step.selector, step.value).catch(() => {});
        }
        break;
      case "scroll":
        await page.evaluate((amt) => window.scrollBy(0, Number(amt)), step.value ?? "300");
        break;
      case "hover":
        if (step.selector) await page.hover(step.selector).catch(() => {});
        break;
      case "wait":
        await new Promise((r) => setTimeout(r, Math.min(step.durationMs, 3000)));
        break;
    }

    await new Promise((r) => setTimeout(r, 400));

    const screenshotPath = path.join(outputDir, `frame-${String(i).padStart(3, "0")}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });

    frames.push({ stepIndex: i, screenshotPath, durationMs: step.durationMs, narration: step.narration });
  }

  await browser.close();
  return frames;
}
