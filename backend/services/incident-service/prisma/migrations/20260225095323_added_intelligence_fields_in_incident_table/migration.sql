-- AlterTable
ALTER TABLE "Incident" ADD COLUMN     "alertCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastAlertAt" TIMESTAMP(3),
ADD COLUMN     "resolvedAt" TIMESTAMP(3);
