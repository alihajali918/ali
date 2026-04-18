import { NextRequest, NextResponse } from "next/server";
import { generate, generateSecret } from "otplib";

const STEP = 15;
import { db as prisma } from "@/app/lib/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;

  const organization = await prisma.attOrganization.findUnique({ where: { slug: org } });
  if (!organization) return NextResponse.json({ error: "غير موجود" }, { status: 404 });

  let qrSession = await prisma.attQrSession.findUnique({ where: { organizationId: organization.id } });
  if (!qrSession) {
    qrSession = await prisma.attQrSession.create({
      data: { organizationId: organization.id, secret: generateSecret() },
    });
  }

  const token = await generate({ secret: qrSession.secret });
  const host  = req.headers.get("host") ?? "alihajali.com";
  const proto = process.env.NODE_ENV === "production" ? "https" : "http";
  const url   = `${proto}://${host}/attend/${org}/scan?t=${token}`;

  const remaining = STEP - (Math.floor(Date.now() / 1000) % STEP);
  return NextResponse.json({ url, remaining });
}
