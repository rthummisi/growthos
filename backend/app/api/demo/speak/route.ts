import { NextRequest, NextResponse } from "next/server";
import { execFileSync } from "child_process";
import { mkdtempSync, readFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

const EDGE_TTS = `${process.env.HOME}/Library/Python/3.9/bin/edge-tts`;
const VOICE = "en-US-AriaNeural";
const RATE = "+5%";

export async function POST(req: NextRequest) {
  let tmpDir: string | null = null;
  try {
    const { text } = (await req.json()) as { text?: string };
    if (!text?.trim()) {
      return NextResponse.json({ error: "text required" }, { status: 400 });
    }

    tmpDir = mkdtempSync(join(tmpdir(), "growthos-tts-"));
    const outFile = join(tmpDir, "speech.mp3");

    execFileSync(EDGE_TTS, [
      "--voice", VOICE,
      "--rate", RATE,
      "--text", text,
      "--write-media", outFile,
    ], { timeout: 30_000 });

    const audio = readFileSync(outFile);
    return new NextResponse(audio, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[demo/speak]", err);
    return NextResponse.json({ error: "TTS failed" }, { status: 502 });
  } finally {
    if (tmpDir) {
      try { rmSync(tmpDir, { recursive: true, force: true }); } catch {}
    }
  }
}
