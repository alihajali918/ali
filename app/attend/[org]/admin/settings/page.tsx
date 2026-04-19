"use client";

import { use, useEffect, useState } from "react";
import { Loader2, Save, Building2, Copy, Monitor } from "lucide-react";

type OrgSettings = {
  name: string; slug: string; email: string; phone: string; address: string; plan: string;
  attendanceWindowMins: number; lateToleranceMins: number; displayKey: string;
};

export default function SettingsPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [form, setForm] = useState<OrgSettings>({ name: "", slug: "", email: "", phone: "", address: "", plan: "", attendanceWindowMins: 10, lateToleranceMins: 0, displayKey: "" });
  const [copiedDk, setCopiedDk] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState(false);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState("");

  useEffect(() => {
    fetch(`/api/attend/${org}/settings`)
      .then(r => r.json())
      .then(d => { if (!d.error) setForm(d); })
      .finally(() => setLoading(false));
  }, [org]);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const res  = await fetch(`/api/attend/${org}/settings`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, address: form.address, attendanceWindowMins: form.attendanceWindowMins, lateToleranceMins: form.lateToleranceMins }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally { setSaving(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl bg-[#111] border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40";

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-neon-cyan" size={32}/></div>;

  return (
    <div dir="rtl" className="max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
          <Building2 size={20} className="text-neon-cyan"/>
        </div>
        <div>
          <h1 className="text-2xl font-black text-white">إعدادات المؤسسة</h1>
          <p className="text-gray-500 text-sm">تعديل بيانات المؤسسة</p>
        </div>
      </div>

      <form onSubmit={save} className="glass-card rounded-2xl p-8 flex flex-col gap-5">
        {/* Info banner */}
        <div className="bg-neon-cyan/5 border border-neon-cyan/20 rounded-xl px-4 py-3 flex items-center gap-3">
          <div>
            <p className="text-neon-cyan text-xs font-bold">رابط المؤسسة</p>
            <p className="text-white font-mono text-sm mt-0.5">/attend/{org}</p>
          </div>
          <div className="mr-auto">
            <span className={`text-xs px-2 py-1 rounded-full font-bold ${form.plan === "PRO" ? "bg-purple-500/20 text-purple-400" : form.plan === "BASIC" ? "bg-blue-500/20 text-blue-400" : "bg-white/10 text-gray-400"}`}>
              {form.plan}
            </span>
          </div>
        </div>

        {/* Display screen URL */}
        {form.displayKey && (
          <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3">
            <div className="flex items-center gap-2 mb-1.5">
              <Monitor size={14} className="text-neon-cyan"/>
              <p className="text-xs font-bold text-neon-cyan">رابط شاشة العرض (للتلفزيون)</p>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-[11px] text-gray-400 font-mono break-all flex-1">
                {typeof window !== "undefined" ? `${window.location.origin}/attend/${org}/display?dk=${form.displayKey}` : `/attend/${org}/display?dk=${form.displayKey}`}
              </p>
              <button type="button" onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/attend/${org}/display?dk=${form.displayKey}`);
                setCopiedDk(true); setTimeout(() => setCopiedDk(false), 2000);
              }} className="text-gray-500 hover:text-neon-cyan shrink-0">
                <Copy size={13}/>
              </button>
            </div>
            {copiedDk && <p className="text-[10px] text-green-400 mt-1">✓ تم النسخ</p>}
            <p className="text-[10px] text-gray-600 mt-1">افتح هذا الرابط على شاشة الاستقبال — لا يحتاج تسجيل دخول</p>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">اسم المؤسسة *</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required className={inp}/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">البريد الإلكتروني</label>
            <input type="email" value={form.email ?? ""} dir="ltr"
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp}
              placeholder="info@company.com"/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">رقم الهاتف</label>
            <input value={form.phone ?? ""} dir="ltr"
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp}
              placeholder="+966 5x xxx xxxx"/>
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">العنوان</label>
            <input value={form.address ?? ""} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
              className={inp} placeholder="المدينة، الحي"/>
          </div>
        </div>

        {/* Attendance policy */}
        <div className="border-t border-white/8 pt-5">
          <p className="text-sm font-black text-white mb-4">سياسة الحضور</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">
                نافذة الحضور/الانصراف (دقيقة)
              </label>
              <input type="number" min={0} max={60} value={form.attendanceWindowMins}
                onChange={e => setForm(f => ({ ...f, attendanceWindowMins: Number(e.target.value) }))}
                className={inp} placeholder="10"/>
              <p className="text-[11px] text-gray-600 mt-1">
                مثال: 10 = يُقبل الحضور من الساعة −10 إلى +10 من موعد الدوام
              </p>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">
                هامش التأخير المسموح (دقيقة)
              </label>
              <input type="number" min={0} max={60} value={form.lateToleranceMins}
                onChange={e => setForm(f => ({ ...f, lateToleranceMins: Number(e.target.value) }))}
                className={inp} placeholder="0"/>
              <p className="text-[11px] text-gray-600 mt-1">
                مثال: 5 = التأخير يُحسب فقط بعد 5 دقائق من موعد الدوام
              </p>
            </div>
          </div>
        </div>

        {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2">{error}</p>}

        <button type="submit" disabled={saving}
          className="flex items-center justify-center gap-2 py-3 bg-neon-cyan text-dark-bg font-black rounded-xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60">
          {saving ? <Loader2 size={16} className="animate-spin"/> : saved ? "✓ تم الحفظ" : <><Save size={16}/> حفظ التغييرات</>}
        </button>
      </form>
    </div>
  );
}
