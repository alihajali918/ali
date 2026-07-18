import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../lib/db";
import { isClubAdmin } from "../../../../lib/club-auth";

export async function GET(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  const tally = await db.clubVote.groupBy({
    by: ["categoryId", "candidate"],
    _count: { candidate: true },
    orderBy: { _count: { candidate: "desc" } },
  });
  const total = await db.clubVote.count();
  return NextResponse.json({
    total,
    tally: tally.map(t => ({ categoryId: t.categoryId, candidate: t.candidate, votes: t._count.candidate })),
  });
}

export async function DELETE(req: NextRequest) {
  if (!await isClubAdmin(req)) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  await db.$transaction([
    db.clubVote.deleteMany(),
    db.clubVoteCategory.updateMany({ data: { votingRound: { increment: 1 } } }),
  ]);
  return NextResponse.json({ ok: true });
}
