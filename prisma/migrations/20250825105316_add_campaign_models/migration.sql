/*
  Warnings:

  - You are about to drop the `vendors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "public"."vendors";

-- CreateTable
CREATE TABLE "public"."Vendors" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "mobile_hashed" VARCHAR(256) NOT NULL,
    "email" VARCHAR(100),
    "password_hashed" VARCHAR(256),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendor_name" VARCHAR(100),
    "address" VARCHAR(255),
    "google_map_link" VARCHAR(255),
    "domain" VARCHAR(255),

    CONSTRAINT "Vendors_pkey" PRIMARY KEY ("id")
);
