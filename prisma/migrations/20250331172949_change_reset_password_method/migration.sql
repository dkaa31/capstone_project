-- CreateTable
CREATE TABLE "TicketResetPassword" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "used" "Usage" NOT NULL DEFAULT 'UNUSED',
    "ticket_id" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TicketResetPassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TicketResetPassword_email_key" ON "TicketResetPassword"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TicketResetPassword_ticket_id_key" ON "TicketResetPassword"("ticket_id");
