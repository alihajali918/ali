"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Shield, Loader2 } from "lucide-react";

export default function AdminLoginPage({ params }: { params: Promise<{ org: string }> }) {
  const { org }   = use(params);
  const router    = useRouter();
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/attend/${org}/auth/admin-login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      router.push(`/attend/${org}/admin`);
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const inp = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/40 text-sm";

  return (
    <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
            <Shield size={32} className="text-neon-cyan"/>
          </div>
          <h1 className="text-2xl font-black text-white capitalize">{org}</h1>
          <p className="text-gray-500 text-sm mt-1">لوحة تحكم الأدمن</p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-2xl p-8 flex flex-col gap-4">
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">البريد الإلكتروني</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              autoFocus
              dir="ltr"
              className={inp}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-gray-400 mb-2 block">كلمة المرور</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className={inp}
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-xl px-4 py-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex items-center justify-center gap-2 py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100"
          >
            {loading ? <><Loader2 size={18} className="animate-spin"/> جارٍ الدخول...</> : "دخول"}
          </button>
        </form>
      </div>
    </div>
  );
}
