/*
  Warnings:

  - You are about to alter the column `type` on the `Token` table. The data in that column could be lost. The data in that column will be cast from `Text` to `Enum("TokenType")`.

*/
-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('RESET_PASSWORD');

-- AlterTable
ALTER TABLE "Token" ALTER COLUMN "type" SET DATA TYPE "TokenType" USING type::"TokenType";
