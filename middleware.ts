import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

const ATT_SECRET = new TextEncoder().encode(
  process.env.ATT_JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "att-fallback-secret"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ── Main site admin (/admin/*) ──────────────────────────
  if (pathname.startsWith("/admin")) {
    if (pathname.startsWith("/admin/login")) return NextResponse.next();

    const token = req.cookies.get("admin_token")?.value;
    if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));

    try {
      const { payload } = await jwtVerify(token, SECRET);
      if (payload.role !== "admin") return NextResponse.redirect(new URL("/admin/login", req.url));
      return NextResponse.next();
    } catch {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
  }

  // ── Attendance admin (/attend/[org]/admin/*) ────────────
  const attAdmin = pathname.match(/^\/attend\/([^/]+)\/admin(\/.*)?$/);
  if (attAdmin) {
    const org = attAdmin[1];
    const sub = attAdmin[2] ?? "";

    // Allow login page through
    if (sub === "/login" || sub === "") {
      // For the root admin path, we still need to check below
      if (sub === "/login") return NextResponse.next();
    }

    // /attend/[org]/admin and sub-pages require att_admin_token
    if (sub !== "/login") {
      const token = req.cookies.get("att_admin_token")?.value;
      if (!token) {
        return NextResponse.redirect(new URL(`/attend/${org}/admin/login`, req.url));
      }

      try {
        const { payload } = await jwtVerify(token, ATT_SECRET);
        // Verify token belongs to this org
        if (payload.orgSlug !== org) {
          return NextResponse.redirect(new URL(`/attend/${org}/admin/login`, req.url));
        }
        return NextResponse.next();
      } catch {
        return NextResponse.redirect(new URL(`/attend/${org}/admin/login`, req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/attend/:org/admin", "/attend/:org/admin/:path*"],
};
