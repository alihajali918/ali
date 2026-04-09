"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Navbar from "../../components/Navbar";
import {
  Download, ImagePlus, X, Printer,
  RefreshCw, Users, BookOpen,
} from "lucide-react";

// ─────────────────────────────────────────────
// أنواع
// ─────────────────────────────────────────────
type Template = "classic" | "dark" | "corporate";

interface CertData {
  recipientName: string;
  courseName:    string;
  certDate:      string;
  directorName:  string;
  centerName:    string;
  description:   string;
}

interface DrawOpts {
  data:       CertData;
  template:   Template;
  accent:     string;
  logoImg:    HTMLImageElement | null;
}

// ─────────────────────────────────────────────
// Canvas W/H
// ─────────────────────────────────────────────
const CW = 1200;
const CH = 848;

// ─────────────────────────────────────────────
// مساعدات Canvas
// ─────────────────────────────────────────────
function hex2rgb(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.arcTo(x + w, y,     x + w, y + r,     r);
  ctx.lineTo(x + w, y + h - r);
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h);
  ctx.arcTo(x, y + h,     x, y + h - r,     r);
  ctx.lineTo(x, y + r);
  ctx.arcTo(x, y,         x + r, y,         r);
  ctx.closePath();
}

function textFit(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  baseFontSize: number,
  weight = "900"
): string {
  let size = baseFontSize;
  ctx.font = `${weight} ${size}px Cairo`;
  while (ctx.measureText(text).width > maxWidth && size > 18) {
    size -= 2;
    ctx.font = `${weight} ${size}px Cairo`;
  }
  return `${weight} ${size}px Cairo`;
}

// ─────────────────────────────────────────────
// رسم الشهادات
// ─────────────────────────────────────────────
function drawClassic(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg } = opts;
  const [ar, ag, ab] = hex2rgb(accent);

  // خلفية كريمية
  ctx.fillStyle = "#FDFAF4";
  ctx.fillRect(0, 0, CW, CH);

  // إطار خارجي مزدوج
  ctx.strokeStyle = accent;
  ctx.lineWidth = 6;
  ctx.strokeRect(24, 24, CW - 48, CH - 48);
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.3)`;
  ctx.lineWidth = 2;
  ctx.strokeRect(36, 36, CW - 72, CH - 72);

  // زخارف الزوايا
  const corners = [[50, 50], [CW - 50, 50], [50, CH - 50], [CW - 50, CH - 50]];
  corners.forEach(([cx, cy]) => {
    ctx.fillStyle = accent;
    ctx.beginPath();
    ctx.arc(cx, cy, 8, 0, Math.PI * 2);
    ctx.fill();
  });

  // شريط عنوان علوي
  const grad = ctx.createLinearGradient(0, 0, CW, 0);
  grad.addColorStop(0, `rgba(${ar},${ag},${ab},0.08)`);
  grad.addColorStop(0.5, `rgba(${ar},${ag},${ab},0.18)`);
  grad.addColorStop(1, `rgba(${ar},${ag},${ab},0.08)`);
  ctx.fillStyle = grad;
  ctx.fillRect(50, 50, CW - 100, 110);

  // اسم المركز
  ctx.fillStyle = accent;
  ctx.font = "700 20px Cairo";
  ctx.textAlign = "center";
  ctx.fillText(data.centerName || "مركز التدريب", CW / 2, 100);

  // عنوان "شهادة تقدير"
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "900 52px Cairo";
  ctx.fillText("شـهـادة تـقـدير", CW / 2, 200);

  // خط تزييني
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CW / 2 - 120, 220); ctx.lineTo(CW / 2 - 20, 220);
  ctx.moveTo(CW / 2 + 20, 220);  ctx.lineTo(CW / 2 + 120, 220);
  ctx.stroke();

  // نص "يُمنح هذه الشهادة إلى"
  ctx.fillStyle = "#6b7280";
  ctx.font = "600 18px Cairo";
  ctx.fillText("يُمنح هذه الشهادة إلى", CW / 2, 270);

  // اسم المتلقي
  const nameFont = textFit(ctx, data.recipientName || "اسم المتدرب", CW - 200, 64);
  ctx.fillStyle = accent;
  ctx.font = nameFont;
  ctx.fillText(data.recipientName || "اسم المتدرب", CW / 2, 350);

  // خط تحت الاسم
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.4)`;
  ctx.lineWidth = 1.5;
  const nameW = ctx.measureText(data.recipientName || "اسم المتدرب").width;
  ctx.beginPath();
  ctx.moveTo(CW / 2 - nameW / 2 - 20, 365);
  ctx.lineTo(CW / 2 + nameW / 2 + 20, 365);
  ctx.stroke();

  // وصف
  const desc = data.description || `لإتمامه بنجاح دورة "${data.courseName || "اسم الدورة"}"`;
  ctx.fillStyle = "#374151";
  ctx.font = "600 19px Cairo";
  ctx.fillText(desc, CW / 2, 420);

  // اسم الدورة
  if (data.courseName && !data.description) {
    ctx.fillStyle = "#1a1a1a";
    ctx.font = textFit(ctx, data.courseName, CW - 240, 32, "700");
    ctx.fillText(data.courseName, CW / 2, 465);
  }

  // تاريخ
  ctx.fillStyle = "#9ca3af";
  ctx.font = "600 16px Cairo";
  ctx.fillText(
    `بتاريخ: ${data.certDate ? new Date(data.certDate).toLocaleDateString("ar-QA", { year: "numeric", month: "long", day: "numeric" }) : "التاريخ"}`,
    CW / 2, 520
  );

  // خط فاصل
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.2)`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 580); ctx.lineTo(CW - 100, 580);
  ctx.stroke();

  // توقيع
  const sigX = CW / 2;
  ctx.fillStyle = "#374151";
  ctx.font = "700 15px Cairo";
  ctx.fillText(data.directorName || "اسم المدير", sigX, 640);
  ctx.fillStyle = "#9ca3af";
  ctx.font = "600 13px Cairo";
  ctx.fillText("المدير التنفيذي", sigX, 660);
  ctx.strokeStyle = "#d1d5db";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(sigX - 80, 615); ctx.lineTo(sigX + 80, 615);
  ctx.stroke();

  // شعار
  if (logoImg) {
    const ls = 72;
    ctx.save();
    roundRect(ctx, CW - 130, 55, ls, ls, 12);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.drawImage(logoImg, CW - 126, 59, ls - 8, ls - 8);
    ctx.restore();
  }

  // رقم الشهادة
  ctx.fillStyle = "#d1d5db";
  ctx.font = "500 11px Cairo";
  ctx.textAlign = "right";
  ctx.fillText(`تاريخ الإصدار: ${new Date().getFullYear()}`, CW - 60, CH - 45);
  ctx.textAlign = "center";
}

function drawDark(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg } = opts;
  const [ar, ag, ab] = hex2rgb(accent);

  // خلفية داكنة
  ctx.fillStyle = "#0A0A0A";
  ctx.fillRect(0, 0, CW, CH);

  // إضاءة خلفية
  const glow1 = ctx.createRadialGradient(CW * 0.25, CH * 0.4, 0, CW * 0.25, CH * 0.4, 400);
  glow1.addColorStop(0, `rgba(${ar},${ag},${ab},0.12)`);
  glow1.addColorStop(1, "transparent");
  ctx.fillStyle = glow1;
  ctx.fillRect(0, 0, CW, CH);

  const glow2 = ctx.createRadialGradient(CW * 0.75, CH * 0.6, 0, CW * 0.75, CH * 0.6, 350);
  glow2.addColorStop(0, "rgba(123,97,255,0.1)");
  glow2.addColorStop(1, "transparent");
  ctx.fillStyle = glow2;
  ctx.fillRect(0, 0, CW, CH);

  // إطار متدرج
  ctx.save();
  roundRect(ctx, 24, 24, CW - 48, CH - 48, 24);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.stroke();
  ctx.restore();

  // شريط علوي
  const topGrad = ctx.createLinearGradient(0, 0, CW, 0);
  topGrad.addColorStop(0, `rgba(${ar},${ag},${ab},0)`);
  topGrad.addColorStop(0.5, `rgba(${ar},${ag},${ab},0.15)`);
  topGrad.addColorStop(1, `rgba(${ar},${ag},${ab},0)`);
  ctx.fillStyle = topGrad;
  ctx.fillRect(50, 50, CW - 100, 90);

  // اسم المركز
  ctx.fillStyle = accent;
  ctx.font = "700 18px Cairo";
  ctx.textAlign = "center";
  ctx.fillText(data.centerName || "مركز التدريب", CW / 2, 95);

  // العنوان
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 56px Cairo";
  ctx.fillText("شـهـادة تـقـدير", CW / 2, 198);

  // خط نيون
  ctx.shadowColor = accent;
  ctx.shadowBlur = 12;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CW / 2 - 200, 215); ctx.lineTo(CW / 2 + 200, 215);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // نص فرعي
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "600 17px Cairo";
  ctx.fillText("يُمنح هذه الشهادة إلى", CW / 2, 265);

  // الاسم
  const nameFont = textFit(ctx, data.recipientName || "اسم المتدرب", CW - 180, 68);
  ctx.fillStyle = accent;
  ctx.shadowColor = accent;
  ctx.shadowBlur = 20;
  ctx.font = nameFont;
  ctx.fillText(data.recipientName || "اسم المتدرب", CW / 2, 350);
  ctx.shadowBlur = 0;

  // وصف
  const desc = data.description || `لإتمامه بنجاح دورة "${data.courseName || "اسم الدورة"}"`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 18px Cairo";
  ctx.fillText(desc, CW / 2, 415);

  if (data.courseName && !data.description) {
    ctx.fillStyle = "#FFFFFF";
    ctx.font = textFit(ctx, data.courseName, CW - 240, 30, "700");
    ctx.fillText(data.courseName, CW / 2, 460);
  }

  // تاريخ
  ctx.fillStyle = "rgba(255,255,255,0.35)";
  ctx.font = "600 15px Cairo";
  ctx.fillText(
    `بتاريخ: ${data.certDate ? new Date(data.certDate).toLocaleDateString("ar-QA", { year: "numeric", month: "long", day: "numeric" }) : "التاريخ"}`,
    CW / 2, 510
  );

  // خط فاصل
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(100, 568); ctx.lineTo(CW - 100, 568);
  ctx.stroke();

  // توقيع
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.beginPath();
  ctx.moveTo(CW / 2 - 80, 610); ctx.lineTo(CW / 2 + 80, 610);
  ctx.stroke();
  ctx.fillStyle = "rgba(255,255,255,0.8)";
  ctx.font = "700 15px Cairo";
  ctx.fillText(data.directorName || "اسم المدير", CW / 2, 635);
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "600 13px Cairo";
  ctx.fillText("المدير التنفيذي", CW / 2, 655);

  // شعار
  if (logoImg) {
    const ls = 70;
    ctx.save();
    roundRect(ctx, CW - 128, 56, ls, ls, 12);
    ctx.fillStyle = "rgba(255,255,255,0.08)";
    ctx.fill();
    ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.4)`;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.drawImage(logoImg, CW - 124, 60, ls - 8, ls - 8);
    ctx.restore();
  }
}

function drawCorporate(ctx: CanvasRenderingContext2D, opts: DrawOpts) {
  const { data, accent, logoImg } = opts;
  const [ar, ag, ab] = hex2rgb(accent);

  // خلفية بيضاء
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, CW, CH);

  // شريط جانبي أيسر
  const barGrad = ctx.createLinearGradient(0, 0, 0, CH);
  barGrad.addColorStop(0, accent);
  barGrad.addColorStop(1, `rgba(${ar},${ag},${ab},0.6)`);
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, 8, CH);

  // رأس ملوّن
  ctx.fillStyle = accent;
  ctx.fillRect(0, 0, CW, 120);

  // أسم المركز في الرأس
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = "700 18px Cairo";
  ctx.textAlign = "center";
  ctx.fillText(data.centerName || "مركز التدريب الاحترافي", CW / 2, 55);

  // عنوان الشهادة في الرأس
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "900 34px Cairo";
  ctx.fillText("شـهـادة تـقـدير واجتياز", CW / 2, 98);

  // شعار في الرأس
  if (logoImg) {
    const ls = 80;
    ctx.save();
    ctx.fillStyle = "rgba(255,255,255,0.15)";
    roundRect(ctx, 24, 20, ls, ls, 12);
    ctx.fill();
    ctx.drawImage(logoImg, 28, 24, ls - 8, ls - 8);
    ctx.restore();
  }

  // المحتوى
  ctx.fillStyle = "#374151";
  ctx.font = "500 17px Cairo";
  ctx.fillText("نشهد بأن المتدرب / المتدربة", CW / 2, 185);

  // اسم المتلقي
  const nameFont = textFit(ctx, data.recipientName || "اسم المتدرب", CW - 200, 60, "900");
  ctx.fillStyle = "#111827";
  ctx.font = nameFont;
  ctx.fillText(data.recipientName || "اسم المتدرب", CW / 2, 265);

  // خط تحت الاسم
  const nameWidth = ctx.measureText(data.recipientName || "اسم المتدرب").width;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(CW / 2 - nameWidth / 2 - 10, 278);
  ctx.lineTo(CW / 2 + nameWidth / 2 + 10, 278);
  ctx.stroke();

  // وصف
  const desc = data.description || "قد أتمّ بنجاح متطلبات الدورة التدريبية";
  ctx.fillStyle = "#6b7280";
  ctx.font = "500 17px Cairo";
  ctx.fillText(desc, CW / 2, 330);

  // اسم الدورة في مستطيل
  const cname = data.courseName || "اسم الدورة التدريبية";
  ctx.fillStyle = `rgba(${ar},${ag},${ab},0.06)`;
  roundRect(ctx, CW / 2 - 280, 355, 560, 60, 12);
  ctx.fill();
  ctx.strokeStyle = `rgba(${ar},${ag},${ab},0.2)`;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = accent;
  ctx.font = textFit(ctx, cname, 520, 26, "700");
  ctx.fillText(cname, CW / 2, 393);

  // التاريخ والمدة
  ctx.fillStyle = "#9ca3af";
  ctx.font = "500 15px Cairo";
  ctx.fillText(
    `تاريخ الإصدار: ${data.certDate ? new Date(data.certDate).toLocaleDateString("ar-QA", { year: "numeric", month: "long", day: "numeric" }) : "التاريخ"}`,
    CW / 2, 455
  );

  // خط فاصل
  ctx.strokeStyle = "#e5e7eb";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(80, 510); ctx.lineTo(CW - 80, 510);
  ctx.stroke();

  // التوقيعات
  const sigs = [
    { x: CW * 0.28, label: data.directorName || "المدير التنفيذي", title: "التوقيع" },
    { x: CW * 0.72, label: "ختم المركز", title: "الختم الرسمي" },
  ];
  sigs.forEach(({ x, label, title }) => {
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x - 80, 575); ctx.lineTo(x + 80, 575);
    ctx.stroke();
    ctx.fillStyle = "#374151";
    ctx.font = "700 14px Cairo";
    ctx.textAlign = "center";
    ctx.fillText(label, x, 598);
    ctx.fillStyle = "#9ca3af";
    ctx.font = "500 12px Cairo";
    ctx.fillText(title, x, 616);
  });

  // تذييل
  ctx.fillStyle = accent;
  ctx.fillRect(0, CH - 40, CW, 40);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "500 12px Cairo";
  ctx.textAlign = "center";
  ctx.fillText(
    `${data.centerName || "مركز التدريب"} · ${new Date().getFullYear()} · جميع الحقوق محفوظة`,
    CW / 2, CH - 16
  );
}

// ─────────────────────────────────────────────
// رسم الشهادة الرئيسي
// ─────────────────────────────────────────────
function drawCertificate(canvas: HTMLCanvasElement, opts: DrawOpts) {
  const ctx = canvas.getContext("2d")!;
  canvas.width  = CW;
  canvas.height = CH;
  ctx.clearRect(0, 0, CW, CH);

  if (opts.template === "classic")   drawClassic(ctx, opts);
  else if (opts.template === "dark") drawDark(ctx, opts);
  else                               drawCorporate(ctx, opts);
}

// ─────────────────────────────────────────────
// الصفحة الرئيسية
// ─────────────────────────────────────────────
const TEMPLATES: { id: Template; label: string; bg: string; desc: string }[] = [
  { id: "classic",   label: "كلاسيكي",    bg: "#FDFAF4", desc: "ذهبي فاخر على خلفية كريمية" },
  { id: "dark",      label: "داكن نيون",  bg: "#0A0A0A", desc: "أسلوب عصري بإضاءة نيون" },
  { id: "corporate", label: "مؤسسي",      bg: "#FFFFFF", desc: "احترافي لبيئات الأعمال" },
];

export default function CertsPage() {
  const [data, setData] = useState<CertData>({
    recipientName: "",
    courseName:    "",
    certDate:      new Date().toISOString().split("T")[0],
    directorName:  "",
    centerName:    "",
    description:   "",
  });
  const [template,    setTemplate]    = useState<Template>("classic");
  const [accent,      setAccent]      = useState("#C9A84C");
  const [logoUrl,     setLogoUrl]     = useState<string | null>(null);
  const [logoImg,     setLogoImg]     = useState<HTMLImageElement | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoRef   = useRef<HTMLInputElement>(null);

  // تحميل صورة الشعار
  useEffect(() => {
    if (!logoUrl) { setLogoImg(null); return; }
    const img = new Image();
    img.onload = () => setLogoImg(img);
    img.src = logoUrl;
  }, [logoUrl]);

  // تحميل خط Cairo ثم رسم الشهادة
  useEffect(() => {
    if (!canvasRef.current) return;
    const opts: DrawOpts = { data, template, accent, logoImg };

    if ((document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        if (canvasRef.current) drawCertificate(canvasRef.current, opts);
      });
    } else {
      drawCertificate(canvasRef.current, opts);
    }
  }, [data, template, accent, logoImg]);

  // لون افتراضي حسب القالب
  useEffect(() => {
    if (template === "classic")   setAccent("#C9A84C");
    else if (template === "dark") setAccent("#00F5D4");
    else                          setAccent("#3B82F6");
  }, [template]);

  const handleLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setLogoUrl(e.target!.result as string);
    reader.readAsDataURL(file);
  };

  const downloadPNG = useCallback(() => {
    if (!canvasRef.current) return;
    const a = document.createElement("a");
    a.href = canvasRef.current.toDataURL("image/png");
    a.download = `شهادة_${data.recipientName || "مجهول"}.png`;
    a.click();
  }, [data.recipientName]);

  const printCert = useCallback(() => {
    if (!canvasRef.current) return;
    const url = canvasRef.current.toDataURL("image/png");
    const win = window.open("", "_blank", "width=1200,height=900");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>شهادة</title>
<style>body{margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f5f5f5}
img{max-width:100%;box-shadow:0 4px 24px rgba(0,0,0,0.2)}
@media print{body{background:white}img{box-shadow:none;width:100%}}</style>
</head><body><img src="${url}"/></body></html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 600);
  }, []);

  const upd = (k: keyof CertData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData((d) => ({ ...d, [k]: e.target.value }));

  const inputCls = "w-full bg-glass border border-glass-border rounded-xl px-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors";

  return (
    <main className="min-h-screen">
      <Navbar />

      <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">

        {/* رأس */}
        <div className="mb-6 text-center">
          <span className="section-badge mb-3 inline-flex">اشتراك شهري</span>
          <h1 className="text-3xl md:text-4xl font-black mb-1">
            صانع <span className="text-gradient">الشهادات</span>
          </h1>
          <p className="text-gray-500 text-sm">صمّم شهادات احترافية لمركزك التدريبي في ثوانٍ</p>
        </div>

        <div className="grid lg:grid-cols-[360px_1fr] gap-6 items-start">

          {/* ──────── الشريط الجانبي ──────── */}
          <div className="flex flex-col gap-4">

            {/* اختيار القالب */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3">القالب</p>
              <div className="flex flex-col gap-2">
                {TEMPLATES.map((t) => (
                  <button key={t.id} onClick={() => setTemplate(t.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all text-right ${
                      template === t.id
                        ? "border border-neon-cyan/30 bg-neon-cyan/8"
                        : "border border-glass-border hover:border-white/15"
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg border border-glass-border flex-shrink-0"
                      style={{ background: t.bg }} />
                    <div>
                      <p className={`text-sm font-bold ${template === t.id ? "text-neon-cyan" : "text-white"}`}>
                        {t.label}
                      </p>
                      <p className="text-[11px] text-gray-600">{t.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* بيانات المتدرب */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Users size={13} /> بيانات المتدرب
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">اسم المتدرب *</label>
                  <input value={data.recipientName} onChange={upd("recipientName")}
                    placeholder="محمد أحمد العلي" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">اسم الدورة *</label>
                  <input value={data.courseName} onChange={upd("courseName")}
                    placeholder="دورة البرمجة المتقدمة" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">وصف مخصص (اختياري)</label>
                  <textarea value={data.description} onChange={upd("description")}
                    placeholder="لإتمامه بنجاح..."
                    rows={2}
                    className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors resize-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">التاريخ</label>
                  <input type="date" value={data.certDate} onChange={upd("certDate")}
                    dir="ltr" className={inputCls} />
                </div>
              </div>
            </div>

            {/* بيانات المركز */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <BookOpen size={13} /> بيانات المركز
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">اسم المركز</label>
                  <input value={data.centerName} onChange={upd("centerName")}
                    placeholder="مركز الإبداع للتدريب" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">اسم المدير</label>
                  <input value={data.directorName} onChange={upd("directorName")}
                    placeholder="م. خالد الدوسري" className={inputCls} />
                </div>
                {/* شعار */}
                {!logoUrl ? (
                  <button onClick={() => logoRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-glass-border rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-bold">
                    <ImagePlus size={14} /> رفع شعار المركز
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-2 bg-glass rounded-xl border border-glass-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={logoUrl} alt="logo" className="w-10 h-10 object-contain rounded-lg bg-white p-1" />
                    <span className="flex-1 text-xs text-gray-400">تم رفع الشعار</span>
                    <button onClick={() => setLogoUrl(null)} className="text-gray-600 hover:text-red-400 transition-colors"><X size={14} /></button>
                  </div>
                )}
                <input ref={logoRef} type="file" accept="image/*" className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleLogo(e.target.files[0])} />
              </div>
            </div>

            {/* لون التمييز */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3">لون التمييز</p>
              <div className="flex items-center gap-3 mb-3">
                <label className="relative w-10 h-10 rounded-xl overflow-hidden border border-glass-border cursor-pointer shrink-0">
                  <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-full h-full" style={{ background: accent }} />
                </label>
                <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)}
                  maxLength={7} dir="ltr"
                  className="flex-1 bg-glass border border-glass-border rounded-xl px-3 py-2 text-xs font-mono text-gray-300 outline-none focus:border-neon-cyan/40 transition-colors" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {["#C9A84C", "#00F5D4", "#7B61FF", "#3B82F6", "#10B981", "#EF4444", "#F59E0B", "#EC4899"].map((c) => (
                  <button key={c} onClick={() => setAccent(c)}
                    className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                    style={{ background: c, borderColor: accent === c ? "white" : "transparent" }} />
                ))}
              </div>
            </div>

            {/* أزرار */}
            <div className="flex flex-col gap-2">
              <button onClick={downloadPNG}
                className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-cyan text-dark-bg font-black text-sm hover:scale-105 active:scale-95 transition-all glow-cyan">
                <Download size={16} /> تحميل PNG
              </button>
              <button onClick={printCert}
                className="flex items-center justify-center gap-2 py-3 rounded-2xl glass-card text-white font-bold text-sm hover:border-white/15 transition-all">
                <Printer size={15} /> طباعة
              </button>
            </div>
          </div>

          {/* ──────── معاينة الشهادة ──────── */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-gray-500">معاينة مباشرة</p>
              <span className="text-[10px] text-gray-700 font-semibold">{CW}×{CH}px</span>
            </div>
            <div className="rounded-2xl overflow-hidden border border-glass-border">
              <canvas
                ref={canvasRef}
                className="w-full h-auto block"
                style={{ imageRendering: "crisp-edges" }}
              />
            </div>
            <p className="text-[11px] text-gray-700 text-center">
              الشهادة بدقة عالية {CW}×{CH} — مناسبة للطباعة والمشاركة
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
