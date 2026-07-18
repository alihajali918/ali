"use client";

import { useState } from "react";
import { ChevronDown, Circle, CircleCheck, Loader2, Vote } from "lucide-react";
import { getClubIcon } from "../lib/club-icons";

interface CategoryData {
  id: number;
  label: string;
  icon: string;
  speakers: string[];
}

const PALETTE = ["#7a222c", "#074466", "#b45309", "#3f6212", "#5b21b6"];

export default function VotingWidget({
  categories,
  alreadyVoted,
}: {
  categories: CategoryData[];
  alreadyVoted: Record<number, boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [voted, setVoted] = useState(alreadyVoted);
  const [pending, setPending] = useState<string | null>(null);
  const [toast, setToast] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const castVote = async (categoryId: number, candidate: string) => {
    setPending(candidate);
    setError(null);
    try {
      const res = await fetch("/api/tamimtoastmasterclub/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId, candidate }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "حدث خطأ، يرجى المحاولة لاحقاً.");
        setPending(null);
        return;
      }
      setVoted(v => ({ ...v, [categoryId]: true }));
      setToast(true);
      setTimeout(() => setToast(false), 3500);
    } catch {
      setError("تعذّر الاتصال بالخادم.");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="lg:col-span-7 bg-[#7a222c] rounded-2xl p-6 border border-white/10 shadow-lg">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between text-white transition font-bold text-[1.125em]"
      >
        <span className="flex items-center gap-3">
          <Vote size={22} className="text-[#00a3e0]" />
          <span>منصة التصويت المباشر</span>
        </span>
        <ChevronDown size={16} className={`text-[#00a3e0] transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="mt-4 bg-white rounded-xl p-4 space-y-4 shadow-inner text-right text-[#1c2b39]">
          {categories.map((cat, i) => {
            if (!cat.speakers.length) return null;
            const Icon = getClubIcon(cat.icon);
            const color = PALETTE[i % PALETTE.length];
            const hasVoted = voted[cat.id];
            return (
              <div key={cat.id}>
                <h4 className="text-[0.75em] md:text-[0.875em] font-bold border-b pb-2 mb-3" style={{ color }}>
                  <Icon size={13} className="inline-block ml-1" /> {cat.label}:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {cat.speakers.map(name => (
                    <button
                      key={name}
                      disabled={hasVoted || pending === name}
                      onClick={() => castVote(cat.id, name)}
                      className="w-full text-right p-3 rounded-lg bg-gray-50 hover:enabled:bg-amber-50 hover:enabled:text-amber-900 border border-gray-200 text-[0.75em] md:text-[0.875em] font-semibold transition flex items-center justify-between group disabled:opacity-70"
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
                        <span className="text-[0.625em] text-gray-400 opacity-0 group-hover:opacity-100 transition">
                          اضغط للتصويت
                        </span>
                      )}
                    </button>
                  ))}
                </div>
                {hasVoted && (
                  <p className="text-[0.6875em] text-emerald-700 font-semibold mt-2">تم تسجيل تصويتك بهذه الفئة، شكراً لك!</p>
                )}
              </div>
            );
          })}
          {error && <p className="text-[0.75em] text-red-600 font-semibold">{error}</p>}
        </div>
      )}

      {/* toast */}
      <div
        className={`fixed inset-x-0 top-0 max-w-md mx-auto mt-4 bg-emerald-600 text-white px-6 py-3 rounded-xl text-[0.875em] font-semibold shadow-2xl transform transition-all duration-500 flex items-center justify-center gap-2 z-50 ${
          toast ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <CircleCheck size={16} /> تم تسجيل تصويتك بنجاح، شكراً لك!
      </div>
    </div>
  );
}
