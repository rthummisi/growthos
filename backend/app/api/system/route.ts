import { json } from "@backend/lib/api";

export async function GET() {
  return json({
    postgres: true,
    redis: true,
    minio: true,
    env: {
      databaseUrl: Boolean(process.env.DATABASE_URL),
      redisUrl: Boolean(process.env.REDIS_URL),
      minioEndpoint: Boolean(process.env.MINIO_ENDPOINT),
      anthropicApiKey: Boolean(process.env.ANTHROPIC_API_KEY),
      githubToken: Boolean(process.env.GITHUB_TOKEN),
      firecrawlApiKey: Boolean(process.env.FIRECRAWL_API_KEY),
      tavilyApiKey: Boolean(process.env.TAVILY_API_KEY),
      youtubeClientId: Boolean(process.env.YOUTUBE_CLIENT_ID),
      youtubeRefreshToken: Boolean(process.env.YOUTUBE_REFRESH_TOKEN),
      instagramAccessToken: Boolean(process.env.INSTAGRAM_ACCESS_TOKEN),
      instagramIgUserId: Boolean(process.env.INSTAGRAM_IG_USER_ID),
      tiktokAccessToken: Boolean(process.env.TIKTOK_ACCESS_TOKEN),
      publicAssetBaseUrl: Boolean(process.env.PUBLIC_ASSET_BASE_URL),
      shortformVideoUrl: Boolean(process.env.SHORTFORM_VIDEO_URL),
      shortformVideoFile: Boolean(process.env.SHORTFORM_VIDEO_FILE)
    }
  });
}
