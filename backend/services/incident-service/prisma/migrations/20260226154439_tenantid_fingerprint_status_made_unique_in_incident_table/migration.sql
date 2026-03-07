/*
  Warnings:

  - A unique constraint covering the columns `[tenantId,fingerprint,status]` on the table `Incident` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Incident_tenantId_fingerprint_status_key" ON "Incident"("tenantId", "fingerprint", "status");
