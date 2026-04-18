import { prisma } from "@backend/lib/prisma";
import { BaseAgent } from "@agents/_core/base-agent";
import { commitFiles, createPR, createRepo } from "@backend/lib/integrations/github";
import { post as postToProductHunt } from "@backend/lib/integrations/producthunt";
import { post as postToReddit } from "@backend/lib/integrations/reddit";
import { post as postToNewsletter } from "@backend/lib/integrations/newsletter";
import { post as postToTwitter } from "@backend/lib/integrations/twitter";
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

    const artifacts = await this.executePlacement(suggestion.type, suggestion.title, input.approvedAsset);

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
    approvedAsset: AssetOutput
  ): Promise<ExecutionArtifact[]> {
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
}
