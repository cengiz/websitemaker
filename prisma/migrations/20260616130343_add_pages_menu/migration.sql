-- AlterTable
ALTER TABLE "Site" ADD COLUMN "menuConfig" TEXT;

-- CreateTable
CREATE TABLE "SitePage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "siteId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "SitePage_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "SitePage_siteId_idx" ON "SitePage"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "SitePage_siteId_slug_key" ON "SitePage"("siteId", "slug");
