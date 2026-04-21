import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { verifyPassword, signAttToken } from "@/app/lib/attendance";

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { email, password } = await req.json();

  // Only the owner email is allowed
  const ownerEmail    = process.env.OWNER_EMAIL ?? "";
  const ownerPassHash = process.env.OWNER_PASS_HASH ?? "";

  if (!email || email.toLowerCase().trim() !== ownerEmail.toLowerCase()) {
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const valid = await verifyPassword(password, ownerPassHash);
  if (!valid) {
    return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });
  }

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });

  const token = await signAttToken(
    { orgSlug: org, orgId: organization.id, role: "ADMIN" },
    "24h"
  );

  const res = NextResponse.json({ ok: true });
  res.cookies.set("att_admin_token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    path:     "/",
    maxAge:   60 * 60 * 24,
  });
  res.cookies.set("att_emp_token", "", {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "strict", path: "/", maxAge: 0,
  });
  return res;
}
