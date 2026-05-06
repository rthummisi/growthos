import fs from "fs/promises";
import os from "os";
import path from "path";
import { prisma } from "@backend/lib/prisma";
import { minio } from "@backend/lib/minio";
import { DemoGenerationAgent } from "@agents/demo/demo-generation.agent";

const VIDEO_EXTENSIONS = [".mp4", ".mov", ".m4v", ".webm"];
const URL_PATTERN = /https?:\/\/[^\s"'<>]+/gi;
const FILE_PATTERN = /(?:\/|~\/)[^\s"'<>]+\.(?:mp4|mov|m4v|webm)\b/gi;

export interface ResolvedShortFormMedia {
  filePath: string;
  publicUrl?: string;
  source:
    | "asset-storage"
    | "asset-content-url"
    | "asset-content-file"
    | "env-url"
    | "env-file"
    | "generated-demo";
}

function isVideoPath(value: string) {
  const lower = value.toLowerCase();
  return VIDEO_EXTENSIONS.some((extension) => lower.endsWith(extension));
}

function normalizeHomePath(value: string) {
  return value.startsWith("~/") ? path.join(os.homedir(), value.slice(2)) : value;
}

function extractVideoUrl(text: string) {
  const matches = text.match(URL_PATTERN) ?? [];
  return matches.find((candidate) => isVideoPath(candidate));
}

function extractVideoFilePath(text: string) {
  const matches = text.match(FILE_PATTERN) ?? [];
  return matches.find((candidate) => isVideoPath(candidate));
}

async function pathExists(targetPath: string) {
  try {
    await fs.access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function downloadToTemp(url: string) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(45_000)
  });
  if (!response.ok) {
    throw new Error(`Unable to download video asset: ${response.status}`);
  }
  const suffix = path.extname(new URL(url).pathname) || ".mp4";
  const filePath = path.join(os.tmpdir(), `growthos-shortform-${Date.now()}${suffix}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await fs.writeFile(filePath, bytes);
  return filePath;
}

async function downloadMinioObject(storageKey: string) {
  const bucket = process.env.MINIO_BUCKET ?? "growthos";
  const extension = path.extname(storageKey) || ".mp4";
  const filePath = path.join(os.tmpdir(), `growthos-shortform-${Date.now()}${extension}`);
  const stream = await minio.getObject(bucket, storageKey);
  const chunks: Buffer[] = [];
  await new Promise<void>((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.from(chunk)));
    stream.on("end", () => resolve());
    stream.on("error", reject);
  });
  await fs.writeFile(filePath, Buffer.concat(chunks));
  return filePath;
}

function buildPublicUrl(storageKey: string) {
  const configuredBase = process.env.PUBLIC_ASSET_BASE_URL?.trim();
  if (!configuredBase) {
    return undefined;
  }
  return `${configuredBase.replace(/\/$/, "")}/${storageKey.replace(/^\//, "")}`;
}

async function resolveFromAssets(suggestionId: string) {
  const assets = await prisma.asset.findMany({
    where: { suggestionId },
    orderBy: { createdAt: "asc" }
  });

  for (const asset of assets) {
    if (asset.storageKey && isVideoPath(asset.storageKey)) {
      const filePath = await downloadMinioObject(asset.storageKey);
      return {
        filePath,
        publicUrl: buildPublicUrl(asset.storageKey),
        source: "asset-storage" as const
      };
    }
  }

  for (const asset of assets) {
    const contentUrl = extractVideoUrl(asset.content);
    if (contentUrl) {
      return {
        filePath: await downloadToTemp(contentUrl),
        publicUrl: contentUrl,
        source: "asset-content-url" as const
      };
    }

    const contentPath = extractVideoFilePath(asset.content);
    if (contentPath) {
      const normalized = normalizeHomePath(contentPath);
      if (await pathExists(normalized)) {
        return {
          filePath: normalized,
          source: "asset-content-file" as const
        };
      }
    }
  }

  return null;
}

async function resolveFromEnvironment() {
  const envUrl = process.env.SHORTFORM_VIDEO_URL?.trim();
  if (envUrl && isVideoPath(envUrl)) {
    return {
      filePath: await downloadToTemp(envUrl),
      publicUrl: envUrl,
      source: "env-url" as const
    };
  }

  const envFile = process.env.SHORTFORM_VIDEO_FILE?.trim();
  if (envFile) {
    const normalized = normalizeHomePath(envFile);
    if (await pathExists(normalized)) {
      return {
        filePath: normalized,
        source: "env-file" as const
      };
    }
  }

  return null;
}

async function resolveGeneratedDemo(input: {
  productUrl: string;
  productDescription: string;
}): Promise<ResolvedShortFormMedia | null> {
  if (process.env.GROWTHOS_ENABLE_AUTO_DEMO_VIDEO === "false" || !process.env.ANTHROPIC_API_KEY) {
    return null;
  }

  try {
    const demo = await new DemoGenerationAgent().run({
      productDescription: input.productDescription,
      localUrl: input.productUrl
    });
    return {
      filePath: demo.mp4,
      source: "generated-demo" as const
    };
  } catch {
    return null;
  }
}

export async function resolveShortFormMedia(input: {
  suggestionId: string;
  productUrl: string;
  productDescription: string;
}): Promise<ResolvedShortFormMedia> {
  const fromAssets = await resolveFromAssets(input.suggestionId);
  if (fromAssets) {
    return fromAssets;
  }

  const fromEnvironment = await resolveFromEnvironment();
  if (fromEnvironment) {
    return fromEnvironment;
  }

  const generated = await resolveGeneratedDemo(input);
  if (generated) {
    return generated;
  }

  throw new Error(
    "No video asset available. Set an asset storageKey, embed a .mp4 URL/path in the asset, or configure SHORTFORM_VIDEO_URL / SHORTFORM_VIDEO_FILE."
  );
}
