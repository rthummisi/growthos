export const BACKEND_BASE = process.env.E2E_BACKEND_BASE ?? "http://127.0.0.1:3101/api";

export async function createProductAndRun(request: {
  post: (url: string, options?: { data?: unknown }) => Promise<{ ok(): boolean; json(): Promise<unknown> }>;
}) {
  const productResponse = await request.post(`${BACKEND_BASE}/products`, {
    data: {
      url: "https://growthos.local/product",
      githubUrl: "https://github.com/example/growthos",
      description: "A local-first growth operations system for developer products.",
      brandVoice: {
        tone: "technical but approachable",
        style: "clear and direct",
        vocabulary: {
          include: ["developer", "workflow"],
          avoid: ["synergy"]
        },
        preset: "Technical OSS"
      }
    }
  });

  if (!productResponse.ok()) {
    throw new Error("Failed to create product in E2E helper");
  }

  const product = (await productResponse.json()) as { id: string };
  const runResponse = await request.post(`${BACKEND_BASE}/run`, {
    data: { productId: product.id }
  });

  if (!runResponse.ok()) {
    throw new Error("Failed to run swarm in E2E helper");
  }

  const run = (await runResponse.json()) as { runId: string };
  return { productId: product.id, runId: run.runId };
}
