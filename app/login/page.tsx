"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const verified = params.get("verified") === "1";
  const expired  = params.get("error") === "expired";

  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [show,     setShow]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "خطأ"); setLoading(false); return; }
      router.push(data.role === "admin" ? "/admin" : "/");
    } catch {
      setError("تعذّر الاتصال");
      setLoading(false);
    }
  };

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
          <h1 className="text-2xl font-black text-white">تسجيل الدخول</h1>
          <p className="text-gray-500 text-sm mt-1">أهلاً بعودتك</p>
        </div>

        {verified && (
          <div className="flex items-center gap-2 bg-neon-cyan/10 border border-neon-cyan/20 rounded-2xl px-4 py-3 mb-4">
            <CheckCircle size={16} className="text-neon-cyan shrink-0" />
            <p className="text-neon-cyan text-sm font-bold">تم تأكيد بريدك! يمكنك الدخول الآن.</p>
          </div>
        )}
        {expired && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 mb-4">
            <p className="text-red-400 text-sm font-bold text-center">رابط التأكيد منتهي. سجّل من جديد.</p>
          </div>
        )}

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

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-gray-400">كلمة المرور</label>
              <Link href="/forgot-password" className="text-xs text-gray-600 hover:text-neon-cyan transition-colors">نسيت كلمة المرور؟</Link>
            </div>
            <div className="relative">
              <Lock size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              <input type={show ? "text" : "password"} value={password}
                onChange={e => setPassword(e.target.value)}
                required placeholder="••••••••" dir="ltr"
                className="w-full bg-glass border border-glass-border rounded-xl pr-9 pl-9 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors" />
              <button type="button" onClick={() => setShow(v => !v)}
                className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500 hover:text-gray-300 transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-400 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">{error}</p>}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-neon-cyan text-dark-bg font-black text-sm disabled:opacity-60 hover:scale-105 active:scale-95 transition-all mt-1">
            {loading ? <><Loader2 size={16} className="animate-spin" /> جارٍ الدخول...</> : "دخول"}
          </button>

          <p className="text-center text-xs text-gray-600">
            ما عندك حساب؟{" "}
            <Link href="/register" className="text-neon-cyan hover:underline font-bold">إنشاء حساب</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
