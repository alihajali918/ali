import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../lib/db";
import { isClubAdmin } from "../../../../../../lib/club-auth";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { formId } = await params;
  await db.clubFormSubmission.deleteMany({ where: { formId: Number(formId) } });
  return NextResponse.json({ ok: true });
}
