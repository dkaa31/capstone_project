-- CreateEnum
CREATE TYPE "Usage" AS ENUM ('UNUSED', 'USED');

-- AlterTable
ALTER TABLE "TicketUser" ADD COLUMN     "used" "Usage" NOT NULL DEFAULT 'UNUSED';
