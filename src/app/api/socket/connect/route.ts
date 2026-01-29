// export const runtime = "nodejs";

// import connectDb from "@/lib/db";
// import User from "@/models/user.model";
// import { NextRequest, NextResponse } from "next/server";
// import mongoose from "mongoose";

// export async function POST(req: NextRequest) {
//   try {
//     await connectDb();

//     const { userId, socketId } = await req.json();

//     // ✅ validation
//     if (!userId || !socketId) {
//       return NextResponse.json(
//         { message: "userId and socketId required" },
//         { status: 400 }
//       );
//     }

//     // ✅ ObjectId conversion (MAIN FIX)
//     const updatedUser = await User.findOneAndUpdate(
//       { _id: new mongoose.Types.ObjectId(userId) },
//       {
//         $set: {
//           socketId,
//           isOnline: true,
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
//     console.error("SOCKET CONNECT ERROR:", error);
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
    const { userId, socketId } = body;

    // validation
    if (!userId || !socketId) {
      return NextResponse.json(
        { message: "userId and socketId required" },
        { status: 400 }
      );
    }

    // ObjectId conversion
    const updatedUser = await User.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(userId) },
      {
        $set: {
          socketId,
          isOnline: true,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json({ message: "user not found" }, { status: 404 });
    }

    console.log("USER CONNECTED:", updatedUser._id);

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("SOCKET CONNECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 }
    );
  }
}
