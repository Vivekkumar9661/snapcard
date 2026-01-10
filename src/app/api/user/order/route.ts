import connectDb from "@/lib/db";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();
    const body = await req.json();
    const missingFields = [];
    if (!body.userId) missingFields.push("userId");
    if (!body.item || !Array.isArray(body.item) || body.item.length === 0)
      missingFields.push("item[]");
    if (!body.totalAmount) missingFields.push("totalAmount");
    if (!body.paymentMethod) missingFields.push("paymentMethod");
    if (!body.address) {
      missingFields.push("address");
    } else {
      // Validate address subfields
      const addressFields = [
        "fullName",
        "mobile",
        "city",
        "state",
        "pincode",
        "fullAddress",
      ];
      addressFields.forEach((f) => {
        if (!body.address[f]) missingFields.push(`address.${f}`);
      });
    }

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          error: true,
          message: `Missing required fields: ${missingFields.join(", ")}`,
          fields: missingFields,
          received: body,
        },
        { status: 400 }
      );
    }

    const user = await User.findById(body.userId);
    if (!user) {
      return NextResponse.json(
        { error: true, message: "User not found", userId: body.userId },
        { status: 400 }
      );
    }

    const newOrder = await Order.create({
      user: body.userId,
      item: body.item,
      paymentMethod: body.paymentMethod,
      totalAmount: body.totalAmount,
      address: body.address,
    });
    return NextResponse.json(
      { error: false, order: newOrder },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json(
      {
        error: true,
        message: error?.message || `Place order error`,
        stack: error?.stack || null,
      },
      { status: 500 }
    );
  }
}
