import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@backend/lib/prisma";
import { json, auditMutation } from "@backend/lib/api";
import { ensureDefaultChannels } from "@backend/lib/bootstrap";

export async function POST(request: NextRequest) {
  await ensureDefaultChannels();
  const body = (await request.json()) as {
    url: string;
    githubUrl?: string;
    description: string;
    brandVoice?: { tone: string; style: string; vocabulary: unknown; preset?: string };
  };

  const org = await prisma.organization.upsert({
    where: { id: "default-org" },
    update: {},
    create: { id: "default-org", name: "Default Organization" }
  });

  const project = await prisma.project.create({
    data: {
      orgId: org.id,
      name: new URL(body.url).hostname
    }
  });

  const brandVoice = body.brandVoice
    ? await prisma.brandVoice.create({
        data: {
          ...body.brandVoice,
          vocabulary: body.brandVoice.vocabulary as Prisma.InputJsonValue
        }
      })
    : null;

  const product = await prisma.product.create({
    data: {
      projectId: project.id,
      url: body.url,
      githubUrl: body.githubUrl,
      description: body.description,
      brandVoiceId: brandVoice?.id
    }
  });

  await auditMutation("product.created", "Product", product);
  return json(product, 201);
}
