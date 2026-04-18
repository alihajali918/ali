import { NextRequest, NextResponse } from "next/server";
import { generateRegistrationOptions } from "@simplewebauthn/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession, getRpId } from "@/app/lib/attendance";

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_emp_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const employee = await prisma.attEmployee.findUnique({
    where: { id: session.employeeId as number },
    include: { org: true },
  });
  if (!employee) return NextResponse.json({ error: "موظف غير موجود" }, { status: 404 });
  if (employee.deviceBound) {
    return NextResponse.json({ error: "الجهاز مربوط مسبقاً" }, { status: 400 });
  }

  const host  = req.headers.get("host") ?? "localhost";
  const rpID  = getRpId(host);
  const rpName = employee.org.name ?? "Attendance";

  const options = await generateRegistrationOptions({
    rpName,
    rpID,
    userID:          new TextEncoder().encode(String(employee.id)),
    userName:        employee.email,
    userDisplayName: employee.name,
    authenticatorSelection: {
      authenticatorAttachment: "platform",  // built-in biometric only
      userVerification: "required",
      residentKey: "preferred",
    },
    excludeCredentials: employee.credentialId
      ? [{ id: employee.credentialId }]
      : [],
  });

  // Store challenge temporarily in DB (simple approach)
  await prisma.attEmployee.update({
    where: { id: employee.id },
    data:  { notes: options.challenge } as never,
  });

  return NextResponse.json(options);
}
