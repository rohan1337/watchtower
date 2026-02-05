/*
  Warnings:

  - You are about to drop the column `userId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Tenant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_tenantId_fkey";

-- DropIndex
DROP INDEX "User_userId_key";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "userId",
ALTER COLUMN "passwordHash" DROP NOT NULL;

-- DropTable
DROP TABLE "Tenant";

-- CreateIndex
CREATE INDEX "Membership_userId_idx" ON "Membership"("userId");
