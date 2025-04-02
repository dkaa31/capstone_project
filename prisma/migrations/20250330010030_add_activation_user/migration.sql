-- CreateTable
CREATE TABLE "ActivationUser" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "otp" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ActivationUser_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ActivationUser_phoneNumber_key" ON "ActivationUser"("phoneNumber");
