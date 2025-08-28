// src/app/api/backend/orders/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {z} from "zod";

// ✅ Input validation schema for Order creation
const orderSchema = z.object({
    vendorId: z.string().uuid(),
    vendorCampaignId: z.string().uuid(),
    orderCount: z.number().int().nonnegative().optional(),
    successMsgCount: z.number().int().nonnegative().optional(),
    failedMsgCount: z.number().int().nonnegative().optional(),
    viewCount: z.number().int().nonnegative().optional(),
});

// ✅ GET: Fetch all orders
export async function GET() {
    try {
        const orders = await prisma.orders.findMany({
            select: {
                id: true,
                vendorId: true,
                vendorCampaignId: true,
                orderCount: true,
                successMsgCount: true,
                failedMsgCount: true,
                viewCount: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        return NextResponse.json({success: true, orders}, {status: 200});
    } catch (error) {
        console.error("Error fetching orders:", error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}

// ✅ POST: Create an order
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const parsed = orderSchema.parse(body);

        // Save to DB
        const newOrder = await prisma.orders.create({
            data: {
                vendorId: parsed.vendorId,
                vendorCampaignId: parsed.vendorCampaignId,
                orderCount: parsed.orderCount ?? 0,
                successMsgCount: parsed.successMsgCount ?? 0,
                failedMsgCount: parsed.failedMsgCount ?? 0,
                viewCount: parsed.viewCount ?? 0,
            },
        });

        return NextResponse.json({success: true, orderId: newOrder.id}, {status: 201});
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {success: false, errors: error.issues},
                {status: 400}
            );
        }
        console.error("Order creation error:", error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}
