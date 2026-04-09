import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

async function isAdmin(req: NextRequest) {
  const token = req.cookies.get("admin_token")?.value;
  if (!token) return false;
  try { await jwtVerify(token, SECRET); return true; } catch { return false; }
}

// جلب كل المستخدمين
export async function GET(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(users);
}

// إضافة مستخدم
export async function POST(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { name, email, password, role } = await req.json();
  if (!name || !email || !password) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "البريد مستخدم" }, { status: 409 });
  const hashed = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { name, email, password: hashed, role: role || "user", emailVerified: true },
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
  });
  return NextResponse.json(user);
}

// حذف مستخدم
export async function DELETE(req: NextRequest) {
  if (!await isAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  if (user.role === "admin") return NextResponse.json({ error: "لا يمكن حذف الأدمن" }, { status: 403 });
  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
