import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { db } from "../../../lib/db";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

export async function GET(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ user: null });
  try {
    const { payload } = await jwtVerify(token, SECRET);
    const user = await db.user.findUnique({
      where: { id: payload.id as number },
      select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
    });
    return NextResponse.json({ user: user || null });
  } catch {
    return NextResponse.json({ user: null });
  }
}
