import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { orderId } = await req.json();

        if (!orderId) {
            return NextResponse.json(
                { error: true, message: "Order ID is required" },
                { status: 400 }
            );
        }

        await connectDb();
        const order = await Order.findById(orderId);

        if (!order) {
            return NextResponse.json(
                { error: true, message: "Order not found" },
                { status: 404 }
            );
        }

        if (order.isPaid) {
            return NextResponse.json(
                { error: false, message: "Order is already paid", order },
                { status: 200 }
            );
        }

        if (!order.stripeSessionId) {
            return NextResponse.json(
                {
                    error: true,
                    message: "No Stripe Session ID found for this order",
                },
                { status: 400 }
            );
        }

        const session = await stripe.checkout.sessions.retrieve(
            order.stripeSessionId
        );

        if (session.payment_status === "paid") {
            const updatedOrder = await Order.findByIdAndUpdate(
                orderId,
                {
                    isPaid: true,
                    stripePaymentIntentId: session.payment_intent || null,
                    stripePaymentMethod: session.payment_method_types
                        ? session.payment_method_types[0]
                        : null,
                    reconciledAt: new Date(),

                },
                { new: true }
            );

            return NextResponse.json(
                {
                    error: false,
                    message: "Order reconciled successfully",
                    order: updatedOrder,
                },
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                {
                    error: true,
                    message: `Payment not completed. Status: ${session.payment_status}`,
                },
                { status: 400 }
            );
        }
    } catch (error: any) {
        console.error("Reconciliation error:", error);
        return NextResponse.json(
            {
                error: true,
                message: error.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
