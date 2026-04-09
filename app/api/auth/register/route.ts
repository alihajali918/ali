import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.user.create({
      data: { name, email, password: hashed, role: "user", verifyToken, verifyExpires },
    });

    // إرسال الإيميل - لا نوقف التسجيل لو فشل
    try {
      const { sendVerificationEmail } = await import("../../../lib/mailer");
      await sendVerificationEmail(email, name, verifyToken);
    } catch (mailErr) {
      console.error("Email send failed:", mailErr);
      // الحساب تم إنشاؤه، الإيميل فشل فقط
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Register error:", err);
    return NextResponse.json({ error: "حدث خطأ في إنشاء الحساب" }, { status: 500 });
  }
}
