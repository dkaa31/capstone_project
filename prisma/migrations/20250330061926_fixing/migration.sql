/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `ticketUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ticketUser_email_key" ON "ticketUser"("email");
