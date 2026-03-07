/*
  Warnings:

  - Added the required column `fingerprint` to the `Incident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "fingerprint" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Incident_fingerprint_idx" ON "Incident"("fingerprint");
