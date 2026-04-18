import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { json } from "@backend/lib/api";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId") ?? "demo-product-1";

  const [matches, signals] = await Promise.all([
    prisma.wildMatch.findMany({
      where: { productId },
      orderBy: { fetchedAt: "desc" },
      take: 20
    }),
    prisma.marketSignal.findMany({
      where: { productId },
      orderBy: { generatedAt: "desc" },
      take: 5
    })
  ]);

  const lastScan = matches[0]?.fetchedAt ?? null;

  return json({ matches, signals, lastScan });
}
