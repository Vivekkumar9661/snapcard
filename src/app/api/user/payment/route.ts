import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const NEXT_BASE_URL = process.env.NEXT_BASE_URL;

if (!STRIPE_SECRET_KEY) {
  throw new Error("STRIPE_SECRET_KEY is not defined in environment");
}
if (!NEXT_BASE_URL) {
  throw new Error("NEXT_BASE_URL is not defined in environment");
}

const strip = new Stripe(STRIPE_SECRET_KEY);

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const { userId, item, totalAmount, paymentMethod, address } =
      await req.json();
    if (!item || !userId || !paymentMethod || !totalAmount || !address) {
      return NextResponse.json(
        { message: "Please send all creadential" },
        { status: 400 }
      );
    }
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ message: "user not found" }, { status: 400 });
    }

    const newOrder = await Order.create({
      user: userId,
      item,
      paymentMethod,
      totalAmount,
      address,
      isPaid: false,
    });

    const session = await strip.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      success_url: `${NEXT_BASE_URL}/user/order-success`,
      cancel_url: `${NEXT_BASE_URL}/user/order-cancel`,
      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: "SnapCart Order payment",
            },
            unit_amount: totalAmount * 100,
          },
          quantity: 1,
        },
      ],
      metadata: { orderId: newOrder._id.toString() },
    });
    return NextResponse.json({ url: session.url }, { status: 200 });
  } catch (error: any) {
    let errorMsg = "order payment error";
    if (error instanceof Error) {
      errorMsg += `: ${error.message}`;
    } else {
      errorMsg += `: ${JSON.stringify(error)}`;
    }
    return NextResponse.json({ message: errorMsg }, { status: 500 });
  }
}
