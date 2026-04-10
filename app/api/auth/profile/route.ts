import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { prisma } from "../../../lib/prisma";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

export async function PUT(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  let userId: number;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    userId = payload.id as number;
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { name, currentPassword, newPassword } = await req.json();
  const updates: Record<string, string> = {};

  if (name && name.trim().length >= 2) {
    updates.name = name.trim();
  }

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "أدخل كلمة المرور الحالية" }, { status: 400 });
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: "كلمة المرور الجديدة قصيرة جداً" }, { status: 400 });
    updates.password = await bcrypt.hash(newPassword, 12);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "لا يوجد تغييرات" }, { status: 400 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: updates,
    select: { id: true, name: true, email: true, role: true, emailVerified: true, createdAt: true },
  });

  return NextResponse.json({ user: updated });
}
