/*
  Warnings:

  - You are about to drop the column `password_hash` on the `vendors` table. All the data in the column will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- AlterTable
ALTER TABLE "public"."vendors" DROP COLUMN "password_hash",
ADD COLUMN     "password_hashed" VARCHAR(256);

-- DropTable
DROP TABLE "public"."User";
