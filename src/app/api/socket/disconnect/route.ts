export const runtime = "nodejs";

import connectDb from "@/lib/db";
import User from "@/models/user.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const { socketId } = await req.json();

    // validation
    if (!socketId) {
      return NextResponse.json(
        { message: "socketId required" },
        { status: 400 }
      );
    }

    // find user by socketId and mark offline
    const updatedUser = await User.findOneAndUpdate(
      { socketId },
      {
        $set: {
          socketId: null,
          isOnline: false,
        },
      },
      { new: true }
    );

    if (!updatedUser) {
      return NextResponse.json(
        { message: "user not found for this socketId" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: true, user: updatedUser },
      { status: 200 }
    );
  } catch (error) {
    console.error("SOCKET DISCONNECT ERROR:", error);
    return NextResponse.json(
      { success: false, message: "server error" },
      { status: 500 }
    );
  }
}
