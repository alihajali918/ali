import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { db } from "../../../../../../lib/db";
import { isClubAdmin } from "../../../../../../lib/club-auth";

function formatAnswer(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return value.join(", ");
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .map(([row, v]) => `${row}: ${Array.isArray(v) ? v.join("/") : v}`)
      .join(" | ");
  }
  return String(value);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ formId: string }> }) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const { formId } = await params;
  const form = await db.clubForm.findUnique({
    where: { id: Number(formId) },
    include: {
      fields: { orderBy: { order: "asc" } },
      submissions: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!form) return NextResponse.json({ error: "النموذج غير موجود" }, { status: 404 });

  const rows = form.submissions.map(sub => {
    const answers = sub.answers as Record<string, unknown>;
    const row: Record<string, string> = { "تاريخ الإرسال": new Date(sub.createdAt).toLocaleString("ar-QA") };
    for (const field of form.fields) {
      row[field.label] = formatAnswer(answers[field.id]);
    }
    return row;
  });

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows.length ? rows : [{ "لا توجد ردود": "" }]);
  XLSX.utils.book_append_sheet(wb, ws, form.title.slice(0, 31) || "Form");
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(form.title)}.xlsx"`,
    },
  });
}
