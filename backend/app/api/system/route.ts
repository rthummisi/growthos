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
      githubToken: Boolean(process.env.GITHUB_TOKEN)
    }
  });
}
