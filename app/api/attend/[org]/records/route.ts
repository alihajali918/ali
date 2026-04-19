import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

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
