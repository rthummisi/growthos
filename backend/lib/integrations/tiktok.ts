import fs from "fs/promises";

interface PublishTiktokInput {
  title: string;
  caption: string;
  filePath: string;
}

interface CreatorInfoResponse {
  data?: {
    creator_avatar_url?: string;
    privacy_level_options?: string[];
    comment_disabled?: boolean;
    duet_disabled?: boolean;
    stitch_disabled?: boolean;
    max_video_post_duration_sec?: number;
  };
}

function requiredTiktokToken() {
  const token = process.env.TIKTOK_ACCESS_TOKEN?.trim();
  if (!token) {
    throw new Error("TikTok access token is not configured");
  }
  return token;
}

async function tiktokRequest<T>(pathname: string, init?: RequestInit) {
  const token = requiredTiktokToken();
  const response = await fetch(`https://open.tiktokapis.com${pathname}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json; charset=UTF-8",
      ...(init?.headers ?? {})
    },
    signal: AbortSignal.timeout(20_000)
  });

  if (!response.ok) {
    throw new Error(`TikTok API failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

async function uploadVideoChunks(uploadUrl: string, filePath: string) {
  const video = await fs.readFile(filePath);
  const chunkSize = 5 * 1024 * 1024;
  const totalChunks = Math.max(1, Math.ceil(video.byteLength / chunkSize));

  for (let index = 0; index < totalChunks; index += 1) {
    const start = index * chunkSize;
    const end = Math.min(video.byteLength, start + chunkSize);
    const chunk = video.subarray(start, end);
    const response = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(chunk.byteLength),
        "Content-Range": `bytes ${start}-${end - 1}/${video.byteLength}`
      },
      body: chunk,
      signal: AbortSignal.timeout(120_000)
    });

    if (!response.ok) {
      throw new Error(`TikTok chunk upload failed: ${response.status}`);
    }
  }
}

export async function publishVideo(input: PublishTiktokInput) {
  const creatorInfo = await tiktokRequest<CreatorInfoResponse>("/v2/post/publish/creator_info/query/", {
    method: "POST",
    body: JSON.stringify({})
  });
  const privacyOptions = creatorInfo.data?.privacy_level_options ?? ["SELF_ONLY"];
  const privacyLevel = privacyOptions.includes(process.env.TIKTOK_PRIVACY_LEVEL?.trim() || "")
    ? (process.env.TIKTOK_PRIVACY_LEVEL?.trim() as string)
    : privacyOptions[0];

  const video = await fs.readFile(input.filePath);
  const chunkSize = Math.min(5 * 1024 * 1024, video.byteLength || 5 * 1024 * 1024);
  const totalChunkCount = Math.max(1, Math.ceil(video.byteLength / chunkSize));

  const initResponse = await tiktokRequest<{
    data?: {
      publish_id?: string;
      upload_url?: string;
      video_id?: string;
    };
  }>("/v2/post/publish/video/init/", {
    method: "POST",
    body: JSON.stringify({
      post_info: {
        title: input.title.slice(0, 150),
        description: input.caption.slice(0, 2_200),
        privacy_level: privacyLevel,
        disable_comment: false,
        disable_duet: false,
        disable_stitch: false
      },
      source_info: {
        source: "FILE_UPLOAD",
        video_size: video.byteLength,
        chunk_size: chunkSize,
        total_chunk_count: totalChunkCount
      }
    })
  });

  const uploadUrl = initResponse.data?.upload_url;
  if (!uploadUrl) {
    throw new Error("TikTok upload URL missing");
  }

  await uploadVideoChunks(uploadUrl, input.filePath);

  return {
    id: initResponse.data?.publish_id ?? initResponse.data?.video_id ?? "tiktok-publish",
    url: "https://www.tiktok.com/upload",
    privacyLevel
  };
}

export async function fetchMetrics(entityId: string) {
  try {
    const payload = await tiktokRequest<{
      data?: {
        videos?: Array<{
          id?: string;
          view_count?: number;
          like_count?: number;
          comment_count?: number;
          share_count?: number;
        }>;
      };
    }>(
      `/v2/video/query/?${new URLSearchParams({
        fields: "id,view_count,like_count,comment_count,share_count"
      }).toString()}`,
      {
        method: "POST",
        body: JSON.stringify({
          filters: {
            video_ids: [entityId]
          }
        })
      }
    );
    const video = payload.data?.videos?.[0];
    return {
      views: Number(video?.view_count ?? 0),
      watchTime: 0,
      avgViewDuration: 0,
      completionRate: 0,
      shares: Number(video?.share_count ?? 0),
      likes: Number(video?.like_count ?? 0),
      comments: Number(video?.comment_count ?? 0)
    };
  } catch {
    return {
      views: 0,
      watchTime: 0,
      avgViewDuration: 0,
      completionRate: 0,
      shares: 0,
      likes: 0,
      comments: 0
    };
  }
}
