import { NextResponse } from "next/server";

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

  const seed     = Math.floor(Math.random() * 999999);
  const token    = process.env.POLLINATIONS_TOKEN ?? "";
  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true&token=${token}`;

  return NextResponse.json({ imageUrl });
}
