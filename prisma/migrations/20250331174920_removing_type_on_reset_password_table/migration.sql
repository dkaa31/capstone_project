/*
  Warnings:

  - The values [RESET] on the enum `Type` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `used` on the `TicketResetPassword` table. All the data in the column will be lost.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "Type_new" AS ENUM ('REGIS', 'UPDATE');
ALTER TABLE "TicketUser" ALTER COLUMN "type" TYPE "Type_new" USING ("type"::text::"Type_new");
ALTER TYPE "Type" RENAME TO "Type_old";
ALTER TYPE "Type_new" RENAME TO "Type";
DROP TYPE "Type_old";
COMMIT;

-- AlterTable
ALTER TABLE "TicketResetPassword" DROP COLUMN "used";
