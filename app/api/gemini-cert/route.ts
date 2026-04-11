import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store (resets on cold start — good enough for edge cases)
// key: "ip:date" → count
const rlMap = new Map<string, number>();
const DAILY_LIMIT = 10;

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 500 });

  // ─── rate limit ───
  const ip    = getIp(req);
  const today = new Date().toISOString().split("T")[0];
  const rlKey = `${ip}:${today}`;
  const count = rlMap.get(rlKey) ?? 0;

  if (count >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: "limit", message: `وصلت الحد اليومي (${DAILY_LIMIT} طلبات). حاول غداً.` },
      { status: 429 }
    );
  }
  rlMap.set(rlKey, count + 1);

  // ─── parse body ───
  const body = await req.json();
  const { prompt, mode } = body; // mode: "fill" (default) | "desc"
  if (!prompt?.trim()) return NextResponse.json({ error: "empty prompt" }, { status: 400 });

  // ─── mode: desc — generate a short description sentence ───
  if (mode === "desc") {
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.7, maxOutputTokens: 80 },
          }),
        }
      );
      if (!res.ok) {
        const errText = await res.text();
        console.error("Gemini desc error:", res.status, errText);
        return NextResponse.json({ error: "gemini error", detail: errText }, { status: 502 });
      }
      const json = await res.json();
      const text = (json.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
      return NextResponse.json({
        data: { description: text },
        remaining: DAILY_LIMIT - (count + 1),
      });
    } catch {
      return NextResponse.json({ error: "parse error" }, { status: 500 });
    }
  }

  // ─── mode: fill (default) — extract all fields as JSON ───
  const systemPrompt = `أنت مساعد ذكي متخصص في استخراج بيانات الشهادات من النص العربي.
استخرج البيانات التالية من نص المستخدم وأعدها كـ JSON صارم بدون أي نص إضافي:
{
  "recipientName": "اسم المتدرب أو المستلم",
  "courseName": "اسم الدورة أو البرنامج",
  "certDate": "التاريخ بصيغة YYYY-MM-DD (اليوم هو ${today} إذا قال اليوم)",
  "directorName": "اسم المدير أو المشرف",
  "centerName": "اسم المركز أو المؤسسة",
  "description": "وصف قصير للإنجاز (جملة واحدة)"
}
إذا لم يُذكر حقل معين، اتركه فارغاً "". لا تضف أي نص خارج الـ JSON.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: `${systemPrompt}\n\nنص المستخدم: ${prompt}` }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 512 },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini fill error:", res.status, errText);
      return NextResponse.json({ error: "gemini error", detail: errText }, { status: 502 });
    }

    const json = await res.json();
    const raw  = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "no json" }, { status: 422 });

    const data = JSON.parse(match[0]);
    return NextResponse.json({ data, remaining: DAILY_LIMIT - (count + 1) });
  } catch {
    return NextResponse.json({ error: "parse error" }, { status: 500 });
  }
}
