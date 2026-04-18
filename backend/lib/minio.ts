import { Client } from "minio";

declare global {
  // eslint-disable-next-line no-var
  var __growthosMinio: Client | undefined;
}

export const minio =
  globalThis.__growthosMinio ??
  new Client({
    endPoint: process.env.MINIO_ENDPOINT ?? "localhost",
    port: 9000,
    useSSL: false,
    accessKey: process.env.MINIO_ACCESS_KEY ?? "growthos",
    secretKey: process.env.MINIO_SECRET_KEY ?? "growthos"
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__growthosMinio = minio;
}
