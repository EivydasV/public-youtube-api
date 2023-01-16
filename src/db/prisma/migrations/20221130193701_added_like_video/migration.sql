-- CreateTable
CREATE TABLE "LikeVideo" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isLike" BOOLEAN NOT NULL,
    "userId" TEXT NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "LikeVideo_pkey" PRIMARY KEY ("userId","videoId")
);

-- AddForeignKey
ALTER TABLE "LikeVideo" ADD CONSTRAINT "LikeVideo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LikeVideo" ADD CONSTRAINT "LikeVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "Video"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
