import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  try { await jwtVerify(token, SECRET); return true; } catch { return false; }
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  await Promise.all([
    db.visitor.deleteMany(),
    db.pageView.deleteMany(),
    db.qrHistory.deleteMany(),
    db.certHistory.deleteMany(),
    db.reportHistory.deleteMany(),
  ]);

  return NextResponse.json({ ok: true });
}
