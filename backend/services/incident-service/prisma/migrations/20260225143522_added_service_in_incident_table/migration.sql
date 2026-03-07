/*
  Warnings:

  - Added the required column `service` to the `Incident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "service" TEXT NOT NULL;
