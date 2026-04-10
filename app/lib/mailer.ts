import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: "smtp.hostinger.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER || "noreply@alihajali.com",
    pass: process.env.SMTP_PASS,
  },
});

export async function sendVerificationEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/api/auth/verify-email?token=${token}`;
  await transporter.sendMail({
    from: `"Ali Hajali" <noreply@alihajali.com>`,
    to,
    subject: "تأكيد بريدك الإلكتروني",
    html: emailTemplate({
      title: `مرحباً ${name}`,
      body: "شكراً لتسجيلك! اضغط الزر أدناه لتأكيد بريدك الإلكتروني.",
      btnText: "تأكيد البريد الإلكتروني",
      btnUrl: url,
      note: "هذا الرابط صالح لمدة 24 ساعة.",
    }),
  });
}

export async function sendResetEmail(to: string, name: string, token: string) {
  const url = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
  await transporter.sendMail({
    from: `"Ali Hajali" <noreply@alihajali.com>`,
    to,
    subject: "إعادة تعيين كلمة المرور",
    html: emailTemplate({
      title: `مرحباً ${name}`,
      body: "تلقينا طلباً لإعادة تعيين كلمة مرور حسابك. اضغط الزر أدناه للمتابعة.",
      btnText: "إعادة تعيين كلمة المرور",
      btnUrl: url,
      note: "هذا الرابط صالح لمدة ساعة واحدة فقط. إن لم تطلب ذلك تجاهل هذا البريد.",
    }),
  });
}

function emailTemplate({ title, body, btnText, btnUrl, note }: {
  title: string; body: string; btnText: string; btnUrl: string; note: string;
}) {
  return `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0A0A0A;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0A0A0A;padding:40px 20px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#111;border:1px solid rgba(255,255,255,0.08);border-radius:20px;overflow:hidden;">
        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#00F5D4,#7B61FF);padding:30px;text-align:center;">
          <div style="width:48px;height:48px;background:rgba(0,0,0,0.3);border-radius:12px;display:inline-flex;align-items:center;justify-content:center;margin-bottom:12px;">
            <span style="color:#00F5D4;font-weight:900;font-size:14px;">AH</span>
          </div>
          <h1 style="margin:0;color:#fff;font-size:20px;font-weight:900;">Ali Hajali</h1>
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:36px 32px;">
          <h2 style="margin:0 0 12px;color:#fff;font-size:18px;font-weight:700;">${title}</h2>
          <p style="margin:0 0 28px;color:#9ca3af;font-size:14px;line-height:1.7;">${body}</p>
          <div style="text-align:center;margin-bottom:28px;">
            <a href="${btnUrl}" style="display:inline-block;background:#00F5D4;color:#0A0A0A;text-decoration:none;font-weight:900;font-size:14px;padding:14px 32px;border-radius:12px;">${btnText}</a>
          </div>
          <p style="margin:0;color:#6b7280;font-size:12px;text-align:center;">${note}</p>
        </td></tr>
        <!-- Footer -->
        <tr><td style="padding:20px 32px;border-top:1px solid rgba(255,255,255,0.06);text-align:center;">
          <p style="margin:0;color:#374151;font-size:11px;">© 2026 Ali Hajali · Qatar</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
