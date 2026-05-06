import fs from "fs/promises";

interface YouTubeTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface PublishShortInput {
  title: string;
  description: string;
  filePath: string;
}

function youtubePrivacyStatus() {
  return process.env.YOUTUBE_UPLOAD_PRIVACY?.trim() || "private";
}

async function getAccessToken() {
  const directToken = process.env.YOUTUBE_ACCESS_TOKEN?.trim();
  if (directToken) {
    return directToken;
  }

  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
  const clientId = process.env.YOUTUBE_CLIENT_ID?.trim();
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();
  if (!refreshToken || !clientId || !clientSecret) {
    throw new Error("YouTube credentials are not configured");
  }

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token"
    }),
    signal: AbortSignal.timeout(10_000)
  });

  if (!response.ok) {
    throw new Error(`YouTube token refresh failed: ${response.status}`);
  }

  const data = (await response.json()) as YouTubeTokenResponse;
  return data.access_token;
}

export async function publishShort(input: PublishShortInput) {
  const accessToken = await getAccessToken();
  const videoBuffer = await fs.readFile(input.filePath);

  const initResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?part=snippet,status&uploadType=resumable",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Type": "video/mp4",
        "X-Upload-Content-Length": String(videoBuffer.byteLength)
      },
      body: JSON.stringify({
        snippet: {
          title: input.title.slice(0, 100),
          description: input.description.slice(0, 5_000),
          categoryId: "28"
        },
        status: {
          privacyStatus: youtubePrivacyStatus(),
          selfDeclaredMadeForKids: false
        }
      }),
      signal: AbortSignal.timeout(20_000)
    }
  );

  if (!initResponse.ok) {
    throw new Error(`YouTube upload init failed: ${initResponse.status}`);
  }

  const uploadUrl = initResponse.headers.get("location");
  if (!uploadUrl) {
    throw new Error("YouTube upload URL missing");
  }

  const uploadResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "video/mp4",
      "Content-Length": String(videoBuffer.byteLength)
    },
    body: videoBuffer,
    signal: AbortSignal.timeout(120_000)
  });

  if (!uploadResponse.ok) {
    throw new Error(`YouTube upload failed: ${uploadResponse.status}`);
  }

  const payload = (await uploadResponse.json()) as {
    id?: string;
    status?: { privacyStatus?: string };
  };
  if (!payload.id) {
    throw new Error("YouTube upload response missing video id");
  }

  return {
    id: payload.id,
    url: `https://www.youtube.com/shorts/${payload.id}`,
    privacyStatus: payload.status?.privacyStatus ?? youtubePrivacyStatus()
  };
}

export async function fetchMetrics(entityId: string) {
  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  const token = process.env.YOUTUBE_ACCESS_TOKEN?.trim();
  const accessToken = token || (process.env.YOUTUBE_REFRESH_TOKEN ? await getAccessToken().catch(() => "") : "");
  const params = new URLSearchParams({
    part: "statistics,contentDetails",
    id: entityId
  });
  if (apiKey) {
    params.set("key", apiKey);
  }

  try {
    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
      signal: AbortSignal.timeout(10_000)
    });
    if (!response.ok) {
      throw new Error("YouTube API error");
    }

    const payload = (await response.json()) as {
      items?: Array<{
        statistics?: {
          viewCount?: string;
          likeCount?: string;
          commentCount?: string;
        };
      }>;
    };
    const stats = payload.items?.[0]?.statistics;
    const views = Number(stats?.viewCount ?? 0);
    const likes = Number(stats?.likeCount ?? 0);
    const comments = Number(stats?.commentCount ?? 0);
    return {
      views,
      watchTime: 0,
      avgViewDuration: 0,
      completionRate: 0,
      shares: comments,
      subscribersGained: likes,
      clickThroughRate: 0
    };
  } catch {
    return {
      views: 0,
      watchTime: 0,
      avgViewDuration: 0,
      completionRate: 0,
      shares: 0,
      subscribersGained: 0,
      clickThroughRate: 0
    };
  }
}
