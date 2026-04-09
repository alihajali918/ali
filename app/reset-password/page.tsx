"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token  = params.get("token") || "";

  const [password,  setPassword]  = useState("");
  const [password2, setPassword2] = useState("");
  const [show,      setShow]      = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [done,      setDone]      = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) { setError("كلمتا المرور غير متطابقتين"); return; }
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); setLoading(false); return; }
      setDone(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch {
      setError("تعذّر الاتصال");
      setLoading(false);
    }
  };

  if (!token) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4" dir="rtl">
      <p className="text-red-400 font-bold">رابط غير صالح</p>
    </div>
  );

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4" dir="rtl">
      <div className="w-full max-w-sm text-center glass-card rounded-3xl p-8 flex flex-col items-center gap-4">
        <CheckCircle size={48} className="text-neon-cyan" />
        <h2 className="text-xl font-black text-white">تم تغيير كلمة المرور!</h2>
        <p className="text-gray-400 text-sm">جاري تحويلك لصفحة الدخول...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4" dir="rtl">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan flex items-center justify-center">
              <span className="text-dark-bg font-black text-xs">AH</span>
            </div>
            <span className="font-black text-white text-lg">Ali Hajali</span>
          </Link>
          <h1 className="text-2xl font-black text-white">إعادة تعيين كلمة المرور</h1>
          <p className="text-gray-500 text-sm mt-1">اختر كلمة مرور جديدة</p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">كلمة المرور الجديدة</label>
            <div className="relative">
              <Lock size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              <input type={show ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="8 أحرف على الأقل" dir="ltr"
                className="w-full bg-glass border border-glass-border rounded-xl pr-9 pl-9 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors" />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500 hover:text-gray-300 transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">تأكيد كلمة المرور</label>
            <div className="relative">
              <Lock size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              <input type={show ? "text" : "password"} value={password2}
                onChange={e => setPassword2(e.target.value)}
                required placeholder="••••••••" dir="ltr"
                className="w-full bg-glass border border-glass-border rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors" />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</p>}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-neon-cyan text-dark-bg font-black text-sm disabled:opacity-60 hover:scale-105 active:scale-95 transition-all mt-1">
            {loading ? <><Loader2 size={16} className="animate-spin" /> جارٍ الحفظ...</> : "حفظ كلمة المرور"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>;
}
