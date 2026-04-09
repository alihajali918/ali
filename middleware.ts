import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

// المسارات المحمية
const PROTECTED = ["/admin"];
// المسارات العامة داخل admin
const PUBLIC_ADMIN = ["/admin/login"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // حماية /admin
  if (PROTECTED.some((p) => pathname.startsWith(p))) {
    if (PUBLIC_ADMIN.some((p) => pathname.startsWith(p))) {
      return NextResponse.next();
    }

    const token = req.cookies.get("admin_token")?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
