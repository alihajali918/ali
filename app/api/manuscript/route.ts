import { NextResponse } from "next/server";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { transporter } from "@/app/lib/mailer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alihajali.com";

export async function POST(req: Request) {
  const { nameParts, email } = await req.json();

  if (!Array.isArray(nameParts) || nameParts.length < 2 || !email) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const fullName = nameParts.filter(Boolean).join(" ");

  const prompt = `
Create a square 512×512 digital artwork with absolutely no border or frame of any kind.

TEXT RULES — extremely strict:
- The design contains EXACTLY TWO Arabic text elements, nothing else.
- MAIN TEXT (upper area, larger): "${fullName}" — appears EXACTLY ONCE. Written in artistic Arabic graphic calligraphy (ornate, handcrafted style, NOT a regular printed font).
- SECONDARY TEXT (lower area, smaller): "إنسان" — appears EXACTLY ONCE. Same artistic calligraphic graphic style but smaller than the main text.
- NO other text, letters, words, numbers, or decorative writing anywhere in the image.
- No repetition of any word. No extra characters.
- Arabic text direction: right-to-left with proper natural letter connections.

DIVIDER:
- One single plain horizontal straight line between the main text and the secondary text. Simple, thin, undecorated.

FLOWER:
- Integrate ONE flower naturally with the main text "${fullName}". The flower type should complement the calligraphic composition. It must be upright (not flipped or inverted), blended into the text composition as part of it — not floating separately.

TYPOGRAPHY COLOR:
- Both text elements: luxurious shiny gold with a soft, balanced metallic sheen. Not overly bright, not dull — elegant and clear.

BACKGROUND:
- Calm, light, clean, quiet tone. Subtle and unobtrusive.

COMPOSITION:
- Centered and balanced. Generous spacing. No crowding.
- Both texts within comfortable safe margins.
- Main text and secondary text clearly legible as the highest priority.
- Simple, luxurious, balanced.
`.trim();

  try {
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3:predict?key=${process.env.GEMINI_API_KEY}`;
    const apiRes = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances:  [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: "1:1" },
      }),
    });

    const data = await apiRes.json();
    if (!apiRes.ok) return NextResponse.json({ error: data.error?.message ?? "فشل توليد الصورة" }, { status: 500 });

    const imageBytes: string | undefined = data.predictions?.[0]?.bytesBase64Encoded;
    if (!imageBytes) return NextResponse.json({ error: "فشل توليد الصورة" }, { status: 500 });

    const id = randomUUID();
    const dir = path.join(process.cwd(), "public", "manuscripts");
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, `${id}.png`), Buffer.from(imageBytes, "base64"));

    const imageUrl = `${BASE_URL}/manuscripts/${id}.png`;
    const formUrl  = `${BASE_URL}/manuscript`;

    const qrDataUrl = await QRCode.toDataURL(formUrl, {
      width: 320,
      margin: 2,
      color: { dark: "#3b1a00", light: "#fef3c7" },
    });

    await transporter.sendMail({
      from: `"مخطوطة" <noreply@alihajali.com>`,
      to: email,
      subject: `📜 مخطوطتك المخصصة — ${fullName}`,
      html: manuscriptEmailHtml(fullName, imageUrl),
      attachments: [
        {
          filename: `مخطوطة-${fullName}.png`,
          path: path.join(process.cwd(), "public", "manuscripts", `${id}.png`),
        },
      ],
    });

    return NextResponse.json({ imageUrl, qrDataUrl });
  } catch (e: unknown) {
    console.error(e);
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "حدث خطأ أثناء الإنشاء" },
      { status: 500 }
    );
  }
}

function manuscriptEmailHtml(name: string, imageUrl: string) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#1c0a00;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#1c0a00;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#2d1400;border:1px solid #7c3c00;border-radius:20px;overflow:hidden;">
        <tr><td style="background:linear-gradient(135deg,#92400e,#d97706);padding:28px 32px;text-align:center;">
          <p style="margin:0;color:#fef3c7;font-size:28px;">📜</p>
          <h1 style="margin:8px 0 0;color:#fef3c7;font-size:18px;font-weight:900;">مخطوطتك المخصصة</h1>
        </td></tr>
        <tr><td style="padding:32px;text-align:center;">
          <p style="margin:0 0 20px;color:#fde68a;font-size:15px;">مرحباً <strong>${name}</strong>، إليك مخطوطتك:</p>
          <img src="${imageUrl}" style="max-width:460px;width:100%;border-radius:12px;border:2px solid #7c3c00;" />
          <p style="margin:20px 0 0;color:#d97706;font-size:13px;">
            <a href="${imageUrl}" style="color:#d97706;">عرض الصورة كاملة</a>
          </p>
        </td></tr>
        <tr><td style="padding:16px 32px;border-top:1px solid #7c3c00;text-align:center;">
          <p style="margin:0;color:#92400e;font-size:11px;">© 2026 alihajali.com</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
