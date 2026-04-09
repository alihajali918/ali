import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

export async function GET(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ user: null });

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return NextResponse.json({ user: payload });
  } catch {
    return NextResponse.json({ user: null });
  }
}
