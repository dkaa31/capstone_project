/*
  Warnings:

  - You are about to drop the `ActivationUser` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ticketUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Type" AS ENUM ('REGIS', 'RESET');

-- DropTable
DROP TABLE "ActivationUser";

-- DropTable
DROP TABLE "ticketUser";

-- CreateTable
CREATE TABLE "TicketUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "type" "Type" NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketUser_email_key" ON "TicketUser"("email");
