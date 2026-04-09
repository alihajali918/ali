import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { parseUserAgent, getIP, getSessionId } from "@/lib/visitor";

export async function POST(req: NextRequest) {
  try {
    const body      = await req.json();
    const page      = String(body.page      || "/").slice(0, 255);
    const referrer  = String(body.referrer  || "").slice(0, 500) || null;
    const userAgent = req.headers.get("user-agent") || "";
    const ip        = getIP(req);
    const sessionId = getSessionId(req);

    const { device, browser, os } = parseUserAgent(userAgent);

    // حفظ الزيارة
    await prisma.visitor.create({
      data: { sessionId, ip, page, referrer, userAgent, device, browser, os },
    });

    // تحديث عداد الصفحة لليوم الحالي
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await prisma.pageView.upsert({
      where:  { page_date: { page, date: today } },
      update: { views: { increment: 1 } },
      create: { page, date: today, views: 1 },
    });

    const res = NextResponse.json({ ok: true });

    // ضع session cookie إذا ما كانت موجودة
    if (!req.cookies.get("sid")) {
      res.cookies.set("sid", sessionId, {
        httpOnly: true,
        maxAge: 60 * 60 * 24 * 30, // 30 يوم
        path: "/",
        sameSite: "lax",
      });
    }

    return res;
  } catch (err) {
    // لا نوقف الموقع بسبب خطأ في التتبع
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
