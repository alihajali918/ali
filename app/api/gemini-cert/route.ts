import { NextRequest, NextResponse } from "next/server";

const rlMap = new Map<string, number>();
const DAILY_LIMIT = 10;
const GEMINI_URL = (key: string) =>
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`;

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

async function callGemini(key: string, contents: object, config: object) {
  const res = await fetch(GEMINI_URL(key), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents, generationConfig: config }),
    signal: AbortSignal.timeout(9000),
  });
  const text = await res.text();
  if (!res.ok) throw Object.assign(new Error("gemini_error"), { status: res.status, body: text });
  return JSON.parse(text);
}

// GET — diagnostic
export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ ok: false, reason: "GEMINI_API_KEY not set" });
  try {
    const json = await callGemini(
      key,
      [{ parts: [{ text: "قل مرحبا" }] }],
      { maxOutputTokens: 10 }
    );
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return NextResponse.json({ ok: true, text });
  } catch (e: any) {
    return NextResponse.json({ ok: false, status: e.status, body: e.body ?? e.message });
  }
}

export async function POST(req: NextRequest) {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "missing key" }, { status: 500 });

  // rate limit
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

  const body = await req.json();
  const { prompt, mode } = body;
  if (!prompt?.trim()) return NextResponse.json({ error: "empty prompt" }, { status: 400 });

  try {
    if (mode === "desc") {
      const json = await callGemini(
        key,
        [{ parts: [{ text: prompt }] }],
        { temperature: 0.7, maxOutputTokens: 80 }
      );
      const text = (json.candidates?.[0]?.content?.parts?.[0]?.text ?? "").trim();
      return NextResponse.json({ data: { description: text }, remaining: DAILY_LIMIT - (count + 1) });
    }

    // mode: fill
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

    const json = await callGemini(
      key,
      [{ parts: [{ text: `${systemPrompt}\n\nنص المستخدم: ${prompt}` }] }],
      { temperature: 0.1, maxOutputTokens: 512 }
    );

    const raw   = json.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "no json in response" }, { status: 422 });

    const data = JSON.parse(match[0]);
    return NextResponse.json({ data, remaining: DAILY_LIMIT - (count + 1) });

  } catch (e: any) {
    if (e.name === "TimeoutError") {
      return NextResponse.json({ error: "timeout", message: "Gemini لم يستجب، حاول مرة أخرى" }, { status: 504 });
    }
    console.error("Gemini error:", e.status, e.body ?? e.message);
    return NextResponse.json({ error: "gemini error", detail: e.body ?? e.message }, { status: 502 });
  }
}
