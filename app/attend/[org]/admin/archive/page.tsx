"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Archive, ChevronDown, ChevronUp } from "lucide-react";

type MonthSummary = {
  year: number; month: number;
  _sum: {
    presentDays: number | null; lateDays: number | null; absentDays: number | null;
    excusedDays: number | null; lateMinutes: number | null;
    overtimeMinutes: number | null; totalDue: number | null;
  };
};

type EmployeeRow = {
  id: number; year: number; month: number;
  presentDays: number; lateDays: number; absentDays: number; excusedDays: number;
  lateMinutes: number; overtimeMinutes: number;
  salarySnapshot: number | null; overtimePay: number | null; totalDue: number | null;
  employee: { name: string; email: string };
};

const MONTHS_AR = ["","يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];

export default function ArchivePage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [months, setMonths]   = useState<MonthSummary[]>([]);
  const [detail, setDetail]   = useState<EmployeeRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [archiving, setArchiving] = useState(false);
  const [archiveMsg, setArchiveMsg] = useState("");

  // Month picker — default to previous month
  const now = new Date();
  const prevMonth = now.getMonth() === 0 ? 12 : now.getMonth();
  const prevYear  = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
  const [pickYear, setPickYear]   = useState(prevYear);
  const [pickMonth, setPickMonth] = useState(prevMonth);

  const load = async () => {
    setLoading(true);
    const res  = await fetch(`/api/attend/${org}/archive`);
    const data = await res.json();
    setMonths(data.months ?? []);
    setDetail(data.detail ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const doArchive = async () => {
    if (!confirm(`أرشفة شهر ${MONTHS_AR[pickMonth]} ${pickYear}؟ سيتم حذف السجلات اليومية بعد الأرشفة.`)) return;
    setArchiving(true); setArchiveMsg("");
    try {
      const res  = await fetch(`/api/attend/${org}/archive`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: pickYear, month: pickMonth }),
      });
      const data = await res.json();
      if (!res.ok) { setArchiveMsg(data.error); return; }
      setArchiveMsg(`✓ تم أرشفة ${data.employeesArchived} موظف، وحذف ${data.recordsDeleted} سجل`);
      load();
    } finally { setArchiving(false); }
  };

  const key = (y: number, m: number) => `${y}-${m}`;
  const rowsForMonth = (y: number, m: number) => detail.filter(d => d.year === y && d.month === m);

  const sel = "px-3 py-2 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40";

  return (
    <div dir="rtl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
          <Archive size={20} className="text-neon-cyan"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">أرشيف الشهور</h1>
          <p className="text-gray-500 text-sm">ملخصات الحضور الشهرية المحفوظة</p>
        </div>
      </div>

      {/* Archive action */}
      <div className="glass-card rounded-2xl p-6 mb-8 flex flex-col sm:flex-row gap-4 items-start sm:items-end">
        <div>
          <p className="text-xs font-bold text-gray-400 mb-2">أرشفة شهر</p>
          <div className="flex gap-2">
            <select value={pickMonth} onChange={e => setPickMonth(Number(e.target.value))} className={sel} style={{ colorScheme: "dark" }}>
              {MONTHS_AR.slice(1).map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
            <select value={pickYear} onChange={e => setPickYear(Number(e.target.value))} className={sel} style={{ colorScheme: "dark" }}>
              {Array.from({ length: 3 }, (_, i) => now.getFullYear() - i).map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={doArchive} disabled={archiving}
            className="flex items-center gap-2 px-5 py-2.5 bg-neon-cyan text-dark-bg font-black rounded-xl text-sm hover:scale-105 active:scale-95 transition-transform disabled:opacity-60">
            {archiving ? <Loader2 size={15} className="animate-spin"/> : <Archive size={15}/>}
            أرشفة وحذف السجلات
          </button>
          {archiveMsg && <p className={`text-xs ${archiveMsg.startsWith("✓") ? "text-green-400" : "text-red-400"}`}>{archiveMsg}</p>}
        </div>
        <p className="text-xs text-gray-600 sm:mr-auto sm:text-left max-w-xs">
          الأرشفة تحفظ ملخص الشهر لكل موظف ثم تمسح السجلات اليومية لتخفيف قاعدة البيانات
        </p>
      </div>

      {/* Archived months list */}
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-cyan" size={32}/></div>
      ) : months.length === 0 ? (
        <div className="glass-card rounded-2xl p-10 text-center text-gray-500">لا توجد شهور مؤرشفة بعد</div>
      ) : (
        <div className="flex flex-col gap-3">
          {months.map(m => {
            const k = key(m.year, m.month);
            const isOpen = expanded === k;
            const rows   = rowsForMonth(m.year, m.month);
            return (
              <div key={k} className="glass-card rounded-2xl overflow-hidden">
                {/* Month header */}
                <button onClick={() => setExpanded(isOpen ? null : k)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/3 transition-colors">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-white font-black text-base">{MONTHS_AR[m.month]} {m.year}</p>
                      <p className="text-gray-500 text-xs mt-0.5">{rows.length} موظف</p>
                    </div>
                    <div className="hidden sm:flex gap-4 text-xs">
                      <span className="text-green-400">{m._sum.presentDays ?? 0} حضور</span>
                      <span className="text-yellow-400">{m._sum.lateDays ?? 0} متأخر</span>
                      <span className="text-red-400">{m._sum.absentDays ?? 0} غائب</span>
                      {(m._sum.excusedDays ?? 0) > 0 && <span className="text-blue-400">{m._sum.excusedDays} معذور</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {m._sum.totalDue !== null && (
                      <span className="text-neon-cyan font-black text-sm">
                        {Number(m._sum.totalDue).toLocaleString()} ريال إجمالي
                      </span>
                    )}
                    {isOpen ? <ChevronUp size={16} className="text-gray-500"/> : <ChevronDown size={16} className="text-gray-500"/>}
                  </div>
                </button>

                {/* Employee detail */}
                {isOpen && (
                  <div className="border-t border-white/8 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-gray-500 text-xs border-b border-white/6">
                          <th className="text-right px-5 py-2.5 font-semibold">الموظف</th>
                          <th className="text-center px-4 py-2.5 font-semibold">حضور</th>
                          <th className="text-center px-4 py-2.5 font-semibold">تأخر</th>
                          <th className="text-center px-4 py-2.5 font-semibold">غياب</th>
                          <th className="text-center px-4 py-2.5 font-semibold">معذور</th>
                          <th className="text-center px-4 py-2.5 font-semibold">دق. تأخير</th>
                          <th className="text-center px-4 py-2.5 font-semibold">دق. أوفرتايم</th>
                          <th className="text-center px-4 py-2.5 font-semibold">الراتب</th>
                          <th className="text-center px-4 py-2.5 font-semibold">أوفرتايم ر.</th>
                          <th className="text-center px-4 py-2.5 font-semibold">المستحق</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rows.map(r => (
                          <tr key={r.id} className="border-b border-white/5 hover:bg-white/3">
                            <td className="px-5 py-3">
                              <p className="text-white font-semibold">{r.employee.name}</p>
                              <p className="text-gray-600 text-xs">{r.employee.email}</p>
                            </td>
                            <td className="px-4 py-3 text-center text-green-400 font-bold">{r.presentDays}</td>
                            <td className="px-4 py-3 text-center text-yellow-400 font-bold">{r.lateDays}</td>
                            <td className="px-4 py-3 text-center text-red-400 font-bold">{r.absentDays}</td>
                            <td className="px-4 py-3 text-center text-blue-400 font-bold">{r.excusedDays}</td>
                            <td className="px-4 py-3 text-center text-gray-400">{r.lateMinutes}</td>
                            <td className="px-4 py-3 text-center text-gray-400">{r.overtimeMinutes}</td>
                            <td className="px-4 py-3 text-center text-gray-300">{r.salarySnapshot ? Number(r.salarySnapshot).toLocaleString() : "—"}</td>
                            <td className="px-4 py-3 text-center text-blue-400">{r.overtimePay ? Number(r.overtimePay).toLocaleString() : "—"}</td>
                            <td className="px-4 py-3 text-center text-neon-cyan font-black">{r.totalDue ? Number(r.totalDue).toLocaleString() : "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
