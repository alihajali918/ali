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

  for (const emp of employees) {
    if (!emp.shift) continue;

    // Check last 7 days (excluding today)
    for (let daysAgo = 1; daysAgo <= 7; daysAgo++) {
      const day = new Date();
      day.setDate(day.getDate() - daysAgo);
      day.setHours(0, 0, 0, 0);

      const dayOfWeek = day.getDay().toString(); // "0"=Sun … "6"=Sat
      if (!emp.shift.workDays.includes(dayOfWeek)) continue;

      const existing = await prisma.attRecord.findUnique({
        where: { employeeId_date: { employeeId: emp.id, date: day } },
      });
      if (existing) continue;

      await prisma.attRecord.create({
        data: {
          organizationId: organization.id,
          employeeId:     emp.id,
          date:           day,
          status:         "ABSENT",
        },
      });
      marked++;
    }
  }

  return NextResponse.json({ ok: true, marked });
}
