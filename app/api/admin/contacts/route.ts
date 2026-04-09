import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const contacts = await prisma.contact.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return NextResponse.json(contacts);
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  await prisma.contact.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
