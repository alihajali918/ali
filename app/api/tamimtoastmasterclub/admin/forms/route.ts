import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { isClubAdmin } from "../../../../lib/club-auth";

export async function GET(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const forms = await db.clubForm.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { fields: true, submissions: true } } },
  });
  return NextResponse.json(forms);
}

export async function POST(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { title, icon, color } = await req.json();
  if (!title) return NextResponse.json({ error: "العنوان مطلوب" }, { status: 400 });
  const count = await db.clubForm.count();
  const form = await db.clubForm.create({
    data: { title, icon: icon || "ClipboardList", color: color || "#00a3e0", order: count },
  });
  return NextResponse.json(form);
}

export async function PATCH(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  if (Array.isArray(body.orderedIds)) {
    await db.$transaction(
      body.orderedIds.map((id: number, index: number) => db.clubForm.update({ where: { id }, data: { order: index } }))
    );
    return NextResponse.json({ ok: true });
  }
  const { id, ...data } = body;
  const form = await db.clubForm.update({ where: { id }, data });
  return NextResponse.json(form);
}

export async function DELETE(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  await db.clubForm.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
