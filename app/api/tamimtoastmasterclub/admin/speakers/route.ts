import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { isClubAdmin } from "../../../../lib/club-auth";

export async function GET(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const speakers = await db.clubSpeaker.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(speakers);
}

export async function POST(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { categoryId, name } = await req.json();
  if (!categoryId || !name) return NextResponse.json({ error: "الفئة والاسم مطلوبان" }, { status: 400 });
  const speaker = await db.clubSpeaker.create({ data: { categoryId, name } });
  return NextResponse.json(speaker);
}

export async function DELETE(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  await db.clubSpeaker.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
