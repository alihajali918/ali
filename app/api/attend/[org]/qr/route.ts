import { NextRequest, NextResponse } from "next/server";
import { generate, verify, generateSecret } from "otplib";
import { db as prisma } from "@/app/lib/db";
import { getAttSession } from "@/app/lib/attendance";

const STEP = 15;
const remaining = () => STEP - (Math.floor(Date.now() / 1000) % STEP);

// GET — current QR token (admin only)
export async function GET(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const session = await getAttSession("att_admin_token");
  if (!session || session.orgSlug !== org || session.role !== "ADMIN") {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }

  const qrSession = await getOrCreateQrSession(org);
  const token = await generate({ secret: qrSession.secret });

  return NextResponse.json({ token, remaining: remaining(), step: STEP });
}

// POST — validate token (called during check-in)
export async function POST(req: NextRequest, { params }: { params: Promise<{ org: string }> }) {
  const { org } = await params;
  const { token } = await req.json();

  const qrSession = await prisma.attQrSession.findFirst({
    where: { org: { slug: org }, active: true },
  });
  if (!qrSession) return NextResponse.json({ valid: false });

  const valid = await verify({ token: String(token), secret: qrSession.secret });
  return NextResponse.json({ valid });
}

async function getOrCreateQrSession(orgSlug: string) {
  const org = await prisma.attOrganization.findUnique({ where: { slug: orgSlug } });
  if (!org) throw new Error("org not found");

  const existing = await prisma.attQrSession.findUnique({ where: { organizationId: org.id } });
  if (existing) return existing;

  return prisma.attQrSession.create({
    data: { organizationId: org.id, secret: generateSecret() },
  });
}
