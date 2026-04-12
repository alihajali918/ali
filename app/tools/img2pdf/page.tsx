"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, ArrowUp, ArrowDown, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type PageSize   = "a4" | "a3" | "letter" | "custom" | "image";
type PageOrient = "portrait" | "landscape";

interface ImgFile {
  id: string;
  url: string;
  name: string;
  size: number;
  natW: number;
  natH: number;
}

// dimensions in mm
const PAGE_DIMS_MM: Record<Exclude<PageSize, "custom" | "image">, [number, number]> = {
  a4:     [210, 297],
  a3:     [297, 420],
  letter: [216, 279],
};

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Img2PdfPage() {
  const [images,    setImages]    = useState<ImgFile[]>([]);
  const [pgSize,    setPgSize]    = useState<PageSize>("a4");
  const [orient,    setOrient]    = useState<PageOrient>("portrait");
  const [margin,    setMargin]    = useState(10);
  const [fit,       setFit]       = useState<"contain" | "cover" | "fill">("contain");
  const [customW,   setCustomW]   = useState("210");
  const [customH,   setCustomH]   = useState("297");
  const [exporting, setExporting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          setImages(prev => [...prev, {
            id:   Math.random().toString(36).slice(2),
            url:  e.target!.result as string,
            name: f.name,
            size: f.size,
            natW: img.width,
            natH: img.height,
          }]);
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(f);
    });
  };

  const remove = (id: string) => setImages(p => p.filter(i => i.id !== id));
  const move   = (id: string, dir: -1 | 1) => {
    setImages(prev => {
      const idx = prev.findIndex(i => i.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      const to   = idx + dir;
      if (to < 0 || to >= next.length) return prev;
      [next[idx], next[to]] = [next[to], next[idx]];
      return next;
    });
  };

  const exportPDF = useCallback(async () => {
    if (!images.length) return;
    setExporting(true);
    try {
      // Dynamic import to keep bundle small
      const { default: jsPDF } = await import("jspdf");

      // Resolve page dims (mm) for first page — we'll handle per-image below
      const getPageDims = (img: ImgFile): [number, number] => {
        if (pgSize === "image") {
          // use natural image ratio, fit in A4-like area but keep ratio
          const PX_PER_MM = 3.7795275591;
          const wMM = img.natW / PX_PER_MM;
          const hMM = img.natH / PX_PER_MM;
          return [wMM, hMM];
        }
        if (pgSize === "custom") {
          const w = parseFloat(customW) || 210;
          const h = parseFloat(customH) || 297;
          return orient === "portrait" ? [w, h] : [h, w];
        }
        const [w, h] = PAGE_DIMS_MM[pgSize];
        return orient === "portrait" ? [w, h] : [h, w];
      };

      const firstDims = getPageDims(images[0]);
      const pdf = new jsPDF({
        orientation: firstDims[0] > firstDims[1] ? "landscape" : "portrait",
        unit: "mm",
        format: [firstDims[0], firstDims[1]],
      });

      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const [pgW, pgH] = getPageDims(img);

        if (i > 0) {
          pdf.addPage([pgW, pgH], pgW > pgH ? "landscape" : "portrait");
        }

        const mg  = margin; // mm
        const aW  = pgW - mg * 2;
        const aH  = pgH - mg * 2;
        const ratio = img.natW / img.natH;

        let drawW = aW;
        let drawH = aW / ratio;

        if (fit === "contain") {
          if (drawH > aH) { drawH = aH; drawW = aH * ratio; }
        } else if (fit === "fill") {
          drawW = aW; drawH = aH;
        } else {
          // cover: fill area, crop via clip
          if (drawH < aH) { drawH = aH; drawW = aH * ratio; }
        }

        const x = mg + (aW - drawW) / 2;
        const y = mg + (aH - drawH) / 2;

        pdf.addImage(img.url, "JPEG", x, y, drawW, drawH, undefined, "FAST");
      }

      pdf.save("images.pdf");
    } finally {
      setExporting(false);
    }
  }, [images, pgSize, orient, margin, fit, customW, customH]);

  const inputCls = "bg-[#0a0a0a] border border-white/8 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan/40 transition-colors w-full";

  return (
    <main className="h-screen flex flex-col overflow-hidden" style={{ paddingTop: "4rem" }}>

      {/* top bar */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between border-b border-white/6 bg-[#111]/80 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-black">صور إلى <span className="text-gradient">PDF</span></h1>
          <p className="text-[11px] text-gray-600">ارفع صور · رتّبها · حمّل PDF مباشرةً</p>
        </div>
        <button onClick={exportPDF} disabled={!images.length || exporting}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-neon-cyan text-dark-bg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40">
          <Printer size={15}/> {exporting ? "جارٍ التصدير..." : "تحميل PDF"}
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* sidebar */}
        <div className="shrink-0 w-72 border-l border-white/6 bg-[#0d0d0d] flex flex-col overflow-y-auto p-4 gap-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.08) transparent" }}>

          {/* page size */}
          <div className="glass-card rounded-2xl p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-2">حجم الصفحة</p>
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              {(["a4","a3","letter"] as PageSize[]).map(s => (
                <button key={s} onClick={() => setPgSize(s)}
                  className={`py-1.5 rounded-lg text-[11px] font-black border transition-all uppercase ${pgSize === s ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-500"}`}>
                  {s}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-1.5 mb-3">
              <button onClick={() => setPgSize("image")}
                className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${pgSize === "image" ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-500"}`}>
                مقاس الصورة
              </button>
              <button onClick={() => setPgSize("custom")}
                className={`py-1.5 rounded-lg text-[10px] font-bold border transition-all ${pgSize === "custom" ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-500"}`}>
                مخصص
              </button>
            </div>

            {/* custom dims */}
            {pgSize === "custom" && (
              <div className="flex gap-2 items-center mb-3">
                <div className="flex-1">
                  <p className="text-[9px] text-gray-600 mb-1">العرض (mm)</p>
                  <input type="number" min={50} max={2000} value={customW}
                    onChange={e => setCustomW(e.target.value)} className={inputCls}/>
                </div>
                <span className="text-gray-600 mt-4">×</span>
                <div className="flex-1">
                  <p className="text-[9px] text-gray-600 mb-1">الارتفاع (mm)</p>
                  <input type="number" min={50} max={2000} value={customH}
                    onChange={e => setCustomH(e.target.value)} className={inputCls}/>
                </div>
              </div>
            )}

            {/* orientation — hidden when "image" size */}
            {pgSize !== "image" && (
              <div className="flex gap-1.5">
                {(["portrait","landscape"] as PageOrient[]).map(o => (
                  <button key={o} onClick={() => setOrient(o)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-bold border transition-all ${orient === o ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-500"}`}>
                    <div className={`border rounded-sm ${orient === o ? "border-neon-cyan" : "border-gray-600"}`}
                      style={o === "portrait" ? {width:10,height:14} : {width:14,height:10}}/>
                    {o === "portrait" ? "عمودي" : "أفقي"}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* options */}
          <div className="glass-card rounded-2xl p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-3">خيارات</p>

            <div className="mb-3">
              <p className="text-[10px] text-gray-600 mb-1.5">ملاءمة الصورة</p>
              <div className="flex gap-1.5">
                {(["contain","cover","fill"] as const).map(f => (
                  <button key={f} onClick={() => setFit(f)}
                    className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${fit === f ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-600"}`}>
                    {f === "contain" ? "كامل" : f === "cover" ? "ملء" : "تمدد"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] text-gray-600 mb-1.5">هامش: <span className="text-white font-bold">{margin}mm</span></p>
              <input type="range" min={0} max={30} value={margin} onChange={e => setMargin(+e.target.value)}
                className="w-full accent-neon-cyan"/>
            </div>
          </div>

          {/* count */}
          {images.length > 0 && (
            <div className="px-3 py-2 rounded-xl border border-white/6 flex items-center justify-between">
              <span className="text-[11px] text-gray-500">{images.length} صورة</span>
              <button onClick={() => setImages([])} className="text-[10px] text-red-500 hover:text-red-400 font-bold">مسح الكل</button>
            </div>
          )}
        </div>

        {/* main drop area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">

          {/* drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="mx-6 mt-6 shrink-0 rounded-2xl border-2 border-dashed border-white/8 flex flex-col items-center justify-center gap-3 py-8 cursor-pointer hover:border-neon-cyan/30 hover:bg-neon-cyan/2 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-neon-cyan/8 flex items-center justify-center">
              <Upload size={22} className="text-neon-cyan"/>
            </div>
            <p className="text-sm font-bold text-gray-400">اسحب الصور هنا أو اضغط للرفع</p>
            <p className="text-[11px] text-gray-700">JPG · PNG · WEBP · HEIC</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)}/>

          {/* image grid */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
            {images.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-gray-700 text-sm">لا توجد صور بعد</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                <AnimatePresence>
                  {images.map((img, idx) => (
                    <motion.div key={img.id}
                      layout
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="relative group rounded-2xl overflow-hidden border border-white/6 bg-[#111] aspect-[3/4]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img.url} alt={img.name} className="w-full h-full object-cover"/>

                      {/* overlay on hover */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                        <div className="flex gap-1.5">
                          <button onClick={() => move(img.id, -1)} disabled={idx === 0}
                            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30">
                            <ArrowUp size={12}/>
                          </button>
                          <button onClick={() => move(img.id, 1)} disabled={idx === images.length - 1}
                            className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-white hover:bg-white/20 disabled:opacity-30">
                            <ArrowDown size={12}/>
                          </button>
                          <button onClick={() => remove(img.id)}
                            className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 hover:bg-red-500/30">
                            <X size={12}/>
                          </button>
                        </div>
                      </div>

                      {/* page number */}
                      <div className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/70 flex items-center justify-center text-[10px] font-black text-white">
                        {idx + 1}
                      </div>

                      {/* size */}
                      <div className="absolute bottom-0 left-0 right-0 px-2 py-1.5 bg-gradient-to-t from-black/80 to-transparent">
                        <p className="text-[9px] text-gray-400 truncate">{img.name}</p>
                        <p className="text-[9px] text-gray-600">{img.natW}×{img.natH} · {fmt(img.size)}</p>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
