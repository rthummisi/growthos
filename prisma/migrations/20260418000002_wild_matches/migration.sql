-- WildMatch: stores live conversation matches found by the In the Wild agent
CREATE TABLE "WildMatch" (
  "id"          TEXT NOT NULL,
  "productId"   TEXT NOT NULL,
  "source"      TEXT NOT NULL,
  "url"         TEXT NOT NULL,
  "title"       TEXT NOT NULL,
  "matchReason" TEXT NOT NULL,
  "draftReply"  TEXT NOT NULL,
  "fetchedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "WildMatch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "WildMatch_productId_fetchedAt_idx" ON "WildMatch"("productId", "fetchedAt");

-- MarketSignal: inference pass over accumulated WildMatches — what to prioritise next
CREATE TABLE "MarketSignal" (
  "id"          TEXT NOT NULL,
  "productId"   TEXT NOT NULL,
  "insight"     TEXT NOT NULL,
  "priority"    TEXT NOT NULL,
  "suggestion"  TEXT NOT NULL,
  "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "MarketSignal_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "MarketSignal_productId_generatedAt_idx" ON "MarketSignal"("productId", "generatedAt");
