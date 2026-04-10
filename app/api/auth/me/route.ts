import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "../../../lib/db";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const [rows] = await db.query(
      "SELECT id, name, email, role, emailVerified, createdAt FROM users WHERE id = ? LIMIT 1",
      [payload.id]
    ) as any[];
    return NextResponse.json({ user: rows[0] || null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
