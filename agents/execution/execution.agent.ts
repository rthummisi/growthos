import { prisma } from "@backend/lib/prisma";
import { BaseAgent } from "@agents/_core/base-agent";
import { commitFiles, createPR, createRepo } from "@backend/lib/integrations/github";
import { post as postToProductHunt } from "@backend/lib/integrations/producthunt";
import { post as postToReddit } from "@backend/lib/integrations/reddit";
import { post as postToNewsletter } from "@backend/lib/integrations/newsletter";
import { post as postToTwitter } from "@backend/lib/integrations/twitter";
import { publishReel as publishInstagramReel } from "@backend/lib/integrations/instagram-reels";
import { publishShort as publishYouTubeShort } from "@backend/lib/integrations/youtube-shorts";
import { publishVideo as publishTikTokVideo } from "@backend/lib/integrations/tiktok";
import { resolveShortFormMedia } from "@backend/lib/integrations/short-form-media";
import type { Prisma } from "@prisma/client";
import type { AssetOutput, ExecutionArtifact } from "@shared/types/agent.types";

export class ExecutionAgent extends BaseAgent<
  { suggestionId: string; approvedAsset: AssetOutput; taskId?: string },
  { taskId: string; artifacts: ExecutionArtifact[] }
> {
  name = "execution";

  async run(input: { suggestionId: string; approvedAsset: AssetOutput; taskId?: string }) {
    const approval = await prisma.approval.findFirst({
      where: { suggestionId: input.suggestionId, decision: "approved" },
      orderBy: { decidedAt: "desc" }
    });
    if (!approval) {
      throw new Error("Suggestion must be approved before execution");
    }

    const suggestion = await prisma.placementSuggestion.findUniqueOrThrow({
      where: { id: input.suggestionId },
      include: {
        product: true,
        channel: true
      }
    });

    const queuedTask = input.taskId
      ? await prisma.executionTask.update({
          where: { id: input.taskId },
          data: {
            status: "running",
            startedAt: new Date(),
            errorMsg: null
          }
        })
      : await prisma.executionTask.create({
          data: {
            suggestionId: input.suggestionId,
            status: "running",
            startedAt: new Date()
          }
        });

    const artifacts = await this.executePlacement(
      suggestion.type,
      suggestion.title,
      input.approvedAsset,
      suggestion.channel.slug,
      suggestion.product.url,
      suggestion.product.description
    );

    await prisma.executionTask.update({
      where: { id: queuedTask.id },
      data: {
        status: "done",
        completedAt: new Date(),
        artifacts: artifacts as unknown as Prisma.InputJsonValue
      }
    });

    return {
      taskId: queuedTask.id,
      artifacts
    };
  }

  private async executePlacement(
    type: string,
    title: string,
    approvedAsset: AssetOutput,
    channelSlug: string,
    productUrl: string,
    productDescription: string
  ): Promise<ExecutionArtifact[]> {
    if (type === "short-form-video") {
      return this.publishShortFormVideo({
        title,
        approvedAsset,
        channelSlug,
        productUrl,
        productDescription
      });
    }

    switch (type) {
      case "github-repo": {
        const repoName = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
        const repo = await createRepo(repoName || "growthos-launch", title, false);
        const commit = await commitFiles(repo.repoUrl, [
          { path: "README.md", content: approvedAsset.content }
        ]);
        return [
          { label: "Repository", url: repo.repoUrl },
          { label: "Initial Commit", content: commit.sha }
        ];
      }
      case "awesome-list-entry": {
        const pr = await createPR(
          "https://github.com/example/awesome-devtools",
          `Add ${title}`,
          approvedAsset.content,
          "growthos/add-entry"
        );
        return [{ label: "Pull Request", url: pr.url }];
      }
      case "package-listing": {
        return [
          { label: "Publish Command", content: "npm publish --access public" },
          { label: "Prepared Content", content: approvedAsset.content }
        ];
      }
      case "newsletter-submission": {
        const draft = await postToNewsletter(approvedAsset.content);
        return [
          { label: "Newsletter Draft", content: draft.content },
          { label: "Target Publication", content: draft.draftTarget }
        ];
      }
      case "community-post": {
        const redditDraft = await postToReddit(approvedAsset.content);
        const tweetDraft = await postToTwitter(approvedAsset.content);
        return [
          { label: "Reddit Draft", url: redditDraft.submissionUrl },
          { label: "Twitter Draft", url: tweetDraft.composeUrl },
          { label: "Prepared Content", content: approvedAsset.content }
        ];
      }
      case "blog-article": {
        const launchDraft = await postToProductHunt(approvedAsset.content);
        return [
          { label: "Product Hunt Draft", url: launchDraft.launchUrl },
          { label: "Prepared Article", content: approvedAsset.content }
        ];
      }
      case "answer-reply":
      case "influencer-outreach":
      default: {
        return [
          { label: "Prepared Asset", content: approvedAsset.content },
          { label: "Posting Mode", content: "manual approval-gated handoff" }
        ];
      }
    }
  }

  private async publishShortFormVideo(input: {
    title: string;
    approvedAsset: AssetOutput;
    channelSlug: string;
    productUrl: string;
    productDescription: string;
  }): Promise<ExecutionArtifact[]> {
    const media = await resolveShortFormMedia({
      suggestionId: input.approvedAsset.suggestionId,
      productUrl: input.productUrl,
      productDescription: input.productDescription
    });

    if (input.channelSlug === "youtube-shorts") {
      const published = await publishYouTubeShort({
        title: input.title,
        description: input.approvedAsset.content,
        filePath: media.filePath
      });
      return [
        { label: "YouTube Short", url: published.url },
        { label: "Video Id", content: published.id },
        { label: "Privacy", content: published.privacyStatus },
        { label: "Media Source", content: media.source }
      ];
    }

    if (input.channelSlug === "instagram-reels") {
      if (!media.publicUrl) {
        throw new Error(
          "Instagram Reels publishing requires an HTTPS-accessible video URL. Configure PUBLIC_ASSET_BASE_URL or SHORTFORM_VIDEO_URL."
        );
      }
      const published = await publishInstagramReel({
        caption: input.approvedAsset.content,
        videoUrl: media.publicUrl
      });
      return [
        { label: "Instagram Reel", url: published.url },
        { label: "Media Id", content: published.id },
        { label: "Media Source", content: media.source }
      ];
    }

    if (input.channelSlug === "tiktok") {
      const published = await publishTikTokVideo({
        title: input.title,
        caption: input.approvedAsset.content,
        filePath: media.filePath
      });
      return [
        { label: "TikTok Upload", url: published.url },
        { label: "Publish Id", content: published.id },
        { label: "Privacy", content: published.privacyLevel },
        { label: "Media Source", content: media.source }
      ];
    }

    return [
      { label: "Prepared Short-Form Script", content: input.approvedAsset.content },
      { label: "Posting Mode", content: "manual approval-gated handoff" }
    ];
  }
}
