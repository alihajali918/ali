import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(req: NextRequest) {
  try {
    const today = daysAgo(0);
    const week  = daysAgo(7);
    const month = daysAgo(30);

    // Batch 1 – visitor counts
    const [visitorsToday, visitorsWeek, visitorsMonth, visitorsTotal] = await Promise.all([
      prisma.visitor.count({ where: { createdAt: { gte: today } } }),
      prisma.visitor.count({ where: { createdAt: { gte: week  } } }),
      prisma.visitor.count({ where: { createdAt: { gte: month } } }),
      prisma.visitor.count(),
    ]);

    // Batch 2 – page / device / browser breakdown
    const [topPages, deviceStats, browserStats, recentVisitors] = await Promise.all([
      prisma.pageView.groupBy({
        by: ["page"],
        _sum: { views: true },
        where: { date: { gte: month } },
        orderBy: { _sum: { views: "desc" } },
        take: 10,
      }),
      prisma.visitor.groupBy({
        by: ["device"],
        _count: { device: true },
        where: { createdAt: { gte: month } },
        orderBy: { _count: { device: "desc" } },
      }),
      prisma.visitor.groupBy({
        by: ["browser"],
        _count: { browser: true },
        where: { createdAt: { gte: month } },
        orderBy: { _count: { browser: "desc" } },
        take: 5,
      }),
      prisma.visitor.findMany({
        take: 20,
        orderBy: { createdAt: "desc" },
        select: { ip: true, page: true, device: true, browser: true, os: true, createdAt: true },
      }),
    ]);

    // Batch 3 – tool & contact stats
    const [qrTotal, qrToday, certTotal, certToday, reportTotal, reportToday, contactsUnread, contactsTotal, dailyViews] = await Promise.all([
      prisma.qrHistory.count(),
      prisma.qrHistory.count({ where: { createdAt: { gte: today } } }),
      prisma.certHistory.count(),
      prisma.certHistory.count({ where: { createdAt: { gte: today } } }),
      prisma.reportHistory.count(),
      prisma.reportHistory.count({ where: { createdAt: { gte: today } } }),
      prisma.contact.count({ where: { read: false } }),
      prisma.contact.count(),
      prisma.pageView.groupBy({
        by: ["date"],
        _sum: { views: true },
        where: { date: { gte: month } },
        orderBy: { date: "asc" },
      }),
    ]);

    return NextResponse.json({
      visitors: { today: visitorsToday, week: visitorsWeek, month: visitorsMonth, total: visitorsTotal },
      topPages: topPages.map((p) => ({ page: p.page, views: p._sum.views ?? 0 })),
      devices:  deviceStats.map((d) => ({ device: d.device, count: d._count.device })),
      browsers: browserStats.map((b) => ({ browser: b.browser, count: b._count.browser })),
      recentVisitors,
      tools: {
        qr:     { total: qrTotal,     today: qrToday },
        cert:   { total: certTotal,   today: certToday },
        report: { total: reportTotal, today: reportToday },
      },
      contacts: { unread: contactsUnread, total: contactsTotal },
      dailyViews: dailyViews.map((d) => ({ date: d.date, views: d._sum.views ?? 0 })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
