"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const router = useRouter();
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
      router.push("/admin");
    } catch {
      setError("تعذّر الاتصال بالخادم");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-bg px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon-cyan flex items-center justify-center mx-auto mb-4">
            <Lock size={24} className="text-dark-bg" />
          </div>
          <h1 className="text-2xl font-black text-white">لوحة التحكم</h1>
          <p className="text-gray-500 text-sm mt-1">Ali Hajali · Admin</p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-3xl p-6 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">البريد الإلكتروني</label>
            <div className="relative">
              <Mail size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required placeholder="admin@alihajali.com" dir="ltr"
                className="w-full bg-glass border border-glass-border rounded-xl pr-9 pl-3 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-400 mb-1.5 block">كلمة المرور</label>
            <div className="relative">
              <Lock size={15} className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500" />
              <input
                type={show ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                required placeholder="••••••••" dir="ltr"
                className="w-full bg-glass border border-glass-border rounded-xl pr-9 pl-9 py-2.5 text-sm text-white placeholder-gray-700 outline-none focus:border-neon-cyan/40 transition-colors"
              />
              <button type="button" onClick={() => setShow((v) => !v)}
                className="absolute top-1/2 -translate-y-1/2 left-3 text-gray-500 hover:text-gray-300 transition-colors">
                {show ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-400 text-xs font-semibold text-center bg-red-500/10 py-2 rounded-xl border border-red-500/20">
              {error}
            </p>
          )}

          <button type="submit" disabled={loading}
            className="flex items-center justify-center gap-2 py-3 rounded-2xl bg-neon-cyan text-dark-bg font-black text-sm disabled:opacity-60 hover:scale-105 active:scale-95 transition-all mt-1">
            {loading ? <><Loader2 size={16} className="animate-spin" /> جارٍ الدخول...</> : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
