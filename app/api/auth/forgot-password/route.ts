import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { sendResetEmail } from "../../../lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 });

    const user = await db.user.findUnique({ where: { email } });

    if (user && user.role !== "admin") {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await db.user.update({ where: { id: user.id }, data: { resetToken, resetExpires } });
      await sendResetEmail(email, user.name, resetToken);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
