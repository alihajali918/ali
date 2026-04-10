import { NextResponse } from "next/server";
import { db } from "../../../lib/db";

export async function GET() {
  try {
    // Batch 1 — visitor counts
    const [[today], [week], [month], [total]] = await Promise.all([
      db.query("SELECT COUNT(*) as c FROM visitors WHERE createdAt >= CURDATE()"),
      db.query("SELECT COUNT(*) as c FROM visitors WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 7 DAY)"),
      db.query("SELECT COUNT(*) as c FROM visitors WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)"),
      db.query("SELECT COUNT(*) as c FROM visitors"),
    ]) as any[];

    // Batch 2 — pages, devices, browsers, recent
    const [[topPages], [deviceStats], [browserStats], [recentVisitors]] = await Promise.all([
      db.query("SELECT page, SUM(views) as views FROM page_views WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY page ORDER BY views DESC LIMIT 10"),
      db.query("SELECT device, COUNT(*) as count FROM visitors WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY device ORDER BY count DESC"),
      db.query("SELECT browser, COUNT(*) as count FROM visitors WHERE createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY browser ORDER BY count DESC LIMIT 5"),
      db.query("SELECT ip, page, device, browser, os, createdAt FROM visitors ORDER BY createdAt DESC LIMIT 20"),
    ]) as any[];

    // Batch 3 — tools, contacts, daily
    const [[qrTotal], [qrToday], [certTotal], [certToday], [reportTotal], [reportToday], [contactsUnread], [contactsTotal], [dailyViews]] = await Promise.all([
      db.query("SELECT COUNT(*) as c FROM qr_history"),
      db.query("SELECT COUNT(*) as c FROM qr_history WHERE createdAt >= CURDATE()"),
      db.query("SELECT COUNT(*) as c FROM cert_history"),
      db.query("SELECT COUNT(*) as c FROM cert_history WHERE createdAt >= CURDATE()"),
      db.query("SELECT COUNT(*) as c FROM report_history"),
      db.query("SELECT COUNT(*) as c FROM report_history WHERE createdAt >= CURDATE()"),
      db.query("SELECT COUNT(*) as c FROM contacts WHERE `read` = 0"),
      db.query("SELECT COUNT(*) as c FROM contacts"),
      db.query("SELECT DATE(date) as date, SUM(views) as views FROM page_views WHERE date >= DATE_SUB(NOW(), INTERVAL 30 DAY) GROUP BY DATE(date) ORDER BY date ASC"),
    ]) as any[];

    return NextResponse.json({
      visitors: {
        today: today[0].c, week: week[0].c, month: month[0].c, total: total[0].c,
      },
      topPages,
      devices:  deviceStats,
      browsers: browserStats,
      recentVisitors,
      tools: {
        qr:     { total: qrTotal[0].c,     today: qrToday[0].c },
        cert:   { total: certTotal[0].c,   today: certToday[0].c },
        report: { total: reportTotal[0].c, today: reportToday[0].c },
      },
      contacts: { unread: contactsUnread[0].c, total: contactsTotal[0].c },
      dailyViews,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "DB error" }, { status: 500 });
  }
}
