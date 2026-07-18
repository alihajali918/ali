import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../lib/db";
import { isClubAdmin } from "../../../../../../lib/club-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { formId } = await params;
  const fields = await db.clubFormField.findMany({ where: { formId: Number(formId) }, orderBy: { order: "asc" } });
  return NextResponse.json(fields);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { formId } = await params;
  const { type, label, required, config } = await req.json();
  if (!type || !label) return NextResponse.json({ error: "النوع والعنوان مطلوبان" }, { status: 400 });
  const count = await db.clubFormField.count({ where: { formId: Number(formId) } });
  const field = await db.clubFormField.create({
    data: { formId: Number(formId), type, label, required: !!required, config: config ?? {}, order: count },
  });
  return NextResponse.json(field);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { formId } = await params;
  const body = await req.json();
  if (Array.isArray(body.orderedIds)) {
    await db.$transaction(
      body.orderedIds.map((id: number, index: number) =>
        db.clubFormField.update({ where: { id }, data: { order: index } }))
    );
    return NextResponse.json({ ok: true });
  }
  const { id, ...data } = body;
  const field = await db.clubFormField.update({ where: { id }, data });
  return NextResponse.json(field);
}

export async function DELETE(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { id } = await req.json();
  await db.clubFormField.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
