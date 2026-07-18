import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { isClubAdmin } from "../../../../lib/club-auth";

export async function GET(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const links = await db.clubLink.findMany({
    orderBy: { order: "asc" },
    include: { form: { select: { id: true, title: true, icon: true, color: true } } },
  });
  return NextResponse.json(links);
}

export async function POST(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { title, url, formId } = await req.json();
  if (!title || (!url && !formId)) return NextResponse.json({ error: "العنوان مطلوب مع رابط أو نموذج" }, { status: 400 });
  const count = await db.clubLink.count();
  const link = await db.clubLink.create({
    data: { title, url: formId ? "" : url, formId: formId || null, order: count },
  });
  return NextResponse.json(link);
}

export async function DELETE(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  await db.clubLink.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { orderedIds } = await req.json();
  if (!Array.isArray(orderedIds)) return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
  await db.$transaction(
    orderedIds.map((id: number, index: number) => db.clubLink.update({ where: { id }, data: { order: index } }))
  );
  return NextResponse.json({ ok: true });
}
