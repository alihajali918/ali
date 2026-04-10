import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/db";
import { parseUserAgent, getIP, getSessionId } from "../../lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body      = await req.json();
    const page      = String(body.page     || "/").slice(0, 255);
    const referrer  = String(body.referrer || "").slice(0, 500) || null;
    const userAgent = req.headers.get("user-agent") || "";
    const ip        = getIP(req);
    const sessionId = getSessionId(req);
    const { device, browser, os } = parseUserAgent(userAgent);

    await db.visitor.create({
      data: { sessionId, ip, page, referrer, userAgent, device, browser, os },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await db.pageView.upsert({
      where: { page_date: { page, date: today } },
      update: { views: { increment: 1 } },
      create: { page, date: today, views: 1 },
    });

    const res = NextResponse.json({ ok: true });
    if (!req.cookies.get("sid")) {
      res.cookies.set("sid", sessionId, { httpOnly: true, maxAge: 60 * 60 * 24 * 30, path: "/", sameSite: "lax" });
    }
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
