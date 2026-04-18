"use client";

import { useState, use } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Fingerprint, QrCode, CheckCircle2, XCircle, Loader2 } from "lucide-react";

type Step = "email" | "biometric" | "qr" | "done" | "error";

export default function CheckinPage({ params }: { params: Promise<{ org: string }> }) {
  const { org }      = use(params);
  const [step, setStep]       = useState<Step>("email");
  const [email, setEmail]     = useState("");
  const [empId, setEmpId]     = useState<number | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [action, setAction]   = useState<"checkin" | "checkout">("checkin");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  /* ── Step 1: Biometric authentication ── */
  const handleBiometric = async () => {
    if (!email.trim()) return;
    setLoading(true);
    try {
      // Get auth options
      const optRes = await fetch(`/api/attend/${org}/webauthn/authenticate`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const opts = await optRes.json();
      if (!optRes.ok) { setMessage(opts.error); setStep("error"); return; }

      setEmpId(opts.employeeId);

      // Trigger biometric prompt
      const response = await startAuthentication({ optionsJSON: opts });

      // Verify on server
      const verRes = await fetch(`/api/attend/${org}/webauthn/auth-verify`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ employeeId: opts.employeeId, response }),
      });
      const ver = await verRes.json();
      if (!verRes.ok) { setMessage(ver.error); setStep("error"); return; }

      setStep("qr");
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "فشل التحقق";
      setMessage(msg);
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 2: QR scan + check-in/out ── */
  const handleCheckin = async () => {
    if (!qrToken.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/attend/${org}/records`, {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ qrToken, action }),
      });
      const data = await res.json();
      if (!res.ok) { setMessage(data.error); setStep("error"); return; }
      setMessage(data.message);
      setStep("done");
    } catch {
      setMessage("حدث خطأ في الاتصال");
      setStep("error");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("email");
    setEmail("");
    setQrToken("");
    setMessage("");
    setEmpId(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">

        {/* header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-4">
            <Fingerprint size={32} className="text-neon-cyan"/>
          </div>
          <h1 className="text-2xl font-black text-white capitalize">{org}</h1>
          <p className="text-gray-500 text-sm mt-1">تسجيل الحضور</p>
        </div>

        {/* ── Email step ── */}
        {step === "email" && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-gray-400 mb-2 block">الإيميل</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleBiometric()}
                placeholder="your@email.com"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/40 text-sm"
                dir="ltr"
              />
            </div>

            <div className="flex gap-2">
              {(["checkin", "checkout"] as const).map(a => (
                <button key={a}
                  onClick={() => setAction(a)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-black transition-all ${
                    action === a
                      ? "bg-neon-cyan text-dark-bg"
                      : "bg-white/5 text-gray-400 hover:text-white"
                  }`}>
                  {a === "checkin" ? "حضور" : "انصراف"}
                </button>
              ))}
            </div>

            <button
              onClick={handleBiometric}
              disabled={loading || !email.trim()}
              className="flex items-center justify-center gap-2 py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin"/> جارٍ التحقق...</>
                : <><Fingerprint size={18}/> تحقق بالبصمة</>
              }
            </button>
          </div>
        )}

        {/* ── QR step ── */}
        {step === "qr" && (
          <div className="flex flex-col gap-4">
            <div className="glass-card rounded-2xl p-5 text-center">
              <QrCode size={32} className="text-neon-cyan mx-auto mb-3"/>
              <p className="text-white font-bold text-sm mb-1">أدخل رمز QR</p>
              <p className="text-gray-500 text-xs">اكتب الرقم المعروض على الشاشة</p>
            </div>

            <input
              type="number"
              value={qrToken}
              onChange={e => setQrToken(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCheckin()}
              placeholder="000000"
              maxLength={6}
              className="w-full px-4 py-4 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-neon-cyan/40 text-2xl font-black text-center tracking-[0.4em]"
              dir="ltr"
            />

            <button
              onClick={handleCheckin}
              disabled={loading || qrToken.length < 6}
              className="flex items-center justify-center gap-2 py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform disabled:opacity-60 disabled:scale-100"
            >
              {loading
                ? <><Loader2 size={18} className="animate-spin"/> جارٍ التسجيل...</>
                : action === "checkin" ? "تسجيل الحضور" : "تسجيل الانصراف"
              }
            </button>
          </div>
        )}

        {/* ── Done ── */}
        {step === "done" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} className="text-green-400"/>
            </div>
            <p className="text-white font-black text-xl mb-2">تم!</p>
            <p className="text-gray-400 text-sm mb-8">{message}</p>
            <button onClick={reset}
              className="px-8 py-3 glass-card text-white font-bold rounded-2xl hover:border-white/20 transition-all">
              رجوع
            </button>
          </div>
        )}

        {/* ── Error ── */}
        {step === "error" && (
          <div className="text-center">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-5">
              <XCircle size={40} className="text-red-400"/>
            </div>
            <p className="text-white font-black text-xl mb-2">خطأ</p>
            <p className="text-gray-400 text-sm mb-8">{message}</p>
            <button onClick={reset}
              className="px-8 py-3 glass-card text-white font-bold rounded-2xl hover:border-white/20 transition-all">
              حاول مجدداً
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
