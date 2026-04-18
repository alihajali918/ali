import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { hashPassword } from "@/app/lib/attendance";

export async function POST(req: NextRequest) {
  const { name, slug, password } = await req.json();

  if (!name?.trim() || !slug?.trim() || !password?.trim()) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }
  if (password.length < 8) {
    return NextResponse.json({ error: "كلمة المرور 8 أحرف على الأقل" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "الـ slug يقبل فقط أحرف إنجليزية صغيرة وأرقام وشرطة" }, { status: 400 });
  }

  const existing = await prisma.attOrganization.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "هذا الرابط مستخدم مسبقاً" }, { status: 409 });
  }

  const hashed = await hashPassword(password);
  const org = await prisma.attOrganization.create({
    data: { name: name.trim(), slug, adminSecret: hashed },
  });

  return NextResponse.json({ ok: true, slug: org.slug });
}
