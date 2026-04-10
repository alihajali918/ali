"use client";

import { useState, useRef, useCallback } from "react";
import {
  Plus, Trash2, Printer, ImagePlus, X,
  Building2, FileText, AlignLeft, Table2,
} from "lucide-react";

// ─────────────────────────────────────────────
// أنواع
// ─────────────────────────────────────────────
interface TableRow { id: number; cells: string[]; }

type ReportType = "مالي" | "تشغيلي" | "إداري" | "مبيعات" | "مخصص";

const REPORT_TYPES: ReportType[] = ["مالي", "تشغيلي", "إداري", "مبيعات", "مخصص"];

const PRESET_HEADERS: Record<ReportType, string[]> = {
  "مالي":    ["البند", "الكمية", "سعر الوحدة (ريال)", "الإجمالي (ريال)"],
  "تشغيلي": ["المهمة", "المسؤول", "الحالة", "الملاحظات"],
  "إداري":  ["الموضوع", "التفاصيل", "التاريخ", "الإجراء المطلوب"],
  "مبيعات": ["المنتج", "الكمية المباعة", "العميل", "الإيراد (ريال)"],
  "مخصص":  ["العمود 1", "العمود 2", "العمود 3", "العمود 4"],
};

// ─────────────────────────────────────────────
// مساعد: تحويل dataURL إلى عنصر img
// ─────────────────────────────────────────────
function makeNewRow(id: number, colCount: number): TableRow {
  return { id, cells: Array(colCount).fill("") };
}

// ─────────────────────────────────────────────
// الصفحة
// ─────────────────────────────────────────────
export default function ReportsPage() {
  // ── بيانات الشركة ──
  const [companyName,    setCompanyName]    = useState("");
  const [companyAddress, setCompanyAddress] = useState("");
  const [companyPhone,   setCompanyPhone]   = useState("");
  const [logoUrl,        setLogoUrl]        = useState<string | null>(null);

  // ── بيانات التقرير ──
  const [reportType,   setReportType]   = useState<ReportType>("مالي");
  const [reportTitle,  setReportTitle]  = useState("");
  const [reportNumber, setReportNumber] = useState("");
  const [reportDate,   setReportDate]   = useState(
    new Date().toISOString().split("T")[0]
  );
  const [preparedBy, setPreparedBy] = useState("");

  // ── الجدول ──
  const [headers, setHeaders] = useState<string[]>(PRESET_HEADERS["مالي"]);
  const [rows,    setRows]    = useState<TableRow[]>([
    makeNewRow(1, 4),
    makeNewRow(2, 4),
    makeNewRow(3, 4),
  ]);
  const nextId = useRef(4);

  // ── ملاحظات ──
  const [notes, setNotes] = useState("");

  // ── إعدادات ──
  const [accentColor, setAccentColor] = useState("#00F5D4");

  const logoRef = useRef<HTMLInputElement>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // ── تغيير نوع التقرير ──
  const changeType = (t: ReportType) => {
    setReportType(t);
    const h = PRESET_HEADERS[t];
    setHeaders(h);
    setRows(rows.map((r) => ({
      ...r,
      cells: h.map((_, i) => r.cells[i] ?? ""),
    })));
  };

  // ── إدارة الجدول ──
  const addRow = () => {
    setRows((prev) => [...prev, makeNewRow(nextId.current++, headers.length)]);
  };
  const removeRow = (id: number) => setRows((prev) => prev.filter((r) => r.id !== id));
  const updateCell = (rowId: number, col: number, val: string) => {
    setRows((prev) =>
      prev.map((r) => r.id === rowId
        ? { ...r, cells: r.cells.map((c, i) => (i === col ? val : c)) }
        : r
      )
    );
  };
  const updateHeader = (i: number, val: string) => {
    setHeaders((prev) => prev.map((h, idx) => (idx === i ? val : h)));
  };

  // ── رفع الشعار ──
  const handleLogo = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => setLogoUrl(e.target!.result as string);
    reader.readAsDataURL(file);
  };

  // ── طباعة ──
  const print = useCallback(() => {
    if (!printRef.current) return;
    const html = printRef.current.innerHTML;
    const win  = window.open("", "_blank", "width=900,height=700");
    if (!win) return;
    win.document.write(`<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8"/>
  <title>${reportTitle || "تقرير"}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet"/>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'Cairo',sans-serif;direction:rtl;background:#fff;color:#111;padding:40px;font-size:13px}
    table{width:100%;border-collapse:collapse;margin-top:8px}
    th{background:${accentColor};color:#fff;padding:10px 12px;font-weight:700;text-align:right}
    td{padding:9px 12px;border-bottom:1px solid #e5e7eb;text-align:right}
    tr:nth-child(even) td{background:#f9fafb}
    @media print{body{padding:20px}}
  </style>
</head>
<body>${html}</body>
</html>`);
    win.document.close();
    setTimeout(() => { win.focus(); win.print(); }, 600);
  }, [reportTitle, accentColor]);

  const inputCls = "w-full bg-glass border border-glass-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors";

  return (
    <main className="min-h-screen">

      <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto">

        {/* رأس */}
        <div className="mb-6 text-center">
          <span className="section-badge mb-3 inline-flex">أداة احترافية</span>
          <h1 className="text-3xl md:text-4xl font-black mb-1">
            صانع <span className="text-gradient">التقارير</span>
          </h1>
          <p className="text-gray-500 text-sm">أدخل البيانات واطبع تقريراً احترافياً في دقيقة</p>
        </div>

        <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">

          {/* ──────── الشريط الجانبي ──────── */}
          <div className="flex flex-col gap-4">

            {/* نوع التقرير */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <FileText size={13} /> نوع التقرير
              </p>
              <div className="flex flex-wrap gap-2">
                {REPORT_TYPES.map((t) => (
                  <button key={t} onClick={() => changeType(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      reportType === t ? "bg-neon-cyan text-dark-bg" : "bg-glass border border-glass-border text-gray-400 hover:text-white"
                    }`}
                  >{t}</button>
                ))}
              </div>
            </div>

            {/* بيانات الشركة */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <Building2 size={13} /> بيانات الشركة
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">اسم الشركة</label>
                  <input value={companyName} onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="شركة الفخامة" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">العنوان</label>
                  <input value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)}
                    placeholder="الدوحة، قطر" className={inputCls} />
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">الهاتف</label>
                  <input value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)}
                    placeholder="+974 5000 0000" dir="ltr" className={inputCls} />
                </div>
                {/* شعار */}
                {!logoUrl ? (
                  <button onClick={() => logoRef.current?.click()}
                    className="flex items-center justify-center gap-2 py-2.5 border-2 border-dashed border-glass-border rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-xs font-bold">
                    <ImagePlus size={14} /> رفع شعار الشركة
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

            {/* بيانات التقرير */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <AlignLeft size={13} /> بيانات التقرير
              </p>
              <div className="flex flex-col gap-2.5">
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">عنوان التقرير</label>
                  <input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)}
                    placeholder="تقرير المبيعات الشهري" className={inputCls} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">رقم التقرير</label>
                    <input value={reportNumber} onChange={(e) => setReportNumber(e.target.value)}
                      placeholder="001" dir="ltr" className={inputCls} />
                  </div>
                  <div>
                    <label className="text-[11px] text-gray-500 mb-1 block">التاريخ</label>
                    <input type="date" value={reportDate} onChange={(e) => setReportDate(e.target.value)}
                      dir="ltr" className={inputCls} />
                  </div>
                </div>
                <div>
                  <label className="text-[11px] text-gray-500 mb-1 block">أُعِدَّ بواسطة</label>
                  <input value={preparedBy} onChange={(e) => setPreparedBy(e.target.value)}
                    placeholder="محمد العلي" className={inputCls} />
                </div>
              </div>
            </div>

            {/* لون التمييز */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3">لون التمييز</p>
              <div className="flex items-center gap-3">
                <label className="relative w-10 h-10 rounded-xl overflow-hidden border border-glass-border cursor-pointer shrink-0">
                  <input type="color" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer" />
                  <div className="w-full h-full" style={{ background: accentColor }} />
                </label>
                <input type="text" value={accentColor} onChange={(e) => setAccentColor(e.target.value)}
                  maxLength={7} dir="ltr"
                  className="flex-1 bg-glass border border-glass-border rounded-xl px-3 py-2 text-xs font-mono text-gray-300 outline-none focus:border-neon-cyan/40 transition-colors" />
              </div>
              <div className="flex gap-2 mt-3 flex-wrap">
                {["#00F5D4", "#7B61FF", "#3B82F6", "#10B981", "#F59E0B", "#EF4444"].map((c) => (
                  <button key={c} onClick={() => setAccentColor(c)}
                    className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110"
                    style={{ background: c, borderColor: accentColor === c ? "white" : "transparent" }} />
                ))}
              </div>
            </div>

            {/* ملاحظات */}
            <div className="glass-card rounded-2xl p-4">
              <p className="text-xs font-bold text-gray-400 mb-3 flex items-center gap-1.5">
                <AlignLeft size={13} /> ملاحظات / خلاصة
              </p>
              <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                placeholder="أضف ملاحظات أو خلاصة للتقرير..."
                rows={4}
                className="w-full bg-glass border border-glass-border rounded-xl px-3 py-2 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors resize-none"
              />
            </div>

            {/* زر الطباعة */}
            <button onClick={print}
              className="flex items-center justify-center gap-2 py-4 rounded-2xl bg-neon-cyan text-dark-bg font-black text-base hover:scale-105 active:scale-95 transition-all glow-cyan">
              <Printer size={18} /> طباعة / تحميل PDF
            </button>
          </div>

          {/* ──────── معاينة التقرير ──────── */}
          <div className="overflow-auto">
            <div className="bg-white text-gray-900 rounded-2xl shadow-2xl min-h-[600px]"
              style={{ fontFamily: "'Cairo', sans-serif", direction: "rtl" }}>

              {/* المحتوى القابل للطباعة */}
              <div ref={printRef} style={{ padding: "40px", fontFamily: "'Cairo', sans-serif", direction: "rtl", color: "#111" }}>

                {/* رأس التقرير */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32, paddingBottom: 24, borderBottom: `3px solid ${accentColor}` }}>
                  <div>
                    <h1 style={{ fontSize: 22, fontWeight: 900, color: "#111", marginBottom: 4 }}>
                      {reportTitle || "عنوان التقرير"}
                    </h1>
                    <p style={{ fontSize: 12, color: "#6b7280", fontWeight: 600 }}>
                      نوع التقرير: {reportType}
                      {reportNumber && ` | رقم: ${reportNumber}`}
                    </p>
                  </div>
                  <div style={{ textAlign: "left" }}>
                    {logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={logoUrl} alt="logo"
                        style={{ width: 64, height: 64, objectFit: "contain", marginBottom: 8, display: "block", marginLeft: "auto" }} />
                    )}
                    <p style={{ fontSize: 14, fontWeight: 900, color: "#111" }}>{companyName || "اسم الشركة"}</p>
                    {companyAddress && <p style={{ fontSize: 11, color: "#6b7280" }}>{companyAddress}</p>}
                    {companyPhone && <p style={{ fontSize: 11, color: "#6b7280", direction: "ltr", textAlign: "right" }}>{companyPhone}</p>}
                  </div>
                </div>

                {/* معلومات ثانوية */}
                <div style={{ display: "flex", gap: 32, marginBottom: 28 }}>
                  {[
                    ["التاريخ", new Date(reportDate).toLocaleDateString("ar-QA", { year: "numeric", month: "long", day: "numeric" })],
                    ["أُعِدَّ بواسطة", preparedBy || "—"],
                  ].map(([label, val]) => (
                    <div key={label}>
                      <p style={{ fontSize: 10, color: "#9ca3af", fontWeight: 700, marginBottom: 2 }}>{label}</p>
                      <p style={{ fontSize: 13, fontWeight: 700, color: "#111" }}>{val}</p>
                    </div>
                  ))}
                </div>

                {/* الجدول */}
                <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.1em" }}>
                  البيانات
                </p>
                <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 28 }}>
                  <thead>
                    <tr>
                      {headers.map((h, i) => (
                        <th key={i} style={{ background: accentColor, color: "#fff", padding: "10px 12px", fontWeight: 700, textAlign: "right", fontSize: 13 }}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, ri) => (
                      <tr key={row.id}>
                        {row.cells.map((cell, ci) => (
                          <td key={ci} style={{ padding: "9px 12px", borderBottom: "1px solid #e5e7eb", fontSize: 13, background: ri % 2 === 1 ? "#f9fafb" : "#fff" }}>
                            {cell || <span style={{ color: "#d1d5db" }}>—</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* ملاحظات */}
                {notes && (
                  <div style={{ background: "#f9fafb", borderRight: `4px solid ${accentColor}`, padding: "14px 16px", borderRadius: 8, marginBottom: 24 }}>
                    <p style={{ fontSize: 11, fontWeight: 700, color: "#9ca3af", marginBottom: 6 }}>ملاحظات</p>
                    <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.8 }}>{notes}</p>
                  </div>
                )}

                {/* توقيع وتذييل */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginTop: 48, paddingTop: 16, borderTop: "1px solid #e5e7eb" }}>
                  <p style={{ fontSize: 10, color: "#d1d5db" }}>
                    {companyName || "الشركة"} · {new Date().getFullYear()}
                  </p>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ borderBottom: "1px solid #9ca3af", width: 160, marginBottom: 4 }} />
                    <p style={{ fontSize: 10, color: "#9ca3af" }}>التوقيع والختم</p>
                  </div>
                </div>
              </div>
            </div>

            {/* أدوات الجدول تحت المعاينة */}
            <div className="mt-5 glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
                  <Table2 size={13} /> بيانات الجدول
                </p>
                <button onClick={addRow}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan rounded-xl text-xs font-bold hover:bg-neon-cyan/15 transition-all">
                  <Plus size={12} /> إضافة صف
                </button>
              </div>

              {/* رؤوس الأعمدة */}
              <div className="grid gap-1 mb-2" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr) 32px` }}>
                {headers.map((h, i) => (
                  <input key={i} value={h} onChange={(e) => updateHeader(i, e.target.value)}
                    className="bg-glass border border-neon-cyan/20 rounded-lg px-2 py-1.5 text-xs font-bold text-neon-cyan outline-none focus:border-neon-cyan/50 transition-colors text-center" />
                ))}
                <div />
              </div>

              {/* الصفوف */}
              <div className="flex flex-col gap-1.5 max-h-64 overflow-y-auto">
                {rows.map((row) => (
                  <div key={row.id} className="grid gap-1 items-center" style={{ gridTemplateColumns: `repeat(${headers.length}, 1fr) 32px` }}>
                    {row.cells.map((cell, ci) => (
                      <input key={ci} value={cell} onChange={(e) => updateCell(row.id, ci, e.target.value)}
                        className="bg-glass border border-glass-border rounded-lg px-2 py-1.5 text-xs text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
                        placeholder={`${headers[ci] || ""}`} />
                    ))}
                    <button onClick={() => removeRow(row.id)} className="flex items-center justify-center text-gray-600 hover:text-red-400 transition-colors w-8 h-8 rounded-lg hover:bg-red-500/10">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
