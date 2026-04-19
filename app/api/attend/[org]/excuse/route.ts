import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

// GET — employee fetches their own absent records (for excuse submission)
export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_emp_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const records = await prisma.attRecord.findMany({
    where: { employeeId: session.employeeId as number, status: "ABSENT" },
    orderBy: { date: "desc" },
    take: 30,
    select: { id: true, date: true, excuseType: true, excuseNote: true, excuseApproved: true },
  });

  return NextResponse.json({ records });
}

// POST — employee submits excuse for an absence
export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_emp_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { recordId, excuseType, excuseNote, excuseFile } = await req.json();
  if (!recordId || !excuseType) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  // Verify the record belongs to this employee
  const record = await prisma.attRecord.findFirst({
    where: { id: Number(recordId), employeeId: session.employeeId as number },
  });
  if (!record) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });
  if (record.excuseApproved === true) {
    return NextResponse.json({ error: "العذر موافق عليه مسبقاً" }, { status: 400 });
  }

  // excuseFile is a base64 data URL — limit to ~2MB (base64 ~2.7MB text)
  if (excuseFile && excuseFile.length > 2_800_000) {
    return NextResponse.json({ error: "حجم الملف كبير جداً (الحد 2 ميغابايت)" }, { status: 400 });
  }

  const updated = await prisma.attRecord.update({
    where: { id: Number(recordId) },
    data: {
      excuseType,
      excuseNote: excuseNote ?? null,
      excuseFile: excuseFile ?? null,
      excuseApproved: null, // reset to pending
    },
  });

  return NextResponse.json({ ok: true, id: updated.id });
}

// PATCH — admin approves or rejects excuse
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { recordId, approved } = await req.json();

  const record = await prisma.attRecord.findFirst({
    where: { id: Number(recordId), org: { slug: org } },
  });
  if (!record) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });

  await prisma.attRecord.update({
    where: { id: Number(recordId) },
    data: { excuseApproved: Boolean(approved) },
  });

  return NextResponse.json({ ok: true });
}
