import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession, verifyTOTP } from "@/app/lib/attendance";

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
  return "CHECK_IN"; // new day cycle reset handled by date filter
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const body = await req.json();
  const { action, token } = body;

  // Validate QR token first
  const validToken = await validateQrToken(org, token);
  if (!validToken) {
    return NextResponse.json({ error: "رمز QR منتهي أو غير صالح — سكّن الكود مجدداً" }, { status: 400 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (action === "validate") {
    // Check if employee has a valid session
    const session = await getAttSession("att_emp_token");
    if (!session || session.orgSlug !== org) {
      return NextResponse.json({ hasSession: false });
    }

    const empId = session.employeeId as number;
    const employee = await prisma.attEmployee.findFirst({
      where: { id: empId, org: { slug: org }, active: true },
    });
    if (!employee) return NextResponse.json({ hasSession: false });

    const record = await prisma.attRecord.findFirst({
      where: { employeeId: employee.id, date: today },
    });

    return NextResponse.json({
      hasSession:  true,
      name:        employee.name,
      email:       employee.email,
      employeeId:  employee.id,
      attType:     getAttType(record),
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

    const empId = session.employeeId as number;
    const employee = await prisma.attEmployee.findFirst({
      where: { id: empId, org: { slug: org }, active: true },
      include: { shift: true },
    });
    if (!employee) return NextResponse.json({ error: "الموظف غير موجود" }, { status: 404 });

    const now    = new Date();
    const record = await prisma.attRecord.findFirst({
      where: { employeeId: employee.id, date: today },
    });

    const attType = getAttType(record);
    const org_    = await prisma.attOrganization.findUnique({ where: { slug: org } });
    if (!org_) return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });

    const WINDOW    = org_.attendanceWindowMins;
    const LATE_TOLE = org_.lateToleranceMins;

    // ── Shift time window validation ──────────────────────
    if (employee.shift) {
      const parseTime = (t: string) => {
        const [h, m] = t.split(":").map(Number);
        const d = new Date(today); d.setHours(h, m, 0, 0); return d;
      };
      const fmt = (d: Date) => d.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });

      if (attType === "CHECK_IN") {
        // Only block check-in if employee is too early (before window opens).
        // Late arrivals are always allowed — they get marked LATE with minutes counted.
        const earliest = new Date(parseTime(employee.shift.startTime).getTime() - WINDOW * 60000);
        if (now < earliest) {
          return NextResponse.json({
            error: `تسجيل الحضور لا يبدأ قبل ${fmt(earliest)}`,
          }, { status: 400 });
        }
      } else {
        // Check-out: block if too early before shift end.
        // Allow any time after window opens (late check-out = overtime).
        const earliest = new Date(parseTime(employee.shift.endTime).getTime() - WINDOW * 60000);
        if (now < earliest) {
          return NextResponse.json({
            error: `تسجيل الانصراف لا يبدأ قبل ${fmt(earliest)}`,
          }, { status: 400 });
        }
      }
    }

    if (attType === "CHECK_IN") {
      let lateMinutes = 0;
      if (employee.shift) {
        const [h, m]    = employee.shift.startTime.split(":").map(Number);
        const shiftStart = new Date(today);
        shiftStart.setHours(h, m, 0, 0);
        const rawLate = Math.round((now.getTime() - shiftStart.getTime()) / 60000);
        lateMinutes = Math.max(0, rawLate - LATE_TOLE);
      }
      const status = lateMinutes > 0 ? "LATE" : "PRESENT";

      await prisma.attRecord.upsert({
        where:  { employeeId_date: { employeeId: employee.id, date: today } },
        create: { organizationId: org_.id, employeeId: employee.id, date: today, checkIn: now, status, lateMinutes },
        update: { checkIn: now, status, lateMinutes },
      });
    } else {
      // CHECK_OUT — enforce minimum 30 min since check-in
      if (record?.checkIn) {
        const minsSince = Math.round((now.getTime() - record.checkIn.getTime()) / 60000);
        if (minsSince < 30) {
          return NextResponse.json({
            error: `لا يمكن تسجيل الانصراف — مرّ ${minsSince} دقيقة فقط من الحضور (الحد الأدنى 30 دقيقة)`,
          }, { status: 400 });
        }
      }
      let overtimeMinutes = 0;
      if (employee.shift && record?.checkIn) {
        const [h, m]   = employee.shift.endTime.split(":").map(Number);
        const shiftEnd  = new Date(today);
        shiftEnd.setHours(h, m, 0, 0);
        overtimeMinutes = Math.max(0, Math.round((now.getTime() - shiftEnd.getTime()) / 60000));
      }
      await prisma.attRecord.update({
        where: { employeeId_date: { employeeId: employee.id, date: today } },
        data:  { checkOut: now, overtimeMinutes },
      });
    }

    return NextResponse.json({ ok: true, attType, name: employee.name });
  }

  return NextResponse.json({ error: "طلب غير معروف" }, { status: 400 });
}
