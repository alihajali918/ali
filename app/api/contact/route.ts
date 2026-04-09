import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { name, email, message } = await req.json();
    if (!name || !email || !message) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }
    await prisma.contact.create({
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
