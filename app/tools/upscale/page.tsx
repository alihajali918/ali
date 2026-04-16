"use client";

import { useState, useCallback, useRef } from "react";
import {
  Upload, Download, Zap, ArrowLeft,
  ImageIcon, Maximize2, Loader2,
} from "lucide-react";

type Scale = 2 | 3 | 4 | 8;

const SCALE_LABELS: Record<Scale, string> = {
  2: "2×",
  3: "3×",
  4: "4×",
  8: "8×",
};

export default function UpscalePage() {
  const [original, setOriginal] = useState<{
    url: string; name: string; w: number; h: number;
  } | null>(null);
  const [upscaled, setUpscaled] = useState<string | null>(null);
  const [loading,  setLoading]  = useState(false);
  const [scale,    setScale]    = useState<Scale>(2);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── load file ── */
  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      setOriginal({ url, name: file.name, w: img.naturalWidth, h: img.naturalHeight });
      setUpscaled(null);
    };
    img.src = url;
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  /* ── upscale ── */
  const doUpscale = async () => {
    if (!original || loading) return;
    setLoading(true);

    try {
      const { default: Pica } = await import("pica");
      const pica = Pica();

      const srcImg = new Image();
      srcImg.src = original.url;
      await srcImg.decode();

      const srcCanvas = document.createElement("canvas");
      srcCanvas.width  = srcImg.naturalWidth;
      srcCanvas.height = srcImg.naturalHeight;
      srcCanvas.getContext("2d")!.drawImage(srcImg, 0, 0);

      const dstCanvas = document.createElement("canvas");
      dstCanvas.width  = original.w * scale;
      dstCanvas.height = original.h * scale;

      await pica.resize(srcCanvas, dstCanvas, { quality: 3 }); // Lanczos3

      const blob = await pica.toBlob(dstCanvas, "image/png");
      setUpscaled(URL.createObjectURL(blob));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ── download ── */
  const download = () => {
    if (!upscaled) return;
    const a = document.createElement("a");
    a.href = upscaled;
    const base = original?.name.replace(/\.[^.]+$/, "") ?? "image";
    a.download = `${base}_${scale}x.png`;
    a.click();
  };

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 md:px-8 max-w-5xl mx-auto">

      {/* ── header ── */}
      <div className="mb-10 text-center">
        <span className="section-badge mb-5 inline-flex">
          <Maximize2 size={11}/> رفع دقة الصور
        </span>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">
          كبّر صورتك <span className="text-gradient">بجودة عالية</span>
        </h1>
        <p className="text-gray-500 text-base max-w-lg mx-auto">
          رفع الدقة يعمل مباشرة في متصفحك — صورتك لا تُرسل لأي خادم
        </p>
      </div>

      {/* ── upload zone ── */}
      {!original ? (
        <div
          onDrop={onDrop}
          onDragOver={e => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-white/10 rounded-3xl p-16 flex flex-col items-center gap-4 cursor-pointer hover:border-neon-cyan/30 hover:bg-neon-cyan/3 transition-all duration-300 group"
        >
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Upload size={28} className="text-neon-cyan"/>
          </div>
          <div className="text-center">
            <p className="text-white font-bold text-lg mb-1">اسحب صورتك هنا أو انقر للرفع</p>
            <p className="text-gray-600 text-sm">JPG · PNG · WEBP</p>
          </div>
          <input
            ref={fileRef} type="file" accept="image/*"
            className="hidden"
            onChange={e => e.target.files?.[0] && loadFile(e.target.files[0])}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">

          {/* ── options bar ── */}
          <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-400 font-bold ml-1">المضاعفة:</span>
              {([2, 3, 4, 8] as Scale[]).map(s => (
                <button key={s}
                  onClick={() => { setScale(s); setUpscaled(null); }}
                  className={`px-4 py-1.5 rounded-xl text-sm font-black transition-all ${
                    scale === s
                      ? "bg-neon-cyan text-dark-bg"
                      : "text-gray-400 hover:text-white bg-white/5"
                  }`}
                >
                  {SCALE_LABELS[s]}
                </button>
              ))}
            </div>

            <div className="text-xs text-gray-600 mr-auto font-mono">
              {original.w}×{original.h} → {original.w * scale}×{original.h * scale}px
            </div>

            <button
              onClick={() => { setOriginal(null); setUpscaled(null); }}
              className="text-xs text-gray-500 hover:text-white transition-colors px-3 py-1.5 rounded-xl hover:bg-white/5"
            >
              تغيير الصورة
            </button>
          </div>

          {/* ── before / after ── */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-gray-500"/>
                <span className="text-xs font-bold text-gray-400">
                  الأصلية — {original.w}×{original.h}
                </span>
              </div>
              <div className="p-2 h-64 flex items-center justify-center">
                <img src={original.url} alt="original"
                  className="max-w-full max-h-full object-contain rounded-xl"/>
              </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${upscaled ? "bg-neon-cyan" : "bg-gray-700"}`}/>
                <span className="text-xs font-bold text-gray-400">
                  {upscaled
                    ? `محسّنة — ${original.w * scale}×${original.h * scale}`
                    : "في انتظار المعالجة..."}
                </span>
              </div>
              <div className="p-2 h-64 flex items-center justify-center">
                {upscaled ? (
                  <img src={upscaled} alt="upscaled"
                    className="max-w-full max-h-full object-contain rounded-xl"/>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-700">
                    <ImageIcon size={36} className="opacity-20"/>
                    <span className="text-sm">اضغط «رفع الدقة» للبدء</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── action ── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {!upscaled ? (
              <button
                onClick={doUpscale}
                disabled={loading}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100 disabled:cursor-wait"
              >
                {loading ? (
                  <><Loader2 size={16} className="animate-spin"/> جارٍ المعالجة...</>
                ) : (
                  <><Zap size={16}/> رفع الدقة {scale}× <ArrowLeft size={14}/></>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={download}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform"
                >
                  <Download size={16}/> تحميل الصورة المحسّنة
                </button>
                <button
                  onClick={() => { setUpscaled(null); }}
                  className="flex items-center justify-center gap-2 px-8 py-4 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all"
                >
                  تجربة درجة أخرى
                </button>
              </>
            )}
          </div>

          <p className="text-center text-xs text-gray-700">
            يعمل كلياً في متصفحك — لا تُرسل صورتك لأي خادم
          </p>
        </div>
      )}
    </main>
  );
}
