/*
  Warnings:

  - The primary key for the `Vendors` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "public"."Vendors" DROP CONSTRAINT "Vendors_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "Vendors_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "Vendors_id_seq";
