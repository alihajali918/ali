import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getIP } from "../../../lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.query(
      "INSERT INTO qr_history (type, value, format, corner, hasLogo, bulkCount, ip) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        String(body.type   || "url").slice(0, 20),
        String(body.value  || "").slice(0, 2000),
        String(body.format || "png").slice(0, 10),
        String(body.corner || "sharp").slice(0, 10),
        body.hasLogo ? 1 : 0,
        body.bulkCount ? Number(body.bulkCount) : null,
        getIP(req),
      ]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
