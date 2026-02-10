import connectDb from "@/lib/db";
import emitEventHandler from "@/lib/emitEventHandler";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

/* ✅ Allowed statuses */
const STATUS_OPTIONS = ["pending", "out of delivery"];

export async function POST(request: Request, context: any) {
  try {
    await connectDb();

    // read params safely from context (handles Promise or plain object shapes)
    const params =
      context?.params ?? (await context?.params?.catch?.(() => ({}))) ?? {};
    const orderId = params?.orderId;
    const { status } = await request.json();

    // log incoming request for easier local debugging
    console.log("[api:update-order-status] request ->", {
      orderId,
      status,
    });

    /* ✅ Status validation */
    if (!status) {
      return NextResponse.json(
        { message: "status is required" },
        { status: 400 },
      );
    }

    const normalizedStatus = status.toLowerCase();

    if (!STATUS_OPTIONS.includes(normalizedStatus)) {
      return NextResponse.json(
        { message: "invalid status value" },
        { status: 400 },
      );
    }

    /* ✅ Safe ObjectId conversion (FIX for axios error) */
    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(orderId);
    } catch {
      return NextResponse.json(
        { message: "invalid order id" },
        { status: 400 },
      );
    }

    const order = await Order.findById(objectId);

    if (!order) {
      return NextResponse.json({ message: "order not found" }, { status: 404 });
    }

    order.status = normalizedStatus;

    let deliveryBoyPayload: any[] = [];

    /* ✅ Assign delivery boy only when status = out of delivery */
    if (normalizedStatus === "out of delivery" && !order.assignment) {
      const { latitude, longitude } = order.address || {};

      if (latitude == null || longitude == null) {
        return NextResponse.json(
          { message: "order location missing" },
          { status: 400 },
        );
      }

      console.log("[api:update-order-status] Order Location:", {
        latitude,
        longitude,
      });

      const nearbyDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            $maxDistance: 10000,
          },
        },
      });

      console.log(
        `[api:update-order-status] Found ${nearbyDeliveryBoys.length} delivery boys within 10km`,
      );

      const nearbyIds = nearbyDeliveryBoys.map((b) => b._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearbyIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");

      console.log(
        `[api:update-order-status] Busy delivery boys count: ${busyIds.length}`,
      );

      const busySet = new Set(busyIds.map(String));

      const available = nearbyDeliveryBoys.filter(
        (b) => !busySet.has(String(b._id)),
      );

      console.log(
        `[api:update-order-status] Available delivery boys: ${available.length}`,
      );

      if (available.length === 0) {
        // Fallback check: how many total delivery boys exist?
        const totalBoys = await User.countDocuments({ role: "deliveryBoy" });
        console.log(
          `[api:update-order-status] Total delivery boys in DB: ${totalBoys}`,
        );

        await order.save();
        return NextResponse.json(
          { message: "no delivery boy available" },
          { status: 200 },
        );
      }

      const assignment = await DeliveryAssignment.create({
        order: order._id,
        broadcastedTo: available.map((b) => b._id),
        status: "broadcasted",
      });
      for (const boyId of available) {
        const boy = await User.findById(boyId);
        if (boy.socketId) {
          console.log(
            `[api:update-order-status] Notifying Delivery Boy: ${boy.name} (${boy.socketId})`,
          );
          await emitEventHandler({
            socketId: boy.socketId,
            event: "new-delivery-assignment",
            data: {
              assignmentId: assignment._id,
              orderId: order._id,
              address: order.address,
              totalAmount: order.totalAmount,
              status: normalizedStatus,
            },
          });
        }
      }

      order.assignment = assignment._id;

      deliveryBoyPayload = available.map((b) => ({
        id: b._id,
        name: b.name,
        mobile: b.mobile,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0],
      }));

      /* 🔔 Notify Available Delivery Boys */
      for (const boy of available) {
        if (boy.socketId) {
          console.log(
            `[api:update-order-status] Notifying Delivery Boy: ${boy.name} (${boy.socketId})`,
          );
          await emitEventHandler({
            socketId: boy.socketId,
            event: "new-delivery-assignment",
            data: {
              assignmentId: assignment._id,
              orderId: order._id,
              address: order.address,
              totalAmount: order.totalAmount,
              status: normalizedStatus, // 👈 ADDED STATUS
            },
          });
        }
      }
    }

    /* 🔔 Notify Customer (User) */
    const currentDate = new Date();
    const customer = await User.findById(order.user);

    console.log(
      `[DEBUG] Customer Found: ${customer?._id}, SocketID: ${customer?.socketId}`,
    ); // 👈 ADDED LOG

    if (customer && customer.socketId) {
      console.log(
        `[api:update-order-status] Notifying Customer: ${customer.name} (${customer.socketId})`,
      );
      await emitEventHandler({
        socketId: customer.socketId,
        event: "order-updated",
        data: {
          orderId: order._id,
          status: normalizedStatus,
          updatedAt: currentDate,
        },
      });
    } else {
      console.log(
        `[DEBUG] SKIPPING Customer Notification: Missing SocketID or User`,
      ); // 👈 ADDED LOG
    }

    /* 🔔 Notify Assigned Delivery Boy (if exists) */
    if (order.assignment) {
      const existingAssignment = await DeliveryAssignment.findById(
        order.assignment,
      ).populate("assignedTo");
      if (existingAssignment && existingAssignment.assignedTo) {
        // assignedTo could be an object if populated, or ID if not. Checked populate above.
        const deliveryBoy = existingAssignment.assignedTo as any;

        if (deliveryBoy.socketId) {
          console.log(
            `[api:update-order-status] Notifying Assigned Delivery Boy: ${deliveryBoy.name} (${deliveryBoy.socketId})`,
          );
          await emitEventHandler({
            socketId: deliveryBoy.socketId,
            event: "order-updated",
            data: {
              orderId: order._id,
              status: normalizedStatus,
              updatedAt: currentDate,
            },
          });
        }
      }
    }

    await order.save();

    return NextResponse.json({
      success: true,
      assignment: order.assignment ?? null,
      availableBoys: deliveryBoyPayload,
    });
  } catch (error) {
    console.error("UPDATE ORDER STATUS ERROR:", error);
    return NextResponse.json(
      { message: "internal server error" },
      { status: 500 },
    );
  }
}
