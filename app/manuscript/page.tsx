"use client";

import { useState } from "react";

type Stage = "form" | "loading" | "done";

export default function ManuscriptPage() {
  const [stage, setStage]       = useState<Stage>("form");
  const [nameType, setNameType] = useState<"two" | "three">("two");
  const [name1, setName1]       = useState("");
  const [name2, setName2]       = useState("");
  const [name3, setName3]       = useState("");
  const [error, setError]       = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const fullName = [name1, name2, nameType === "three" ? name3 : ""].filter(Boolean).join(" ");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setStage("loading");

    const nameParts = nameType === "two" ? [name1, name2] : [name1, name2, name3];

    try {
      const res  = await fetch("/api/manuscript", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nameParts }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "حدث خطأ");
      setImageUrl(data.imageUrl);
      setStage("done");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "حدث خطأ");
      setStage("form");
    }
  };

  const handleDownload = async () => {
    const res  = await fetch(imageUrl);
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `مخطوطة-${fullName}.png`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reset = () => {
    setStage("form");
    setName1(""); setName2(""); setName3("");
    setImageUrl(""); setError("");
  };

  return (
    <div className="min-h-screen bg-[#110800] text-[#fef3c7] flex flex-col items-center justify-center p-6" dir="rtl">

      <div className="text-center mb-8">
        <p className="text-5xl mb-3">📜</p>
        <h1 className="text-2xl font-black tracking-wide">المخطوطة المُخصصة</h1>
        <p className="text-amber-600 text-sm mt-1">أدخل اسمك لتتولد مخطوطتك</p>
      </div>

      <div className="w-full max-w-md">

        {/* ── Form ── */}
        {stage === "form" && (
          <form onSubmit={handleSubmit}
            className="bg-[#1f0d00] border border-amber-900/40 rounded-2xl p-6 flex flex-col gap-5 shadow-xl">

            <div>
              <p className="text-xs font-bold text-amber-700 mb-2 uppercase tracking-wider">نوع الاسم</p>
              <div className="grid grid-cols-2 gap-3">
                {([["two", "ثنائي"], ["three", "ثلاثي"]] as const).map(([val, label]) => (
                  <button key={val} type="button" onClick={() => setNameType(val)}
                    className={`py-2.5 rounded-xl text-sm font-bold border transition-all ${
                      nameType === val
                        ? "bg-amber-700/30 border-amber-600/60 text-amber-300"
                        : "bg-white/3 border-amber-900/30 text-amber-800 hover:bg-white/8"
                    }`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <input value={name1} onChange={e => setName1(e.target.value)}
                placeholder="الاسم الأول" required
                className="px-4 py-3 rounded-xl bg-black/20 border border-amber-900/30 text-[#fef3c7] placeholder-amber-900 focus:outline-none focus:border-amber-600/50 text-sm" />
              <input value={name2} onChange={e => setName2(e.target.value)}
                placeholder="اسم الأب" required
                className="px-4 py-3 rounded-xl bg-black/20 border border-amber-900/30 text-[#fef3c7] placeholder-amber-900 focus:outline-none focus:border-amber-600/50 text-sm" />
              {nameType === "three" && (
                <input value={name3} onChange={e => setName3(e.target.value)}
                  placeholder="اسم الجد" required
                  className="px-4 py-3 rounded-xl bg-black/20 border border-amber-900/30 text-[#fef3c7] placeholder-amber-900 focus:outline-none focus:border-amber-600/50 text-sm" />
              )}
            </div>

            {error && <p className="text-red-400 text-sm text-center bg-red-900/20 rounded-lg py-2">{error}</p>}

            <button type="submit"
              className="py-3.5 bg-amber-700 hover:bg-amber-600 font-black rounded-xl text-sm transition-colors text-[#fef3c7]">
              ✨ أنشئ المخطوطة
            </button>
          </form>
        )}

        {/* ── Loading ── */}
        {stage === "loading" && (
          <div className="bg-[#1f0d00] border border-amber-900/40 rounded-2xl p-10 flex flex-col items-center gap-5 shadow-xl">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-amber-900/30"/>
              <div className="absolute inset-0 rounded-full border-4 border-t-amber-500 animate-spin"/>
            </div>
            <p className="text-amber-400 font-bold text-sm text-center">
              جارٍ رسم مخطوطتك…
              <br/>
              <span className="text-amber-800 font-normal text-xs mt-1 block">قد يستغرق بضع ثوانٍ</span>
            </p>
          </div>
        )}

        {/* ── Done ── */}
        {stage === "done" && (
          <div className="flex flex-col items-center gap-5">
            <div className="w-full bg-[#1f0d00] border border-amber-900/40 rounded-2xl p-3 shadow-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imageUrl}
                alt={`مخطوطة ${fullName}`}
                className="w-full rounded-xl"
                onLoad={e  => (e.currentTarget.style.opacity = "1")}
                style={{ opacity: 0, transition: "opacity 0.6s" }}
              />
            </div>

            <button onClick={handleDownload}
              className="w-full py-3.5 bg-amber-700 hover:bg-amber-600 font-black rounded-xl text-sm transition-colors text-[#fef3c7]">
              ⬇️ حفظ الصورة
            </button>

            <button onClick={reset}
              className="w-full py-2.5 bg-transparent border border-amber-900/40 hover:bg-amber-900/20 rounded-xl text-sm font-bold transition-colors text-amber-800">
              إنشاء مخطوطة جديدة
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
