/*
  Warnings:

  - You are about to drop the `cart` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `cart_item` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cart" DROP CONSTRAINT "cart_userId_fkey";

-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_cartId_fkey";

-- DropForeignKey
ALTER TABLE "cart_item" DROP CONSTRAINT "cart_item_gameId_fkey";

-- AlterTable
ALTER TABLE "invoice" ALTER COLUMN "invoiceId" DROP NOT NULL,
ALTER COLUMN "paymentMethod" DROP NOT NULL;

-- DropTable
DROP TABLE "cart";

-- DropTable
DROP TABLE "cart_item";
