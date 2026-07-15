import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { isClubAdmin } from "../../../../lib/club-auth";

export async function GET(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const tally = await db.clubVote.groupBy({
    by: ["category", "candidate"],
    _count: { candidate: true },
    orderBy: { _count: { candidate: "desc" } },
  });
  const total = await db.clubVote.count();
  return NextResponse.json({
    total,
    tally: tally.map(t => ({ category: t.category, candidate: t.candidate, votes: t._count.candidate })),
  });
}

export async function DELETE(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await db.clubVote.deleteMany();
  return NextResponse.json({ ok: true });
}
