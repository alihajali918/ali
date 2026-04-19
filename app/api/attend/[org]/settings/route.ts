import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

async function guard(org: string) {
  const s = await getAttSession("att_admin_token");
  return s?.orgSlug === org ? s : null;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  // Admin session required for sensitive fields
  if (!await guard(org)) {
    return NextResponse.json({ exists: true, name: organization.name });
  }

  return NextResponse.json({
    name:                 organization.name,
    slug:                 organization.slug,
    email:                organization.email,
    phone:                organization.phone,
    address:              organization.address,
    plan:                 organization.plan,
    attendanceWindowMins: organization.attendanceWindowMins,
    lateToleranceMins:    organization.lateToleranceMins,
    displayKey:           organization.displayKey,
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  if (!await guard(org)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { name, email, phone, address, attendanceWindowMins, lateToleranceMins } = await req.json();

  const updated = await prisma.attOrganization.update({
    where: { slug: org },
    data: {
      ...(name    !== undefined && { name }),
      ...(email   !== undefined && { email }),
      ...(phone   !== undefined && { phone }),
      ...(address !== undefined && { address }),
      ...(attendanceWindowMins !== undefined && { attendanceWindowMins: Number(attendanceWindowMins) }),
      ...(lateToleranceMins   !== undefined && { lateToleranceMins:    Number(lateToleranceMins) }),
    },
  });

  return NextResponse.json({ ok: true, name: updated.name });
}
