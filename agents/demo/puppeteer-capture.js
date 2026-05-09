"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureFrames = captureFrames;
const playwright_1 = require("playwright");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
async function captureFrames(steps, outputDir, viewportWidth = 1280, viewportHeight = 720) {
    fs_1.default.mkdirSync(outputDir, { recursive: true });
    const browser = await playwright_1.chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.setViewportSize({ width: viewportWidth, height: viewportHeight });
    const frames = [];
    for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        switch (step.action) {
            case "goto":
                await page.goto(step.url, { waitUntil: "networkidle", timeout: 15_000 });
                break;
            case "click":
                if (step.selector)
                    await page.click(step.selector).catch(() => { });
                break;
            case "type":
                if (step.selector && step.value) {
                    await page.click(step.selector).catch(() => { });
                    await page.fill(step.selector, step.value).catch(() => { });
                }
                break;
            case "scroll":
                await page.evaluate((amt) => window.scrollBy(0, Number(amt)), step.value ?? "300");
                break;
            case "hover":
                if (step.selector)
                    await page.hover(step.selector).catch(() => { });
                break;
            case "wait":
                await new Promise((r) => setTimeout(r, Math.min(step.durationMs, 3000)));
                break;
        }
        await new Promise((r) => setTimeout(r, 400));
        const screenshotPath = path_1.default.join(outputDir, `frame-${String(i).padStart(3, "0")}.png`);
        await page.screenshot({ path: screenshotPath, fullPage: false });
        frames.push({ stepIndex: i, screenshotPath, durationMs: step.durationMs, narration: step.narration });
    }
    await browser.close();
    return frames;
}
