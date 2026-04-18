import { execSync, spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import type { CapturedFrame } from "./puppeteer-capture";

// Same voices as ContextOS demo: Aria (female) + Andrew (male)
const EDGE_TTS = "/Users/raghunathvenkataramanathummisi/Library/Python/3.9/bin/edge-tts";
const VOICE_FEMALE = "en-US-AriaNeural";
const VOICE_MALE = "en-US-AndrewNeural";
const TTS_RATE = "+5%";

function checkFfmpeg() {
  const result = spawnSync("which", ["ffmpeg"]);
  if (result.status !== 0) {
    throw new Error("ffmpeg not found. Install it: brew install ffmpeg");
  }
}

// Alternate voices per step for a two-presenter feel (matches ContextOS style)
export async function synthesiseAudio(narration: string, outputPath: string, stepIndex = 0): Promise<void> {
  const voice = stepIndex % 2 === 0 ? VOICE_FEMALE : VOICE_MALE;
  const safeText = narration.replace(/"/g, '\\"').replace(/'/g, "\\'");
  execSync(
    `"${EDGE_TTS}" --voice "${voice}" --rate "${TTS_RATE}" --text "${safeText}" --write-media "${outputPath}"`,
    { stdio: "pipe" }
  );
}

export async function buildVideo(
  frames: CapturedFrame[],
  workDir: string,
  outputMp4: string,
  outputGif: string
): Promise<{ mp4: string; gif: string }> {
  checkFfmpeg();

  const audioDir = path.join(workDir, "audio");
  fs.mkdirSync(audioDir, { recursive: true });

  // Generate audio per frame — Aria and Andrew alternate steps
  const audioPaths: string[] = [];
  for (let i = 0; i < frames.length; i++) {
    const audioPath = path.join(audioDir, `narration-${String(i).padStart(3, "0")}.mp3`);
    await synthesiseAudio(frames[i].narration, audioPath, i);
    audioPaths.push(audioPath);
  }

  // Concat audio
  const audioListFile = path.join(workDir, "audiolist.txt");
  fs.writeFileSync(audioListFile, audioPaths.map((p) => `file '${p}'`).join("\n"));
  const mergedAudio = path.join(workDir, "narration.mp3");
  execSync(`ffmpeg -y -f concat -safe 0 -i "${audioListFile}" -c copy "${mergedAudio}" 2>/dev/null`);

  // Build ffmpeg image concat file — each frame held for its durationMs
  const concatFile = path.join(workDir, "concat.txt");
  const lines = frames.map((f) => `file '${f.screenshotPath}'\nduration ${(f.durationMs / 1000).toFixed(2)}`);
  lines.push(`file '${frames[frames.length - 1].screenshotPath}'`);
  fs.writeFileSync(concatFile, lines.join("\n"));

  // Silent video from screenshots
  const silentVideo = path.join(workDir, "silent.mp4");
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p -r 30 "${silentVideo}" 2>/dev/null`
  );

  // Mux video + narration
  execSync(
    `ffmpeg -y -i "${silentVideo}" -i "${mergedAudio}" -c:v copy -c:a aac -shortest "${outputMp4}" 2>/dev/null`
  );

  // GIF export (480p, 12fps for size)
  execSync(
    `ffmpeg -y -i "${outputMp4}" -vf "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outputGif}" 2>/dev/null`
  );

  return { mp4: outputMp4, gif: outputGif };
}
