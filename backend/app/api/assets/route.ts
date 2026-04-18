import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json, auditMutation } from "@backend/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const suggestionId = searchParams.get("suggestionId") ?? undefined;
  const assets = await prisma.asset.findMany({
    where: { suggestionId }
  });
  return json(assets);
}

export async function PUT(request: NextRequest) {
  const body = (await request.json()) as { id: string; content: string };
  const asset = await prisma.asset.update({
    where: { id: body.id },
    data: { content: body.content }
  });
  await auditMutation("asset.updated", "Asset", body);
  return json(asset);
}
