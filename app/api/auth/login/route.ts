import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "ali-secret-2026");

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const [rows] = await db.query("SELECT * FROM users WHERE email = ? LIMIT 1", [email]) as any[];
    const user = rows[0];
    if (!user) return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });

    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role, name: user.name })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET);

    const res = NextResponse.json({ ok: true, name: user.name, role: user.role });
    const cookieOpts = { httpOnly: true, maxAge: 60 * 60 * 24 * 7, path: "/", sameSite: "lax" as const };

    if (user.role === "admin") res.cookies.set("admin_token", token, cookieOpts);
    res.cookies.set("user_token", token, cookieOpts);
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
