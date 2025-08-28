// src/app/api/backend/payments/[id]/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {Prisma} from "@/generated/prisma";
import {z} from "zod";

// ✅ GET /api/payments/[id]
export async function GET(
    req: Request,
    {params}: { params: { id: string } }
) {
    try {
        const {id} = params;

        const payment = await prisma.payments.findUnique({
            where: {id},
            include: {
                order: true,
                vendor: true,
                vendorCampaign: true,
            },
        });

        if (!payment) {
            return NextResponse.json(
                {success: false, message: "Payment not found"},
                {status: 404}
            );
        }

        return NextResponse.json({success: true, payment}, {status: 200});
    } catch (error) {
        console.error("Error fetching payment by ID:", error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}

// ---------------------------
// ✅ PATCH /api/payments/[id]
// ---------------------------
const paymentPatchSchema = z.object({
    transactionId: z.string().max(500).optional(),
    gateway: z.string().max(20).optional(),
    amount: z.number().positive().optional(),
    currency: z.string().max(10).optional(),
    status: z.enum(["Pending", "Success", "Failed"]).optional(),
});

export async function PATCH(
    req: Request,
    {params}: { params: { id: string } }
) {
    try {
        const {id} = params;
        const body = await req.json();
        const parsed = paymentPatchSchema.parse(body);

        if (Object.keys(parsed).length === 0) {
            return NextResponse.json(
                {success: false, message: "No fields to update"},
                {status: 400}
            );
        }

        const updatedPayment = await prisma.payments.update({
            where: {id},
            data: parsed,
        });

        return NextResponse.json({success: true, updatedPayment}, {status: 200});
    } catch (error) {
        console.error("Error updating payment:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({success: false, errors: error.issues}, {status: 400});
        }

        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            if (error.code === "P2025") {
                return NextResponse.json({success: false, message: "Payment not found"}, {status: 404});
            }
        }

        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}
