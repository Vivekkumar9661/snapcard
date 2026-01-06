import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

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
    });
    return NextResponse.json({ message: newOrder }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { message: `Place order error ${error}` },
      { status: 500 }
    );
  }
}
