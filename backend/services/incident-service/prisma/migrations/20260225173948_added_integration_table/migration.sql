-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('WEBHOOK', 'STRIPE', 'GITHUB', 'CUSTOM');

-- CreateTable
CREATE TABLE "Integration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "apiKey" TEXT NOT NULL,
    "secret" TEXT,
    "metadata" JSONB,
    "provider" "IntegrationProvider" NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Integration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Integration_apiKey_key" ON "Integration"("apiKey");
