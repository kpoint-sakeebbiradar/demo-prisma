// src/app/api/backend/payments/route.ts
import {NextResponse} from "next/server";
import {prisma} from "@/lib/prisma";
import {Prisma} from "@/generated/prisma";
import {z} from "zod";

// ✅ Input Validation schema for payments
const paymentSchema = z.object({
    orderId: z.string().uuid(),
    vendorId: z.string().uuid(),
    vendorCampaignId: z.string().uuid(),

    transactionId: z.string().max(500),
    gateway: z.string().max(20).default("PayU"),
    amount: z.number().positive(),
    currency: z.string().max(10).default("INR"),
    status: z.enum(["Pending", "Success", "Failed"]),
});

// ✅ GET: Fetch all payments
export async function GET() {
    try {
        const payments = await prisma.payments.findMany({
            include: {
                order: true,
                vendor: true,
                vendorCampaign: true,
            },
        });

        return NextResponse.json({success: true, payments}, {status: 200});
    } catch (error) {
        console.error("Error fetching payments:", error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}

// ✅ POST: Create new payment
export async function POST(req: Request) {
    try {
        const body = await req.json();

        // Validate input
        const parsed = paymentSchema.parse(body);

        // Save to DB
        const payment = await prisma.payments.create({
            data: parsed,
        });

        return NextResponse.json({success: true, paymentId: payment.id}, {status: 201});
    } catch (error: unknown) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {success: false, errors: error.issues},
                {status: 400}
            );
        }

        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            return NextResponse.json(
                {success: false, message: "Transaction ID must be unique"},
                {status: 400}
            );
        }

        console.error("Payment creation error:", error);
        return NextResponse.json(
            {success: false, message: "Internal Server Error"},
            {status: 500}
        );
    }
}
