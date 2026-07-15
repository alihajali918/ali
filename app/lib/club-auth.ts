import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

export async function isClubAdmin(req: NextRequest): Promise<boolean> {
  const token = req.cookies.get("club_admin_token")?.value;
  if (!token) return false;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload.role === "club_admin" || payload.role === "admin";
  } catch {
    return false;
  }
}
