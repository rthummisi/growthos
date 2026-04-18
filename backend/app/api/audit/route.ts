import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json } from "@backend/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const entityId = searchParams.get("entityId") ?? undefined;
  const entityType = searchParams.get("entityType") ?? undefined;
  const rows = await prisma.auditLog.findMany({
    where: {
      entityId,
      entityType
    },
    orderBy: { createdAt: "desc" },
    take: 100
  });
  return json(rows);
}
