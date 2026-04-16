"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, Download, Scissors, Loader2, RefreshCw } from "lucide-react";

type Stage = "idle" | "loading" | "done" | "error";

const CHECKERBOARD =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20'%3E%3Crect width='10' height='10' fill='%23222'/%3E%3Crect x='10' y='10' width='10' height='10' fill='%23222'/%3E%3Crect x='10' y='0' width='10' height='10' fill='%23333'/%3E%3Crect x='0' y='10' width='10' height='10' fill='%23333'/%3E%3C/svg%3E";

export default function RemoveBgPage() {
  const [original, setOriginal] = useState<string | null>(null);
  const [result,   setResult]   = useState<string | null>(null);
  const [fileName, setFileName] = useState("image");
  const [stage,    setStage]    = useState<Stage>("idle");
  const [progress, setProgress] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── load file ── */
  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setOriginal(URL.createObjectURL(file));
    setFileName(file.name.replace(/\.[^.]+$/, ""));
    setResult(null);
    setStage("idle");
    setProgress("");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  }, [loadFile]);

  /* ── remove bg ── */
  const removeBg = async () => {
    if (!original || stage === "loading") return;
    setStage("loading");
    setProgress("تحميل النموذج...");

    try {
      const { removeBackground } = await import("@imgly/background-removal");

      setProgress("جارٍ إزالة الخلفية...");

      const blob = await removeBackground(original, {
        progress: (key: string, current: number, total: number) => {
          if (key === "compute:inference") {
            setProgress(`${Math.round((current / total) * 100)}%`);
          }
        },
      });

      setResult(URL.createObjectURL(blob));
      setStage("done");
    } catch (err) {
      console.error(err);
      setStage("error");
      setProgress("حدث خطأ، حاول مجدداً");
    }
  };

  /* ── download ── */
  const download = () => {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result;
    a.download = `${fileName}_no_bg.png`;
    a.click();
  };

  /* ── reset ── */
  const reset = () => {
    setOriginal(null);
    setResult(null);
    setStage("idle");
    setProgress("");
  };

  return (
    <main className="min-h-screen pt-28 pb-24 px-4 md:px-8 max-w-5xl mx-auto">

      {/* ── header ── */}
      <div className="mb-10 text-center">
        <span className="section-badge mb-5 inline-flex">
          <Scissors size={11}/> إزالة الخلفية
        </span>
        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-3">
          إزالة الخلفية <span className="text-gradient">بضغطة واحدة</span>
        </h1>
        <p className="text-gray-500 text-base max-w-lg mx-auto">
          يعمل مباشرة في متصفحك — صورتك لا تُرسل لأي خادم
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

          {/* ── before / after ── */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* original */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-gray-500"/>
                  <span className="text-xs font-bold text-gray-400">الأصلية</span>
                </div>
                <button
                  onClick={reset}
                  className="text-xs text-gray-600 hover:text-white transition-colors flex items-center gap-1"
                >
                  <RefreshCw size={11}/> تغيير
                </button>
              </div>
              <div className="p-3 h-64 flex items-center justify-center">
                <img src={original} alt="original"
                  className="max-w-full max-h-full object-contain rounded-xl"/>
              </div>
            </div>

            {/* result */}
            <div className="glass-card rounded-2xl overflow-hidden">
              <div className="px-4 py-2.5 border-b border-white/5 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full transition-colors ${stage === "done" ? "bg-neon-cyan" : "bg-gray-700"}`}/>
                <span className="text-xs font-bold text-gray-400">
                  {stage === "done" ? "بدون خلفية" : "في انتظار المعالجة..."}
                </span>
              </div>
              <div
                className="p-3 h-64 flex items-center justify-center"
                style={stage === "done" ? { backgroundImage: `url("${CHECKERBOARD}")`, backgroundSize: "20px 20px" } : {}}
              >
                {stage === "done" && result ? (
                  <img src={result} alt="no background"
                    className="max-w-full max-h-full object-contain rounded-xl"/>
                ) : stage === "loading" ? (
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 size={32} className="text-neon-cyan animate-spin opacity-60"/>
                    <span className="text-sm text-gray-500 font-bold">{progress}</span>
                    <span className="text-xs text-gray-700">أول مرة تأخذ ثوانٍ للتحميل</span>
                  </div>
                ) : stage === "error" ? (
                  <div className="text-center">
                    <p className="text-red-400 text-sm font-bold mb-2">{progress}</p>
                    <button onClick={removeBg} className="text-xs text-neon-cyan hover:underline">
                      حاول مجدداً
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-gray-700">
                    <Scissors size={36} className="opacity-20"/>
                    <span className="text-sm">اضغط «إزالة الخلفية» للبدء</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── progress bar ── */}
          {stage === "loading" && (
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full rounded-full bg-neon-cyan animate-pulse" style={{ width: "100%" }}/>
            </div>
          )}

          {/* ── actions ── */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {stage !== "done" ? (
              <button
                onClick={removeBg}
                disabled={stage === "loading"}
                className="flex items-center justify-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100 disabled:cursor-wait"
              >
                {stage === "loading" ? (
                  <><Loader2 size={16} className="animate-spin"/> {progress}</>
                ) : (
                  <><Scissors size={16}/> إزالة الخلفية</>
                )}
              </button>
            ) : (
              <>
                <button
                  onClick={download}
                  className="flex items-center justify-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform"
                >
                  <Download size={16}/> تحميل PNG شفاف
                </button>
                <button
                  onClick={() => { setResult(null); setStage("idle"); }}
                  className="flex items-center justify-center gap-2 px-8 py-4 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all"
                >
                  <RefreshCw size={15}/> صورة جديدة
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
