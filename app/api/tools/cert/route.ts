import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";
import { getIP } from "../../../lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await db.query(
      "INSERT INTO cert_history (recipientName, courseName, centerName, template, ip) VALUES (?, ?, ?, ?, ?)",
      [
        String(body.recipientName || "").slice(0, 255),
        String(body.courseName    || "").slice(0, 255),
        String(body.centerName    || "").slice(0, 255) || null,
        String(body.template      || "classic").slice(0, 20),
        getIP(req),
      ]
    );
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
