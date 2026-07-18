import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { categoryId, candidate } = await req.json();
    if (!categoryId || !candidate) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const settings = await db.clubSettings.upsert({ where: { id: 1 }, update: {}, create: { id: 1 } });
    const cookieName = `voted_${categoryId}_${settings.votingRound}`;
    if (req.cookies.get(cookieName)) {
      return NextResponse.json({ error: "لقد صوّتّ بهذه الفئة مسبقاً" }, { status: 409 });
    }

    await db.clubVote.create({ data: { categoryId, candidate } });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieName, "1", { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
