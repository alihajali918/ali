import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../lib/db";

export async function POST(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  try {
    const { formId } = await params;
    const { answers } = await req.json();
    if (!answers || typeof answers !== "object") {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const form = await db.clubForm.findUnique({
      where: { id: Number(formId) },
      include: { fields: true },
    });
    if (!form || !form.active) return NextResponse.json({ error: "النموذج غير متاح" }, { status: 404 });

    for (const field of form.fields) {
      if (field.required) {
        const v = answers[field.id];
        const empty = v == null || v === "" || (Array.isArray(v) && v.length === 0);
        if (empty) return NextResponse.json({ error: `الحقل "${field.label}" مطلوب` }, { status: 400 });
      }
    }

    await db.clubFormSubmission.create({ data: { formId: form.id, answers } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
