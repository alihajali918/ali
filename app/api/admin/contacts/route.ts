import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM contacts ORDER BY createdAt DESC LIMIT 50") as any[];
  return NextResponse.json(rows);
}

export async function PATCH(req: NextRequest) {
  const { id } = await req.json();
  await db.query("UPDATE contacts SET `read` = 1 WHERE id = ?", [id]);
  return NextResponse.json({ ok: true });
}
