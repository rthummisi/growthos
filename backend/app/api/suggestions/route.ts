import { NextRequest } from "next/server";
import { prisma } from "@backend/lib/prisma";
import { auditMutation, json } from "@backend/lib/api";
import { publishEvent } from "@backend/lib/events";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get("productId") ?? undefined;
  const status = searchParams.get("status") ?? undefined;
  const channelSlug = searchParams.get("channelSlug") ?? undefined;
  const page = Number(searchParams.get("page") ?? "1");
  const limit = Number(searchParams.get("limit") ?? "50");

  const suggestions = await prisma.placementSuggestion.findMany({
    where: {
      productId,
      status,
      channel: channelSlug ? { slug: channelSlug } : undefined
    },
    include: {
      channel: true,
      assets: true,
      versions: true,
      approvals: true
    },
    skip: (page - 1) * limit,
    take: limit,
    orderBy: { createdAt: "desc" }
  });

  return json({ suggestions, total: suggestions.length });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as {
    productId?: string;
    channelSlug: string;
    type: string;
    title: string;
    body: string;
    reasoning: string;
  };

  const product =
    (body.productId
      ? await prisma.product.findUnique({ where: { id: body.productId } })
      : await prisma.product.findFirst({ orderBy: { createdAt: "desc" } })) ?? null;
  if (!product) {
    return json({ error: "No product available to attach suggestion" }, 400);
  }

  const channel = await prisma.channel.findUniqueOrThrow({
    where: { slug: body.channelSlug }
  });

  const suggestion = await prisma.placementSuggestion.create({
    data: {
      productId: product.id,
      channelId: channel.id,
      type: body.type,
      title: body.title,
      body: body.body,
      reasoning: body.reasoning,
      viralityScore: 70,
      effortScore: 35,
      audienceFit: 75,
      timeToValue: 5,
      status: "pending",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    }
  });

  await prisma.asset.create({
    data: {
      suggestionId: suggestion.id,
      type: "post",
      title: suggestion.title,
      content: suggestion.body
    }
  });

  const pending = await prisma.placementSuggestion.count({
    where: { status: "pending" }
  });
  publishEvent({
    type: "queue:update",
    payload: { pending, suggestionId: suggestion.id }
  });
  await auditMutation("suggestion.created", "PlacementSuggestion", {
    suggestionId: suggestion.id,
    channelSlug: body.channelSlug
  });

  return json(suggestion, 201);
}
