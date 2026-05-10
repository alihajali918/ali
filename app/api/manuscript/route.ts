import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import QRCode from "qrcode";
import fs from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { transporter } from "@/app/lib/mailer";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alihajali.com";

export async function POST(req: Request) {
  const { nameParts, email } = await req.json();

  if (!Array.isArray(nameParts) || nameParts.length < 2 || !email) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const fullName = nameParts.filter(Boolean).join(" ");

  const prompt = `
Create a stunning, highly detailed traditional Arabic manuscript (مخطوطة عربية أصيلة).

Visual requirements:
- Aged parchment or papyrus background with warm golden-brown and cream tones, with subtle texture and wear marks
- Elaborate Islamic geometric border: interlocking stars, arabesque vines, and gilded ornamental frames layered on all sides
- The full name "${fullName}" written prominently in the vertical center in beautiful large Arabic calligraphy (thuluth or diwani style), gold ink on a slightly darker patch
- Decorative roundels, floral medallions, and marginal ornaments typical of Quranic manuscripts
- Subtle color palette: deep burgundy, indigo, gold leaf, aged ivory — no modern colors
- Faint horizontal ruling lines behind the text as in classic Islamic manuscripts
- Aspect ratio approximately portrait (3:4)
- Museum-quality rendering, warm raking light to reveal texture

Do NOT include any Latin text, borders that look modern, photographic elements, or watermarks.
`.trim();

  try {
    const response = await ai.models.generateImages({
      model: "imagen-3.0-generate-002",
      prompt,
      config: {
        numberOfImages: 1,
        aspectRatio: "3:4",
        outputMimeType: "image/png",
      },
    });

    const imageBytes = response.generatedImages?.[0]?.image?.imageBytes;
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
