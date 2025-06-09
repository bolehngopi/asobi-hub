-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('HTML', 'DOWNLOADABLE');

-- AlterTable
ALTER TABLE "game" ADD COLUMN     "gameType" "GameType" NOT NULL DEFAULT 'DOWNLOADABLE',
ADD COLUMN     "stars" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "session" ADD COLUMN     "impersonatedBy" TEXT;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "banExpires" TIMESTAMP(3),
ADD COLUMN     "banReason" TEXT,
ADD COLUMN     "banned" BOOLEAN,
ADD COLUMN     "role" TEXT;
