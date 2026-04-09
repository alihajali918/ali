// هذا الـ route لإنشاء حساب الأدمن لأول مرة فقط
// بعد الإنشاء احذف هذا الملف أو عطّل الـ route

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const existing = await prisma.user.count();
  if (existing > 0) {
    return NextResponse.json({ error: "المستخدمون موجودون بالفعل" }, { status: 403 });
  }

  const { name, email, password, setupKey } = await req.json();

  // مفتاح الإعداد للحماية
  if (setupKey !== process.env.NEXTAUTH_SECRET) {
    return NextResponse.json({ error: "مفتاح غير صحيح" }, { status: 403 });
  }

  const hashed = await bcrypt.hash(password, 12);
  const user   = await prisma.user.create({
    data: { name, email, password: hashed, role: "admin" },
  });

  return NextResponse.json({ ok: true, email: user.email });
}
