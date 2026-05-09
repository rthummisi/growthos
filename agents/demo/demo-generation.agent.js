"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DemoGenerationAgent = void 0;
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
const fs_1 = __importDefault(require("fs"));
const base_agent_1 = require("../_core/base-agent");
const narration_script_agent_1 = require("./narration-script.agent");
const puppeteer_capture_1 = require("./puppeteer-capture");
const video_builder_1 = require("./video-builder");
class DemoGenerationAgent extends base_agent_1.BaseAgent {
    name = "demo-generation";
    async run({ productDescription, localUrl, outputDir }) {
        const workDir = outputDir ?? path_1.default.join(os_1.default.tmpdir(), `growthos-demo-${Date.now()}`);
        fs_1.default.mkdirSync(workDir, { recursive: true });
        console.log("→ Generating narration script (Haiku)...");
        const script = await (0, narration_script_agent_1.generateNarrationScript)(productDescription, localUrl);
        console.log(`→ Capturing ${script.steps.length} frames via Playwright...`);
        const framesDir = path_1.default.join(workDir, "frames");
        const frames = await (0, puppeteer_capture_1.captureFrames)(script.steps, framesDir);
        const mp4 = path_1.default.join(workDir, "demo.mp4");
        const gif = path_1.default.join(workDir, "demo.gif");
        console.log("→ Synthesising narration with edge-tts (Aria + Andrew neural voices)...");
        console.log("→ Stitching video with ffmpeg...");
        const { mp4: mp4Out, gif: gifOut } = await (0, video_builder_1.buildVideo)(frames, workDir, mp4, gif);
        console.log(`✓ MP4 → ${mp4Out}`);
        console.log(`✓ GIF → ${gifOut}`);
        return { script, mp4: mp4Out, gif: gifOut, workDir };
    }
}
exports.DemoGenerationAgent = DemoGenerationAgent;
