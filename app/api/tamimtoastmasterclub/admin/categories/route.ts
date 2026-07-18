import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { isClubAdmin } from "../../../../lib/club-auth";

export async function GET(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const categories = await db.clubVoteCategory.findMany({ orderBy: { order: "asc" } });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { label, icon } = await req.json();
  if (!label) return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
  const count = await db.clubVoteCategory.count();
  const category = await db.clubVoteCategory.create({ data: { label, icon: icon || "Vote", order: count } });
  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const body = await req.json();
  if (Array.isArray(body.orderedIds)) {
    await db.$transaction(
      body.orderedIds.map((id: number, index: number) => db.clubVoteCategory.update({ where: { id }, data: { order: index } }))
    );
    return NextResponse.json({ ok: true });
  }
  const { id, label, icon } = body;
  const category = await db.clubVoteCategory.update({ where: { id }, data: { label, icon } });
  return NextResponse.json(category);
}

export async function DELETE(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  await db.clubVoteCategory.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
