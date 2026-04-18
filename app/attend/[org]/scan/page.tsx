"use client";

import { use, useEffect, useState, Suspense, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { startRegistration } from "@simplewebauthn/browser";
import { Fingerprint, Loader2, CheckCircle2, AlertCircle, LogIn, LogOut } from "lucide-react";

type Stage = "validating" | "login" | "binding" | "confirm" | "done" | "error";
type AttType = "CHECK_IN" | "CHECK_OUT";

function ScanContent({ org }: { org: string }) {
  const token = useSearchParams().get("t") ?? "";

  const [stage, setStage]     = useState<Stage>("validating");
  const [attType, setAttType] = useState<AttType>("CHECK_IN");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const validate = useCallback(async () => {
    const res  = await fetch(`/api/attend/${org}/scan`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "validate", token }),
    });
    const data = await res.json();
    if (!res.ok) { setStage("error"); setError(data.error); return; }

    setAttType(data.attType ?? "CHECK_IN");
    if (data.hasSession) { setName(data.name); setStage("confirm"); }
    else setStage("login");
  }, [org, token]);

  useEffect(() => {
    if (!token) { setStage("error"); setError("رمز QR غير صالح"); return; }
    validate();
  }, [validate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/attend/${org}/auth/employee-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setName(data.name);
      if (data.needsBinding) { setStage("binding"); }
      else { setAttType(data.attType ?? "CHECK_IN"); setStage("confirm"); }
    } finally { setLoading(false); }
  };

  const bindDevice = async () => {
    setLoading(true); setError("");
    try {
      const optRes = await fetch(`/api/attend/${org}/webauthn/register`, { method: "POST" });
      const opts   = await optRes.json();
      if (!optRes.ok) { setError(opts.error); return; }
      const response = await startRegistration({ optionsJSON: opts });
      const verRes   = await fetch(`/api/attend/${org}/webauthn/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(response),
      });
      const ver = await verRes.json();
      if (!verRes.ok) { setError(ver.error); return; }
      setStage("confirm");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "فشل ربط الجهاز");
    } finally { setLoading(false); }
  };

  const record = async () => {
    setLoading(true); setError("");
    try {
      const res  = await fetch(`/api/attend/${org}/scan`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "record", token }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error); return; }
      setAttType(data.attType); setStage("done");
    } finally { setLoading(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3">
            <Fingerprint size={28} className="text-neon-cyan"/>
          </div>
          <h1 className="text-xl font-black text-white capitalize">{org}</h1>
        </div>

        {stage === "validating" && (
          <div className="glass-card rounded-2xl p-10 flex justify-center">
            <Loader2 size={36} className="animate-spin text-neon-cyan"/>
          </div>
        )}

        {stage === "login" && (
          <form onSubmit={handleLogin} className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <p className="text-white font-black text-lg text-center">سجّل دخولك</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required dir="ltr" autoFocus placeholder="your@email.com" className={inp}/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••" className={inp}/>
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 text-center">{error}</p>}
            <button type="submit" disabled={loading}
              className="py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin mx-auto"/> : "دخول"}
            </button>
          </form>
        )}

        {stage === "binding" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            <Fingerprint size={40} className="text-neon-cyan"/>
            <div>
              <p className="text-white font-black text-lg">مرحباً {name}</p>
              <p className="text-gray-400 text-sm mt-1">ربط البصمة مرة واحدة فقط</p>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 w-full">{error}</p>}
            <button onClick={bindDevice} disabled={loading}
              className="flex items-center justify-center gap-2 w-full py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin"/> : <><Fingerprint size={18}/> ربط البصمة</>}
            </button>
          </div>
        )}

        {stage === "confirm" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${attType === "CHECK_IN" ? "bg-green-500/15" : "bg-blue-500/15"}`}>
              {attType === "CHECK_IN" ? <LogIn size={32} className="text-green-400"/> : <LogOut size={32} className="text-blue-400"/>}
            </div>
            <div>
              <p className="text-white font-black text-xl">{name}</p>
              <p className={`font-bold mt-1 ${attType === "CHECK_IN" ? "text-green-400" : "text-blue-400"}`}>
                {attType === "CHECK_IN" ? "تسجيل حضور" : "تسجيل انصراف"}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
              </p>
            </div>
            {error && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 w-full">{error}</p>}
            <button onClick={record} disabled={loading}
              className={`w-full py-4 font-black rounded-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 ${attType === "CHECK_IN" ? "bg-green-500 text-white" : "bg-blue-500 text-white"}`}>
              {loading ? <Loader2 size={18} className="animate-spin mx-auto"/> : `تأكيد ${attType === "CHECK_IN" ? "الحضور" : "الانصراف"}`}
            </button>
          </div>
        )}

        {stage === "done" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={56} className={attType === "CHECK_IN" ? "text-green-400" : "text-blue-400"}/>
            <p className="text-white font-black text-2xl">{name}</p>
            <p className={`font-bold text-lg ${attType === "CHECK_IN" ? "text-green-400" : "text-blue-400"}`}>
              {attType === "CHECK_IN" ? "✓ سُجّل الحضور" : "✓ سُجّل الانصراف"}
            </p>
            <p className="text-neon-cyan font-mono font-bold text-lg">
              {new Date().toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
        )}

        {stage === "error" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <AlertCircle size={48} className="text-red-400"/>
            <p className="text-white font-black">حدث خطأ</p>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ScanPage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
        <Loader2 className="animate-spin text-neon-cyan" size={32}/>
      </div>
    }>
      <ScanContent org={org}/>
    </Suspense>
  );
}
