import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { verifyPassword, signAttToken } from "@/app/lib/attendance";

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { email, password } = await req.json();

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "المؤسسة غير موجودة" }, { status: 404 });

  const employee = await prisma.attEmployee.findFirst({
    where: { organizationId: organization.id, email: email.toLowerCase().trim(), active: true },
  });
  if (!employee) return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });

  const valid = await verifyPassword(password, employee.password);
  if (!valid) return NextResponse.json({ error: "البريد أو كلمة المرور غير صحيحة" }, { status: 401 });

  // Device-bound employees must verify via WebAuthn — don't issue session yet
  if (employee.deviceBound) {
    const r = NextResponse.json({ ok: true, name: employee.name, needsWebAuthn: true, employeeId: employee.id });
    r.cookies.set("att_admin_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
    return r;
  }

  // First-time (unbound) — issue session and prompt for device binding
  const token = await signAttToken(
    { orgSlug: org, orgId: organization.id, employeeId: employee.id, role: "EMPLOYEE" },
    "12h"
  );

  const res = NextResponse.json({ ok: true, name: employee.name, needsBinding: true });
  res.cookies.set("att_emp_token", token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === "production",
    sameSite: "strict",
    path:     "/",
    maxAge:   60 * 60 * 12,
  });
  res.cookies.set("att_admin_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
  return res;
}
