"use client";

import { useState, useEffect, use } from "react";
import { UserPlus, Pencil, Trash2, Loader2, RotateCcw, Link2 } from "lucide-react";

type Employee = {
  id: string; name: string; email: string; role: string;
  active: boolean; deviceBound: boolean;
};

export default function EmployeesPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [editEmp, setEditEmp]     = useState<Employee | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "EMPLOYEE" });
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

  const openAdd = () => {
    setEditEmp(null);
    setForm({ name: "", email: "", password: "", role: "EMPLOYEE" });
    setShowForm(true);
    setError("");
  };

  const openEdit = (e: Employee) => {
    setEditEmp(e);
    setForm({ name: e.name, email: e.email, password: "", role: e.role });
    setShowForm(true);
    setError("");
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const body: Record<string, unknown> = { ...form };
      if (!body.password) delete body.password;

      const res = editEmp
        ? await fetch(`/api/attend/${org}/employees`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: editEmp.id, ...body }),
          })
        : await fetch(`/api/attend/${org}/employees`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setShowForm(false);
      fetchEmployees();
    } finally {
      setSaving(false);
    }
  };

  const deleteEmp = async (id: string) => {
    if (!confirm("حذف الموظف؟")) return;
    await fetch(`/api/attend/${org}/employees`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchEmployees();
  };

  const resetDevice = async (id: string) => {
    if (!confirm("إعادة تعيين الجهاز المرتبط؟")) return;
    await fetch(`/api/attend/${org}/employees`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, resetDevice: true }),
    });
    fetchEmployees();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-white">الموظفون</h1>
        <div className="flex gap-3">
          <button
            onClick={() => {
              const url = `${window.location.origin}/attend/${org}/login`;
              navigator.clipboard.writeText(url);
              alert("تم نسخ رابط دخول الموظفين!");
            }}
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
        <div className="glass-card rounded-2xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs">
                <th className="text-right px-5 py-3 font-semibold">الاسم</th>
                <th className="text-right px-5 py-3 font-semibold">البريد</th>
                <th className="text-right px-5 py-3 font-semibold">الدور</th>
                <th className="text-right px-5 py-3 font-semibold">الجهاز</th>
                <th className="text-right px-5 py-3 font-semibold">الحالة</th>
                <th className="px-5 py-3"/>
              </tr>
            </thead>
            <tbody>
              {employees.map(e => (
                <tr key={e.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="px-5 py-4 text-white font-semibold">{e.name}</td>
                  <td className="px-5 py-4 text-gray-400 font-mono text-xs">{e.email}</td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${e.role === "ADMIN" ? "bg-purple-500/20 text-purple-400" : "bg-white/10 text-gray-400"}`}>
                      {e.role === "ADMIN" ? "أدمن" : "موظف"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    {e.deviceBound
                      ? <span className="text-xs text-green-400 font-bold">مرتبط ✓</span>
                      : <span className="text-xs text-gray-500">غير مرتبط</span>}
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-bold ${e.active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                      {e.active ? "نشط" : "موقوف"}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      {e.deviceBound && (
                        <button onClick={() => resetDevice(e.id)} title="إعادة تعيين الجهاز"
                          className="text-yellow-400 hover:text-yellow-300 transition-colors">
                          <RotateCcw size={15}/>
                        </button>
                      )}
                      <button onClick={() => openEdit(e)} className="text-neon-cyan hover:text-white transition-colors">
                        <Pencil size={15}/>
                      </button>
                      <button onClick={() => deleteEmp(e.id)} className="text-red-400 hover:text-red-300 transition-colors">
                        <Trash2 size={15}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr><td colSpan={6} className="text-center text-gray-500 py-10">لا يوجد موظفون</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="glass-card rounded-2xl p-8 w-full max-w-md flex flex-col gap-4" dir="rtl">
            <h2 className="text-lg font-black text-white">{editEmp ? "تعديل موظف" : "إضافة موظف"}</h2>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">الاسم</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">البريد الإلكتروني</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                dir="ltr"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">
                كلمة المرور {editEmp && <span className="text-gray-600">(اتركها فارغة لعدم التغيير)</span>}
              </label>
              <input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40"/>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1 block">الدور</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40">
                <option value="EMPLOYEE">موظف</option>
                <option value="ADMIN">أدمن</option>
              </select>
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
