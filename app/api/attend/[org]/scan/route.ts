import { NextRequest, NextResponse } from "next/server";
import { verify } from "otplib";

const STEP = 15;
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

async function validateQrToken(org: string, token: string): Promise<boolean> {
  const qrSession = await prisma.attQrSession.findFirst({
    where: { org: { slug: org }, active: true },
  });
  if (!qrSession) return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result: any = await verify({ token: String(token), secret: qrSession.secret });
  return result === true || result?.isValid === true;
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
      employeeId:  employee.id,
      attType:     getAttType(record),
    });
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

    if (attType === "CHECK_IN") {
      // Calculate if late
      let lateMinutes = 0;
      if (employee.shift) {
        const [h, m]    = employee.shift.startTime.split(":").map(Number);
        const shiftStart = new Date(today);
        shiftStart.setHours(h, m, 0, 0);
        lateMinutes = Math.max(0, Math.round((now.getTime() - shiftStart.getTime()) / 60000));
      }
      const status = lateMinutes > 0 ? "LATE" : "PRESENT";

      await prisma.attRecord.upsert({
        where:  { employeeId_date: { employeeId: employee.id, date: today } },
        create: { organizationId: org_.id, employeeId: employee.id, date: today, checkIn: now, status, lateMinutes },
        update: { checkIn: now, status, lateMinutes },
      });
    } else {
      // CHECK_OUT — calculate overtime
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
