-- DropIndex
DROP INDEX "Video_channelId_idx";

-- DropIndex
DROP INDEX "Video_userId_idx";

-- CreateIndex
CREATE INDEX "Video_userId_channelId_isPublished_idx" ON "Video"("userId", "channelId", "isPublished");
