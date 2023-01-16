/*
  Warnings:

  - Added the required column `duration` to the `Video` table without a default value. This is not possible if the table is not empty.
  - Made the column `url` on table `Video` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Video" ADD COLUMN     "duration" INTEGER NOT NULL,
ALTER COLUMN "url" SET NOT NULL;
