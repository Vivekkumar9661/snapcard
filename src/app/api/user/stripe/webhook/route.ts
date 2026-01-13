import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  const rawBody = await req.text();
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error) {
    console.error("signature verification failed", error);
  }
  if (event?.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Stripe session object:", session);
    await connectDb();
    if (!session?.metadata?.orderId) {
      console.error("No orderId found in session.metadata");
    } else {
      try {
        const updateResult = await Order.findByIdAndUpdate(
          session.metadata.orderId,
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
        if (!updateResult) {
          console.error(
            "Order not found or not updated for orderId:",
            session.metadata.orderId
          );
        } else {
          console.log("Order update result:", updateResult);
        }
      } catch (err) {
        console.error("Error updating order:", err);
      }
    }
  }
  return NextResponse.json({ recieved: true }, { status: 200 });
}
