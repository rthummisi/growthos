import { prisma } from "@backend/lib/prisma";
import { BaseAgent } from "@agents/_core/base-agent";
import type { AssetOutput, PlacementSuggestionOutput } from "@shared/types/agent.types";

export class ApprovalOrchestrationAgent extends BaseAgent<
  { productId: string; suggestions: PlacementSuggestionOutput[]; assets: AssetOutput[] },
  { count: number }
> {
  name = "approval-orchestration";

  async run(input: { productId: string; suggestions: PlacementSuggestionOutput[]; assets: AssetOutput[] }) {
    for (const suggestion of input.suggestions) {
      const channel = await prisma.channel.findUniqueOrThrow({
        where: { slug: suggestion.channelSlug }
      });
      const existing = await prisma.placementSuggestion.findFirst({
        where: {
          productId: input.productId,
          channelId: channel.id,
          type: suggestion.type,
          status: {
            in: ["pending", "approved", "deferred"]
          }
        }
      });
      if (existing) {
        continue;
      }
      const created = await prisma.placementSuggestion.create({
        data: {
          productId: input.productId,
          channelId: channel.id,
          type: suggestion.type,
          title: suggestion.title,
          body: suggestion.body,
          reasoning: suggestion.reasoning,
          viralityScore: suggestion.viralityScore,
          effortScore: suggestion.effortScore,
          audienceFit: suggestion.audienceFit,
          timeToValue: suggestion.timeToValue,
          status: "pending",
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      });
      const asset = input.assets.find((entry) => entry.title === suggestion.title);
      if (asset) {
        const primaryAsset = await prisma.asset.create({
          data: {
            suggestionId: created.id,
            type: asset.type,
            title: asset.title,
            content: asset.content
          }
        });
        for (const variation of asset.variations) {
          await prisma.asset.create({
            data: {
              suggestionId: created.id,
              type: asset.type,
              title: `${asset.title} variation`,
              content: variation,
              variationOf: primaryAsset.id
            }
          });
        }
      }
    }
    return { count: input.suggestions.length };
  }
}
