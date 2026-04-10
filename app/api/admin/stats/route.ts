import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    const now = new Date();
    const today = new Date(now); today.setHours(0, 0, 0, 0);
    const week  = new Date(now); week.setDate(week.getDate() - 7);
    const month = new Date(now); month.setDate(month.getDate() - 30);

    const [
      todayCount, weekCount, monthCount, totalCount,
      topPages, deviceStats, browserStats, recentVisitors,
      qrTotal, qrToday, certTotal, certToday, reportTotal, reportToday,
      contactsUnread, contactsTotal, dailyViews,
    ] = await Promise.all([
      db.visitor.count({ where: { createdAt: { gte: today } } }),
      db.visitor.count({ where: { createdAt: { gte: week } } }),
      db.visitor.count({ where: { createdAt: { gte: month } } }),
      db.visitor.count(),
      db.pageView.groupBy({ by: ["page"], where: { date: { gte: month } }, _sum: { views: true }, orderBy: { _sum: { views: "desc" } }, take: 10 }),
      db.visitor.groupBy({ by: ["device"], where: { createdAt: { gte: month } }, _count: { device: true }, orderBy: { _count: { device: "desc" } } }),
      db.visitor.groupBy({ by: ["browser"], where: { createdAt: { gte: month } }, _count: { browser: true }, orderBy: { _count: { browser: "desc" } }, take: 5 }),
      db.visitor.findMany({ select: { ip: true, page: true, device: true, browser: true, os: true, createdAt: true }, orderBy: { createdAt: "desc" }, take: 20 }),
      db.qrHistory.count(),
      db.qrHistory.count({ where: { createdAt: { gte: today } } }),
      db.certHistory.count(),
      db.certHistory.count({ where: { createdAt: { gte: today } } }),
      db.reportHistory.count(),
      db.reportHistory.count({ where: { createdAt: { gte: today } } }),
      db.contact.count({ where: { read: false } }),
      db.contact.count(),
      db.pageView.groupBy({ by: ["date"], where: { date: { gte: month } }, _sum: { views: true }, orderBy: { date: "asc" } }),
    ]);

    return NextResponse.json({
      visitors: { today: todayCount, week: weekCount, month: monthCount, total: totalCount },
      topPages: topPages.map(p => ({ page: p.page, views: p._sum.views })),
      devices:  deviceStats.map(d => ({ device: d.device, count: d._count.device })),
      browsers: browserStats.map(b => ({ browser: b.browser, count: b._count.browser })),
      recentVisitors,
      tools: {
        qr:     { total: qrTotal,     today: qrToday },
        cert:   { total: certTotal,   today: certToday },
        report: { total: reportTotal, today: reportToday },
      },
      contacts: { unread: contactsUnread, total: contactsTotal },
      dailyViews: dailyViews.map(d => ({ date: d.date, views: d._sum.views })),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
