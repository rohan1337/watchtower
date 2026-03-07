/*
  Warnings:

  - Added the required column `fingerprint` to the `Alert` table without a default value. This is not possible if the table is not empty.
  - Added the required column `service` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "fingerprint" TEXT NOT NULL,
ADD COLUMN     "service" TEXT NOT NULL;
