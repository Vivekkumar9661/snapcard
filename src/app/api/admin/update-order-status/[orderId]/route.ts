// import connectDb from "@/lib/db";
// import DeliveryAssignment from "@/models/deliveryAssignment.model";
// import Order from "@/models/order.model";
// import User from "@/models/user.model";

// import { NextRequest, NextResponse } from "next/server";

// export async function POST(
//   req: NextRequest,
//   { params }: { params: { orderId: string } }
// ) {
//   try {
//     await connectDb();
//     const { orderId } = params;
//     const { status } = await req.json();
//     const order = await Order.findById(orderId).populate("user");
//     if (!order) {
//       return NextResponse.json({ message: "order not found" }, { status: 400 });
//     }
//     order.status = status;
//     let deliveryBoyPayload: any[] = [];
//     if (status === "out of delivery" && !order.assignment) {
//       const { latitude, longitude } = order.address;
//       const nearByDeliveryBoy = await User.find({
//         role: "deliveryBoy",
//         location: {
//           $near: {
//             $geometry: {
//               type: "Point",
//               coordinates: [Number(longitude), Number(latitude)],
//             },
//             $maxDistance: 10000,
//           },
//         },
//       });
//       const nearByIds = nearByDeliveryBoy.map((b) => b._id);
//       const busyIds = await DeliveryAssignment.find({
//         assignedTo: { $in: nearByIds },
//         status: { $nin: ["brodcasted", "completed"] },
//       }).distinct("assignedTo");
//       const busyIdSet = new Set(busyIds.map((b) => String(b)));
//       const availableDeliveryBoy = nearByDeliveryBoy.filter(
//         (b) => !busyIdSet.has(String(b._id))
//       );
//       const candidates = availableDeliveryBoy.map((b) => b._id);
//       if (candidates.length == 0) {
//         await order.save();
//         return NextResponse.json(
//           { message: "there is not available delivery boy" },
//           { status: 200 }
//         );
//       }
//       const deliveryAssignment = await DeliveryAssignment.create({
//         order: order._id,
//         brodcastedTo: candidates,
//         status: "brodcasted",
//       });
//       (order.assignment = deliveryAssignment._id),
//         (deliveryBoyPayload = availableDeliveryBoy.map((b) => ({
//           id: b._id,
//           name: b.name,
//           mobile: b.mobile,
//           latitude: b.location.coordinates[1],
//           longitude: b.location.coordinates[0],
//         })));
//       await deliveryAssignment.populate("order");
//     }
//     await order.save();
//     await order.populate("user");

//     return NextResponse.json({
//       assignment: order.assignment?._id,
//       availableBoys: deliveryBoyPayload,
//     });
//   } catch (error) {
//     return NextResponse.json(
//       { message: `update status error ${error}` },
//       { status: 500 }
//     );
//   }
// }
import connectDb from "@/lib/db";
import DeliveryAssignment from "@/models/deliveryAssignment.model";
import Order from "@/models/order.model";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

/* ✅ Allowed statuses */
const STATUS_OPTIONS = ["pending", "out of delivery"];

export async function POST(
  req: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    await connectDb();

    // `params` may be a Promise in some Next.js runtimes — unwrap it defensively
    const paramsResolved =
      typeof (params as any)?.then === "function"
        ? await (params as any)
        : params;
    const { orderId } = paramsResolved as { orderId: string };
    const { status } = await req.json();

    // log incoming request for easier local debugging
    console.log("[api:update-order-status] request ->", {
      orderId,
      status,
    });

    /* ✅ Status validation */
    if (!status) {
      return NextResponse.json(
        { message: "status is required" },
        { status: 400 }
      );
    }

    const normalizedStatus = status.toLowerCase();

    if (!STATUS_OPTIONS.includes(normalizedStatus)) {
      return NextResponse.json(
        { message: "invalid status value" },
        { status: 400 }
      );
    }

    /* ✅ Safe ObjectId conversion (FIX for axios error) */
    let objectId: mongoose.Types.ObjectId;
    try {
      objectId = new mongoose.Types.ObjectId(orderId);
    } catch {
      return NextResponse.json(
        { message: "invalid order id" },
        { status: 400 }
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
          { status: 400 }
        );
      }

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

      const nearbyIds = nearbyDeliveryBoys.map((b) => b._id);

      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearbyIds },
        status: { $nin: ["brodcasted", "completed"] },
      }).distinct("assignedTo");

      const busySet = new Set(busyIds.map(String));

      const available = nearbyDeliveryBoys.filter(
        (b) => !busySet.has(String(b._id))
      );

      if (available.length === 0) {
        await order.save();
        return NextResponse.json(
          { message: "no delivery boy available" },
          { status: 200 }
        );
      }

      const assignment = await DeliveryAssignment.create({
        order: order._id,
        brodcastedTo: available.map((b) => b._id),
        status: "brodcasted",
      });

      order.assignment = assignment._id;

      deliveryBoyPayload = available.map((b) => ({
        id: b._id,
        name: b.name,
        mobile: b.mobile,
        latitude: b.location.coordinates[1],
        longitude: b.location.coordinates[0],
      }));
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
      { status: 500 }
    );
  }
}
