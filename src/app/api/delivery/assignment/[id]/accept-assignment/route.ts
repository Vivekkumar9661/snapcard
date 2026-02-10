import { auth } from "@/auth";
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import emitEventHandler from "@/lib/emitEventHandler";
import mongoose from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: Request, context: any) {
  // normalize params (accept either plain object or a Promise that resolves to params)
  let params: any = context?.params;
  if (params && typeof params.then === "function") {
    try {
      params = await params;
    } catch {
      params = {};
    }
  }
  const id = params?.id;
  if (!id)
    return NextResponse.json(
      { message: "Missing id parameter" },
      { status: 400 },
    );

  try {
    await connectDb();
    console.log(`[API:Accept] RAW PARAMS:`, params);
    // ✅ Unwrapped params for Next.js compatibility
    const resolvedParams = await (params as any);
    const { id } = resolvedParams;
    console.log(`[API:Accept] RESOLVED ID: ${id}`);
    const session = await auth();
    const deliveryBoyID = session?.user?.id;

    console.log(`[API:Accept] Processing ID: ${id}, User: ${deliveryBoyID}`);

    if (!deliveryBoyID) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }
    let assignment = await DeliveryAssignment.findById(id);

    if (!assignment) {
      console.log(
        `[API:Accept] findById failed for ${id}. Trying findOne by string and ObjectId...`,
      );
      assignment = await DeliveryAssignment.findOne({
        $or: [
          { _id: id as any },
          {
            _id: (mongoose.Types.ObjectId.isValid(id)
              ? new mongoose.Types.ObjectId(id)
              : id) as any,
          },
        ],
      });
    }

    if (!assignment) {
      console.log(
        `[API:Accept:v2] NOT FOUND: Assignment ID ${id} is missing from deliveryassignments collection.`,
      );
      return NextResponse.json(
        {
          message: `[V2] Assignment ${id} not found in database. Please refresh.`,
        },
        { status: 404 },
      );
    }

    const currentStatus = assignment.status as any;
    console.log(`[API:Accept:v2] CURRENT STATUS: ${currentStatus}`);

    if (currentStatus !== "broadcasted" && currentStatus !== "brodcasted") {
      console.log(`[API:Accept:v2] INVALID STATUS: ${currentStatus}`);
      return NextResponse.json(
        { message: `[V2] Conflict: Assignment is already ${currentStatus}` },
        { status: 409 },
      );
    }

    const bTo =
      (assignment as any).broadcastedTo ||
      (assignment as any).brodcastedTo ||
      [];
    const broadcastedTo = Array.isArray(bTo)
      ? bTo.map((bId: any) => bId.toString())
      : [];
    const deliveryBoyObjectIdStr = new mongoose.Types.ObjectId(
      deliveryBoyID,
    ).toString();

    console.log(
      `[API:Accept:v2] BROADCAST LIST: ${JSON.stringify(broadcastedTo)}`,
    );
    console.log(
      `[API:Accept:v2] CHECKING USER: ${deliveryBoyID} OR ${deliveryBoyObjectIdStr}`,
    );

    if (
      !broadcastedTo.includes(deliveryBoyID) &&
      !broadcastedTo.includes(deliveryBoyObjectIdStr)
    ) {
      console.log(`[API:Accept:v2] UNAUTHORIZED: User not in broadcast list`);
      return NextResponse.json(
        {
          message: `[V2] Error: You [${deliveryBoyID}] are not in the broadcast list for this order.`,
        },
        { status: 403 },
      );
    }

    console.log(`[API:Accept:v2] MATCH SUCCESS! Updating DB...`);

    // ✅ Accept the assignment
    assignment.assignedTo = new mongoose.Types.ObjectId(deliveryBoyID);
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    // Handle legacy field name if it exists
    if ((assignment as any).brodcastedTo) {
      (assignment as any).broadcastedTo = (assignment as any).brodcastedTo;
      delete (assignment as any).brodcastedTo;
    }

    await assignment.save();

    const order = await Order.findById(assignment.order);
    if (!order) {
      console.log(`[API:Accept:v2] ORDER NOT FOUND: ${assignment.order}`);
      return NextResponse.json(
        { message: "[V2] Order linked to assignment not found" },
        { status: 404 },
      );
    }
    order.status = "out of delivery";
    order.assignedDeliveryBoy = new mongoose.Types.ObjectId(deliveryBoyID);
    await order.save();

    // ✅ Notify Admins in real-time
    const deliveryBoy =
      await User.findById(deliveryBoyID).select("name mobile");
    if (deliveryBoy) {
      await emitEventHandler({
        event: "order-accepted",
        data: {
          orderId: order._id,
          status: order.status,
          deliveryBoy: {
            _id: deliveryBoy._id,
            name: deliveryBoy.name,
            mobile: deliveryBoy.mobile,
          },
        },
      });
    }

    // Standard cleanup logic
    const deliveryBoyObjectId = new mongoose.Types.ObjectId(deliveryBoyID);
    await DeliveryAssignment.updateMany(
      {
        _id: { $ne: assignment._id },
        $or: [
          { broadcastedTo: { $in: [deliveryBoyID, deliveryBoyObjectId] } },
          { brodcastedTo: { $in: [deliveryBoyID, deliveryBoyObjectId] } },
        ],
        status: { $in: ["broadcasted", "brodcasted"] },
      },
      {
        $pull: {
          broadcastedTo: { $in: [deliveryBoyID, deliveryBoyObjectId] },
          brodcastedTo: { $in: [deliveryBoyID, deliveryBoyObjectId] },
        },
      },
    );

    return NextResponse.json({
      success: true,
      message: "Assignment accepted successfully",
      assignment,
    });
  } catch (error) {
    console.error("ACCEPT ASSIGNMENT ERROR:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 },
    );
  }
}
