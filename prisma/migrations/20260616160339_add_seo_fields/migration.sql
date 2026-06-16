-- AlterTable
ALTER TABLE "Site" ADD COLUMN "ogImageUrl" TEXT;
ALTER TABLE "Site" ADD COLUMN "seoDescription" TEXT;

-- AlterTable
ALTER TABLE "SitePage" ADD COLUMN "seoDescription" TEXT;
