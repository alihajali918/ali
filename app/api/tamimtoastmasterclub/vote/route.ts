import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../lib/db";

const CATEGORIES = ["PREPARED", "EVALUATION", "IMPROMPTU"];

export async function POST(req: NextRequest) {
  try {
    const { category, candidate } = await req.json();
    if (!CATEGORIES.includes(category) || !candidate) {
      return NextResponse.json({ error: "بيانات غير صحيحة" }, { status: 400 });
    }

    const cookieName = `voted_${category}`;
    if (req.cookies.get(cookieName)) {
      return NextResponse.json({ error: "لقد صوّتّ بهذه الفئة مسبقاً" }, { status: 409 });
    }

    await db.clubVote.create({ data: { category, candidate } });

    const res = NextResponse.json({ ok: true });
    res.cookies.set(cookieName, "1", { httpOnly: true, maxAge: 60 * 60 * 24, path: "/", sameSite: "lax" });
    return res;
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
