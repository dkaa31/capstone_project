-- CreateTable
CREATE TABLE "ticketUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ticketUser_pkey" PRIMARY KEY ("id")
);
