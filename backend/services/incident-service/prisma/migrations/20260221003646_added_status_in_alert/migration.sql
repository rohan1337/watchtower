-- CreateEnum
CREATE TYPE "AlertStatus" AS ENUM ('OPEN', 'ACKNOWLEDGED', 'RESOLVED');

-- AlterTable
ALTER TABLE "Alert" ADD COLUMN     "status" "AlertStatus" NOT NULL DEFAULT 'OPEN';
