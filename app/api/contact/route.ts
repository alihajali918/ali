import { NextRequest, NextResponse } from "next/server";
import { db } from "../../lib/db";

// in-memory rate limit: max 3 submissions per IP per hour
const rl = new Map<string, { count: number; reset: number }>();
const LIMIT = 3;
const WINDOW_MS = 60 * 60 * 1000;

function checkRate(ip: string): boolean {
  const now   = Date.now();
  const entry = rl.get(ip);
  if (!entry || now > entry.reset) {
    rl.set(ip, { count: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (entry.count >= LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!checkRate(ip)) {
    return NextResponse.json(
      { error: "تجاوزت الحد المسموح، حاول بعد ساعة" },
      { status: 429 }
    );
  }

  try {
    const { name, email, message, company } = await req.json();
    // honeypot: bots fill hidden "company" field, humans don't
    if (company && String(company).trim()) {
      return NextResponse.json({ ok: true });
    }
    if (!name || !email || !message)
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    await db.contact.create({
      data: {
        name:    String(name).slice(0, 100),
        email:   String(email).slice(0, 150),
        message: String(message).slice(0, 3000),
      },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "حدث خطأ" }, { status: 500 });
  }
}
