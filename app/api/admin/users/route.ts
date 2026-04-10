import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  try { await jwtVerify(token, SECRET); return true; } catch { return false; }
}

export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const [rows] = await db.query("SELECT id, name, email, role, emailVerified, createdAt FROM users ORDER BY createdAt DESC") as any[];
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  const [existing] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]) as any[];
  if (existing[0]) return NextResponse.json({ error: "البريد مستخدم" }, { status: 409 });
  const hashed = await bcrypt.hash(password, 12);
  const [result] = await db.query(
    "INSERT INTO users (name, email, password, role, emailVerified) VALUES (?, ?, ?, ?, 1)",
    [name, email, hashed, role || "user"]
  ) as any[];
  const [rows] = await db.query("SELECT id, name, email, role, emailVerified, createdAt FROM users WHERE id = ?", [result.insertId]) as any[];
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  const [rows] = await db.query("SELECT role FROM users WHERE id = ? LIMIT 1", [id]) as any[];
  if (!rows[0]) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  if (rows[0].role === "admin") return NextResponse.json({ error: "لا يمكن حذف الأدمن" }, { status: 403 });
  await db.query("DELETE FROM users WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
