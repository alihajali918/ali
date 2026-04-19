import { NextRequest, NextResponse } from "next/server";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";
import { generateSecret, generate } from "otplib";

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { searchParams } = new URL(req.url);
  const dk = searchParams.get("dk"); // display key

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

  const token     = await generate({ secret: qrSession.secret });
  const host      = req.headers.get("host") ?? "alihajali.com";
  const proto     = process.env.NODE_ENV === "production" ? "https" : "http";
  const url       = `${proto}://${host}/attend/${org}/scan?t=${token}`;
  const remaining = 30 - (Math.floor(Date.now() / 1000) % 30);

  return NextResponse.json({ url, remaining });
}
