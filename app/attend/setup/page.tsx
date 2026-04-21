"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2, CheckCircle2 } from "lucide-react";

export default function SetupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ ownerEmail: "", ownerPassword: "", name: "", slug: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [done, setDone]       = useState(false);

  const slugify = (v: string) =>
    v.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/attend/setup", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setDone(true);
      setTimeout(() => router.push(`/attend/${form.slug}/admin/login`), 2000);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/40 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
            <Building2 size={32} className="text-neon-cyan"/>
          </div>
          <h1 className="text-3xl font-black text-white">إنشاء مؤسسة جديدة</h1>
          <p className="text-gray-500 text-sm mt-2">نظام حضور ذكي لمؤسستك</p>
        </div>

        {done ? (
          <div className="text-center glass-card rounded-2xl p-8">
            <CheckCircle2 size={48} className="text-green-400 mx-auto mb-4"/>
            <p className="text-white font-black text-xl">تم الإنشاء!</p>
            <p className="text-gray-500 text-sm mt-2">جارٍ التوجه للوحة التحكم...</p>
          </div>
        ) : (
          <form onSubmit={submit} className="glass-card rounded-2xl p-8 flex flex-col gap-5">

            <div className="border-b border-white/8 pb-5 flex flex-col gap-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">تحقق من الهوية</p>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">البريد الإلكتروني</label>
                <input type="email" value={form.ownerEmail}
                  onChange={e => setForm(f => ({ ...f, ownerEmail: e.target.value }))}
                  placeholder="your@email.com" required dir="ltr" className={inp}/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">كلمة المرور</label>
                <input type="password" value={form.ownerPassword}
                  onChange={e => setForm(f => ({ ...f, ownerPassword: e.target.value }))}
                  placeholder="••••••••" required className={inp}/>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">بيانات المؤسسة</p>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">اسم المؤسسة</label>
                <input value={form.name}
                  onChange={e => {
                    const name = e.target.value;
                    setForm(f => ({ ...f, name, slug: slugify(name) }));
                  }}
                  placeholder="شركة النجاح" required className={inp}/>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-400 mb-2 block">
                  الرابط الخاص <span className="text-gray-600">(slug)</span>
                </label>
                <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus-within:border-neon-cyan/40">
                  <span className="text-gray-600 text-xs whitespace-nowrap">alihajali.com/attend/</span>
                  <input value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: slugify(e.target.value) }))}
                    placeholder="company-name" required dir="ltr"
                    className="flex-1 bg-transparent text-white text-sm focus:outline-none"/>
                </div>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl px-4 py-2">{error}</p>
            )}

            <button type="submit" disabled={loading}
              className="flex items-center justify-center gap-2 py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100">
              {loading ? <><Loader2 size={18} className="animate-spin"/> جارٍ الإنشاء...</> : "إنشاء المؤسسة"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
