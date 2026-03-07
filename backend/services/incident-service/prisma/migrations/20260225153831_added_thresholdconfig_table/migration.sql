-- CreateTable
CREATE TABLE "ThresholdConfig" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "service" TEXT,
    "mediumCount" INTEGER NOT NULL DEFAULT 10,
    "lowCount" INTEGER NOT NULL DEFAULT 20,
    "highCount" INTEGER NOT NULL DEFAULT 1,
    "mediumWindowSeconds" INTEGER NOT NULL DEFAULT 120,
    "lowWindowSeconds" INTEGER NOT NULL DEFAULT 60,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ThresholdConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ThresholdConfig_tenantId_idx" ON "ThresholdConfig"("tenantId");

-- CreateIndex
CREATE INDEX "ThresholdConfig_service_idx" ON "ThresholdConfig"("service");
