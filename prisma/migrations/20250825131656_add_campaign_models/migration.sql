/*
  Warnings:

  - You are about to drop the column `mobile_hashed` on the `Vendors` table. All the data in the column will be lost.
  - You are about to drop the column `password_hashed` on the `Vendors` table. All the data in the column will be lost.
  - Added the required column `mobile` to the `Vendors` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Vendors" DROP COLUMN "mobile_hashed",
DROP COLUMN "password_hashed",
ADD COLUMN     "mobile" VARCHAR(256) NOT NULL,
ADD COLUMN     "password" VARCHAR(256);
