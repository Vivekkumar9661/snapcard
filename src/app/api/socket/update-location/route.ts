// export const runtime = "nodejs";

// import connectDb from "@/lib/db";
// import User from "@/models/user.model";
// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";

// export async function POST(req: NextRequest) {
//   try {
//     await connectDb();

//     const { userId, latitude, longitude } = await req.json();

//     // ✅ validation
//     if (!userId || latitude === undefined || longitude === undefined) {
//       return NextResponse.json(
//         { message: "userId, latitude and longitude required" },
//         { status: 400 }
//       );
//     }

//     // ✅ ObjectId + GeoJSON FIX
//     const updatedUser = await User.findOneAndUpdate(
//       { _id: new mongoose.Types.ObjectId(userId) },
//       {
//         $set: {
//           location: {
//             type: "Point",
//             coordinates: [longitude, latitude], // ✅ correct order
//           },
//         },
//       },
//       { new: true }
//     );

//     // ✅ not found check
//     if (!updatedUser) {
//       return NextResponse.json({ message: "user not found" }, { status: 404 });
//     }

//     return NextResponse.json(
//       { success: true, user: updatedUser },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("UPDATE LOCATION ERROR:", error);
//     return NextResponse.json(
//       { success: false, message: "server error" },
//       { status: 500 }
//     );
//   }
// }
export const runtime = "nodejs";

import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const body = await req.json();
    const { userId, latitude, longitude } = body;

    // ✅ validation
    if (!userId || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { message: "userId, latitude, longitude required" },
        { status: 400 }
      );
    }

    // ✅ ObjectId conversion + GeoJSON format
    const updatedUser = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          location: {
            type: "Point",
            coordinates: [longitude, latitude], // IMPORTANT ORDER
          },
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    console.log("✅ LOCATION UPDATED:", updatedUser.location);

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPDATE LOCATION ERROR:", error);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 }
    );
  }
}
