import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { sendResetEmail } from "../../../lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 });

    const [rows] = await db.query("SELECT id, name, role FROM users WHERE email = ? LIMIT 1", [email]) as any[];
    const user = rows[0];

    if (user && user.role !== "admin") {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await db.query("UPDATE users SET resetToken = ?, resetExpires = ? WHERE id = ?", [resetToken, resetExpires, user.id]);
      await sendResetEmail(email, user.name, resetToken);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
