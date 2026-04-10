import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();
    if (!token || !password) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    if (password.length < 8) return NextResponse.json({ error: "كلمة المرور 8 أحرف على الأقل" }, { status: 400 });

    const [rows] = await db.query(
      "SELECT id FROM users WHERE resetToken = ? AND resetExpires > NOW() LIMIT 1",
      [token]
    ) as any[];
    if (!rows[0]) return NextResponse.json({ error: "الرابط منتهي أو غير صالح" }, { status: 400 });

    const hashed = await bcrypt.hash(password, 12);
    await db.query("UPDATE users SET password = ?, resetToken = NULL, resetExpires = NULL WHERE id = ?", [hashed, rows[0].id]);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
