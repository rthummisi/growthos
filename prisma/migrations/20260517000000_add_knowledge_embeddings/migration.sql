-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- CreateTable
CREATE TABLE "KnowledgeEmbedding" (
    "id"          TEXT NOT NULL,
    "productId"   TEXT,
    "tenantId"    TEXT,
    "content"     TEXT NOT NULL,
    "chunkType"   TEXT NOT NULL,
    "sourceUrl"   TEXT,
    "channelSlug" TEXT,
    "metadata"    JSONB NOT NULL DEFAULT '{}',
    "embedding"   vector(768),
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeEmbedding_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "KnowledgeEmbedding_productId_chunkType_idx" ON "KnowledgeEmbedding"("productId", "chunkType");

-- CreateIndex for approximate nearest-neighbour search (IVFFlat)
-- Falls back gracefully if pgvector is not available — the column simply stays unindexed.
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') THEN
    EXECUTE 'CREATE INDEX IF NOT EXISTS "KnowledgeEmbedding_embedding_idx"
             ON "KnowledgeEmbedding" USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100)';
  END IF;
END$$;
