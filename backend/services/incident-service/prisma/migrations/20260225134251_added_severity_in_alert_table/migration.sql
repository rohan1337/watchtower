/*
  Warnings:

  - Added the required column `severity` to the `Alert` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "severity" "Severity" NOT NULL;
