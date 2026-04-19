import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SITE_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);
const ATT_SECRET = new TextEncoder().encode(
  process.env.ATT_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "att-fallback-secret"
);

function redirect(req: NextRequest, to: string) {
  return NextResponse.redirect(new URL(to, req.url));
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── 1. Main site admin (/admin/*) ──────────────────────
  if (pathname.startsWith("/admin")) {
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

  // ── 2. Attendance admin (/attend/[org]/admin/*) ────────
  const m = pathname.match(/^\/attend\/([^/]+)\/admin(\/.*)?$/);
  if (m) {
    const org = m[1];
    const sub = m[2] ?? "";

    // Login page is always public
    if (sub === "/login") return NextResponse.next();

    const token = req.cookies.get("att_admin_token")?.value;
    if (!token) return redirect(req, `/attend/${org}/admin/login`);

    try {
      const { payload } = await jwtVerify(token, ATT_SECRET);
      // Token must belong to this exact org
      if (payload.orgSlug !== org) return redirect(req, `/attend/${org}/admin/login`);
    } catch {
      return redirect(req, `/attend/${org}/admin/login`);
    }
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/attend/:org/admin", "/attend/:org/admin/:path*"],
};
