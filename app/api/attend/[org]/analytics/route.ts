import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  const [totalEmployees, activeToday, lateToday, totalOvertimeResult] = await Promise.all([
    prisma.attEmployee.count({ where: { organizationId: organization.id, active: true } }),

    prisma.attRecord.count({
      where: { organizationId: organization.id, date: today, checkIn: { not: null } },
    }),

    prisma.attRecord.count({
      where: { organizationId: organization.id, date: today, status: "LATE" },
    }),

    prisma.attRecord.aggregate({
      where:  { organizationId: organization.id },
      _sum:   { overtimeMinutes: true },
    }),
  ]);

  const absentToday = totalEmployees - activeToday;

  return NextResponse.json({
    totalEmployees,
    presentToday: activeToday,
    absentToday:  Math.max(0, absentToday),
    lateToday,
    totalOvertimeHours: Math.round((totalOvertimeResult._sum.overtimeMinutes ?? 0) / 60),
  });
}
