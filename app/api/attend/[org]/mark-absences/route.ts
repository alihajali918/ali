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

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  yesterday.setHours(0, 0, 0, 0);

  for (const emp of employees) {
    if (!emp.shift) continue;

    const startDate = new Date(emp.createdAt);
    startDate.setHours(0, 0, 0, 0);

    // Collect all expected workdays for this employee in one pass
    const expectedDays: Date[] = [];
    for (let day = new Date(yesterday); day >= startDate; day.setDate(day.getDate() - 1)) {
      const day_ = new Date(day);
      if (isArchived(day_)) continue;
      if (emp.shift.workDays.includes(day_.getDay().toString())) {
        expectedDays.push(day_);
      }
    }
    if (expectedDays.length === 0) continue;

    // Fetch all existing records in range in ONE query
    const existing = await prisma.attRecord.findMany({
      where: {
        employeeId: emp.id,
        date: { gte: startDate, lte: yesterday },
      },
      select: { date: true },
    });
    const existingSet = new Set(existing.map(r => r.date.toISOString().slice(0, 10)));

    // Batch-create all missing absent days
    const toCreate = expectedDays
      .filter(d => !existingSet.has(d.toISOString().slice(0, 10)))
      .map(d => ({
        organizationId: organization.id,
        employeeId:     emp.id,
        date:           d,
        status:         "ABSENT" as const,
      }));

    if (toCreate.length > 0) {
      await prisma.attRecord.createMany({ data: toCreate, skipDuplicates: true });
      marked += toCreate.length;
    }
  }

  return NextResponse.json({ ok: true, marked });
}
