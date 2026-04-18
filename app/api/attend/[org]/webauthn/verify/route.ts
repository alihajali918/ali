import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
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

  const body          = await req.json();
  const host          = req.headers.get("host") ?? "localhost";
  const rpID          = getRpId(host);
  const expectedOrigin = `https://${host}`;
  const challenge     = (employee as never as { notes: string }).notes;

  try {
    const verification = await verifyRegistrationResponse({
      response:        body,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID:    rpID,
      requireUserVerification: true,
    });

    if (!verification.verified || !verification.registrationInfo) {
      return NextResponse.json({ error: "فشل التحقق" }, { status: 400 });
    }

    const { credential } = verification.registrationInfo;

    await prisma.attEmployee.update({
      where: { id: employee.id },
      data: {
        credentialId:        credential.id,
        credentialPublicKey: Buffer.from(credential.publicKey),
        credentialCounter:   credential.counter,
        deviceBound:         true,
      } as never,
    });

    return NextResponse.json({ ok: true, message: "تم ربط الجهاز بنجاح" });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "خطأ غير معروف";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
