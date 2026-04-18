import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:3100"
  },
  webServer: [
    {
      command: "npm --workspace backend run dev:test",
      url: "http://127.0.0.1:3101/api/run",
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        DATABASE_URL: "postgresql://growthos:growthos@127.0.0.1:55432/growthos",
        REDIS_URL: "redis://127.0.0.1:56379",
        MINIO_ENDPOINT: "127.0.0.1",
        MINIO_ACCESS_KEY: "growthos",
        MINIO_SECRET_KEY: "growthos",
        NEXT_PUBLIC_API_BASE: "http://127.0.0.1:3101/api"
      }
    },
    {
      command: "npm --workspace frontend run dev:test",
      url: "http://127.0.0.1:3100",
      reuseExistingServer: true,
      timeout: 120000,
      env: {
        NEXT_PUBLIC_API_BASE: "http://127.0.0.1:3101/api"
      }
    }
  ]
});
