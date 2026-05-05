-- CreateTable
CREATE TABLE "BrandVisibilitySnapshot" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "snapshotAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "summary" JSONB NOT NULL,
    "shareOfVoice" JSONB NOT NULL,
    "sentiment" JSONB NOT NULL,
    "intent" JSONB NOT NULL,
    "signals" JSONB NOT NULL,
    "mentions" JSONB NOT NULL,

    CONSTRAINT "BrandVisibilitySnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BrandVisibilitySnapshot_productId_snapshotAt_idx" ON "BrandVisibilitySnapshot"("productId", "snapshotAt");
