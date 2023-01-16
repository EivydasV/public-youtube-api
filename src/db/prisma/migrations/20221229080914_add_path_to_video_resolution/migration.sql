/*
  Warnings:

  - You are about to drop the column `url` on the `Video` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[path]` on the table `VideoResolution` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `path` to the `VideoResolution` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `VideoResolution` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Video_url_key";

-- AlterTable
ALTER TABLE "Video" DROP COLUMN "url";

-- AlterTable
ALTER TABLE "VideoResolution" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "path" VARCHAR(400) NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "VideoResolution_path_key" ON "VideoResolution"("path");
