// src/app/api/backend/vendor-campaign-properties/[id]/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {Prisma} from "@/generated/prisma";
import {z} from "zod";

const propertySchema = z.object({
    vendorCampaignId: z.string().uuid(),
    properties: z.array(
        z.object({
            propertyKey: z.string().max(150),
            propertyValue: z.string().max(150),
        })
    ),
});

// ✅ GET vendor campaign properties by ID
export async function GET(req: Request) {
    try {
        const {searchParams} = new URL(req.url);
        const vendorCampaignId = searchParams.get("vendorCampaignId");

        if (!vendorCampaignId) {
            return NextResponse.json({success: false, message: "Missing vendorCampaignId"}, {status: 400});
        }

        const properties = await prisma.vendorCampaignProperties.findMany({
            where: {vendorCampaignId},
        });

        return NextResponse.json({success: true, properties}, {status: 200});
    } catch (error) {
        console.error("Error in GET /vendor-campaign-properties:", error);
        return NextResponse.json({success: false, message: "Internal Server Error"}, {status: 500});
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const parsed = propertySchema.parse(body);

        const {vendorCampaignId, properties} = parsed;

        // Delete old properties first (optional)
        await prisma.vendorCampaignProperties.deleteMany({
            where: {vendorCampaignId},
        });

        // Bulk insert new properties
        const createdProperties = await prisma.vendorCampaignProperties.createMany({
            data: properties.map(prop => ({
                vendorCampaignId,
                propertyKey: prop.propertyKey,
                propertyValue: prop.propertyValue,
            })),
        });

        return NextResponse.json({success: true, count: createdProperties.count}, {status: 201});
    } catch (error) {
        console.error("Error in POST /vendor-campaign-properties:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({success: false, errors: error.issues}, {status: 400});
        }
        return NextResponse.json({success: false, message: "Internal Server Error"}, {status: 500});
    }
}


