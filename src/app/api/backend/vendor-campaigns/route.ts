// src/app/api/backend/vendor-campaigns/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import bcrypt from "bcrypt";
import {z} from "zod";

// ✅ Input validation schema
const vendorCampaignCreateSchema = z.object({
    vendorId: z.string().uuid(),
    templateCampaignId: z.string().max(150),
    templateCampaignDetails: z.any(), // Accepts full JSON
    name: z.string().max(150).optional(),
});

// ✅ GET all vendor campaigns
export async function GET() {
    try {
        const campaigns = await prisma.vendorCampaigns.findMany({
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

        return NextResponse.json({success: true, campaigns}, {status: 200});
    } catch (error) {
        console.error("Error fetching campaigns:", error);
        return NextResponse.json({success: false, message: "Internal Server Error"}, {status: 500});
    }
}

// ✅ POST create new vendor campaign
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const parsed = vendorCampaignCreateSchema.parse(body);

        // Save to DB
        const newCampaign = await prisma.vendorCampaigns.create({
            data: {
                vendorId: parsed.vendorId,
                templateCampaignId: parsed.templateCampaignId,
                templateCampaignDetails: parsed.templateCampaignDetails,
                name: parsed.name,
            },
        });

        return NextResponse.json({success: true, campaignId: newCampaign.id}, {status: 201});
    } catch (error: unknown) {
        console.error("Error creating vendor campaign:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {success: false, errors: error.issues},
                {status: 400}
            );
        }

        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}
