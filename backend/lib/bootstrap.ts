import { prisma } from "@backend/lib/prisma";
import { CHANNELS } from "@shared/constants/channels";

function titleCase(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export async function ensureDefaultChannels() {
  for (const slug of CHANNELS) {
    const name = titleCase(slug);
    const existing = await prisma.channel.findFirst({
      where: {
        OR: [{ slug }, { name }]
      }
    });

    if (existing) {
      if (existing.slug !== slug || existing.name !== name) {
        await prisma.channel.update({
          where: { id: existing.id },
          data: {
            slug,
            name
          }
        });
      }
      continue;
    }

    await prisma.channel.upsert({
      where: { slug },
      update: {
        name
      },
      create: {
        slug,
        name,
        cadence: "daily",
        active: true
      }
    });
  }
}
