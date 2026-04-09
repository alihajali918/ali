"use client";

import { useState } from "react";
import { Mail, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setDone(true);
    } catch {
      setError("تعذّر الاتصال");
    } finally {
      setLoading(false);
    }
  };

  if (done) return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4" dir="rtl">
      <div className="w-full max-w-sm text-center">
        <div className="glass-card rounded-3xl p-8 flex flex-col items-center gap-4">
          <CheckCircle size={48} className="text-neon-cyan" />
          <h2 className="text-xl font-black text-white">تحقق من بريدك</h2>
          <p className="text-gray-400 text-sm leading-relaxed">
            إذا كان البريد مسجلاً، سيصلك رابط إعادة التعيين خلال دقيقة.
          </p>
          <Link href="/login" className="mt-2 text-xs text-gray-500 hover:text-white transition-colors">
            العودة لتسجيل الدخول
          </Link>
        </div>
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
          <h1 className="text-2xl font-black text-white">نسيت كلمة المرور؟</h1>
          <p className="text-gray-500 text-sm mt-1">أدخل بريدك وسنرسل لك رابط الاسترداد</p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                required placeholder="you@example.com" dir="ltr"
                className="w-full bg-glass border border-glass-border rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors" />
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</p>}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-neon-cyan text-dark-bg font-black text-sm disabled:opacity-60 hover:scale-105 active:scale-95 transition-all mt-1">
            {loading ? <><Loader2 size={16} className="animate-spin" /> جارٍ الإرسال...</> : "إرسال رابط الاسترداد"}
          </button>

          <p className="text-center text-xs text-gray-600">
            تذكرت كلمة المرور؟{" "}
            <Link href="/login" className="text-neon-cyan hover:underline font-bold">تسجيل الدخول</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
