import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SITE_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

function redirect(req: NextRequest, to: string) {
  return NextResponse.redirect(new URL(to, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();

  const token = req.cookies.get("admin_token")?.value;
  if (!token) return redirect(req, "/admin/login");

  try {
    const { payload } = await jwtVerify(token, SITE_SECRET);
    if (payload.role !== "admin") return redirect(req, "/admin/login");
  } catch {
    return redirect(req, "/admin/login");
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
