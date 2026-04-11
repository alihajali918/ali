import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  try { await jwtVerify(token, SECRET); return true; } catch { return false; }
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const [visitors, pageViews, qrHistory, certHistory, reportHistory] = await Promise.all([
    db.visitor.findMany({ orderBy: { createdAt: "desc" } }),
    db.pageView.findMany({ orderBy: { date: "desc" } }),
    db.qrHistory.findMany({ orderBy: { createdAt: "desc" } }),
    db.certHistory.findMany({ orderBy: { createdAt: "desc" } }),
    db.reportHistory.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  return NextResponse.json({ visitors, pageViews, qrHistory, certHistory, reportHistory });
}
