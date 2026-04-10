import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  const contacts = await db.contact.findMany({ orderBy: { createdAt: "desc" }, take: 50 });
  return NextResponse.json(contacts);
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  await db.contact.update({ where: { id }, data: { read: true } });
  return NextResponse.json({ ok: true });
}
