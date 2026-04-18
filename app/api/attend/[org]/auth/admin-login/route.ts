import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { verifyPassword, signAttToken } from "@/app/lib/attendance";

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { password } = await req.json();

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });

  const valid = await verifyPassword(password, organization.adminSecret);
  if (!valid) return NextResponse.json({ error: "كلمة المرور غير صحيحة" }, { status: 401 });

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
  return res;
}
