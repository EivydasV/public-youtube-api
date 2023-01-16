-- DropForeignKey
ALTER TABLE "Channel" DROP CONSTRAINT "Channel_createdById_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_userId_fkey";

-- DropForeignKey
ALTER TABLE "Comment" DROP CONSTRAINT "Comment_videoId_fkey";

-- DropForeignKey
ALTER TABLE "LikeVideo" DROP CONSTRAINT "LikeVideo_userId_fkey";

-- DropForeignKey
ALTER TABLE "LikeVideo" DROP CONSTRAINT "LikeVideo_videoId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_channelId_fkey";

-- DropForeignKey
ALTER TABLE "Video" DROP CONSTRAINT "Video_userId_fkey";

-- CreateIndex
CREATE INDEX "Comment_videoId_idx" ON "Comment"("videoId");

-- CreateIndex
CREATE INDEX "Comment_userId_idx" ON "Comment"("userId");

-- CreateIndex
CREATE INDEX "LikeVideo_userId_idx" ON "LikeVideo"("userId");

-- CreateIndex
CREATE INDEX "LikeVideo_videoId_idx" ON "LikeVideo"("videoId");

-- CreateIndex
CREATE INDEX "Video_userId_idx" ON "Video"("userId");

-- CreateIndex
CREATE INDEX "Video_channelId_idx" ON "Video"("channelId");
