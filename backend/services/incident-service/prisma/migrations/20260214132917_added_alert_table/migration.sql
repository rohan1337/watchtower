/*
  Warnings:

  - The values [ACKNOWLEDGED] on the enum `IncidentStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `assignedTo` on the `Incident` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Incident` table. All the data in the column will be lost.
  - Added the required column `createdById` to the `Incident` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "IncidentStatus_new" AS ENUM ('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');
ALTER TABLE "Incident" ALTER COLUMN "status" TYPE "IncidentStatus_new" USING ("status"::text::"IncidentStatus_new");
ALTER TYPE "IncidentStatus" RENAME TO "IncidentStatus_old";
ALTER TYPE "IncidentStatus_new" RENAME TO "IncidentStatus";
DROP TYPE "IncidentStatus_old";
COMMIT;

-- DropIndex
DROP INDEX "Incident_severity_idx";

-- DropIndex
DROP INDEX "Incident_status_idx";

-- AlterTable
ALTER TABLE "Incident" DROP COLUMN "assignedTo",
DROP COLUMN "createdBy",
ADD COLUMN     "createdById" TEXT NOT NULL,
ALTER COLUMN "severity" SET DEFAULT 'MEDIUM',
ALTER COLUMN "status" SET DEFAULT 'OPEN';

-- CreateTable
CREATE TABLE "Alert" (
    "id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "source" TEXT,
    "incidentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Alert_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Alert_tenantId_idx" ON "Alert"("tenantId");

-- CreateIndex
CREATE INDEX "Alert_incidentId_idx" ON "Alert"("incidentId");

-- AddForeignKey
ALTER TABLE "Alert" ADD CONSTRAINT "Alert_incidentId_fkey" FOREIGN KEY ("incidentId") REFERENCES "Incident"("id") ON DELETE CASCADE ON UPDATE CASCADE;
