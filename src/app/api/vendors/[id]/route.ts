import { NextResponse } from "next/server";
import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcrypt";
import { z } from "zod";

const prisma = new PrismaClient();

// ------------------------
// ✅ GET /api/vendors/[id]
// ------------------------
export async function GET(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;

        const vendor = await prisma.vendors.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                vendor_name: true,
                address: true,
                google_map_link: true,
                domain: true,
                created_at: true,
                updated_at: true,
            },
        });

        if (!vendor) {
            return NextResponse.json(
                { success: false, message: "Vendor not found" },
                { status: 404 }
            );
        }

        return NextResponse.json({ success: true, vendor }, { status: 200 });
    } catch (error) {
        console.error("Error fetching vendor by ID:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// -------------------------
// ✅ PUT /api/vendors/[id]
// -------------------------
const vendorUpdateSchema = z.object({
    name: z.string().min(2).max(100),
    mobile: z.string().min(10).max(15),
    email: z.string().email().optional(),
    password: z.string().min(6).max(50),
    vendor_name: z.string().optional(),
    address: z.string().optional(),
    google_map_link: z.string().url().optional(),
    domain: z.string().optional(),
});

type VendorUpdateInput = z.infer<typeof vendorUpdateSchema>;

export async function PUT(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const parsed: VendorUpdateInput = vendorUpdateSchema.parse(body);

        const hashedMobile = await bcrypt.hash(parsed.mobile, 10);
        const hashedPassword = await bcrypt.hash(parsed.password, 10);

        const updatedVendor = await prisma.vendors.update({
            where: { id },
            data: {
                name: parsed.name,
                mobile: hashedMobile,
                email: parsed.email,
                password: hashedPassword,
                vendor_name: parsed.vendor_name,
                address: parsed.address,
                google_map_link: parsed.google_map_link,
                domain: parsed.domain,
            },
        });

        return NextResponse.json({ success: true, updatedVendor }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, errors: error.issues },
                { status: 400 }
            );
        }
        console.error("PUT vendor error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}

// ---------------------------
// ✅ PATCH /api/vendors/[id]
// ---------------------------
const vendorPatchSchema = z.object({
    name: z.string().min(2).max(100).optional(),
    mobile: z.string().min(10).max(15).optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).max(50).optional(),
    vendor_name: z.string().optional(),
    address: z.string().optional(),
    google_map_link: z.string().url().optional(),
    domain: z.string().optional(),
});

type VendorPatchInput = z.infer<typeof vendorPatchSchema>;

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const { id } = params;
        const body = await req.json();
        const parsed: VendorPatchInput = vendorPatchSchema.parse(body);

        const dataToUpdate: Partial<VendorPatchInput> = { ...parsed };

        if (parsed.mobile) {
            dataToUpdate.mobile = await bcrypt.hash(parsed.mobile, 10);
        }

        if (parsed.password) {
            dataToUpdate.password = await bcrypt.hash(parsed.password, 10);
        }

        const updatedVendor = await prisma.vendors.update({
            where: { id },
            data: dataToUpdate,
        });

        return NextResponse.json({ success: true, updatedVendor }, { status: 200 });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                { success: false, errors: error.issues },
                { status: 400 }
            );
        }
        console.error("PATCH vendor error:", error);
        return NextResponse.json(
            { success: false, message: "Internal Server Error" },
            { status: 500 }
        );
    }
}
