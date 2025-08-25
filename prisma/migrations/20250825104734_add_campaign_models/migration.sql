-- CreateTable
CREATE TABLE "public"."vendors" (
    "id" BIGSERIAL NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "mobile_hashed" VARCHAR(256) NOT NULL,
    "email" VARCHAR(100),
    "password_hash" VARCHAR(256),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "vendor_name" VARCHAR(100),
    "address" VARCHAR(255),
    "google_map_link" VARCHAR(255),
    "domain" VARCHAR(255),

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);
