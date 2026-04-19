import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession, calcMinutes } from "@/app/lib/attendance";
import { verifyTOTP } from "@/app/lib/attendance";

// POST — check-in or check-out
export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_emp_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { qrToken, action } = await req.json(); // action: "checkin" | "checkout"

  // 1. Validate QR token
  const qrSession = await prisma.attQrSession.findFirst({
    where: { org: { slug: org }, active: true },
  });
  if (!qrSession) return NextResponse.json({ error: "رمز QR غير صحيح أو منتهي الصلاحية" }, { status: 400 });
  const valid = verifyTOTP(qrSession.secret, String(qrToken));
  if (!valid) {
    return NextResponse.json({ error: "رمز QR غير صحيح أو منتهي الصلاحية" }, { status: 400 });
  }

  // 2. Get employee + shift
  const employee = await prisma.attEmployee.findUnique({
    where:   { id: session.employeeId as number },
    include: { shift: true },
  });
  if (!employee) return NextResponse.json({ error: "موظف غير موجود" }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const now   = new Date();

  // 3. Handle check-in
  if (action === "checkin") {
    const existing = await prisma.attRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });
    if (existing?.checkIn) {
      return NextResponse.json({ error: "سجّلت حضورك مسبقاً اليوم" }, { status: 400 });
    }

    let lateMinutes = 0;
    let status: "PRESENT" | "LATE" = "PRESENT";
    if (employee.shift) {
      const [sh, sm] = employee.shift.startTime.split(":").map(Number);
      const shiftStart = new Date(now);
      shiftStart.setHours(sh, sm, 0, 0);
      lateMinutes = Math.max(0, Math.floor((now.getTime() - shiftStart.getTime()) / 60000));
      if (lateMinutes > 10) status = "LATE";
    }

    const record = await prisma.attRecord.upsert({
      where:  { employeeId_date: { employeeId: employee.id, date: today } },
      create: { organizationId: employee.organizationId, employeeId: employee.id, date: today, checkIn: now, status, lateMinutes },
      update: { checkIn: now, status, lateMinutes },
    });

    return NextResponse.json({
      ok: true,
      message: lateMinutes > 0 ? `تأخرت ${lateMinutes} دقيقة` : "تم تسجيل الحضور",
      record,
    });
  }

  // 4. Handle check-out
  if (action === "checkout") {
    const record = await prisma.attRecord.findUnique({
      where: { employeeId_date: { employeeId: employee.id, date: today } },
    });
    if (!record?.checkIn) {
      return NextResponse.json({ error: "لم تسجل حضورك بعد" }, { status: 400 });
    }
    if (record.checkOut) {
      return NextResponse.json({ error: "سجّلت الانصراف مسبقاً" }, { status: 400 });
    }

    let overtimeMinutes = 0;
    if (employee.shift) {
      const { overtimeMinutes: ot } = calcMinutes(record.checkIn, now, employee.shift);
      overtimeMinutes = ot;
    }

    const updated = await prisma.attRecord.update({
      where: { id: record.id },
      data:  { checkOut: now, overtimeMinutes },
    });

    return NextResponse.json({
      ok: true,
      message: overtimeMinutes > 0 ? `أوفرتايم ${overtimeMinutes} دقيقة` : "تم تسجيل الانصراف",
      record: updated,
    });
  }

  return NextResponse.json({ error: "action غير معروف" }, { status: 400 });
}

// GET — fetch records (admin)
export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const date  = searchParams.get("date");
  const from  = searchParams.get("from");
  const to    = searchParams.get("to");
  const empId = searchParams.get("employeeId");

  let dateFilter = {};
  if (date) {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    dateFilter = { date: d };
  } else if (from && to) {
    dateFilter = { date: { gte: new Date(from), lte: new Date(to) } };
  }

  const records = await prisma.attRecord.findMany({
    where: {
      org: { slug: org },
      ...(empId && { employeeId: Number(empId) }),
      ...dateFilter,
    },
    include: { employee: { select: { name: true, email: true } } },
    orderBy: { date: "desc" },
    take: 200,
  });

  return NextResponse.json({ records });
}

// PATCH — admin manual edit
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const { id, checkIn, checkOut, status, notes } = await req.json();

  // Verify record belongs to this org before mutating
  const existing = await prisma.attRecord.findFirst({
    where: { id: Number(id), org: { slug: org } },
  });
  if (!existing) return NextResponse.json({ error: "السجل غير موجود" }, { status: 404 });

  const updated = await prisma.attRecord.update({
    where: { id: Number(id) },
    data:  {
      ...(checkIn  && { checkIn:  new Date(checkIn) }),
      ...(checkOut && { checkOut: new Date(checkOut) }),
      ...(status   && { status }),
      ...(notes    !== undefined && { notes }),
      editedBy: session.email as string,
    },
  });

  return NextResponse.json(updated);
}
