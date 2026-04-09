import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import { getIP } from "../../lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await prisma.reportHistory.create({
      data: {
        reportTitle: String(body.reportTitle || "").slice(0, 255),
        reportType:  String(body.reportType  || "").slice(0, 30),
        companyName: String(body.companyName || "").slice(0, 255) || null,
        rowCount:    Number(body.rowCount) || 0,
        ip:          getIP(req),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
