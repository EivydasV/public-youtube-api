-- CreateTable
CREATE TABLE "VideoLike" (
    "isLiked" BOOLEAN NOT NULL,
    "videoId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VideoLike_pkey" PRIMARY KEY ("videoId","userId")
);
