// import { auth } from "@/auth";
// import connectDb from "@/lib/db";
// import DeliveryAssignment from "@/models/deliveryAssignment.model";
// import { NextResponse } from "next/server";

// export async function GET() {
//   try {
//     await connectDb();
//     const session = await auth();
//     const assignments = await DeliveryAssignment.find({
//       brodcastedTo: session?.user?.id,
//       status: "brodcasted",
//     }).populate("order assignedTo");
//     return NextResponse.json({ assignments }, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: "Internal Server Error" },
//       { status: 500 },
//     );
//   }
// }

import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import "@/models/grocery.model";
import mongoose from "mongoose"; // ✅ Added for debug
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("👉 /api/delivery/get-assignments HIT");
    await connectDb();

    // Check registered models
    const models = Object.keys(mongoose.models);
    console.log("Registered Models:", models);
    if (!models.includes("Order")) {
      console.error("❌ Order model missing! Attempting re-import...");
      try {
        const OrderModel = require("@/models/order.model").default;
        console.log("Re-imported Order:", !!OrderModel);
      } catch (e) {
        console.error("Re-import failed:", e);
      }
    }
    if (!models.includes("User")) console.error("❌ User model missing!");
    if (!models.includes("Grocery")) console.error("❌ Grocery model missing!");

    const session = await auth();

    // ✅ Safety check
    if (!session?.user?.id) {
      console.log("❌ No session/user ID");
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    console.log("Session User:", session.user.id);

    // 1. Basic Find Test
    try {
      const basicCount = await DeliveryAssignment.countDocuments({
        brodcastedTo: session.user.id,
        status: "brodcasted",
      });
      console.log(`✅ Basic count succeeded: ${basicCount}`);
    } catch (e) {
      console.error("❌ Basic find failed:", e);
      throw new Error(`Basic DB Find Failed: ${e instanceof Error ? e.message : e}`);
    }

    // 2. Full Query
    const assignments = await DeliveryAssignment.find({
      brodcastedTo: session.user.id,
      status: "brodcasted",
    })
      .populate({
        path: "order",
        select: "address totalAmount",
      })
      .populate("assignedTo");

    console.log(`✅ Fetched ${assignments.length} assignments with populate`);

    return NextResponse.json({ assignments }, { status: 200 });
  } catch (error) {
    console.error("❌ GET ASSIGNMENTS API ERROR:", error);

    return NextResponse.json(
      {
        message: `Server Error: ${error instanceof Error ? error.message : String(error)}`,
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 },
    );
  }
}
