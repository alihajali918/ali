import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getIP } from "../../../lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.qrHistory.create({
      data: {
        type:      String(body.type   || "url").slice(0, 20),
        value:     String(body.value  || "").slice(0, 2000),
        format:    String(body.format || "png").slice(0, 10),
        corner:    String(body.corner || "sharp").slice(0, 10),
        hasLogo:   !!body.hasLogo,
        bulkCount: body.bulkCount ? Number(body.bulkCount) : null,
        ip:        getIP(req),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
