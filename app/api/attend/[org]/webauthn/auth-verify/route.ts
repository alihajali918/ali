import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse } from "@simplewebauthn/server";
import { db as prisma } from "@/app/lib/db";
import { getRpId, signAttToken } from "@/app/lib/attendance";

export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { employeeId, response } = await req.json();

  const employee = await prisma.attEmployee.findUnique({
    where: { id: Number(employeeId) },
    include: { org: true },
  });

  if (!employee?.credentialId || !employee.credentialPublicKey) {
    return NextResponse.json({ error: "بيانات الجهاز غير موجودة" }, { status: 400 });
  }
  if (employee.org.slug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const host           = req.headers.get("host") ?? "localhost";
  const rpID           = getRpId(host);
  const expectedOrigin = `https://${host}`;
  const challenge      = (employee as never as { challenge: string }).challenge;

  try {
    const verification = await verifyAuthenticationResponse({
      response,
      expectedChallenge: challenge,
      expectedOrigin,
      expectedRPID:      rpID,
      requireUserVerification: true,
      credential: {
        id:         employee.credentialId,
        publicKey:  new Uint8Array(employee.credentialPublicKey),
        counter:    employee.credentialCounter,
      },
    });

    if (!verification.verified) {
      return NextResponse.json({ error: "فشل التحقق" }, { status: 401 });
    }

    // Update counter (replay attack protection)
    await prisma.attEmployee.update({
      where: { id: employee.id },
      data:  { credentialCounter: verification.authenticationInfo.newCounter } as never,
    });

    // Issue session token
    const token = await signAttToken(
      { employeeId: employee.id, orgSlug: org, role: employee.role },
      "12h"
    );

    const res = NextResponse.json({ ok: true, name: employee.name });
    res.cookies.set("att_emp_token", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "strict",
      path:     "/",
      maxAge:   60 * 60 * 12,
    });
    res.cookies.set("att_admin_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 0 });
    return res;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "خطأ غير معروف";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
