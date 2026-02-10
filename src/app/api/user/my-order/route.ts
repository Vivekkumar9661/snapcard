
import { auth } from "@/auth";
import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    await connectDb();

    // ✅ auth check
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // ✅ get orders
    const orders = await Order.find({
      user: session.user.id,
    })
      .populate("user  assignedDeliveryBoy")
      .sort({ createdAt: -1 });

    // ✅ empty array check (optional)
    if (orders.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(orders, { status: 200 });
  } catch (error) {
    console.error("GET ORDERS ERROR:", error);
    return NextResponse.json(
      { message: "get all order error" },
      { status: 500 }
    );
  }
}
