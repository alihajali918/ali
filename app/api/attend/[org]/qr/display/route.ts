import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession, nowInQatar } from "@/app/lib/attendance";
import { generateSecret, generate } from "otplib";
import { sendDisplayTamperAlert } from "@/app/lib/mailer";

const LEASE_MS = 45_000;

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { searchParams } = new URL(req.url);
  const dk  = searchParams.get("dk");
  const sid = searchParams.get("sid");

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

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

  // If screen is locked → block immediately (423)
  if (qrSession.displayLocked) {
    return NextResponse.json({ error: "تم قفل الشاشة لأسباب أمنية" }, { status: 423 });
  }

  if (sid) {
    const now         = new Date();
    const leaseExpired = !qrSession.displayLastSeen ||
      (now.getTime() - qrSession.displayLastSeen.getTime()) > LEASE_MS;
    const ownedByOther = qrSession.displayDeviceId && qrSession.displayDeviceId !== sid;

    if (ownedByOther && !leaseExpired) {
      // Lock the screen and alert
      await prisma.attQrSession.update({
        where: { organizationId: organization.id },
        data:  { displayLocked: true },
      });
      const time = nowInQatar().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
      sendDisplayTamperAlert(org, time);
      return NextResponse.json({ error: "الشاشة مفتوحة على جهاز آخر" }, { status: 409 });
    }

    await prisma.attQrSession.update({
      where: { organizationId: organization.id },
      data:  { displayDeviceId: sid, displayLastSeen: now },
    });
  }

  const token     = await generate({ secret: qrSession.secret });
  const host      = req.headers.get("host") ?? "alihajali.com";
  const proto     = process.env.NODE_ENV === "production" ? "https" : "http";
  const url       = `${proto}://${host}/attend/${org}/scan?t=${token}`;
  const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);

  return NextResponse.json({ url, remaining });
}

// POST — admin unlocks the display screen
export async function POST(_: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  await prisma.attQrSession.updateMany({
    where: { organizationId: organization.id },
    data:  { displayLocked: false, displayDeviceId: null, displayLastSeen: null },
  });

  return NextResponse.json({ ok: true });
}
