"use client";

import { useState, useEffect, use } from "react";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";

type Shift = {
  id: string; name: string; startTime: string; endTime: string; workDays: string[];
};

const DAY_LABELS: Record<string, string> = {
  "0": "أحد", "1": "اثنين", "2": "ثلاثاء", "3": "أربعاء",
  "4": "خميس", "5": "جمعة", "6": "سبت",
};

export default function ShiftsPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [shifts, setShifts]   = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editShift, setEditShift] = useState<Shift | null>(null);
  const [form, setForm] = useState({ name: "", startTime: "08:00", endTime: "17:00", workDays: ["0","1","2","3","4"] });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const fetchShifts = async () => {
    setLoading(true);
    const res = await fetch(`/api/attend/${org}/shifts`);
    const data = await res.json();
    setShifts(data.shifts ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchShifts(); }, []);

  const openAdd = () => {
    setEditShift(null);
    setForm({ name: "", startTime: "08:00", endTime: "17:00", workDays: ["0","1","2","3","4"] });
    setShowForm(true); setError("");
  };

  const openEdit = (s: Shift) => {
    setEditShift(s);
    setForm({ name: s.name, startTime: s.startTime, endTime: s.endTime, workDays: s.workDays });
    setShowForm(true); setError("");
  };

  const toggleDay = (d: string) => {
    setForm(f => ({
      ...f,
      workDays: f.workDays.includes(d) ? f.workDays.filter(x => x !== d) : [...f.workDays, d],
    }));
  };

  const save = async () => {
    setSaving(true); setError("");
    try {
      const method = editShift ? "PATCH" : "POST";
      const body   = editShift ? { id: editShift.id, ...form } : form;
      const res    = await fetch(`/api/attend/${org}/shifts`, {
        method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowForm(false); fetchShifts();
    } finally { setSaving(false); }
  };

  const deleteShift = async (id: string) => {
    if (!confirm("حذف الوردية؟")) return;
    await fetch(`/api/attend/${org}/shifts`, {
      method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }),
    });
    fetchShifts();
  };

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">الورديات</h1>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-bg font-bold rounded-xl text-sm hover:scale-105 transition-transform">
          <Plus size={16}/> وردية جديدة
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-cyan" size={32}/></div>
      ) : (
        <div className="grid gap-4">
          {shifts.map(s => (
            <div key={s.id} className="glass-card rounded-2xl p-5 flex items-center justify-between">
              <div>
                <p className="text-white font-black text-lg">{s.name}</p>
                <p className="text-neon-cyan text-sm font-mono mt-1">{s.startTime} — {s.endTime}</p>
                <div className="flex gap-1 mt-2">
                  {["0","1","2","3","4","5","6"].map(d => (
                    <span key={d} className={`text-xs px-2 py-0.5 rounded-full font-bold ${s.workDays.includes(d) ? "bg-neon-cyan/20 text-neon-cyan" : "bg-white/5 text-gray-600"}`}>
                      {DAY_LABELS[d]}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEdit(s)} className="text-neon-cyan hover:text-white transition-colors"><Pencil size={16}/></button>
                <button onClick={() => deleteShift(s.id)} className="text-red-400 hover:text-red-300 transition-colors"><Trash2 size={16}/></button>
              </div>
            </div>
          ))}
          {shifts.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center text-gray-500">لا توجد ورديات</div>
          )}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-md flex flex-col gap-4">
            <h2 className="text-lg font-black text-white">{editShift ? "تعديل وردية" : "وردية جديدة"}</h2>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">اسم الوردية</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="وردية صباحية"
                className="w-full px-4 py-2.5 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40"/>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 mb-1 block">وقت البداية</label>
                <input type="time" value={form.startTime} onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40"/>
              </div>
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-400 mb-1 block">وقت النهاية</label>
                <input type="time" value={form.endTime} onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40"/>
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">أيام العمل</label>
              <div className="flex gap-2 flex-wrap">
                {["0","1","2","3","4","5","6"].map(d => (
                  <button key={d} type="button" onClick={() => toggleDay(d)}
                    className={`text-xs px-3 py-1.5 rounded-full font-bold transition-colors ${form.workDays.includes(d) ? "bg-neon-cyan text-dark-bg" : "bg-white/10 text-gray-400 hover:bg-white/20"}`}>
                    {DAY_LABELS[d]}
                  </button>
                ))}
              </div>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button onClick={save} disabled={saving}
                className="flex-1 py-3 bg-neon-cyan text-dark-bg font-black rounded-xl text-sm hover:scale-105 active:scale-95 transition-transform disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto"/> : "حفظ"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20 transition-colors">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
