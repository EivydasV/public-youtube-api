-- CreateTable
CREATE TABLE "VideoResolution" (
    "resolution" VARCHAR(20) NOT NULL,
    "videoId" TEXT NOT NULL,

    CONSTRAINT "VideoResolution_pkey" PRIMARY KEY ("resolution","videoId")
);
