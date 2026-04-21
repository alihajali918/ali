import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { hashPassword, verifyPassword } from "@/app/lib/attendance";
import { randomBytes } from "crypto";

export async function POST(req: NextRequest) {
  const { ownerEmail, ownerPassword, name, slug } = await req.json();

  // Verify owner credentials before allowing org creation
  const validEmail = (ownerEmail ?? "").toLowerCase().trim() ===
    (process.env.OWNER_EMAIL ?? "").toLowerCase();
  const validPass  = validEmail && await verifyPassword(
    ownerPassword ?? "",
    process.env.OWNER_PASS_HASH ?? ""
  );

  if (!validEmail || !validPass) {
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  if (!name?.trim() || !slug?.trim()) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return NextResponse.json({ error: "الـ slug يقبل فقط أحرف إنجليزية صغيرة وأرقام وشرطة" }, { status: 400 });
  }

  const existing = await prisma.attOrganization.findUnique({ where: { slug } });
  if (existing) {
    return NextResponse.json({ error: "هذا الرابط مستخدم مسبقاً" }, { status: 409 });
  }

  // adminSecret is no longer used for login but required by schema
  const dummySecret = await hashPassword(randomBytes(32).toString("hex"));
  const org = await prisma.attOrganization.create({
    data: { name: name.trim(), slug, adminSecret: dummySecret },
  });

  return NextResponse.json({ ok: true, slug: org.slug });
}
