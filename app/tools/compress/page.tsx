"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, X, Download, FileArchive } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import JSZip from "jszip";

interface ImgItem {
  id:       string;
  name:     string;
  origSize: number;
  origUrl:  string;
  compUrl:  string | null;
  compSize: number | null;
  width:    number;
  height:   number;
}

function fmt(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function saving(orig: number, comp: number | null) {
  if (!comp) return null;
  const pct = Math.round((1 - comp / orig) * 100);
  return pct;
}

async function compressImage(
  origUrl: string,
  quality: number,
  maxW: number,
  format: "jpeg" | "webp" | "png"
): Promise<{ url: string; size: number; w: number; h: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale  = Math.min(1, maxW / img.width);
      const w      = Math.round(img.width  * scale);
      const h      = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, w, h);
      const mime = `image/${format}`;
      const url  = canvas.toDataURL(mime, format === "png" ? undefined : quality / 100);
      const size = Math.round((url.length - `data:${mime};base64,`.length) * 0.75);
      resolve({ url, size, w, h });
    };
    img.onerror = reject;
    img.src = origUrl;
  });
}

export default function CompressPage() {
  const [items,    setItems]    = useState<ImgItem[]>([]);
  const [quality,  setQuality]  = useState(75);
  const [maxW,     setMaxW]     = useState(1920);
  const [format,   setFormat]   = useState<"jpeg"|"webp"|"png">("jpeg");
  const [loading,  setLoading]  = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(f => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          setItems(prev => [...prev, {
            id:       Math.random().toString(36).slice(2),
            name:     f.name.replace(/\.[^.]+$/, "") + "." + format,
            origSize: f.size,
            origUrl:  e.target!.result as string,
            compUrl:  null,
            compSize: null,
            width:    img.width,
            height:   img.height,
          }]);
        };
        img.src = e.target!.result as string;
      };
      reader.readAsDataURL(f);
    });
  };

  const compressAll = useCallback(async () => {
    setLoading(true);
    const updated = await Promise.all(
      items.map(async item => {
        const { url, size, w, h } = await compressImage(item.origUrl, quality, maxW, format);
        return { ...item, compUrl: url, compSize: size, width: w, height: h, name: item.name.replace(/\.[^.]+$/, "") + "." + format };
      })
    );
    setItems(updated);
    setLoading(false);
  }, [items, quality, maxW, format]);

  const downloadOne = (item: ImgItem) => {
    if (!item.compUrl) return;
    const a = document.createElement("a");
    a.href     = item.compUrl;
    a.download = item.name;
    a.click();
  };

  const downloadAll = useCallback(async () => {
    const ready = items.filter(i => i.compUrl);
    if (!ready.length) return;
    setZipLoading(true);
    const zip = new JSZip();
    ready.forEach(i => {
      const b64 = i.compUrl!.split(",")[1];
      zip.file(i.name, b64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: "blob" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "compressed.zip";
    a.click();
    URL.revokeObjectURL(url);
    setZipLoading(false);
  }, [items]);

  const compressed = items.filter(i => i.compUrl);

  return (
    <main className="h-screen flex flex-col overflow-hidden" style={{ paddingTop: "4rem" }}>

      {/* top bar */}
      <div className="shrink-0 px-6 py-3 flex items-center justify-between border-b border-white/6 bg-[#111]/80 backdrop-blur-xl">
        <div>
          <h1 className="text-lg font-black">ضاغط <span className="text-gradient">الصور</span></h1>
          <p className="text-[11px] text-gray-600">قلّل الحجم · احفظ الجودة</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={compressAll} disabled={!items.length || loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-sm bg-neon-cyan text-dark-bg hover:scale-105 active:scale-95 transition-transform disabled:opacity-40">
            {loading ? "جارٍ الضغط..." : "ضغط الكل"}
          </button>
          {compressed.length > 0 && (
            <button onClick={downloadAll} disabled={zipLoading}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm glass-card text-white hover:border-white/20 transition-all disabled:opacity-40">
              <FileArchive size={14}/> {zipLoading ? "..." : "ZIP"}
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">

        {/* sidebar settings */}
        <div className="shrink-0 w-64 border-l border-white/6 bg-[#0d0d0d] flex flex-col overflow-y-auto p-4 gap-4"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>

          {/* quality */}
          <div className="glass-card rounded-2xl p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-3">الجودة</p>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-500">جودة منخفضة</span>
              <span className="text-sm font-black text-neon-cyan">{quality}%</span>
            </div>
            <input type="range" min={10} max={100} value={quality} onChange={e => setQuality(+e.target.value)}
              className="w-full accent-neon-cyan mb-2"/>
            <div className="flex gap-1.5">
              {[40, 60, 75, 90].map(q => (
                <button key={q} onClick={() => setQuality(q)}
                  className={`flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all ${quality === q ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-600"}`}>
                  {q}%
                </button>
              ))}
            </div>
          </div>

          {/* max width */}
          <div className="glass-card rounded-2xl p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-1.5">
              أقصى عرض: <span className="text-white font-black">{maxW}px</span>
            </p>
            <input type="range" min={400} max={4000} step={100} value={maxW} onChange={e => setMaxW(+e.target.value)}
              className="w-full accent-neon-cyan mb-2"/>
            <div className="flex gap-1.5 flex-wrap">
              {[800, 1280, 1920, 2560].map(w => (
                <button key={w} onClick={() => setMaxW(w)}
                  className={`flex-1 py-1 rounded-lg text-[9px] font-bold border transition-all ${maxW === w ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-600"}`}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          {/* format */}
          <div className="glass-card rounded-2xl p-3">
            <p className="text-[11px] font-bold text-gray-500 mb-2">صيغة الإخراج</p>
            <div className="flex gap-1.5">
              {(["jpeg","webp","png"] as const).map(f => (
                <button key={f} onClick={() => setFormat(f)}
                  className={`flex-1 py-1.5 rounded-lg text-[10px] font-bold border uppercase transition-all ${format === f ? "border-neon-cyan/40 bg-neon-cyan/8 text-neon-cyan" : "border-white/8 text-gray-600"}`}>
                  {f}
                </button>
              ))}
            </div>
            <p className="text-[9px] text-gray-700 mt-2">
              {format === "webp" ? "WebP: أفضل ضغط للويب" : format === "jpeg" ? "JPEG: مثالي للصور الفوتوغرافية" : "PNG: بدون فقدان جودة"}
            </p>
          </div>

          {/* stats */}
          {compressed.length > 0 && (() => {
            const totalOrig = items.reduce((s, i) => s + i.origSize, 0);
            const totalComp = compressed.reduce((s, i) => s + (i.compSize ?? 0), 0);
            const pct       = Math.round((1 - totalComp / totalOrig) * 100);
            return (
              <div className="rounded-2xl p-3 border border-neon-cyan/20" style={{ background: "rgba(0,245,212,0.04)" }}>
                <p className="text-[10px] text-gray-500 mb-2">إجمالي التوفير</p>
                <p className="text-2xl font-black text-neon-cyan">{pct}%</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  {fmt(totalOrig)} ← {fmt(totalComp)}
                </p>
              </div>
            );
          })()}
        </div>

        {/* main area */}
        <div className="flex-1 flex flex-col overflow-hidden bg-[#0a0a0a]">

          {/* drop zone */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); addFiles(e.dataTransfer.files); }}
            className="mx-6 mt-6 shrink-0 rounded-2xl border-2 border-dashed border-white/8 flex items-center justify-center gap-3 py-5 cursor-pointer hover:border-neon-cyan/30 hover:bg-neon-cyan/2 transition-all">
            <Upload size={18} className="text-neon-cyan"/>
            <p className="text-sm font-bold text-gray-400">اسحب الصور أو اضغط للرفع</p>
            <p className="text-[11px] text-gray-700">JPG · PNG · WEBP</p>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => addFiles(e.target.files)}/>

          {/* grid */}
          <div className="flex-1 overflow-y-auto px-6 pb-6 pt-4"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.06) transparent" }}>
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2">
                <div className="w-14 h-14 rounded-2xl bg-neon-cyan/6 flex items-center justify-center">
                  <Upload size={22} className="text-neon-cyan/40"/>
                </div>
                <p className="text-gray-700 text-sm">ارفع صورة للبدء</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                <AnimatePresence>
                  {items.map(item => {
                    const pct = saving(item.origSize, item.compSize);
                    return (
                      <motion.div key={item.id}
                        layout
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="flex items-center gap-4 p-3 rounded-2xl border border-white/6 bg-[#111]">

                        {/* thumb */}
                        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-[#0a0a0a]">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={item.compUrl ?? item.origUrl} alt={item.name}
                            className="w-full h-full object-cover"/>
                        </div>

                        {/* info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate mb-1">{item.name}</p>
                          <div className="flex items-center gap-3 text-[11px]">
                            <span className="text-gray-600">{fmt(item.origSize)}</span>
                            {item.compSize && <>
                              <span className="text-gray-700">→</span>
                              <span className="text-neon-cyan font-bold">{fmt(item.compSize)}</span>
                            </>}
                          </div>
                          <p className="text-[10px] text-gray-700 mt-0.5">{item.width} × {item.height}px</p>
                        </div>

                        {/* saving badge */}
                        {pct !== null && (
                          <div className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-black ${pct > 0 ? "bg-neon-cyan/10 text-neon-cyan" : "bg-white/6 text-gray-500"}`}>
                            {pct > 0 ? `-${pct}%` : "0%"}
                          </div>
                        )}

                        {/* actions */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.compUrl && (
                            <button onClick={() => downloadOne(item)}
                              className="w-8 h-8 rounded-xl flex items-center justify-center glass-card text-neon-cyan hover:bg-neon-cyan/10 transition-all">
                              <Download size={14}/>
                            </button>
                          )}
                          <button onClick={() => setItems(p => p.filter(i => i.id !== item.id))}
                            className="w-8 h-8 rounded-xl flex items-center justify-center glass-card text-gray-600 hover:text-red-400 transition-all">
                            <X size={14}/>
                          </button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
