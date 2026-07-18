"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { CLUB_ICON_KEYS, getClubIcon } from "../../lib/club-icons";

export default function IconPicker({ value, onChange }: { value: string; onChange: (key: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const Icon = getClubIcon(value);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button type="button" onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-[#00a3e0]/50">
        <Icon size={16} className="text-[#00a3e0]" />
        <span className="text-xs text-gray-400">{value || "اختر أيقونة"}</span>
        <ChevronDown size={13} className="text-gray-500" />
      </button>

      {open && (
        <div className="absolute z-30 mt-2 p-2 bg-[#1c2b39] border border-white/10 rounded-xl shadow-2xl grid grid-cols-6 gap-1 w-64">
          {CLUB_ICON_KEYS.map(key => {
            const OptIcon = getClubIcon(key);
            const active = key === value;
            return (
              <button
                key={key}
                type="button"
                title={key}
                onClick={() => { onChange(key); setOpen(false); }}
                className={`flex items-center justify-center p-2 rounded-lg transition-colors ${
                  active ? "bg-[#00a3e0]/20 text-[#00a3e0]" : "text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <OptIcon size={16} />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
