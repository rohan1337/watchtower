-- DropIndex
DROP INDEX "EmailVerification_email_key";

-- DropIndex
DROP INDEX "PasswordReset_tokenHash_key";

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "isVerified" SET DEFAULT false;

-- CreateIndex
CREATE INDEX "EmailVerification_token_idx" ON "EmailVerification"("token");

-- CreateIndex
CREATE INDEX "EmailVerification_expiresAt_idx" ON "EmailVerification"("expiresAt");

-- CreateIndex
CREATE INDEX "PasswordReset_expiresAt_idx" ON "PasswordReset"("expiresAt");
