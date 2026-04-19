"use client";

import { useState, useEffect, use } from "react";
import { UserPlus, Pencil, Trash2, Loader2, RotateCcw, Link2, ChevronDown, ChevronUp } from "lucide-react";

type Employee = {
  id: string; name: string; email: string; role: string;
  active: boolean; deviceBound: boolean;
  salary: number | null; overtimeRate: number | null;
  shift?: { startTime: string; endTime: string; name: string } | null;
};

type MonthStats = { overtimeMinutes: number };

export default function EmployeesPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editEmp, setEditEmp]     = useState<Employee | null>(null);
  const [expanded, setExpanded]   = useState<string | null>(null);
  const [empStats, setEmpStats]   = useState<Record<string, MonthStats>>({});
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE", salary: "", overtimeRate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  const fetchEmployees = async () => {
    setLoading(true);
    const res = await fetch(`/api/attend/${org}/employees`);
    const data = await res.json();
    setEmployees(data.employees ?? []);
    setLoading(false);
  };

  useEffect(() => { fetchEmployees(); }, []);

  const fetchStats = async (empId: string) => {
    if (empStats[empId]) return;
    const now   = new Date();
    const from  = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
    const to    = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
    const res   = await fetch(`/api/attend/${org}/records?employeeId=${empId}&from=${from}&to=${to}`);
    const data  = await res.json();
    const records: { overtimeMinutes: number }[] = data.records ?? [];
    const total = records.reduce((s, r) => s + (r.overtimeMinutes ?? 0), 0);
    setEmpStats(prev => ({ ...prev, [empId]: { overtimeMinutes: total } }));
  };

  const toggleExpand = (id: string) => {
    if (expanded === id) { setExpanded(null); return; }
    setExpanded(id);
    fetchStats(id);
  };

  const openAdd = () => {
    setEditEmp(null);
    setForm({ name: "", email: "", password: "", role: "EMPLOYEE", salary: "", overtimeRate: "" });
    setShowForm(true); setError("");
  };

  const openEdit = (e: Employee) => {
    setEditEmp(e);
    setForm({ name: e.name, email: e.email, password: "", role: e.role,
      salary: e.salary?.toString() ?? "", overtimeRate: e.overtimeRate?.toString() ?? "" });
    setShowForm(true); setError("");
  };

  const save = async () => {
    setSaving(true); setError("");
    try {
      const body: Record<string, unknown> = {
        name: form.name, email: form.email, role: form.role,
        salary:      form.salary      ? parseFloat(form.salary)      : null,
        overtimeRate: form.overtimeRate ? parseFloat(form.overtimeRate) : null,
      };
      if (form.password) body.password = form.password;

      const res = editEmp
        ? await fetch(`/api/attend/${org}/employees`, {
            method: "PATCH", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editEmp.id, ...body }),
          })
        : await fetch(`/api/attend/${org}/employees`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowForm(false); fetchEmployees();
    } finally { setSaving(false); }
  };

  const deleteEmp    = async (id: string) => {
    if (!confirm("حذف الموظف؟")) return;
    await fetch(`/api/attend/${org}/employees`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchEmployees();
  };

  const resetDevice = async (id: string) => {
    if (!confirm("إعادة تعيين الجهاز المرتبط؟")) return;
    await fetch(`/api/attend/${org}/employees`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resetDevice: true }),
    });
    fetchEmployees();
  };

  const calcOvertimePay = (emp: Employee, overtimeMin: number): string => {
    const hours = overtimeMin / 60;
    if (emp.overtimeRate) return (hours * emp.overtimeRate).toFixed(0);
    if (emp.salary) return (hours * (emp.salary / 160) * 1.5).toFixed(0);
    return "—";
  };

  const inp = "w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40";

  return (
    <div dir="rtl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">الموظفون</h1>
        <div className="flex gap-3">
          <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/attend/${org}/scan`); alert("تم نسخ رابط دخول الموظفين!"); }}
            className="flex items-center gap-2 px-4 py-2 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20 transition-colors">
            <Link2 size={16}/> رابط الدخول
          </button>
          <button onClick={openAdd}
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-dark-bg font-bold rounded-xl text-sm hover:scale-105 transition-transform">
            <UserPlus size={16}/> موظف جديد
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-cyan" size={32}/></div>
      ) : (
        <div className="flex flex-col gap-3">
          {employees.map(e => {
            const stats = empStats[e.id];
            const isExpanded = expanded === e.id;
            const overtimePay = stats ? calcOvertimePay(e, stats.overtimeMinutes) : null;

            return (
              <div key={e.id} className="glass-card rounded-2xl overflow-hidden">
                {/* Main row */}
                <div className="flex items-center gap-4 px-5 py-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-white font-black">{e.name}</p>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${e.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : "bg-white/8 text-gray-500"}`}>
                        {e.role === "ADMIN" ? "أدمن" : "موظف"}
                      </span>
                      {!e.active && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 font-bold">موقوف</span>}
                    </div>
                    <p className="text-gray-500 text-xs font-mono mt-0.5">{e.email}</p>
                    {e.salary && (
                      <p className="text-neon-cyan text-xs mt-0.5 font-bold">
                        الراتب: {Number(e.salary).toLocaleString()} ريال
                        {e.overtimeRate
                          ? ` · أوفرتايم: ${Number(e.overtimeRate).toLocaleString()} ريال/ساعة`
                          : ` · أوفرتايم: ${(Number(e.salary) / 160 * 1.5).toFixed(1)} ريال/ساعة`
                        }
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-bold ${e.deviceBound ? "text-green-400" : "text-gray-600"}`}>
                      {e.deviceBound ? "✓ مرتبط" : "◌"}
                    </span>
                    {e.deviceBound && (
                      <button onClick={() => resetDevice(e.id)} title="إعادة تعيين الجهاز" className="text-yellow-400 hover:text-yellow-300">
                        <RotateCcw size={14}/>
                      </button>
                    )}
                    <button onClick={() => openEdit(e)} className="text-neon-cyan hover:text-white"><Pencil size={15}/></button>
                    <button onClick={() => deleteEmp(e.id)} className="text-red-400 hover:text-red-300"><Trash2 size={15}/></button>
                    <button onClick={() => toggleExpand(e.id)} className="text-gray-500 hover:text-white">
                      {isExpanded ? <ChevronUp size={16}/> : <ChevronDown size={16}/>}
                    </button>
                  </div>
                </div>

                {/* Expanded stats */}
                {isExpanded && (
                  <div className="border-t border-white/8 px-5 py-4 bg-white/3">
                    <p className="text-xs text-gray-500 font-bold mb-3">إحصائيات هذا الشهر</p>
                    {!stats ? (
                      <Loader2 size={16} className="animate-spin text-neon-cyan"/>
                    ) : (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center">
                          <p className="text-blue-400 font-black text-xl">{(stats.overtimeMinutes / 60).toFixed(1)}</p>
                          <p className="text-gray-500 text-xs">ساعات أوفرتايم</p>
                        </div>
                        <div className="text-center">
                          <p className="text-neon-cyan font-black text-xl">{overtimePay}</p>
                          <p className="text-gray-500 text-xs">قيمة الأوفرتايم (ريال)</p>
                        </div>
                        <div className="text-center">
                          <p className="text-white font-black text-xl">
                            {e.salary ? (Number(e.salary) + (overtimePay !== "—" ? parseFloat(overtimePay ?? "0") : 0)).toLocaleString() : "—"}
                          </p>
                          <p className="text-gray-500 text-xs">المستحق هذا الشهر</p>
                        </div>
                      </div>
                    )}
                    {!e.salary && (
                      <p className="text-gray-600 text-xs mt-2">أضف الراتب لحساب الأوفرتايم تلقائياً</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {employees.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center text-gray-500">لا يوجد موظفون</div>
          )}
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-md flex flex-col gap-4 max-h-[90vh] overflow-y-auto" dir="rtl">
            <h2 className="text-lg font-black text-white">{editEmp ? "تعديل موظف" : "إضافة موظف"}</h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block">الاسم</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp}/>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block">البريد</label>
                <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} dir="ltr" className={inp}/>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block">
                  كلمة المرور {editEmp && <span className="text-gray-600">(فارغة = بدون تغيير)</span>}
                </label>
                <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={inp}/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">الراتب الشهري (ريال)</label>
                <input type="number" value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))}
                  placeholder="مثال: 5000" className={inp}/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-1 block">سعر ساعة الأوفرتايم</label>
                <input type="number" value={form.overtimeRate} onChange={e => setForm(f => ({ ...f, overtimeRate: e.target.value }))}
                  placeholder="تلقائي إن فارغ" className={inp}/>
              </div>
              <div className="col-span-2">
                <label className="text-xs font-bold text-gray-400 mb-1 block">الدور</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} className={inp}>
                  <option value="EMPLOYEE">موظف</option>
                  <option value="ADMIN">أدمن</option>
                </select>
              </div>
            </div>

            {form.salary && (
              <div className="bg-neon-cyan/5 border border-neon-cyan/15 rounded-xl px-4 py-3 text-xs text-gray-400">
                سعر الأوفرتايم التلقائي (×1.5):
                <span className="text-neon-cyan font-bold mr-1">
                  {form.overtimeRate ? `${parseFloat(form.overtimeRate).toFixed(2)} ريال/ساعة (يدوي)` : `${(parseFloat(form.salary || "0") / 160 * 1.5).toFixed(2)} ريال/ساعة`}
                </span>
              </div>
            )}

            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}

            <div className="flex gap-3">
              <button onClick={save} disabled={saving}
                className="flex-1 py-3 bg-neon-cyan text-dark-bg font-black rounded-xl text-sm disabled:opacity-60">
                {saving ? <Loader2 size={16} className="animate-spin mx-auto"/> : "حفظ"}
              </button>
              <button onClick={() => setShowForm(false)}
                className="flex-1 py-3 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
