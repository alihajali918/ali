import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();
    if (!name || !email || !password)
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    if (password.length < 8)
      return NextResponse.json({ error: "كلمة المرور 8 أحرف على الأقل" }, { status: 400 });

    const [existing] = await db.query("SELECT id FROM users WHERE email = ? LIMIT 1", [email]) as any[];
    if (existing[0]) return NextResponse.json({ error: "البريد الإلكتروني مستخدم بالفعل" }, { status: 409 });

    const hashed = await bcrypt.hash(password, 12);
    const verifyToken = crypto.randomBytes(32).toString("hex");
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await db.query(
      "INSERT INTO users (name, email, password, role, emailVerified, verifyToken, verifyExpires) VALUES (?, ?, ?, 'user', 0, ?, ?)",
      [name, email, hashed, verifyToken, verifyExpires]
    );

    try {
      const { sendVerificationEmail } = await import("../../../lib/mailer");
      await sendVerificationEmail(email, name, verifyToken);
    } catch (e) { console.error("Email failed:", e); }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ في إنشاء الحساب" }, { status: 500 });
  }
}
