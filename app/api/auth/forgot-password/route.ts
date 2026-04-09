import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { sendResetEmail } from "../../../lib/mailer";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email)
      return NextResponse.json({ error: "البريد مطلوب" }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { email } });

    // نرد بنفس الرسالة دائماً حتى لا نكشف إذا كان البريد مسجلاً
    if (user && user.role !== "admin") {
      const resetToken = crypto.randomBytes(32).toString("hex");
      const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // ساعة
      await prisma.user.update({
        where: { id: user.id },
        data: { resetToken, resetExpires },
      });
      await sendResetEmail(email, user.name, resetToken);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
