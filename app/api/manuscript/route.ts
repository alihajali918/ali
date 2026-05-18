import { NextResponse } from "next/server";
import { GoogleGenAI, Modality } from "@google/genai";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";

const ai      = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alihajali.com";

export async function POST(req: Request) {
  const { nameParts } = await req.json();

  if (!Array.isArray(nameParts) || nameParts.length < 2) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const fullName = nameParts.filter(Boolean).join(" ");

  const prompt = `
Square arabic calligraphy manuscript artwork, luxurious golden metallic calligraphy text on a calm light background.
Main large text in center: "${fullName}" written once in ornate Arabic diwani calligraphy style, gold shiny metallic color.
One single decorative flower integrated with the main text, upright, blended naturally.
One thin simple horizontal divider line below the main text.
Below the divider, smaller text: "إنسان" in same gold calligraphy style, written once only.
No borders, no frames, no extra text, no repetition. Centered balanced composition. Simple luxurious elegant.
`.trim();

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-preview-image-generation",
      contents: prompt,
      config: { responseModalities: [Modality.IMAGE] },
    });

    const parts    = response.candidates?.[0]?.content?.parts ?? [];
    const imgPart  = parts.find((p: { inlineData?: { data?: string } }) => p.inlineData?.data);
    const imgBytes = imgPart?.inlineData?.data;

    if (!imgBytes) return NextResponse.json({ error: "فشل توليد الصورة" }, { status: 500 });

    const id  = randomUUID();
    const dir = path.join(process.cwd(), "public", "manuscripts");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${id}.png`), Buffer.from(imgBytes, "base64"));

    return NextResponse.json({ imageUrl: `${BASE_URL}/manuscripts/${id}.png` });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "حدث خطأ" },
      { status: 500 }
    );
  }
}
