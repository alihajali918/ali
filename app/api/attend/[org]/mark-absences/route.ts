import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

// Marks absent records for employees who had a workday but never checked in.
// Checks up to the past 7 days (skips today).
export async function POST(_: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const employees = await prisma.attEmployee.findMany({
    where: { organizationId: organization.id, active: true, shiftId: { not: null } },
    include: { shift: true },
  });

  let marked = 0;

  // Fetch archived months for this org so we skip them
  const archivedMonths = await prisma.attMonthArchive.findMany({
    where: { organizationId: organization.id },
    select: { year: true, month: true },
    distinct: ["year", "month"],
  });
  const isArchived = (d: Date) =>
    archivedMonths.some(a => a.year === d.getFullYear() && a.month === d.getMonth() + 1);

  for (const emp of employees) {
    if (!emp.shift) continue;

    // Walk backwards from yesterday all the way to the employee's creation date
    const startDate = new Date(emp.createdAt);
    startDate.setHours(0, 0, 0, 0);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    for (let day = new Date(yesterday); day >= startDate; day.setDate(day.getDate() - 1)) {
      const day_ = new Date(day);
      if (isArchived(day_)) continue; // skip months already archived

      const dayOfWeek = day_.getDay().toString(); // "0"=Sun … "6"=Sat
      if (!emp.shift.workDays.includes(dayOfWeek)) continue;

      const existing = await prisma.attRecord.findUnique({
        where: { employeeId_date: { employeeId: emp.id, date: day_ } },
      });
      if (existing) continue;

      await prisma.attRecord.create({
        data: {
          organizationId: organization.id,
          employeeId:     emp.id,
          date:           day_,
          status:         "ABSENT",
        },
      });
      marked++;
    }
  }

  return NextResponse.json({ ok: true, marked });
}
