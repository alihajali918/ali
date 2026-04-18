import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

async function getOrg(slug: string) {
  return prisma.attOrganization.findUnique({ where: { slug } });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const organization = await getOrg(org);
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const shifts = await prisma.attShift.findMany({
    where: { organizationId: organization.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ shifts });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const organization = await getOrg(org);
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const { name, startTime, endTime, workDays } = await req.json();
  if (!name?.trim() || !startTime || !endTime) {
    return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
  }

  const shift = await prisma.attShift.create({
    data: { organizationId: organization.id, name: name.trim(), startTime, endTime, workDays: workDays ?? [] },
  });
  return NextResponse.json({ shift });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id, name, startTime, endTime, workDays } = await req.json();
  const shift = await prisma.attShift.update({
    where: { id },
    data: { name, startTime, endTime, workDays },
  });
  return NextResponse.json({ shift });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await req.json();
  await prisma.attShift.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
