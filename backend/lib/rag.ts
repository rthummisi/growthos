/**
 * RAG (Retrieval-Augmented Generation) helpers for GrowthOS.
 *
 * Uses Ollama's /api/embed endpoint to produce embeddings, then stores and
 * retrieves knowledge chunks in the KnowledgeEmbedding table with pgvector
 * cosine similarity.
 *
 * All embedding calls are best-effort: if Ollama is unavailable the function
 * returns an empty array and storage/retrieval degrade gracefully.
 */

import { prisma } from "./prisma";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL ?? "http://localhost:11434";
const EMBED_MODEL = process.env.OLLAMA_EMBED_MODEL ?? "nomic-embed-text";

// ---------------------------------------------------------------------------
// embedText
// ---------------------------------------------------------------------------

/**
 * Calls Ollama /api/embed and returns a float array.
 * Returns [] silently when Ollama is unreachable or returns an error.
 */
export async function embedText(text: string): Promise<number[]> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/embed`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: EMBED_MODEL, input: text }),
      signal: AbortSignal.timeout(10_000)
    });
    if (!res.ok) return [];
    const data = (await res.json()) as { embeddings?: number[][] };
    return data.embeddings?.[0] ?? [];
  } catch {
    return [];
  }
}

// ---------------------------------------------------------------------------
// storeKnowledge
// ---------------------------------------------------------------------------

interface StoreParams {
  productId?: string;
  tenantId?: string;
  content: string;
  chunkType: "competitor_intel" | "generated_asset" | "brand_example";
  sourceUrl?: string;
  channelSlug?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Stores a knowledge chunk with its embedding.
 * Safe to call fire-and-forget: `void storeKnowledge(...)`.
 * If embeddings are unavailable the row is stored without a vector and will
 * be excluded from similarity queries but can still be retrieved by metadata.
 */
export async function storeKnowledge(params: StoreParams): Promise<void> {
  const { productId, tenantId, content, chunkType, sourceUrl, channelSlug, metadata = {} } = params;

  const embedding = await embedText(content);

  const id = generateCuid();
  const now = new Date().toISOString();
  const metadataJson = JSON.stringify(metadata);

  if (embedding.length > 0) {
    // Store with vector using raw SQL so we can cast to the pgvector type.
    const vectorLiteral = `[${embedding.join(",")}]`;
    await prisma.$executeRawUnsafe(
      `INSERT INTO "KnowledgeEmbedding"
         ("id", "productId", "tenantId", "content", "chunkType", "sourceUrl", "channelSlug", "metadata", "embedding", "createdAt")
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::vector, $10::timestamp)`,
      id,
      productId ?? null,
      tenantId ?? null,
      content,
      chunkType,
      sourceUrl ?? null,
      channelSlug ?? null,
      metadataJson,
      vectorLiteral,
      now
    );
  } else {
    // Fallback: store without embedding so the record is at least persisted.
    await prisma.$executeRawUnsafe(
      `INSERT INTO "KnowledgeEmbedding"
         ("id", "productId", "tenantId", "content", "chunkType", "sourceUrl", "channelSlug", "metadata", "createdAt")
       VALUES
         ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9::timestamp)`,
      id,
      productId ?? null,
      tenantId ?? null,
      content,
      chunkType,
      sourceUrl ?? null,
      channelSlug ?? null,
      metadataJson,
      now
    );
  }
}

// ---------------------------------------------------------------------------
// retrieveRelevant
// ---------------------------------------------------------------------------

interface RetrieveParams {
  productId?: string;
  query: string;
  chunkType?: "competitor_intel" | "generated_asset" | "brand_example";
  channelSlug?: string;
  limit?: number;
}

interface EmbeddingRow {
  content: string;
}

/**
 * Retrieves the most semantically similar knowledge chunks for a query.
 * Falls back to an empty array when Ollama is unreachable or pgvector is
 * not installed.
 */
export async function retrieveRelevant(params: RetrieveParams): Promise<string[]> {
  const { productId, query, chunkType, channelSlug, limit = 5 } = params;

  const queryEmbedding = await embedText(query);
  if (queryEmbedding.length === 0) return [];

  const vectorLiteral = `[${queryEmbedding.join(",")}]`;

  try {
    // Build a dynamic WHERE clause from the optional filters.
    const conditions: string[] = [`"embedding" IS NOT NULL`];
    const bindings: unknown[] = [vectorLiteral, limit];

    if (productId) {
      bindings.push(productId);
      conditions.push(`"productId" = $${bindings.length}`);
    }
    if (chunkType) {
      bindings.push(chunkType);
      conditions.push(`"chunkType" = $${bindings.length}`);
    }
    if (channelSlug) {
      bindings.push(channelSlug);
      conditions.push(`"channelSlug" = $${bindings.length}`);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const rows = await prisma.$queryRawUnsafe<EmbeddingRow[]>(
      `SELECT "content"
       FROM "KnowledgeEmbedding"
       ${where}
       ORDER BY "embedding" <=> $1::vector
       LIMIT $2`,
      ...bindings
    );

    return rows.map((r) => r.content);
  } catch {
    // pgvector might not be installed in all environments — degrade gracefully.
    return [];
  }
}

// ---------------------------------------------------------------------------
// Tiny CUID-like ID generator (avoids an extra dependency)
// ---------------------------------------------------------------------------

function generateCuid(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  return `c${timestamp}${random}`;
}
