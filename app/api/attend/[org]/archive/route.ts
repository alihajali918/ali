import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

async function guard(org: string) {
  const s = await getAttSession("att_admin_token");
  return s?.orgSlug === org ? s : null;
}

// GET — list archived months
export async function GET(_: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  if (!await guard(org)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  // Distinct archived months for this org
  const months = await prisma.attMonthArchive.groupBy({
    by: ["year", "month"],
    where: { organizationId: organization.id },
    _sum: {
      presentDays: true, lateDays: true, absentDays: true,
      excusedDays: true, lateMinutes: true, overtimeMinutes: true,
      totalDue: true,
    },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  // Per-month employee detail
  const detail = await prisma.attMonthArchive.findMany({
    where: { organizationId: organization.id },
    include: { employee: { select: { name: true, email: true } } },
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  return NextResponse.json({ months, detail });
}

// POST — archive a specific month, then delete its raw records
export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  if (!await guard(org)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { year, month } = await req.json(); // month: 1–12

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  // Date range for this month
  const from = new Date(year, month - 1, 1);
  const to   = new Date(year, month, 0, 23, 59, 59); // last day of month

  // Check not archiving current month
  const now = new Date();
  if (year === now.getFullYear() && month === now.getMonth() + 1) {
    return NextResponse.json({ error: "لا يمكن أرشفة الشهر الحالي" }, { status: 400 });
  }

  // Get all records for this month
  const records = await prisma.attRecord.findMany({
    where: { organizationId: organization.id, date: { gte: from, lte: to } },
    include: { employee: true },
  });

  if (records.length === 0) {
    return NextResponse.json({ error: "لا توجد سجلات لهذا الشهر" }, { status: 400 });
  }

  // Group by employee
  const byEmployee: Record<number, typeof records> = {};
  for (const r of records) {
    if (!byEmployee[r.employeeId]) byEmployee[r.employeeId] = [];
    byEmployee[r.employeeId].push(r);
  }

  // Archive each employee
  const archived: number[] = [];
  for (const [empIdStr, recs] of Object.entries(byEmployee)) {
    const empId   = Number(empIdStr);
    const emp     = recs[0].employee;
    const salary  = emp.salary ? Number(emp.salary) : null;
    const otRate  = emp.overtimeRate
      ? Number(emp.overtimeRate)
      : salary ? salary / 160 * 1.5 : null;

    const presentDays     = recs.filter(r => r.status === "PRESENT").length;
    const lateDays        = recs.filter(r => r.status === "LATE").length;
    const absentDays      = recs.filter(r => r.status === "ABSENT" && r.excuseApproved !== true).length;
    const excusedDays     = recs.filter(r => r.status === "ABSENT" && r.excuseApproved === true).length;
    const lateMinutes     = recs.reduce((s, r) => s + r.lateMinutes, 0);
    const overtimeMinutes = recs.reduce((s, r) => s + r.overtimeMinutes, 0);

    const overtimePay = otRate ? Math.round(overtimeMinutes / 60 * otRate * 100) / 100 : null;
    const totalDue    = salary !== null
      ? Math.round(((salary) + (overtimePay ?? 0)) * 100) / 100
      : null;

    await prisma.attMonthArchive.upsert({
      where: { employeeId_year_month: { employeeId: empId, year, month } },
      create: {
        organizationId: organization.id, employeeId: empId, year, month,
        presentDays, lateDays, absentDays, excusedDays,
        lateMinutes, overtimeMinutes,
        salarySnapshot: salary, overtimePay, totalDue,
      },
      update: {
        presentDays, lateDays, absentDays, excusedDays,
        lateMinutes, overtimeMinutes,
        salarySnapshot: salary, overtimePay, totalDue,
      },
    });
    archived.push(empId);
  }

  return NextResponse.json({ ok: true, employeesArchived: archived.length });
}
