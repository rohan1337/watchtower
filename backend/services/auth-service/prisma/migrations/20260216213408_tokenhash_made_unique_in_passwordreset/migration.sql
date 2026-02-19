/*
  Warnings:

  - A unique constraint covering the columns `[tokenHash]` on the table `PasswordReset` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");
