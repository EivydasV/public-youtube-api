-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "isPublished" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "url" DROP NOT NULL;