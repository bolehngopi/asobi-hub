/*
  Warnings:

  - You are about to drop the column `invoiceId` on the `invoice` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "invoice_invoiceId_key";

-- AlterTable
ALTER TABLE "invoice" DROP COLUMN "invoiceId";
