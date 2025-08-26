/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."VendorCampaignStatus" AS ENUM ('Draft', 'Pending_Payment', 'Active', 'Completed', 'Failed');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('Pending', 'Success', 'Failed');

-- DropTable
DROP TABLE "public"."User";

-- CreateTable
CREATE TABLE "public"."Vendors" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "vendorName" VARCHAR(255) NOT NULL,
    "mobile" VARCHAR(256) NOT NULL,
    "email" VARCHAR(100),
    "password" VARCHAR(256),
    "address" VARCHAR(255),
    "googleMapLink" VARCHAR(255),
    "domain" VARCHAR(255),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorCampaigns" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "templateCampaignId" VARCHAR(150) NOT NULL,
    "templateCampaignDetails" JSONB NOT NULL,
    "name" VARCHAR(150),
    "customerCount" INTEGER NOT NULL DEFAULT 0,
    "status" "public"."VendorCampaignStatus" NOT NULL DEFAULT 'Draft',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorCampaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."VendorCampaignProperties" (
    "id" TEXT NOT NULL,
    "vendorCampaignId" TEXT NOT NULL,
    "propertyKey" VARCHAR(150),
    "propertyValue" VARCHAR(150),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VendorCampaignProperties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Orders" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "vendorCampaignId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orderCount" INTEGER NOT NULL DEFAULT 0,
    "successMsgCount" INTEGER NOT NULL DEFAULT 0,
    "failedMsgCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Payments" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "vendorId" TEXT NOT NULL,
    "vendorCampaignId" TEXT NOT NULL,
    "transactionId" VARCHAR(500) NOT NULL,
    "gateway" VARCHAR(20) NOT NULL DEFAULT 'PayU',
    "amount" DECIMAL(10,2) NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'INR',
    "status" "public"."PaymentStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Payments_transactionId_key" ON "public"."Payments"("transactionId");

-- AddForeignKey
ALTER TABLE "public"."VendorCampaigns" ADD CONSTRAINT "VendorCampaigns_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."VendorCampaignProperties" ADD CONSTRAINT "VendorCampaignProperties_vendorCampaignId_fkey" FOREIGN KEY ("vendorCampaignId") REFERENCES "public"."VendorCampaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Orders" ADD CONSTRAINT "Orders_vendorCampaignId_fkey" FOREIGN KEY ("vendorCampaignId") REFERENCES "public"."VendorCampaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payments" ADD CONSTRAINT "Payments_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "public"."Orders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payments" ADD CONSTRAINT "Payments_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "public"."Vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Payments" ADD CONSTRAINT "Payments_vendorCampaignId_fkey" FOREIGN KEY ("vendorCampaignId") REFERENCES "public"."VendorCampaigns"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
