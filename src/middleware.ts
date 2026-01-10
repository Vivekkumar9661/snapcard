import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // ✅ public routes (no auth)
  const publicRoutes = ["/login", "/register", "/api/auth"];

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // 🔥 SAFETY CHECK (MOST IMPORTANT)
  if (!process.env.NEXTAUTH_SECRET) {
    console.error("❌ NEXTAUTH_SECRET is missing");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET, // ✅ correct
  });

  if (!token) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", req.url);
    return NextResponse.redirect(loginUrl);
  }

  const role = token.role;

  if (pathname.startsWith("/user") && role !== "user") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/delivery") && role == "deliveryBoy") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  if (pathname.startsWith("/admin") && role !== "admin") {
    return NextResponse.redirect(new URL("/unauthorized", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
