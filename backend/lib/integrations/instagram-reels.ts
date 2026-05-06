interface PublishReelInput {
  caption: string;
  videoUrl: string;
}

function instagramBaseUrl() {
  return `https://graph.facebook.com/${process.env.INSTAGRAM_GRAPH_VERSION?.trim() || "v22.0"}`;
}

function requiredInstagramEnv() {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  const userId = process.env.INSTAGRAM_IG_USER_ID?.trim();
  if (!accessToken || !userId) {
    throw new Error("Instagram Graph credentials are not configured");
  }
  return { accessToken, userId };
}

async function pollContainer(containerId: string, accessToken: string) {
  for (let attempt = 0; attempt < 20; attempt += 1) {
    const response = await fetch(
      `${instagramBaseUrl()}/${containerId}?${new URLSearchParams({
        fields: "status_code,status",
        access_token: accessToken
      }).toString()}`,
      {
        signal: AbortSignal.timeout(10_000)
      }
    );

    if (!response.ok) {
      throw new Error(`Instagram container status failed: ${response.status}`);
    }

    const payload = (await response.json()) as { status_code?: string; status?: string };
    const status = payload.status_code ?? payload.status ?? "";
    if (status === "FINISHED" || status === "PUBLISHED") {
      return;
    }
    if (status === "ERROR" || status === "EXPIRED") {
      throw new Error(`Instagram media container failed with status ${status}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 3_000));
  }

  throw new Error("Instagram reel container did not finish processing in time");
}

export async function publishReel(input: PublishReelInput) {
  const { accessToken, userId } = requiredInstagramEnv();

  const createResponse = await fetch(`${instagramBaseUrl()}/${userId}/media`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      media_type: "REELS",
      video_url: input.videoUrl,
      caption: input.caption,
      share_to_feed: process.env.INSTAGRAM_SHARE_TO_FEED?.trim() || "true",
      access_token: accessToken
    }),
    signal: AbortSignal.timeout(20_000)
  });

  if (!createResponse.ok) {
    throw new Error(`Instagram reel creation failed: ${createResponse.status}`);
  }

  const createPayload = (await createResponse.json()) as { id?: string };
  if (!createPayload.id) {
    throw new Error("Instagram reel container id missing");
  }

  await pollContainer(createPayload.id, accessToken);

  const publishResponse = await fetch(`${instagramBaseUrl()}/${userId}/media_publish`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      creation_id: createPayload.id,
      access_token: accessToken
    }),
    signal: AbortSignal.timeout(20_000)
  });

  if (!publishResponse.ok) {
    throw new Error(`Instagram reel publish failed: ${publishResponse.status}`);
  }

  const publishPayload = (await publishResponse.json()) as { id?: string };
  if (!publishPayload.id) {
    throw new Error("Instagram publish response missing media id");
  }

  return {
    id: publishPayload.id,
    url: `https://www.instagram.com/reel/${publishPayload.id}/`
  };
}

export async function fetchMetrics(entityId: string) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    return {
      views: 0,
      watchTime: 0,
      avgViewDuration: 0,
      completionRate: 0,
      shares: 0,
      saves: 0,
      followersGained: 0
    };
  }

  try {
    const response = await fetch(
      `${instagramBaseUrl()}/${entityId}/insights?${new URLSearchParams({
        metric: "plays,reach,saved,shares,total_interactions",
        access_token: accessToken
      }).toString()}`,
      {
        signal: AbortSignal.timeout(10_000)
      }
    );
    if (!response.ok) {
      throw new Error("Instagram insights error");
    }

    const payload = (await response.json()) as {
      data?: Array<{
        name?: string;
        values?: Array<{ value?: number }>;
      }>;
    };
    const metrics = Object.fromEntries(
      (payload.data ?? []).map((entry) => [entry.name ?? "", entry.values?.[0]?.value ?? 0])
    );

    return {
      views: Number(metrics.plays ?? 0),
      watchTime: 0,
      avgViewDuration: 0,
      completionRate: 0,
      shares: Number(metrics.shares ?? 0),
      saves: Number(metrics.saved ?? 0),
      followersGained: Number(metrics.total_interactions ?? 0)
    };
  } catch {
    return {
      views: 0,
      watchTime: 0,
      avgViewDuration: 0,
      completionRate: 0,
      shares: 0,
      saves: 0,
      followersGained: 0
    };
  }
}
