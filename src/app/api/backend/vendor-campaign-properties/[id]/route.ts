import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {z} from "zod";

// PATCH /api/backend/vendor-campaign-properties/[id]
export async function PATCH(req: Request, {params}: { params: { id: string } }) {
    try {
        const {id} = params;
        const body = await req.json();

        const schema = z.object({
            propertyValue: z.string().max(150),
        });

        const {propertyValue} = schema.parse(body);

        const updated = await prisma.vendorCampaignProperties.update({
            where: {id},
            data: {propertyValue},
        });

        return NextResponse.json({success: true, updated}, {status: 200});
    } catch (error) {
        console.error("Error in PATCH /vendor-campaign-properties/[id]:", error);
        return NextResponse.json({success: false, message: "Internal Server Error"}, {status: 500});
    }
}
