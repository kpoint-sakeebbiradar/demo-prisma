import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import { Prisma } from "@/generated/prisma";
import bcrypt from "bcrypt";
import {z} from "zod";

// ✅ GET /api/vendors/[id]
export async function GET(
    req: Request,
    {params}: { params: { id: string } }
) {
    try {
        const {id} = params;

        const vendor = await prisma.vendors.findUnique({
            where: {id},
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
                {success: false, message: "Vendor not found"},
                {status: 404}
            );
        }

        return NextResponse.json({success: true, vendor}, {status: 200});
    } catch (error) {
        console.error("Error fetching vendor by ID:", error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}

// ✅ PATCH /api/vendors/[id]
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
    {params}: { params: { id: string } }
) {
    try {
        const {id} = params;
        const body = await req.json();
        const parsed: VendorPatchInput = vendorPatchSchema.parse(body);

        const dataToUpdate: Partial<VendorPatchInput> = {...parsed};

        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json(
                { success: false, message: "No fields to update" },
                { status: 400 }
            );
        }

        if (parsed.mobile) {
            dataToUpdate.mobile = await bcrypt.hash(parsed.mobile, 10);
        }

        if (parsed.password) {
            dataToUpdate.password = await bcrypt.hash(parsed.password, 10);
        }

        const updatedVendor = await prisma.vendors.update({
            where: {id},
            data: dataToUpdate,
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
            }
        });

        return NextResponse.json({success: true, updatedVendor}, {status: 200});
    } catch (error) {
        console.error("PATCH vendor error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {success: false, errors: error.issues},
                {status: 400}
            );
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") { // record not found
                return NextResponse.json({ success: false, message: "Vendor not found" }, { status: 404 });
            }
        }
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}
