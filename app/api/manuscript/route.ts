import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { transporter } from "@/app/lib/mailer";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://alihajali.com";

export async function POST(req: Request) {
  const { nameParts, email } = await req.json();

  if (!Array.isArray(nameParts) || nameParts.length < 2 || !email) {
    return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
  }

  const fullName = nameParts.filter(Boolean).join(" ");
  const seed     = Math.floor(Math.random() * 999999);

  const prompt = `
Square arabic calligraphy manuscript artwork, luxurious golden metallic calligraphy text on a calm light background.
Main large text in center: "${fullName}" written once in ornate Arabic diwani calligraphy style, gold shiny metallic color.
One single decorative flower integrated with the main text, upright, blended naturally.
One thin simple horizontal divider line below the main text.
Below the divider, smaller text: "إنسان" in same gold calligraphy style, written once only.
No borders, no frames, no extra text, no repetition. Centered balanced composition. Simple luxurious elegant.
`.trim();

  const imageUrl = `https://pollinations.ai/p/${encodeURIComponent(prompt)}?width=1024&height=1024&seed=${seed}&model=flux&nologo=true`;

  const qrDataUrl = await QRCode.toDataURL(`${BASE_URL}/manuscript`, {
    width: 320,
    margin: 2,
    color: { dark: "#3b1a00", light: "#fef3c7" },
  });

  await transporter.sendMail({
    from: `"مخطوطة" <noreply@alihajali.com>`,
    to: email,
    subject: `📜 مخطوطتك المخصصة — ${fullName}`,
    html: manuscriptEmailHtml(fullName, imageUrl),
  }).catch(() => {});

  return NextResponse.json({ imageUrl, qrDataUrl });
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
          <img src="${imageUrl}" width="460" style="max-width:100%;border-radius:12px;border:2px solid #7c3c00;" />
          <p style="margin:20px 0 0;font-size:13px;">
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
