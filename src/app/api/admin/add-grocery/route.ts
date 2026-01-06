// import { auth } from "@/auth";
// import uploadOnCloudinary from "@/lib/Cloudinary";
// import connectDb from "@/lib/db";
// import Grocery from "@/models/grocery.model";
// import { NextResponse, NextRequest } from "next/server";

// export async function POST(req: NextRequest) {
//   try {
//     await connectDb();
//     const session = await auth();
//     if (!session || session.user?.role !== "admin") {
//       return NextResponse.json(
//         { message: "Only admin can add grocery" },
//         { status: 403 }
//       );
//     }

//     const formData = await req.formData();
//     const name = formData.get("name") as string;
//     const category = formData.get("category") as string;
//     const unit = formData.get("unit") as string;
//     const price = formData.get("price") as string;
//     const file = formData.get("image") as Blob | null;
//     let imageUrl;
//     if (file) {
//       imageUrl = await uploadOnCloudinary(file);
//     }
//     const grocery = await Grocery.create({
//       name,
//       price,
//       category,
//       unit,
//       image: imageUrl,
//     });
//     return NextResponse.json(grocery, { status: 200 });
//   } catch (error) {
//     return NextResponse.json(
//       { message: `add grocery error ${error}` },
//       { status: 500 }
//     );
//   }
// }

import { auth } from "@/auth";
import uploadOnCloudinary from "@/lib/Cloudinary";
import connectDb from "@/lib/db";
import Grocery from "@/models/grocery.model";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    await connectDb();

    const session = await auth();

    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { message: "Only admin can add grocery" },
        { status: 403 }
      );
    }

    const formData = await req.formData();

    const name = formData.get("name") as string;
    const category = formData.get("category") as string;
    const unit = formData.get("unit") as string;
    const price = formData.get("price") as string;
    const file = formData.get("image") as Blob | null;

    let imageUrl;
    if (file) {
      imageUrl = await uploadOnCloudinary(file);
    }

    const grocery = await Grocery.create({
      name,
      price,
      category,
      unit,
      image: imageUrl,
    });

    return NextResponse.json(grocery, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Add grocery failed" },
      { status: 500 }
    );
  }
}
