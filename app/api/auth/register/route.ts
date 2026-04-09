import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password)
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });

    if (password.length < 8)
      return NextResponse.json({ error: "كلمة المرور 8 أحرف على الأقل" }, { status: 400 });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: { name, email, password: hashed, role: "user" },
    });

    return NextResponse.json({ ok: true, name: user.name });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
