import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getIP } from "../../../lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.certHistory.create({
      data: {
        recipientName: String(body.recipientName || "").slice(0, 255),
        courseName:    String(body.courseName    || "").slice(0, 255),
        centerName:    String(body.centerName    || "").slice(0, 255) || null,
        template:      String(body.template      || "classic").slice(0, 20),
        ip:            getIP(req),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
