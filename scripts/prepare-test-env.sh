#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

export DATABASE_URL="${DATABASE_URL:-postgresql://growthos:growthos@127.0.0.1:55432/growthos}"
export REDIS_URL="${REDIS_URL:-redis://127.0.0.1:56379}"
export MINIO_ENDPOINT="${MINIO_ENDPOINT:-127.0.0.1}"
export MINIO_ACCESS_KEY="${MINIO_ACCESS_KEY:-growthos}"
export MINIO_SECRET_KEY="${MINIO_SECRET_KEY:-growthos}"
export NEXT_PUBLIC_API_BASE="${NEXT_PUBLIC_API_BASE:-http://127.0.0.1:3001/api}"

docker compose -f infra/docker-compose.test.yml up -d
npx prisma db push --skip-generate
