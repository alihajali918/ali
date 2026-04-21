import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession, todayInQatar, FIXED_SCHEDULE } from "@/app/lib/attendance";

export async function POST(_: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  // All active employees — no shift filter (fixed schedule)
  const employees = await prisma.attEmployee.findMany({
    where: { organizationId: organization.id, active: true },
  });

  let marked = 0;

  const archivedMonths = await prisma.attMonthArchive.findMany({
    where: { organizationId: organization.id },
    select: { year: true, month: true },
    distinct: ["year", "month"],
  });
  const isArchived = (d: Date) =>
    archivedMonths.some(a => a.year === d.getUTCFullYear() && a.month === d.getUTCMonth() + 1);

  const yesterday = new Date(todayInQatar().getTime() - 24 * 60 * 60_000);

  for (const emp of employees) {
    const startDate = new Date(emp.createdAt.getTime() + 3 * 60 * 60_000);
    startDate.setUTCHours(0, 0, 0, 0);

    const expectedDays: Date[] = [];
    for (let day = new Date(yesterday); day >= startDate; day.setDate(day.getDate() - 1)) {
      const day_ = new Date(day);
      if (isArchived(day_)) continue;
      // Use fixed workdays (Sun-Thu)
      if (FIXED_SCHEDULE.workDays.includes(day_.getUTCDay().toString())) {
        expectedDays.push(day_);
      }
    }
    if (expectedDays.length === 0) continue;

    const existing = await prisma.attRecord.findMany({
      where: { employeeId: emp.id, date: { gte: startDate, lte: yesterday } },
      select: { date: true },
    });
    const existingSet = new Set(existing.map(r => r.date.toISOString().slice(0, 10)));

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
