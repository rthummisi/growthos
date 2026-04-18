import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json, auditMutation } from "@backend/lib/api";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const body = (await request.json()) as { content: string };
  const { id } = await context.params;
  const asset = await prisma.asset.update({
    where: { id },
    data: { content: body.content }
  });
  await auditMutation("asset.updated", "Asset", { id, content: body.content });
  return json(asset);
}
