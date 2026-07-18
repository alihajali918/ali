"use client";

export default function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-gray-300">{label}</label>
      <div className="flex items-center gap-2">
        <label className="relative w-9 h-9 rounded-lg overflow-hidden border border-white/10 cursor-pointer shrink-0">
          <input type="color" value={value} onChange={e => onChange(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer" />
          <div className="w-full h-full" style={{ background: value }} />
        </label>
        <input value={value} onChange={e => onChange(e.target.value)} dir="ltr"
          className="flex-1 min-w-0 bg-black/20 border border-white/10 rounded-xl px-3 py-2 text-sm text-white font-mono outline-none focus:border-[#00a3e0]/50" />
      </div>
    </div>
  );
}
