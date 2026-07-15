import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { isClubAdmin } from "../../../../lib/club-auth";

export async function GET(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const settings = await db.clubSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
  return NextResponse.json(settings);
}

export async function PATCH(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const data = await req.json();
  const settings = await db.clubSettings.upsert({
    where: { id: 1 },
    update: data,
    create: { id: 1, ...data },
  });
  return NextResponse.json(settings);
}
