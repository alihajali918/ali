import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import crypto from "crypto";
import { db } from "../../../lib/db";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

export async function POST(req: NextRequest) {
  const token = req.cookies.get("user_token")?.value;
  if (!token) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  let userId: number;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    userId = payload.id as number;
  } catch {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ error: "البريد مؤكد مسبقاً" }, { status: 400 });

  const verifyToken = crypto.randomBytes(32).toString("hex");
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await db.user.update({ where: { id: userId }, data: { verifyToken, verifyExpires } });

  try {
    const { sendVerificationEmail } = await import("../../../lib/mailer");
    await sendVerificationEmail(user.email, user.name, verifyToken);
  } catch {
    return NextResponse.json({ error: "فشل إرسال البريد، حاول لاحقاً" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
