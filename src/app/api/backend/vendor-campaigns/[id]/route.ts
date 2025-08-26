// src/app/api/backend/vendor-campaigns/[id]/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {Prisma} from "@/generated/prisma";
import {z} from "zod";

// ✅ GET vendor campaign by ID
export async function GET(req: Request, {params}: { params: { id: string } }) {
    try {
        const {id} = params;

        const vendorCampaign = await prisma.vendorCampaigns.findUnique({
            where: {id: id},
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        vendorName: true,
                    },
                },
            },
        });

        if (!vendorCampaign) {
            return NextResponse.json({success: false, message: "Vendor Campaign not found"}, {status: 404});
        }

        return NextResponse.json({success: true, vendorCampaign}, {status: 200});
    } catch (error) {
        console.error("Error fetching vendor campaign:", error);
        return NextResponse.json({success: false, message: "Internal Server Error"}, {status: 500});
    }
}

// ✅ PATCH /api/vendor-campaigns/[id]
const vendorCampaignPatchSchema = z.object({
    name: z.string().max(150).optional(),
    templateCampaignDetails: z.any().optional(),
    status: z.enum(["Draft", "Pending_Payment", "Active", "Completed", "Failed"]).optional(), // update this based on your enum
    // status: z.nativeEnum(VendorCampaignStatus).optional(),
});

type VendorPatchInput = z.infer<typeof vendorCampaignPatchSchema>;

export async function PATCH(req: Request, {params}: { params: { id: string } }) {
    try {
        const {id} = params;
        const body = await req.json();
        const parsed = vendorCampaignPatchSchema.parse(body);

        const dataToUpdate: Partial<VendorPatchInput> = {...parsed};

        if (Object.keys(dataToUpdate).length === 0) {
            return NextResponse.json(
                {success: false, message: "No fields to update"},
                {status: 400}
            );
        }

        const updatedVendorCampaign = await prisma.vendorCampaigns.update({
            where: {id},
            data: dataToUpdate,
            include: {
                vendor: {
                    select: {
                        id: true,
                        name: true,
                        vendorName: true,
                    },
                },
            },
        });

        return NextResponse.json({success: true, updatedVendorCampaign}, {status: 200});
    } catch (error) {
        console.error("Error updating vendor campaign:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({success: false, errors: error.issues}, {status: 400});
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
            return NextResponse.json({success: false, message: "Vendor Campaign not found"}, {status: 404});
        }
        return NextResponse.json({success: false, message: "Internal Server Error"}, {status: 500});
    }
}
