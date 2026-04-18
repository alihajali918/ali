import { NextRequest, NextResponse } from "next/server";
import { generateAuthenticationOptions } from "@simplewebauthn/server";
import { db as prisma } from "@/app/lib/db";
import { getRpId } from "@/app/lib/attendance";

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { email } = await req.json();

  const employee = await prisma.attEmployee.findFirst({
    where: { email, org: { slug: org }, active: true },
  });
  if (!employee || !employee.credentialId) {
    return NextResponse.json({ error: "الجهاز غير مربوط، تواصل مع المدير" }, { status: 400 });
  }

  const host  = req.headers.get("host") ?? "localhost";
  const rpID  = getRpId(host);

  const options = await generateAuthenticationOptions({
    rpID,
    userVerification: "required",
    allowCredentials: [{ id: employee.credentialId }],
  });

  // Store challenge temporarily
  await prisma.attEmployee.update({
    where: { id: employee.id },
    data:  { notes: options.challenge } as never,
  });

  return NextResponse.json({ ...options, employeeId: employee.id });
}
