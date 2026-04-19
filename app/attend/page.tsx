"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Building2, Shield, ArrowLeft, Loader2 } from "lucide-react";

type Role = "admin" | "employee" | null;

export default function AttendLanding() {
  const router = useRouter();
  const [role, setRole]   = useState<Role>(null);
  const [slug, setSlug]   = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const go = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slug.trim()) { setError("أدخل اسم المؤسسة"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/attend/${slug.trim()}/settings`);
      if (res.status === 404) { setError("المؤسسة غير موجودة"); return; }
      if (role === "admin") {
        router.push(`/attend/${slug.trim()}/admin/login`);
      } else {
        router.push(`/attend/${slug.trim()}/excuse`);
      }
    } catch { setError("حدث خطأ، حاول مجدداً"); }
    finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40 text-center tracking-wider";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
            <Fingerprint size={32} className="text-neon-cyan"/>
          </div>
          <h1 className="text-2xl font-black text-white">نظام الحضور</h1>
          <p className="text-gray-500 text-sm mt-1">اختر دورك للمتابعة</p>
        </div>

        {!role ? (
          <div className="flex flex-col gap-3">
            <button onClick={() => setRole("admin")}
              className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center shrink-0">
                <Shield size={22} className="text-purple-400"/>
              </div>
              <div className="text-right flex-1">
                <p className="text-white font-black">مدير / أدمن</p>
                <p className="text-gray-500 text-xs mt-0.5">لوحة التحكم والإدارة</p>
              </div>
              <ArrowLeft size={16} className="text-gray-600 group-hover:text-purple-400 transition-colors"/>
            </button>

            <button onClick={() => setRole("employee")}
              className="glass-card rounded-2xl p-5 flex items-center gap-4 hover:border-neon-cyan/30 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-neon-cyan/10 flex items-center justify-center shrink-0">
                <Building2 size={22} className="text-neon-cyan"/>
              </div>
              <div className="text-right flex-1">
                <p className="text-white font-black">موظف</p>
                <p className="text-gray-500 text-xs mt-0.5">تقديم عذر غياب</p>
              </div>
              <ArrowLeft size={16} className="text-gray-600 group-hover:text-neon-cyan transition-colors"/>
            </button>

            <div className="mt-4 text-center">
              <a href="/attend/setup" className="text-xs text-gray-600 hover:text-neon-cyan transition-colors">
                تسجيل مؤسسة جديدة ←
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={go} className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <button type="button" onClick={() => { setRole(null); setError(""); }}
              className="flex items-center gap-1.5 text-gray-500 hover:text-white text-xs w-fit">
              <ArrowLeft size={12} className="rotate-180"/> رجوع
            </button>

            <div className="text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3 ${role === "admin" ? "bg-purple-500/10" : "bg-neon-cyan/10"}`}>
                {role === "admin" ? <Shield size={20} className="text-purple-400"/> : <Building2 size={20} className="text-neon-cyan"/>}
              </div>
              <p className="text-white font-black">{role === "admin" ? "دخول المدير" : "بوابة الموظف"}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block text-center">اسم المؤسسة (slug)</label>
              <input value={slug} onChange={e => setSlug(e.target.value.toLowerCase().trim())}
                dir="ltr" placeholder="my-company" autoFocus className={inp}/>
              <p className="text-[11px] text-gray-600 mt-1 text-center">
                مثال: إذا رابطك <span className="text-gray-500">/attend/my-company</span> — اكتب <span className="text-gray-500">my-company</span>
              </p>
            </div>

            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 text-center">{error}</p>}

            <button type="submit" disabled={loading}
              className={`py-3.5 font-black rounded-xl text-sm disabled:opacity-60 ${role === "admin" ? "bg-purple-500 text-white" : "bg-neon-cyan text-dark-bg"}`}>
              {loading ? <Loader2 size={16} className="animate-spin mx-auto"/> : "متابعة"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
