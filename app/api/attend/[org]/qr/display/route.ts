import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession, nowInQatar } from "@/app/lib/attendance";
import { generateSecret, generate } from "otplib";
import { sendDisplayTamperAlert } from "@/app/lib/mailer";

const LEASE_MS = 45_000; // device must re-poll within 45s or lease expires

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { searchParams } = new URL(req.url);
  const dk  = searchParams.get("dk");
  const sid = searchParams.get("sid"); // unique device session ID

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  // Must have either valid admin session OR correct display key
  const session    = await getAttSession("att_admin_token");
  const validAdmin = session?.orgSlug === org;
  const validKey   = dk && organization.displayKey === dk;

  if (!validAdmin && !validKey) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  let qrSession = await prisma.attQrSession.findUnique({ where: { organizationId: organization.id } });
  if (!qrSession) {
    qrSession = await prisma.attQrSession.create({
      data: { organizationId: organization.id, secret: generateSecret() },
    });
  }

  // Single-device enforcement: check if another device holds a valid lease
  if (sid) {
    const now = new Date();
    const leaseExpired = !qrSession.displayLastSeen ||
      (now.getTime() - qrSession.displayLastSeen.getTime()) > LEASE_MS;
    const ownedByOther = qrSession.displayDeviceId && qrSession.displayDeviceId !== sid;

    if (ownedByOther && !leaseExpired) {
      const time = nowInQatar().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
      sendDisplayTamperAlert(org, time);
      return NextResponse.json({ error: "الشاشة مفتوحة على جهاز آخر" }, { status: 409 });
    }

    // Claim or renew the lease
    await prisma.attQrSession.update({
      where:  { organizationId: organization.id },
      data:   { displayDeviceId: sid, displayLastSeen: now },
    });
  }

  const token     = await generate({ secret: qrSession.secret });
  const host      = req.headers.get("host") ?? "alihajali.com";
  const proto     = process.env.NODE_ENV === "production" ? "https" : "http";
  const url       = `${proto}://${host}/attend/${org}/scan?t=${token}`;
  const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);

  return NextResponse.json({ url, remaining });
}
