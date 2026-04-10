import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { db } from "../../../lib/db";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

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
  const sets: string[] = [];
  const vals: any[] = [];

  if (name && name.trim().length >= 2) {
    sets.push("name = ?"); vals.push(name.trim());
  }

  if (newPassword) {
    if (!currentPassword) return NextResponse.json({ error: "أدخل كلمة المرور الحالية" }, { status: 400 });
    const [rows] = await db.query("SELECT password FROM users WHERE id = ? LIMIT 1", [userId]) as any[];
    if (!rows[0]) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
    const valid = await bcrypt.compare(currentPassword, rows[0].password);
    if (!valid) return NextResponse.json({ error: "كلمة المرور الحالية غير صحيحة" }, { status: 400 });
    if (newPassword.length < 6) return NextResponse.json({ error: "كلمة المرور الجديدة قصيرة جداً" }, { status: 400 });
    sets.push("password = ?"); vals.push(await bcrypt.hash(newPassword, 12));
  }

  if (sets.length === 0) return NextResponse.json({ error: "لا يوجد تغييرات" }, { status: 400 });

  vals.push(userId);
  await db.query(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, vals);

  const [rows] = await db.query(
    "SELECT id, name, email, role, emailVerified, createdAt FROM users WHERE id = ? LIMIT 1",
    [userId]
  ) as any[];

  return NextResponse.json({ user: rows[0] });
}
