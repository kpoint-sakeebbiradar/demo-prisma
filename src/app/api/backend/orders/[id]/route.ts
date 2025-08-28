// src/app/api/backend/orders/[id]/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {Prisma} from "@/generated/prisma";
import {z} from "zod";

// ✅ GET /api/orders/[id]
export async function GET(
    req: Request,
    {params}: { params: { id: string } }
) {
    try {
        const {id} = params;

        const order = await prisma.orders.findUnique({
            where: {id},
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
            },
        });

        if (!order) {
            return NextResponse.json(
                {success: false, message: "Order not found"},
                {status: 404}
            );
        }

        return NextResponse.json({success: true, order}, {status: 200});
    } catch (error) {
        console.error("Error fetching order by ID:", error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}

// ---------------------------
// ✅ PATCH /api/orders/[id]
// ---------------------------
const orderPatchSchema = z.object({
    orderCount: z.number().int().nonnegative().optional(),
    successMsgCount: z.number().int().nonnegative().optional(),
    failedMsgCount: z.number().int().nonnegative().optional(),
    viewCount: z.number().int().nonnegative().optional(),
});

export async function PATCH(
    req: Request,
    {params}: { params: { id: string } }
) {
    try {
        const {id} = params;
        const body = await req.json();
        const parsed = orderPatchSchema.parse(body);

        if (Object.keys(parsed).length === 0) {
            return NextResponse.json(
                {success: false, message: "No fields to update"},
                {status: 400}
            );
        }

        const updatedOrder = await prisma.orders.update({
            where: {id},
            data: parsed,
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
            },
        });

        return NextResponse.json({success: true, updatedOrder}, {status: 200});
    } catch (error) {
        console.error("PATCH order error:", error);
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {success: false, errors: error.issues},
                {status: 400}
            );
        }
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json(
                    {success: false, message: "Order not found"},
                    {status: 404}
                );
            }
        }
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}
