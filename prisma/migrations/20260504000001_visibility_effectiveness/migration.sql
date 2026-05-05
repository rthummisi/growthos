-- AlterTable: add nullable effectiveness column to existing snapshots
ALTER TABLE "BrandVisibilitySnapshot" ADD COLUMN "effectiveness" JSONB;
