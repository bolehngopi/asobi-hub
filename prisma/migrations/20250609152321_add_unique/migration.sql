/*
  Warnings:

  - You are about to drop the column `transactionId` on the `invoice` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[gameId,version]` on the table `game_version` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "invoice" DROP CONSTRAINT "invoice_transactionId_fkey";

-- DropIndex
DROP INDEX "invoice_transactionId_key";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "transactionId";

-- CreateIndex
CREATE UNIQUE INDEX "game_version_gameId_version_key" ON "game_version"("gameId", "version");

-- AddForeignKey
ALTER TABLE "invoice" ADD CONSTRAINT "invoice_externalId_fkey" FOREIGN KEY ("externalId") REFERENCES "transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
