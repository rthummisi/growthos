import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { auditMutation, json } from "@backend/lib/api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? undefined;
  const rows = await prisma.contentCalendar.findMany({
    where: { productId },
    orderBy: { scheduledAt: "asc" }
  });
  return json(rows);
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    productId: string;
    entries: Array<{
      channelSlug: string;
      phase: string;
      scheduledAt: string;
      suggestionId?: string;
    }>;
  };

  await prisma.contentCalendar.deleteMany({
    where: { productId: body.productId }
  });

  const created = await prisma.$transaction(
    body.entries.map((entry) =>
      prisma.contentCalendar.create({
        data: {
          productId: body.productId,
          channelSlug: entry.channelSlug,
          phase: entry.phase,
          scheduledAt: new Date(entry.scheduledAt),
          suggestionId: entry.suggestionId,
          status: "scheduled"
        }
      })
    )
  );

  await auditMutation("calendar.saved", "ContentCalendar", {
    productId: body.productId,
    count: created.length
  });

  return json(created, 201);
}
