import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

export const maxDuration = 30;

const rlMap = new Map<string, number>();
const DAILY_LIMIT = 10;
const MODEL = "gemini-2.0-flash";

function getIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function getAI() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenAI({ apiKey: key });
}

// GET — diagnostic
export async function GET() {
  try {
    const ai  = getAI();
    const res = await ai.models.generateContent({
      model: MODEL,
      contents: "قل مرحبا",
      config: { maxOutputTokens: 10 },
    });
    return NextResponse.json({ ok: true, text: res.text });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message });
  }
}

export async function POST(req: NextRequest) {
  let ai: GoogleGenAI;
  try { ai = getAI(); } catch {
    return NextResponse.json({ error: "missing key" }, { status: 500 });
  }

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
      const res = await ai.models.generateContent({
        model: MODEL,
        contents: prompt,
        config: { temperature: 0.7, maxOutputTokens: 80 },
      });
      return NextResponse.json({
        data: { description: (res.text ?? "").trim() },
        remaining: DAILY_LIMIT - (count + 1),
      });
    }

    // mode: fill
    const today2 = new Date().toISOString().split("T")[0];
    const systemPrompt = `أنت مساعد ذكي متخصص في استخراج بيانات الشهادات من النص العربي.
استخرج البيانات التالية من نص المستخدم وأعدها كـ JSON صارم بدون أي نص إضافي:
{
  "recipientName": "اسم المتدرب أو المستلم",
  "courseName": "اسم الدورة أو البرنامج",
  "certDate": "التاريخ بصيغة YYYY-MM-DD (اليوم هو ${today2} إذا قال اليوم)",
  "directorName": "اسم المدير أو المشرف",
  "centerName": "اسم المركز أو المؤسسة",
  "description": "وصف قصير للإنجاز (جملة واحدة)"
}
إذا لم يُذكر حقل معين، اتركه فارغاً "". لا تضف أي نص خارج الـ JSON.`;

    const res = await ai.models.generateContent({
      model: MODEL,
      contents: `${systemPrompt}\n\nنص المستخدم: ${prompt}`,
      config: { temperature: 0.1, maxOutputTokens: 512 },
    });

    const raw   = res.text ?? "";
    const match = raw.match(/\{[\s\S]*\}/);
    if (!match) return NextResponse.json({ error: "no json in response" }, { status: 422 });

    const data = JSON.parse(match[0]);
    return NextResponse.json({ data, remaining: DAILY_LIMIT - (count + 1) });

  } catch (e: any) {
    console.error("Gemini error:", e?.message);
    return NextResponse.json({ error: "gemini error", detail: e?.message }, { status: 502 });
  }
}
