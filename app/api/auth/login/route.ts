import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || "ali-secret-2026"
);

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
    }

    const token = await new SignJWT({ id: user.id, email: user.email, role: user.role })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("7d")
      .sign(SECRET);

    const res = NextResponse.json({ ok: true, name: user.name });
    res.cookies.set("admin_token", token, {
      httpOnly: true,
      maxAge:   60 * 60 * 24 * 7,
      path:     "/",
      sameSite: "lax",
    });
    return res;
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
