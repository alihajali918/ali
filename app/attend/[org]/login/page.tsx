"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, Loader2, CheckCircle2, ShieldCheck } from "lucide-react";

type Step = "form" | "binding" | "done" | "error";

export default function EmployeeLoginPage({ params }: { params: Promise<{ org: string }> }) {
  const { org }    = use(params);
  const router     = useRouter();
  const [step, setStep]       = useState<Step>("form");
  const [form, setForm]       = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [empName, setEmpName] = useState("");

  const login = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/attend/${org}/auth/employee-login`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }

      setEmpName(data.name);

      if (data.needsBinding) {
        setStep("binding");
      } else {
        router.push(`/attend/${org}/checkin`);
      }
    } catch {
      setError("حدث خطأ في الاتصال");
    } finally {
      setLoading(false);
    }
  };

  const bindDevice = async () => {
    setLoading(true);
    setError("");
    try {
      // Get registration options
      const optRes = await fetch(`/api/attend/${org}/webauthn/register`, { method: "POST" });
      const opts   = await optRes.json();
      if (!optRes.ok) { setError(opts.error); return; }

      // Trigger biometric prompt
      const response = await startRegistration({ optionsJSON: opts });

      // Verify on server
      const verRes = await fetch(`/api/attend/${org}/webauthn/verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(response),
      });
      const ver = await verRes.json();
      if (!verRes.ok) { setError(ver.error); return; }

      setStep("done");
      setTimeout(() => router.push(`/attend/${org}/checkin`), 2000);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "فشل ربط الجهاز";
      setError(msg);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm">

        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
            <Fingerprint size={32} className="text-neon-cyan"/>
          </div>
          <h1 className="text-2xl font-black text-white capitalize">{org}</h1>
          <p className="text-gray-500 text-sm mt-1">تسجيل دخول الموظف</p>
        </div>

        {/* ── Login form ── */}
        {step === "form" && (
          <form onSubmit={login} className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">الإيميل</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="your@email.com"
                required
                dir="ltr"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/40 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">كلمة المرور</label>
              <input
                type="password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                placeholder="••••••••"
                required
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/40 text-sm"
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
        )}

        {/* ── Device binding ── */}
        {step === "binding" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center">
              <ShieldCheck size={32} className="text-neon-cyan"/>
            </div>
            <div>
              <p className="text-white font-black text-lg mb-2">مرحباً {empName}</p>
              <p className="text-gray-400 text-sm leading-relaxed">
                أول مرة تدخل من هذا الجهاز.<br/>
                سنربط بصمتك لحماية حسابك — مرة واحدة فقط.
              </p>
            </div>

            {error && (
              <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 w-full">{error}</p>
            )}

            <button
              onClick={bindDevice}
              disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin"/> جارٍ الربط...</>
                : <><Fingerprint size={18}/> ربط البصمة</>
              }
            </button>
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={48} className="text-green-400"/>
            <p className="text-white font-black text-xl">تم ربط الجهاز!</p>
            <p className="text-gray-500 text-sm">جارٍ التوجه لتسجيل الحضور...</p>
          </div>
        )}

        {/* ── Error ── */}
        {step === "error" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <p className="text-red-400 font-bold">{error}</p>
            <button onClick={() => { setStep("form"); setError(""); }}
              className="text-neon-cyan text-sm hover:underline">
              حاول مجدداً
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
