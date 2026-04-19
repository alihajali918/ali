"use client";

import { useState, useEffect, use } from "react";
import { Loader2, Pencil, Check, X } from "lucide-react";

type AttRecord = {
  id: string; date: string; status: string;
  checkIn: string | null; checkOut: string | null;
  lateMinutes: number; overtimeMinutes: number;
  employee: { name: string; email: string };
};

const statusLabel: { [k: string]: string } = {
  PRESENT: "حاضر", LATE: "متأخر", ABSENT: "غائب", HALF_DAY: "نصف يوم",
};
const statusColor: { [k: string]: string } = {
  PRESENT: "text-green-400 bg-green-500/20",
  LATE:    "text-yellow-400 bg-yellow-500/20",
  ABSENT:  "text-red-400 bg-red-500/20",
  HALF_DAY:"text-blue-400 bg-blue-500/20",
};

export default function RecordsPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [records, setRecords] = useState<AttRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate]       = useState(() => new Date().toISOString().slice(0, 10));
  const [editId, setEditId]   = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ status: "", notes: "" });
  const [saving, setSaving]   = useState(false);

  const fetch_ = async (d: string) => {
    setLoading(true);
    const res = await fetch(`/api/attend/${org}/records?date=${d}`);
    const data = await res.json();
    setRecords(data.records ?? []);
    setLoading(false);
  };

  useEffect(() => { fetch_(date); }, [date]);

  const startEdit = (r: AttRecord) => {
    setEditId(r.id);
    setEditForm({ status: r.status, notes: "" });
  };

  const saveEdit = async (id: string) => {
    setSaving(true);
    await fetch(`/api/attend/${org}/records`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...editForm }),
    });
    setSaving(false);
    setEditId(null);
    fetch_(date);
  };

  const fmt = (iso: string | null) => iso ? new Date(iso).toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">سجلات الحضور</h1>
        <input type="date" value={date} onChange={e => setDate(e.target.value)}
          className="px-4 py-2 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40"/>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-cyan" size={32}/></div>
      ) : (
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs">
                <th className="text-right px-5 py-3 font-semibold">الموظف</th>
                <th className="text-right px-5 py-3 font-semibold">الحضور</th>
                <th className="text-right px-5 py-3 font-semibold">الانصراف</th>
                <th className="text-right px-5 py-3 font-semibold">الحالة</th>
                <th className="text-right px-5 py-3 font-semibold">التأخر</th>
                <th className="text-right px-5 py-3 font-semibold">الإضافي</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody>
              {records.map(r => (
                <tr key={r.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-4">
                    <p className="text-white font-semibold">{r.employee.name}</p>
                    <p className="text-gray-500 text-xs">{r.employee.email}</p>
                  </td>
                  <td className="px-5 py-4 text-gray-300">{fmt(r.checkIn)}</td>
                  <td className="px-5 py-4 text-gray-300">{fmt(r.checkOut)}</td>
                  <td className="px-5 py-4">
                    {editId === r.id ? (
                      <select value={editForm.status} onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                        className="bg-white/10 text-white text-xs rounded-lg px-2 py-1 focus:outline-none">
                        {Object.keys(statusLabel).map(s => <option key={s} value={s}>{statusLabel[s]}</option>)}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${statusColor[r.status] ?? ""}`}>
                        {statusLabel[r.status] ?? r.status}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-yellow-400 text-xs">{r.lateMinutes > 0 ? `${r.lateMinutes} د` : "—"}</td>
                  <td className="px-5 py-4 text-blue-400 text-xs">{r.overtimeMinutes > 0 ? `${r.overtimeMinutes} د` : "—"}</td>
                  <td className="px-5 py-4">
                    {editId === r.id ? (
                      <div className="flex gap-2">
                        <button onClick={() => saveEdit(r.id)} disabled={saving}
                          className="text-green-400 hover:text-green-300"><Check size={15}/></button>
                        <button onClick={() => setEditId(null)} className="text-red-400 hover:text-red-300"><X size={15}/></button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(r)} className="text-neon-cyan hover:text-white transition-colors">
                        <Pencil size={15}/>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr><td colSpan={7} className="text-center text-gray-500 py-10">لا توجد سجلات لهذا اليوم</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
