"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import QRCodeLib from "qrcode";
import * as XLSX from "xlsx";
import JSZip from "jszip";
import {
  Link2, Type, Mail, Phone, User, Layers,
  Download, Copy, Check, RefreshCw,
  Upload, Trash2, AlertCircle, Loader2, ImagePlus, X,
} from "lucide-react";

// ─────────────────────────────────────────────
// أنواع
// ─────────────────────────────────────────────
type Mode        = "url" | "text" | "email" | "phone" | "vcard" | "bulk";
type ErrorLevel  = "L" | "M" | "Q" | "H";
type CornerStyle = "sharp" | "rounded";

interface VCard {
  firstName: string; lastName: string; title: string;
  org: string; phone: string; email: string; website: string;
}
interface BulkRow { id: number; value: string; filename: string; }

// ─────────────────────────────────────────────
// كشف finder patterns
// ─────────────────────────────────────────────
function isFinderModule(r: number, c: number, size: number): boolean {
  if (r < 7 && c < 7) return true;           // أعلى يسار
  if (r < 7 && c >= size - 7) return true;   // أعلى يمين
  if (r >= size - 7 && c < 7) return true;   // أسفل يسار
  return false;
}

// ─────────────────────────────────────────────
// رسم مساعدات
// ─────────────────────────────────────────────
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number, r: number
) {
  r = Math.min(r, w / 2, h / 2);
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
  ctx.fill();
}

// رسم finder pattern (المربع الخارجي الكبير)
function drawFinderPattern(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  cell: number,
  fg: string, bg: string,
  corner: CornerStyle
) {
  const outer = 7 * cell;
  const outerR = corner === "rounded" ? cell * 1.5 : 0;
  const innerR = corner === "rounded" ? cell * 0.8 : 0;

  // مربع خارجي داكن
  ctx.fillStyle = fg;
  drawRoundedRect(ctx, x, y, outer, outer, outerR);

  // حلقة بيضاء
  ctx.fillStyle = bg;
  drawRoundedRect(ctx, x + cell, y + cell, 5 * cell, 5 * cell, innerR);

  // مربع داخلي داكن (3×3)
  ctx.fillStyle = fg;
  drawRoundedRect(ctx, x + 2 * cell, y + 2 * cell, 3 * cell, 3 * cell, innerR * 0.6);
}

// ─────────────────────────────────────────────
// رسم QR على Canvas
// ─────────────────────────────────────────────
function renderQRToCanvas(
  canvas: HTMLCanvasElement,
  text: string,
  opts: {
    size: number; fg: string; bg: string;
    level: ErrorLevel; corner: CornerStyle;
    logoImg?: HTMLImageElement | null;
  }
) {
  try {
    const qr  = (QRCodeLib as any).create(text || " ", { errorCorrectionLevel: opts.level });
    const mc  = qr.modules.size as number;
    const md  = qr.modules.data as Uint8ClampedArray;
    const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;

    canvas.width  = opts.size * dpr;
    canvas.height = opts.size * dpr;
    canvas.style.width  = `${opts.size}px`;
    canvas.style.height = `${opts.size}px`;

    const ctx = canvas.getContext("2d")!;
    ctx.scale(dpr, dpr);

    const margin   = 2;
    const cell     = opts.size / (mc + margin * 2);
    const pad      = margin * cell;
    const rr       = opts.corner === "rounded" ? cell * 0.3 : 0;

    // خلفية
    ctx.fillStyle = opts.bg;
    ctx.fillRect(0, 0, opts.size, opts.size);

    // الوحدات العادية (بدون finder patterns)
    ctx.fillStyle = opts.fg;
    for (let r = 0; r < mc; r++) {
      for (let c = 0; c < mc; c++) {
        if (isFinderModule(r, c, mc)) continue;
        if (!md[r * mc + c]) continue;
        const x = pad + c * cell;
        const y = pad + r * cell;
        if (rr > 0) {
          drawRoundedRect(ctx, x + 0.3, y + 0.3, cell - 0.6, cell - 0.6, rr);
        } else {
          ctx.fillRect(x, y, cell, cell);
        }
      }
    }

    // Finder patterns (المربعات الخارجية الثلاثة)
    drawFinderPattern(ctx, pad, pad, cell, opts.fg, opts.bg, opts.corner);                            // أعلى يسار
    drawFinderPattern(ctx, pad + (mc - 7) * cell, pad, cell, opts.fg, opts.bg, opts.corner);         // أعلى يمين
    drawFinderPattern(ctx, pad, pad + (mc - 7) * cell, cell, opts.fg, opts.bg, opts.corner);         // أسفل يسار

    // شعار في المنتصف
    if (opts.logoImg) {
      const logoSize = opts.size * 0.22;
      const logoX    = (opts.size - logoSize) / 2;
      const logoY    = (opts.size - logoSize) / 2;
      const pad2     = logoSize * 0.18;

      // خلفية بيضاء مدورة
      ctx.fillStyle = opts.bg;
      drawRoundedRect(ctx, logoX - pad2, logoY - pad2, logoSize + pad2 * 2, logoSize + pad2 * 2, pad2 * 0.8);

      // الشعار
      ctx.drawImage(opts.logoImg, logoX, logoY, logoSize, logoSize);
    }
  } catch (e) {
    console.error("QR render error:", e);
  }
}

// ─────────────────────────────────────────────
// توليد SVG
// ─────────────────────────────────────────────
function generateQRSVG(
  text: string,
  opts: { size: number; fg: string; bg: string; level: ErrorLevel; corner: CornerStyle; logoDataUrl?: string | null; }
): string {
  const qr  = (QRCodeLib as any).create(text || " ", { errorCorrectionLevel: opts.level });
  const mc  = qr.modules.size as number;
  const md  = qr.modules.data as Uint8ClampedArray;
  const vb  = mc + 4;
  const rr  = opts.corner === "rounded" ? 0.3 : 0;
  const frr = opts.corner === "rounded" ? 1.4 : 0;

  let d = "";
  for (let r = 0; r < mc; r++) {
    for (let c = 0; c < mc; c++) {
      if (isFinderModule(r, c, mc)) continue;
      if (!md[r * mc + c]) continue;
      const x = c + 2 + 0.05, y = r + 2 + 0.05;
      const s = 0.9;
      if (rr === 0) {
        d += `M${x},${y}h${s}v${s}h-${s}z `;
      } else {
        d += `M${x+rr},${y}h${s-2*rr}a${rr},${rr},0,0,1,${rr},${rr}v${s-2*rr}a${rr},${rr},0,0,1,-${rr},${rr}h-${s-2*rr}a${rr},${rr},0,0,1,-${rr},-${rr}v-${s-2*rr}a${rr},${rr},0,0,1,${rr},-${rr}Z `;
      }
    }
  }

  // دالة رسم finder بـ SVG
  const finder = (ox: number, oy: number) => {
    const ir = opts.corner === "rounded" ? 0.7 : 0;
    const o7 = 7, o5 = 5, o3 = 3;
    return `
      <rect x="${ox}" y="${oy}" width="${o7}" height="${o7}" fill="${opts.fg}" rx="${frr}" ry="${frr}"/>
      <rect x="${ox+1}" y="${oy+1}" width="${o5}" height="${o5}" fill="${opts.bg}" rx="${ir}" ry="${ir}"/>
      <rect x="${ox+2}" y="${oy+2}" width="${o3}" height="${o3}" fill="${opts.fg}" rx="${ir*0.5}" ry="${ir*0.5}"/>
    `;
  };

  const logoTag = opts.logoDataUrl
    ? `<image href="${opts.logoDataUrl}" x="${vb/2 - vb*0.11}" y="${vb/2 - vb*0.11}" width="${vb*0.22}" height="${vb*0.22}" preserveAspectRatio="xMidYMid meet"/>`
    : "";

  const logoWhiteBg = opts.logoDataUrl
    ? `<rect x="${vb/2 - vb*0.14}" y="${vb/2 - vb*0.14}" width="${vb*0.28}" height="${vb*0.28}" fill="${opts.bg}" rx="2"/>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${opts.size}" height="${opts.size}" viewBox="0 0 ${vb} ${vb}">
<rect width="${vb}" height="${vb}" fill="${opts.bg}"/>
<path fill="${opts.fg}" d="${d}"/>
${finder(2, 2)}
${finder(mc - 5, 2)}
${finder(2, mc - 5)}
${logoWhiteBg}
${logoTag}
</svg>`;
}

// ─────────────────────────────────────────────
// بناء vCard
// ─────────────────────────────────────────────
function buildVCardString(v: VCard): string {
  const fn = `${v.firstName} ${v.lastName}`.trim();
  return [
    "BEGIN:VCARD", "VERSION:3.0",
    `N:${v.lastName};${v.firstName};;;`,
    fn ? `FN:${fn}` : "",
    v.org   ? `ORG:${v.org}`             : "",
    v.title ? `TITLE:${v.title}`         : "",
    v.phone ? `TEL;TYPE=CELL:${v.phone}` : "",
    v.email ? `EMAIL:${v.email}`         : "",
    v.website ? `URL:${v.website}`       : "",
    "END:VCARD",
  ].filter(Boolean).join("\n");
}

// توليد blob
async function qrToBlob(
  text: string,
  opts: { size: number; fg: string; bg: string; level: ErrorLevel; corner: CornerStyle; logoImg?: HTMLImageElement | null; }
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  renderQRToCanvas(canvas, text, opts);
  return new Promise((res) => canvas.toBlob((b) => res(b!), "image/png"));
}

// ─────────────────────────────────────────────
// مكون معاينة
// ─────────────────────────────────────────────
function QRPreview({ value, size, fg, bg, level, corner, isEmpty, logoImg }: {
  value: string; size: number; fg: string; bg: string;
  level: ErrorLevel; corner: CornerStyle; isEmpty: boolean;
  logoImg: HTMLImageElement | null;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const displaySize = Math.min(size, 220);

  useEffect(() => {
    if (!ref.current) return;
    renderQRToCanvas(ref.current, isEmpty ? "https://alihajali.com" : value, {
      size: displaySize, fg, bg, level, corner, logoImg,
    });
  }, [value, displaySize, fg, bg, level, corner, isEmpty, logoImg]);

  return (
    <div className={`rounded-2xl overflow-hidden transition-opacity duration-300 ${isEmpty ? "opacity-30" : "opacity-100"}`} style={{ lineHeight: 0 }}>
      <canvas ref={ref} style={{ width: displaySize, height: displaySize }} />
    </div>
  );
}

// ─────────────────────────────────────────────
// UI مشترك
// ─────────────────────────────────────────────
function ColorPicker({ fgColor, bgColor, onFg, onBg }: {
  fgColor: string; bgColor: string;
  onFg: (v: string) => void; onBg: (v: string) => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-xs font-bold text-gray-400 mb-3">الألوان</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "لون الرمز", val: fgColor, set: onFg },
          { label: "لون الخلفية", val: bgColor, set: onBg },
        ].map(({ label, val, set }) => (
          <div key={label}>
            <p className="text-[11px] text-gray-500 mb-1.5">{label}</p>
            <div className="flex items-center gap-2">
              <label className="relative w-8 h-8 rounded-lg overflow-hidden border border-glass-border cursor-pointer shrink-0">
                <input type="color" value={val} onChange={(e) => set(e.target.value)}
                  className="absolute inset-0 opacity-0 cursor-pointer" />
                <div className="w-full h-full" style={{ background: val }} />
              </label>
              <input type="text" value={val} onChange={(e) => set(e.target.value)}
                maxLength={7} dir="ltr"
                className="flex-1 min-w-0 bg-glass border border-glass-border rounded-lg px-2 py-1.5 text-xs font-mono text-gray-300 outline-none focus:border-neon-cyan/40 transition-colors" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QRSettings({ qrSize, errorLevel, corner, hasLogo, onSize, onLevel, onCorner }: {
  qrSize: number; errorLevel: ErrorLevel; corner: CornerStyle; hasLogo: boolean;
  onSize: (v: number) => void; onLevel: (v: ErrorLevel) => void; onCorner: (v: CornerStyle) => void;
}) {
  return (
    <div className="glass-card rounded-2xl p-4 flex flex-col gap-4">
      {/* الحجم */}
      <div>
        <label className="text-xs text-gray-400 font-bold mb-2 block">الحجم — {qrSize}px</label>
        <input type="range" min={128} max={512} step={16} value={qrSize}
          onChange={(e) => onSize(Number(e.target.value))}
          className="w-full accent-neon-cyan" dir="ltr" />
        <div className="flex justify-between text-[10px] text-gray-700 mt-0.5"><span>128</span><span>512</span></div>
      </div>

      {/* شكل الزوايا */}
      <div>
        <p className="text-xs text-gray-400 font-bold mb-2">شكل الزوايا</p>
        <div className="grid grid-cols-2 gap-2">
          {([
            { id: "sharp"   as CornerStyle, label: "حادة",   icon: "■" },
            { id: "rounded" as CornerStyle, label: "منحنية", icon: "⬛" },
          ]).map(({ id, label, icon }) => (
            <button key={id} onClick={() => onCorner(id)}
              className={`flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-all ${
                corner === id
                  ? "bg-neon-cyan text-dark-bg"
                  : "bg-glass border border-glass-border text-gray-400 hover:text-white"
              }`}>
              <span className={`text-sm leading-none ${id === "rounded" ? "rounded" : ""}`}>{icon}</span>
              {label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-600 mt-1.5">يؤثر على الوحدات والمربعات الخارجية</p>
      </div>

      {/* مستوى التصحيح */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs text-gray-400 font-bold">جودة التصحيح</p>
          {hasLogo && <span className="text-[10px] text-amber-400 font-bold">يُنصح H مع الشعار</span>}
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {(["L", "M", "Q", "H"] as ErrorLevel[]).map((l) => (
            <button key={l} onClick={() => onLevel(l)}
              className={`py-1.5 rounded-lg text-xs font-black transition-all ${
                errorLevel === l
                  ? "bg-neon-cyan text-dark-bg"
                  : "bg-glass border border-glass-border text-gray-500 hover:text-white"
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// رفع الشعار
function LogoUploader({ logoUrl, onUpload, onRemove }: {
  logoUrl: string | null;
  onUpload: (url: string) => void;
  onRemove: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => onUpload(e.target!.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div className="glass-card rounded-2xl p-4">
      <p className="text-xs font-bold text-gray-400 mb-3">شعار في المنتصف</p>
      {!logoUrl ? (
        <button
          onClick={() => ref.current?.click()}
          className="w-full flex items-center justify-center gap-2 py-3 border-2 border-dashed border-glass-border rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-bold"
        >
          <ImagePlus size={15} />
          رفع شعار (PNG / JPG / SVG)
        </button>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden border border-glass-border flex-shrink-0 bg-white flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-300 font-semibold mb-1">تم رفع الشعار</p>
            <p className="text-[10px] text-gray-600">سيظهر في مركز الرمز</p>
          </div>
          <button onClick={onRemove} className="text-gray-600 hover:text-red-400 transition-colors">
            <X size={16} />
          </button>
        </div>
      )}
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
    </div>
  );
}

// ─────────────────────────────────────────────
// وضع جماعي
// ─────────────────────────────────────────────
function BulkMode({ qrSize, fg, bg, level, corner }: {
  qrSize: number; fg: string; bg: string; level: ErrorLevel; corner: CornerStyle;
}) {
  const [rows, setRows]             = useState<BulkRow[]>([]);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress]     = useState(0);
  const [error, setError]           = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const parseFile = (file: File) => {
    setError("");
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target!.result as ArrayBuffer);
        const wb   = XLSX.read(data, { type: "array" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json<unknown[]>(ws, { header: 1 }) as unknown[][];
        const parsed: BulkRow[] = json
          .filter((row) => Array.isArray(row) && row[0])
          .map((row, i) => ({
            id: i,
            value:    String((row as unknown[])[0] ?? ""),
            filename: String((row as unknown[])[1] ?? `qr_${i + 1}`),
          }))
          .filter((r) => r.value.trim());
        if (!parsed.length) { setError("لم يُعثر على بيانات. العمود الأول يجب أن يحتوي على الروابط."); return; }
        setRows(parsed);
      } catch { setError("تعذّر قراءة الملف. استخدم Excel أو CSV."); }
    };
    reader.readAsArrayBuffer(file);
  };

  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      ["الرابط أو النص", "اسم الملف (اختياري)"],
      ["https://google.com", "google"],
      ["https://example.com", "example"],
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "QR");
    XLSX.writeFile(wb, "template_qr.xlsx");
  };

  const generateAll = async () => {
    if (!rows.length) return;
    setGenerating(true); setProgress(0);
    const zip = new JSZip();
    for (let i = 0; i < rows.length; i++) {
      try {
        const blob = await qrToBlob(rows[i].value, { size: qrSize, fg, bg, level, corner });
        zip.file(`${rows[i].filename}.png`, blob);
      } catch { /* skip */ }
      setProgress(Math.round(((i + 1) / rows.length) * 100));
    }
    const content = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(content);
    a.download = "qrcodes.zip";
    a.click();
    URL.revokeObjectURL(a.href);
    setGenerating(false);
  };

  return (
    <div className="flex flex-col gap-4">
      <div
        onDrop={(e) => { e.preventDefault(); e.dataTransfer.files[0] && parseFile(e.dataTransfer.files[0]); }}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="border-2 border-dashed border-glass-border rounded-2xl p-8 text-center hover:border-neon-cyan/30 transition-colors cursor-pointer"
      >
        <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
          onChange={(e) => e.target.files?.[0] && parseFile(e.target.files[0])} />
        <Upload size={24} className="mx-auto mb-3 text-gray-600" />
        <p className="text-sm font-bold text-gray-400">اسحب ملف Excel أو اضغط للرفع</p>
        <p className="text-xs text-gray-700 mt-1">.xlsx / .xls / .csv</p>
      </div>

      <button onClick={downloadTemplate}
        className="flex items-center justify-center gap-2 py-2.5 rounded-xl glass-card text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/20 transition-all text-xs font-bold">
        <Download size={13} /> تحميل قالب Excel
      </button>

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-xs">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />{error}
        </div>
      )}

      {rows.length > 0 && (
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-glass-border">
            <span className="text-xs font-bold text-gray-300">{rows.length} عنصر جاهز</span>
            <button onClick={() => setRows([])} className="text-gray-600 hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
          </div>
          <div className="max-h-44 overflow-y-auto">
            {rows.slice(0, 100).map((row, i) => (
              <div key={row.id} className="flex items-center gap-3 px-4 py-2 border-b border-glass-border/40 last:border-0">
                <span className="text-[10px] text-gray-700 w-5 shrink-0">{i + 1}</span>
                <span className="text-xs text-gray-400 truncate flex-1 font-mono" dir="ltr">{row.value}</span>
                <span className="text-[10px] text-gray-600 shrink-0">{row.filename}.png</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {generating && (
        <div className="glass-card rounded-2xl p-4">
          <div className="flex justify-between mb-2">
            <span className="text-xs font-bold text-gray-400">جارٍ التوليد...</span>
            <span className="text-xs font-black text-neon-cyan">{progress}%</span>
          </div>
          <div className="h-1.5 bg-glass-border rounded-full overflow-hidden">
            <div className="h-full bg-neon-cyan rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      )}

      <button onClick={generateAll} disabled={!rows.length || generating}
        className="flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-neon-cyan text-dark-bg font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all">
        {generating
          ? <><Loader2 size={16} className="animate-spin" /> جارٍ التوليد...</>
          : <><Download size={16} /> توليد وتحميل ZIP ({rows.length} ملف)</>}
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────
// الصفحة الرئيسية
// ─────────────────────────────────────────────
const modes = [
  { id: "url"   as Mode, label: "رابط",       icon: <Link2 size={13} /> },
  { id: "text"  as Mode, label: "نص",          icon: <Type size={13} /> },
  { id: "email" as Mode, label: "إيميل",       icon: <Mail size={13} /> },
  { id: "phone" as Mode, label: "هاتف",        icon: <Phone size={13} /> },
  { id: "vcard" as Mode, label: "بزنس كارد",   icon: <User size={13} /> },
  { id: "bulk"  as Mode, label: "جماعي",       icon: <Layers size={13} /> },
];

export default function QRCodePage() {
  const [mode, setMode]             = useState<Mode>("url");
  const [value, setValue]           = useState("");
  const [vcard, setVcard]           = useState<VCard>({
    firstName: "", lastName: "", title: "", org: "", phone: "", email: "", website: "",
  });
  const [fgColor, setFgColor]       = useState("#000000");
  const [bgColor, setBgColor]       = useState("#FFFFFF");
  const [qrSize, setQrSize]         = useState(256);
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>("M");
  const [corner, setCorner]         = useState<CornerStyle>("sharp");
  const [logoUrl, setLogoUrl]       = useState<string | null>(null);
  const [logoImg, setLogoImg]       = useState<HTMLImageElement | null>(null);
  const [copied, setCopied]         = useState(false);

  // تحميل صورة الشعار عند التغيير
  useEffect(() => {
    if (!logoUrl) { setLogoImg(null); return; }
    const img = new Image();
    img.onload = () => setLogoImg(img);
    img.src = logoUrl;
  }, [logoUrl]);

  // رفع مستوى التصحيح تلقائياً عند إضافة شعار
  useEffect(() => {
    if (logoUrl && errorLevel === "L") setErrorLevel("H");
  }, [logoUrl]);

  const qrValue = (() => {
    if (mode === "vcard") return buildVCardString(vcard);
    if (mode === "email") return value ? `mailto:${value}` : "";
    if (mode === "phone") return value ? `tel:${value}`   : "";
    return value;
  })();

  const isEmpty = mode === "vcard"
    ? !vcard.firstName && !vcard.phone && !vcard.email
    : !value.trim();

  const renderOpts = { size: qrSize, fg: fgColor, bg: bgColor, level: errorLevel, corner, logoImg };

  const downloadPNG = useCallback(async () => {
    const blob = await qrToBlob(qrValue || "https://alihajali.com", renderOpts);
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qrcode.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [qrValue, renderOpts]);

  const downloadSVG = useCallback(() => {
    const svg  = generateQRSVG(qrValue || "https://alihajali.com", {
      size: qrSize, fg: fgColor, bg: bgColor, level: errorLevel, corner, logoDataUrl: logoUrl,
    });
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "qrcode.svg";
    a.click();
    URL.revokeObjectURL(a.href);
  }, [qrValue, qrSize, fgColor, bgColor, errorLevel, corner, logoUrl]);

  const copyValue = useCallback(() => {
    const text = mode === "vcard" ? qrValue : value;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [qrValue, value, mode]);

  const reset = () => {
    setValue("");
    setVcard({ firstName: "", lastName: "", title: "", org: "", phone: "", email: "", website: "" });
    setFgColor("#000000"); setBgColor("#FFFFFF");
    setQrSize(256); setErrorLevel("M"); setCorner("sharp");
    setLogoUrl(null);
  };

  const isBulk = mode === "bulk";

  return (
    <main className="min-h-screen">

      <div className="pt-28 pb-20 px-4 max-w-5xl mx-auto">

        {/* رأس */}
        <div className="mb-6 text-center">
          <span className="section-badge mb-3 inline-flex">أداة مجانية</span>
          <h1 className="text-3xl md:text-4xl font-black mb-1">
            صانع <span className="text-gradient">QR Code</span>
          </h1>
          <p className="text-gray-500 text-sm">رابط · نص · بزنس كارد · شعار · جماعي</p>
        </div>

        {/* تبويبات — قابلة للتمرير */}
        <div className="overflow-x-auto pb-1 mb-5 -mx-4 px-4">
          <div className="flex gap-2 w-max">
            {modes.map((m) => (
              <button key={m.id} onClick={() => { setMode(m.id); setValue(""); }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  mode === m.id ? "bg-neon-cyan text-dark-bg" : "glass-card text-gray-400 hover:text-white"
                }`}>
                {m.icon}{m.label}
              </button>
            ))}
          </div>
        </div>

        {/* وضع جماعي */}
        {isBulk && (
          <div className="grid md:grid-cols-2 gap-5">
            <BulkMode qrSize={qrSize} fg={fgColor} bg={bgColor} level={errorLevel} corner={corner} />
            <div className="flex flex-col gap-4">
              <ColorPicker fgColor={fgColor} bgColor={bgColor} onFg={setFgColor} onBg={setBgColor} />
              <QRSettings qrSize={qrSize} errorLevel={errorLevel} corner={corner} hasLogo={!!logoUrl}
                onSize={setQrSize} onLevel={setErrorLevel} onCorner={setCorner} />
            </div>
          </div>
        )}

        {/* وضع فردي */}
        {!isBulk && (
          <div className="grid md:grid-cols-[1fr_260px] gap-5 items-start">

            {/* يسار: الإعدادات */}
            <div className="flex flex-col gap-4">

              {mode !== "vcard" && (
                <div className="glass-card rounded-2xl p-4">
                  <label className="block text-xs font-bold text-gray-400 mb-2">
                    {modes.find((m) => m.id === mode)?.label}
                  </label>
                  <input type="text" value={value} onChange={(e) => setValue(e.target.value)}
                    dir={mode === "text" ? "rtl" : "ltr"}
                    placeholder={
                      mode === "url"   ? "https://example.com" :
                      mode === "email" ? "example@email.com"   :
                      mode === "phone" ? "+974 5000 0000"       :
                      "اكتب أي نص..."
                    }
                    className="w-full bg-transparent text-white text-sm placeholder-gray-700 outline-none border-b border-glass-border focus:border-neon-cyan/50 transition-colors pb-1.5"
                  />
                </div>
              )}

              {mode === "vcard" && (
                <div className="glass-card rounded-2xl p-4">
                  <p className="text-xs font-bold text-gray-400 mb-3">بيانات البطاقة</p>
                  <div className="grid grid-cols-2 gap-3">
                    {([
                      ["firstName", "الاسم الأول", "علي",           "rtl"],
                      ["lastName",  "اسم العائلة", "حجالي",         "rtl"],
                      ["title",     "المسمى",       "مطور مواقع",   "rtl"],
                      ["org",       "الشركة",        "AH Studio",   "ltr"],
                      ["phone",     "الهاتف",        "+974 5000 0000","ltr"],
                      ["email",     "البريد",        "ali@email.com","ltr"],
                    ] as [keyof VCard, string, string, string][]).map(([key, label, ph, dir]) => (
                      <div key={key}>
                        <label className="text-[11px] text-gray-500 mb-1 block">{label}</label>
                        <input type="text" value={vcard[key]}
                          onChange={(e) => setVcard((v) => ({ ...v, [key]: e.target.value }))}
                          placeholder={ph} dir={dir}
                          className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
                        />
                      </div>
                    ))}
                    <div className="col-span-2">
                      <label className="text-[11px] text-gray-500 mb-1 block">الموقع</label>
                      <input type="text" value={vcard.website}
                        onChange={(e) => setVcard((v) => ({ ...v, website: e.target.value }))}
                        placeholder="https://alihajali.com" dir="ltr"
                        className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              <ColorPicker fgColor={fgColor} bgColor={bgColor} onFg={setFgColor} onBg={setBgColor} />
              <LogoUploader logoUrl={logoUrl} onUpload={setLogoUrl} onRemove={() => setLogoUrl(null)} />
              <QRSettings qrSize={qrSize} errorLevel={errorLevel} corner={corner} hasLogo={!!logoUrl}
                onSize={setQrSize} onLevel={setErrorLevel} onCorner={setCorner} />
            </div>

            {/* يمين: المعاينة */}
            <div className="flex flex-col items-center gap-3 md:sticky md:top-24">
              <div className="glass-card rounded-3xl p-5 flex flex-col items-center gap-3 w-full">
                <p className="text-xs font-bold text-gray-500 self-start">معاينة مباشرة</p>
                <QRPreview value={qrValue} size={qrSize} fg={fgColor} bg={bgColor}
                  level={errorLevel} corner={corner} isEmpty={isEmpty} logoImg={logoImg} />
                {isEmpty && <p className="text-gray-600 text-xs">أدخل بياناتك لتوليد الرمز</p>}
              </div>

              <div className="flex flex-col gap-2 w-full">
                <button onClick={downloadPNG} disabled={isEmpty}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl bg-neon-cyan text-dark-bg font-black text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all">
                  <Download size={15} /> تحميل PNG
                </button>
                <button onClick={downloadSVG} disabled={isEmpty}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl glass-card text-white font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:border-white/15 transition-all">
                  <Download size={15} /> تحميل SVG
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={copyValue} disabled={isEmpty}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl glass-card text-gray-400 text-xs font-bold disabled:opacity-40 hover:text-white transition-all">
                    {copied ? <Check size={12} className="text-neon-cyan" /> : <Copy size={12} />}
                    {copied ? "تم" : "نسخ"}
                  </button>
                  <button onClick={reset}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-xl glass-card text-gray-400 text-xs font-bold hover:text-white transition-all">
                    <RefreshCw size={12} /> تعيين
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
