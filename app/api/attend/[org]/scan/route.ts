import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import {
  getAttSession, verifyTOTP,
  nowInQatar, todayInQatar, shiftTimeToday,
  FIXED_SCHEDULE,
} from "@/app/lib/attendance";

async function validateQrToken(org: string, token: string): Promise<boolean> {
  const qrSession = await prisma.attQrSession.findFirst({
    where: { org: { slug: org }, active: true },
  });
  if (!qrSession) return false;
  return verifyTOTP(qrSession.secret, token);
}

function getAttType(record: { checkIn: Date | null; checkOut: Date | null } | null): "CHECK_IN" | "CHECK_OUT" {
  if (!record || !record.checkIn) return "CHECK_IN";
  if (!record.checkOut) return "CHECK_OUT";
  return "CHECK_IN";
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const body = await req.json();
  const { action, token } = body;

  const validToken = await validateQrToken(org, token);
  if (!validToken) {
    return NextResponse.json({ error: "رمز QR منتهي أو غير صالح — سكّن الكود مجدداً" }, { status: 400 });
  }

  const today = todayInQatar();
  const now   = nowInQatar();

  if (action === "validate") {
    const session = await getAttSession("att_emp_token");
    if (!session || session.orgSlug !== org) {
      return NextResponse.json({ hasSession: false });
    }
    const employee = await prisma.attEmployee.findFirst({
      where: { id: session.employeeId as number, org: { slug: org }, active: true },
    });
    if (!employee) return NextResponse.json({ hasSession: false });

    const record = await prisma.attRecord.findFirst({
      where: { employeeId: employee.id, date: today },
    });
    return NextResponse.json({
      hasSession: true,
      name:       employee.name,
      email:      employee.email,
      employeeId: employee.id,
      attType:    getAttType(record),
    });
  }

  if (action === "check_employee") {
    const { email } = body;
    const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
    if (!organization) return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });
    const employee = await prisma.attEmployee.findFirst({
      where: { email: String(email).toLowerCase().trim(), organizationId: organization.id, active: true },
    });
    if (!employee) return NextResponse.json({ error: "البريد غير موجود" }, { status: 404 });
    return NextResponse.json({ deviceBound: employee.deviceBound });
  }

  if (action === "record") {
    const session = await getAttSession("att_emp_token");
    if (!session || session.orgSlug !== org) {
      return NextResponse.json({ error: "انتهت جلستك — سجّل دخولك مجدداً" }, { status: 401 });
    }

    const employee = await prisma.attEmployee.findFirst({
      where: { id: session.employeeId as number, org: { slug: org }, active: true },
    });
    if (!employee) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });

    const org_ = await prisma.attOrganization.findUnique({ where: { slug: org } });
    if (!org_) return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });

    const record  = await prisma.attRecord.findFirst({
      where: { employeeId: employee.id, date: today },
    });
    const attType = getAttType(record);
    const LATE_TOLE = org_.lateToleranceMins;

    if (attType === "CHECK_IN") {
      // Block only if too early (before 06:00)
      const earliest = shiftTimeToday("06:00");
      if (now < earliest) {
        return NextResponse.json({ error: "تسجيل الحضور لا يبدأ قبل الساعة 6:00 صباحاً" }, { status: 400 });
      }

      const checkInRef  = shiftTimeToday(FIXED_SCHEDULE.checkInRef); // 08:00
      const rawLate     = Math.round((now.getTime() - checkInRef.getTime()) / 60_000);
      const lateMinutes = Math.max(0, rawLate - LATE_TOLE);
      const status      = lateMinutes > 0 ? "LATE" : "PRESENT";

      await prisma.attRecord.upsert({
        where:  { employeeId_date: { employeeId: employee.id, date: today } },
        create: { organizationId: org_.id, employeeId: employee.id, date: today, checkIn: now, status, lateMinutes },
        update: { checkIn: now, status, lateMinutes },
      });

    } else {
      // CHECK_OUT — need at least 30 min since check-in
      if (record?.checkIn) {
        const minsSince = Math.round((now.getTime() - record.checkIn.getTime()) / 60_000);
        if (minsSince < 30) {
          return NextResponse.json({
            error: `لا يمكن تسجيل الانصراف — مرّ ${minsSince} دقيقة فقط (الحد الأدنى 30 دقيقة)`,
          }, { status: 400 });
        }
      }

      const checkOutRef   = shiftTimeToday(FIXED_SCHEDULE.checkOutRef); // 21:30
      const overtimeMinutes = record?.checkIn
        ? Math.max(0, Math.round((now.getTime() - checkOutRef.getTime()) / 60_000))
        : 0;

      await prisma.attRecord.update({
        where: { employeeId_date: { employeeId: employee.id, date: today } },
        data:  { checkOut: now, overtimeMinutes },
      });
    }

    return NextResponse.json({ ok: true, attType, name: employee.name });
  }

  return NextResponse.json({ error: "طلب غير معروف" }, { status: 400 });
}
