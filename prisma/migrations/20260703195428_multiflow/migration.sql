/*
  Warnings:

  - You are about to drop the column `isActive` on the `Flow` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "FlowStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- DropIndex
DROP INDEX "Flow_clientId_key";

-- AlterTable
ALTER TABLE "Flow" DROP COLUMN "isActive",
ADD COLUMN     "isDefault" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "status" "FlowStatus" NOT NULL DEFAULT 'DRAFT',
ALTER COLUMN "name" SET DEFAULT 'Novo Fluxo';

-- CreateIndex
CREATE INDEX "Flow_clientId_idx" ON "Flow"("clientId");
