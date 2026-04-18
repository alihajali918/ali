import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession, hashPassword } from "@/app/lib/attendance";

async function adminGuard(req: NextRequest, org: string) {
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) return null;
  return session;
}

// GET — list employees
export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  if (!await adminGuard(req, org)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const employees = await prisma.attEmployee.findMany({
    where:   { org: { slug: org } },
    include: { shift: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({
    employees: employees.map(e => ({
      ...e,
      password:            undefined,
      credentialPublicKey: undefined,
    })),
  });
}

// POST — create employee
export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  if (!await adminGuard(req, org)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });

  const { name, email, password, shiftId } = await req.json();
  if (!name || !email || !password) {
    return NextResponse.json({ error: "الاسم والإيميل وكلمة المرور مطلوبة" }, { status: 400 });
  }

  const hashed = await hashPassword(password);
  const employee = await prisma.attEmployee.create({
    data: {
      organizationId: organization.id,
      name, email,
      password: hashed,
      ...(shiftId && { shiftId: Number(shiftId) }),
    },
  });

  return NextResponse.json({ ...employee, password: undefined });
}

// PATCH — update employee
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  if (!await adminGuard(req, org)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id, name, email, shiftId, active, resetDevice } = await req.json();

  const data: Record<string, unknown> = {};
  if (name    !== undefined) data.name    = name;
  if (email   !== undefined) data.email   = email;
  if (active  !== undefined) data.active  = active;
  if (shiftId !== undefined) data.shiftId = shiftId ? Number(shiftId) : null;

  // Reset WebAuthn binding
  if (resetDevice) {
    data.credentialId        = null;
    data.credentialPublicKey = null;
    data.credentialCounter   = 0;
    data.deviceBound         = false;
  }

  const updated = await prisma.attEmployee.update({
    where: { id: Number(id) },
    data,
  });

  return NextResponse.json({ ...updated, password: undefined, credentialPublicKey: undefined });
}

// DELETE — remove employee
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  if (!await adminGuard(req, org)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { id } = await req.json();
  await prisma.attEmployee.delete({ where: { id: Number(id) } });
  return NextResponse.json({ ok: true });
}
