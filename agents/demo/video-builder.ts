import { execSync, spawnSync } from "child_process";
import path from "path";
import fs from "fs";
import type { CapturedFrame } from "./puppeteer-capture";

function checkFfmpeg() {
  const result = spawnSync("which", ["ffmpeg"]);
  if (result.status !== 0) {
    throw new Error("ffmpeg not found. Install it: brew install ffmpeg");
  }
}

export async function synthesiseAudio(narration: string, outputPath: string, voice = "Samantha"): Promise<void> {
  execSync(`say -v "${voice}" -r 145 -o "${outputPath}.aiff" "${narration.replace(/"/g, '\\"')}"`);
  execSync(`ffmpeg -y -i "${outputPath}.aiff" -ar 44100 "${outputPath}" 2>/dev/null`);
  fs.unlinkSync(`${outputPath}.aiff`);
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

  // Generate audio for each frame narration
  const audioPaths: string[] = [];
  for (let i = 0; i < frames.length; i++) {
    const audioPath = path.join(audioDir, `narration-${String(i).padStart(3, "0")}.mp3`);
    await synthesiseAudio(frames[i].narration, audioPath);
    audioPaths.push(audioPath);
  }

  // Build ffmpeg concat file — each image held for its durationMs
  const concatFile = path.join(workDir, "concat.txt");
  const lines = frames.map((f, i) => {
    const dur = (f.durationMs / 1000).toFixed(2);
    return `file '${f.screenshotPath}'\nduration ${dur}`;
  });
  // repeat last frame to avoid ffmpeg concat truncation
  lines.push(`file '${frames[frames.length - 1].screenshotPath}'`);
  fs.writeFileSync(concatFile, lines.join("\n"));

  // Merge audio clips into one track
  const audioListFile = path.join(workDir, "audiolist.txt");
  fs.writeFileSync(audioListFile, audioPaths.map((p) => `file '${p}'`).join("\n"));
  const mergedAudio = path.join(workDir, "narration.mp3");
  execSync(`ffmpeg -y -f concat -safe 0 -i "${audioListFile}" -c copy "${mergedAudio}" 2>/dev/null`);

  // Build silent video from screenshots
  const silentVideo = path.join(workDir, "silent.mp4");
  execSync(
    `ffmpeg -y -f concat -safe 0 -i "${concatFile}" -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2" -c:v libx264 -pix_fmt yuv420p -r 30 "${silentVideo}" 2>/dev/null`
  );

  // Combine video + audio
  execSync(
    `ffmpeg -y -i "${silentVideo}" -i "${mergedAudio}" -c:v copy -c:a aac -shortest "${outputMp4}" 2>/dev/null`
  );

  // Export GIF (720p → 480p for size)
  execSync(
    `ffmpeg -y -i "${outputMp4}" -vf "fps=12,scale=480:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse" "${outputGif}" 2>/dev/null`
  );

  return { mp4: outputMp4, gif: outputGif };
}
