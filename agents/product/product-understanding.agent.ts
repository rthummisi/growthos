import { z } from "zod";
import { BaseAgent } from "@agents/_core/base-agent";
import type { ProductProfile } from "@shared/types/agent.types";

const schema = z.object({
  productId: z.string(),
  icp: z.string().min(1),
  plgWedge: z.string().min(1),
  useCases: z.array(z.string().min(1)).min(1),
  whyDevsShare: z.string().min(1),
  technicalSurface: z.array(z.string().min(1)).min(1),
  targetCommunities: z.array(z.string().min(1)).min(1)
});

async function fetchPageText(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: { "User-Agent": "GrowthOS-Analyzer/1.0" },
      signal: AbortSignal.timeout(10_000)
    });
    const html = await response.text();
    return html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, " ")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 12_000);
  } catch {
    return "";
  }
}

async function fetchGitHubContent(githubUrl: string): Promise<string> {
  try {
    const url = new URL(githubUrl);
    const parts = url.pathname.replace(/^\//, "").split("/");
    if (parts.length < 2) return "";
    const [owner, repo] = parts;
    const base = `https://raw.githubusercontent.com/${owner}/${repo}/main`;

    const [readme, pkg] = await Promise.allSettled([
      fetch(`${base}/README.md`).then((r) => (r.ok ? r.text() : "")),
      fetch(`${base}/package.json`).then((r) => (r.ok ? r.text() : ""))
    ]);

    const readmeText = readme.status === "fulfilled" ? readme.value : "";
    const pkgText = pkg.status === "fulfilled" ? pkg.value : "";

    return `README:\n${readmeText.slice(0, 6_000)}\n\npackage.json:\n${pkgText.slice(0, 1_000)}`;
  } catch {
    return "";
  }
}

const SYSTEM_PROMPT = `You are a senior PLG product analyst. Given a product's URL content, description, and optionally its GitHub README, extract a precise product profile for distribution strategy.

Return ONLY valid JSON with exactly these fields:
{
  "icp": "specific description of the ideal customer profile — role, company size, workflow context, pain point",
  "plgWedge": "the specific self-serve entry point that creates immediate value and drives viral sharing",
  "useCases": ["3-6 concrete use cases a developer would actually have, worded as developer tasks"],
  "whyDevsShare": "the specific mechanism that makes developers share this — what they show peers and why",
  "technicalSurface": ["API", "CLI", "SDK", etc. — actual surfaces present in the product],
  "targetCommunities": ["specific communities where this ICP spends time, e.g. r/devops, HN, GitHub Actions ecosystem"]
}

Rules:
- Be specific, not generic. "Developers who need faster CI" is bad. "Backend engineers at Series A startups running monorepos who hit flaky test bottlenecks" is good.
- plgWedge must describe a concrete first action in the product that produces a shareable outcome
- useCases must be real developer tasks, not marketing copy
- Do not use the product name as a placeholder — analyze the actual content`;

export class ProductUnderstandingAgent extends BaseAgent<
  { productId: string; url: string; githubUrl?: string; description: string },
  ProductProfile
> {
  name = "product-understanding";

  async run(input: { productId: string; url: string; githubUrl?: string; description: string }) {
    const [pageText, githubText] = await Promise.all([
      fetchPageText(input.url),
      input.githubUrl ? fetchGitHubContent(input.githubUrl) : Promise.resolve("")
    ]);

    const userPrompt = `Product URL: ${input.url}
Description: ${input.description}
${input.githubUrl ? `GitHub: ${input.githubUrl}` : ""}

Page content:
${pageText || "(could not fetch)"}

${githubText ? `GitHub content:\n${githubText}` : ""}`;

    const raw = await this.callClaude(SYSTEM_PROMPT, userPrompt);

    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("ProductUnderstandingAgent: no JSON in Claude response");

    const parsed = this.jsonFromText(jsonMatch[0], schema.omit({ productId: true }));
    return this.enforceOutputContract({ productId: input.productId, ...parsed }, schema);
  }
}
