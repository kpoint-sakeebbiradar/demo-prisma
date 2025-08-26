//src/app/api/backend/vendors/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

// ✅ Input validation schema
const vendorSchema = z.object({
    name: z.string().min(2).max(100),
    mobile: z.string().min(10).max(15), // plain input, will be hashed
    email: z.string().email().optional(),
    password: z.string().min(6).max(50), // plain input, will be hashed
    vendorName: z.string().min(2).max(100),
    address: z.string().optional(),
    googleMapLink: z.string().url().optional(),
    domain: z.string().optional(),
});

// ✅ GET: Fetch all vendors
export async function GET() {
    try {
        const vendors = await prisma.vendors.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                vendorName: true,
                address: true,
                googleMapLink: true,
                domain: true,
                createdAt: true,
                updatedAt: true,
                // mobile and password are hashed — you might want to omit them
            }
        });

        return NextResponse.json({ success: true, vendors }, { status: 200 });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// ✅ POST: Register a vendor
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const parsed = vendorSchema.parse(body);

        // Hash sensitive data
        const mobile = await bcrypt.hash(parsed.mobile, 10);
        const password = await bcrypt.hash(parsed.password, 10);

        // Save to DB
        const vendor = await prisma.vendors.create({
            data: {
                name: parsed.name,
                mobile,
                email: parsed.email,
                password,
                vendorName: parsed.vendorName,
                address: parsed.address,
                googleMapLink: parsed.googleMapLink,
                domain: parsed.domain,
            },
        });

        return NextResponse.json(
            { success: true, vendorId: vendor.id },
            { status: 201 }
        );
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, errors: error.issues },
                { status: 400 }
            );
        }

        console.error("Vendor registration error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
