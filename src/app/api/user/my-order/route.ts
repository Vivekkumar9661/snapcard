// import { auth } from "@/auth";
// import connectDb from "@/lib/db";
// import Order from "@/models/order.model";
// import { NextRequest, NextResponse } from "next/server";

// export async function GET(req: NextRequest) {
//   try {
//     await connectDb();
//     const session = await auth();
//     const orders = await Order.find({ user: session?.user?.id }).populate(
//       "user"
//     ).sort({createdAt-1})
//     if (!orders) {
//       return NextResponse.json({ message: "order not found" }, { status: 400 });
//     }
//     return NextResponse.json(orders, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: `get all order error:${error}` },
//       { status: 500 }
//     );
//   }
// }
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
      .populate("user")
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
