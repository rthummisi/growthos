export async function post(content: string) {
  return { id: "npm-manual", content, publishCommand: "npm publish --access public" };
}

export async function fetchMetrics(packageName: string): Promise<{ downloads: number; dependents: number; entityId: string }> {
  try {
    const [dlResponse, pkgResponse] = await Promise.allSettled([
      fetch(`https://api.npmjs.org/downloads/point/last-week/${encodeURIComponent(packageName)}`, { signal: AbortSignal.timeout(5_000) }),
      fetch(`https://registry.npmjs.org/${encodeURIComponent(packageName)}`, { signal: AbortSignal.timeout(5_000) })
    ]);

    const downloads =
      dlResponse.status === "fulfilled" && dlResponse.value.ok
        ? ((await dlResponse.value.json()) as { downloads?: number }).downloads ?? 0
        : 0;

    return { downloads, dependents: 0, entityId: packageName };
  } catch {
    return { downloads: 0, dependents: 0, entityId: packageName };
  }
}
