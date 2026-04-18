import path from "path";
import os from "os";
import fs from "fs";
import { BaseAgent } from "../_core/base-agent";
import { generateNarrationScript, type DemoScript } from "./narration-script.agent";
import { captureFrames } from "./puppeteer-capture";
import { buildVideo } from "./video-builder";

interface DemoInput {
  productDescription: string;
  localUrl: string;
  outputDir?: string;
}

interface DemoOutput {
  script: DemoScript;
  mp4: string;
  gif: string;
  workDir: string;
}

export class DemoGenerationAgent extends BaseAgent<DemoInput, DemoOutput> {
  name = "demo-generation";

  async run({ productDescription, localUrl, outputDir }: DemoInput): Promise<DemoOutput> {
    const workDir = outputDir ?? path.join(os.tmpdir(), `growthos-demo-${Date.now()}`);
    fs.mkdirSync(workDir, { recursive: true });

    console.log("→ Generating narration script (Haiku)...");
    const script = await generateNarrationScript(productDescription, localUrl);

    console.log(`→ Capturing ${script.steps.length} frames via Playwright...`);
    const framesDir = path.join(workDir, "frames");
    const frames = await captureFrames(script.steps, framesDir);

    const mp4 = path.join(workDir, "demo.mp4");
    const gif = path.join(workDir, "demo.gif");

    console.log("→ Synthesising narration with edge-tts (Aria + Andrew neural voices)...");
    console.log("→ Stitching video with ffmpeg...");
    const { mp4: mp4Out, gif: gifOut } = await buildVideo(frames, workDir, mp4, gif);

    console.log(`✓ MP4 → ${mp4Out}`);
    console.log(`✓ GIF → ${gifOut}`);

    return { script, mp4: mp4Out, gif: gifOut, workDir };
  }
}
