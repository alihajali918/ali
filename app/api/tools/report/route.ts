import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getIP } from "../../../lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.query(
      "INSERT INTO report_history (reportTitle, reportType, companyName, rowCount, ip) VALUES (?, ?, ?, ?, ?)",
      [
        String(body.reportTitle || "").slice(0, 255),
        String(body.reportType  || "").slice(0, 30),
        String(body.companyName || "").slice(0, 255) || null,
        Number(body.rowCount) || 0,
        getIP(req),
      ]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
