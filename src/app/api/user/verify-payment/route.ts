import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
    try {
        const { session_id } = await req.json();

        if (!session_id) {
            return NextResponse.json(
                { error: true, message: "Session ID is required" },
                { status: 400 }
            );
        }

        await connectDb();

        // Find the order with this session ID
        const order = await Order.findOne({ stripeSessionId: session_id });

        if (!order) {
            // If order not found by session ID, it might be a mismatch or invalid session
            return NextResponse.json(
                { error: true, message: "Order not found for this session" },
                { status: 404 }
            );
        }

        if (order.isPaid) {
            return NextResponse.json(
                { error: false, message: "Order is already paid", order },
                { status: 200 }
            );
        }

        const session = await stripe.checkout.sessions.retrieve(session_id);

        if (session.payment_status === "paid") {
            const updatedOrder = await Order.findByIdAndUpdate(
                order._id,
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
                    message: "Order verified and updated successfully",
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
        console.error("Verification error:", error);
        return NextResponse.json(
            {
                error: true,
                message: error.message || "Internal Server Error",
            },
            { status: 500 }
        );
    }
}
