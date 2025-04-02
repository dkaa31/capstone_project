/*
  Warnings:

  - A unique constraint covering the columns `[otp]` on the table `TicketUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TicketUser_otp_key" ON "TicketUser"("otp");
