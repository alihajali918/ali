"use client";

import { useState } from "react";
import { ChevronDown, Circle, CircleCheck, Loader2, SquareCheck, Mic, Zap, Vote } from "lucide-react";

type Category = "PREPARED" | "EVALUATION" | "IMPROMPTU";

const CATEGORY_META: Record<Category, { label: string; icon: typeof Mic; color: string }> = {
  PREPARED:   { label: "أفضل خطبة معدة",              icon: Mic,         color: "#7a222c" },
  EVALUATION: { label: "أفضل مقيّم خطبة",             icon: SquareCheck, color: "#074466" },
  IMPROMPTU:  { label: "أفضل خطبة ارتجالية (الساحة)", icon: Zap,         color: "#b45309" },
};

export default function VotingWidget({
  speakers,
  alreadyVoted,
}: {
  speakers: Record<Category, string[]>;
  alreadyVoted: Record<Category, boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(alreadyVoted);
  const [pending, setPending] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const castVote = async (category: Category, candidate: string) => {
    setPending(candidate);
    setError(null);
    try {
      const res = await fetch("/api/tamimtoastmasterclub/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, candidate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "حدث خطأ، يرجى المحاولة لاحقاً.");
        setPending(null);
        return;
      }
      setVoted(v => ({ ...v, [category]: true }));
      setToast(true);
      setTimeout(() => setToast(false), 3500);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setPending(null);
    }
  };

  const categories = Object.keys(speakers) as Category[];

  return (
    <div className="lg:col-span-7 bg-[#7a222c] rounded-2xl p-6 border border-white/10 shadow-lg">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-white transition font-bold text-lg"
      >
        <span className="flex items-center gap-3">
          <Vote size={22} className="text-[#00a3e0]" />
          <span>منصة التصويت المباشر</span>
        </span>
        <ChevronDown size={16} className={`text-[#00a3e0] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 bg-white rounded-xl p-4 space-y-4 shadow-inner text-right text-[#1c2b39]">
          {categories.map(category => {
            const list = speakers[category];
            if (!list || list.length === 0) return null;
            const meta = CATEGORY_META[category];
            const Icon = meta.icon;
            const hasVoted = voted[category];
            return (
              <div key={category}>
                <h4 className="text-xs md:text-sm font-bold border-b pb-2 mb-3" style={{ color: meta.color }}>
                  <Icon size={13} className="inline-block ml-1" /> {meta.label}:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {list.map(name => (
                    <button
                      key={name}
                      disabled={hasVoted || pending === name}
                      onClick={() => castVote(category, name)}
                      className="w-full text-right p-3 rounded-lg bg-gray-50 hover:enabled:bg-amber-50 hover:enabled:text-amber-900 border border-gray-200 text-xs md:text-sm font-semibold transition flex items-center justify-between group disabled:opacity-70"
                    >
                      <span className="flex items-center gap-1">
                        {pending === name ? (
                          <Loader2 size={13} className="animate-spin text-gray-400" />
                        ) : hasVoted ? (
                          <CircleCheck size={13} className="text-emerald-600" />
                        ) : (
                          <Circle size={13} className="text-gray-400 group-hover:text-amber-600" />
                        )}
                        {name}
                      </span>
                      {!hasVoted && (
                        <span className="text-[10px] text-gray-400 opacity-0 group-hover:opacity-100 transition">
                          اضغط للتصويت
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {hasVoted && (
                  <p className="text-[11px] text-emerald-700 font-semibold mt-2">تم تسجيل تصويتك بهذه الفئة، شكراً لك!</p>
                )}
              </div>
            );
          })}
          {error && <p className="text-xs text-red-600 font-semibold">{error}</p>}
        </div>
      )}

      {/* toast */}
      <div
        className={`fixed inset-x-0 top-0 max-w-md mx-auto mt-4 bg-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-semibold shadow-2xl transform transition-all duration-500 flex items-center justify-center gap-2 z-50 ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <CircleCheck size={16} /> تم تسجيل تصويتك بنجاح، شكراً لك!
      </div>
    </div>
  );
}
