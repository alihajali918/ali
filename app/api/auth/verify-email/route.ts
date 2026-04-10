import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) return NextResponse.redirect(new URL("/login?error=invalid", req.url));

  const [rows] = await db.query(
    "SELECT id FROM users WHERE verifyToken = ? AND verifyExpires > NOW() LIMIT 1",
    [token]
  ) as any[];

  if (!rows[0]) return NextResponse.redirect(new URL("/login?error=expired", req.url));

  await db.query(
    "UPDATE users SET emailVerified = 1, verifyToken = NULL, verifyExpires = NULL WHERE id = ?",
    [rows[0].id]
  );

  return NextResponse.redirect(new URL("/login?verified=1", req.url));
}
