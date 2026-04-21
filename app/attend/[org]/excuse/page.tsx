"use client";

import { use, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Loader2, FileUp, CheckCircle2, Fingerprint } from "lucide-react";

const excuseLabels: Record<string, string> = {
  SICK:     "تقرير طبي",
  VACATION: "إجازة",
  PERSONAL: "ظرف شخصي",
  OTHER:    "سبب آخر",
};

type AbsenceRecord = { id: string; date: string };

export default function ExcusePage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [stage, setStage] = useState<"login" | "webauthn" | "form" | "done">("login");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [pendingEmpId, setPendingEmpId] = useState<number | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const [absences, setAbsences]     = useState<AbsenceRecord[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [excuseType, setExcuseType] = useState("SICK");
  const [excuseNote, setExcuseNote] = useState("");
  const [excuseFile, setExcuseFile] = useState("");
  const [fileName, setFileName]     = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const loadAndShowForm = async () => {
    const res  = await fetch(`/api/attend/${org}/excuse`);
    const data = await res.json();
    const list: AbsenceRecord[] = (data.records ?? []).filter((r: { excuseApproved: boolean | null }) => r.excuseApproved !== true);
    setAbsences(list);
    setSelectedId(list[0]?.id ?? "");
    setStage("form");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const res  = await fetch(`/api/attend/${org}/auth/employee-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error); return; }
      if (data.needsWebAuthn) { setPendingEmpId(data.employeeId); setStage("webauthn"); return; }
      await loadAndShowForm();
    } finally { setLoginLoading(false); }
  };

  const handleWebAuthn = async () => {
    setLoginLoading(true); setLoginError("");
    try {
      const optRes = await fetch(`/api/attend/${org}/webauthn/authenticate`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const opts = await optRes.json();
      if (!optRes.ok) { setLoginError(opts.error); return; }
      const response = await startAuthentication({ optionsJSON: opts });
      const verRes   = await fetch(`/api/attend/${org}/webauthn/auth-verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ employeeId: pendingEmpId, response }),
      });
      const ver = await verRes.json();
      if (!verRes.ok) { setLoginError(ver.error); return; }
      await loadAndShowForm();
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : "فشل التحقق بالبصمة");
    } finally { setLoginLoading(false); }
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSubmitError("الحجم الأقصى 2 ميغابايت"); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setExcuseFile(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedId) return;
    setSubmitting(true); setSubmitError("");
    try {
      const res = await fetch(`/api/attend/${org}/excuse`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordId: selectedId, excuseType, excuseNote, excuseFile: excuseFile || null }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error); return; }
      setStage("done");
    } finally { setSubmitting(false); }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

  const inp = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40";

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center px-4 py-10" dir="rtl">
      <div className="w-full max-w-sm">

        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 flex items-center justify-center mx-auto mb-3">
            <FileUp size={28} className="text-neon-cyan"/>
          </div>
          <h1 className="text-xl font-black text-white capitalize">{org}</h1>
          <p className="text-gray-500 text-sm mt-1">تقديم عذر الغياب</p>
        </div>

        {stage === "login" && (
          <form onSubmit={handleLogin} className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <p className="text-white font-black text-lg text-center">سجّل دخولك</p>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              required dir="ltr" autoFocus placeholder="your@email.com" className={inp}/>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder="••••••••" className={inp}/>
            {loginError && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 text-center">{loginError}</p>}
            <button type="submit" disabled={loginLoading}
              className="py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60">
              {loginLoading ? <Loader2 size={18} className="animate-spin mx-auto"/> : "دخول"}
            </button>
          </form>
        )}

        {stage === "webauthn" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
            <Fingerprint size={40} className="text-neon-cyan"/>
            <div>
              <p className="text-white font-black text-lg">تحقق بالبصمة</p>
              <p className="text-gray-400 text-sm mt-1">مطلوب تحقق الجهاز للمتابعة</p>
            </div>
            {loginError && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2 w-full">{loginError}</p>}
            <button onClick={handleWebAuthn} disabled={loginLoading}
              className="flex items-center justify-center gap-2 w-full py-4 bg-neon-cyan text-dark-bg font-black rounded-2xl hover:scale-105 active:scale-95 transition-transform disabled:opacity-60">
              {loginLoading ? <Loader2 size={18} className="animate-spin"/> : <><Fingerprint size={18}/> تحقق بالبصمة</>}
            </button>
            <button onClick={() => { setStage("login"); setLoginError(""); }}
              className="text-gray-500 hover:text-white text-xs">رجوع</button>
          </div>
        )}

        {stage === "form" && (
          absences.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center text-gray-400">
              <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3"/>
              <p className="font-black text-white">لا يوجد غياب مسجّل</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 flex flex-col gap-4">
              <p className="text-white font-black text-lg text-center">رفع عذر الغياب</p>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">يوم الغياب</label>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className={inp} style={{ colorScheme: "dark" }}>
                  {absences.map(r => (
                    <option key={r.id} value={r.id}>{fmtDate(r.date)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">نوع العذر</label>
                <select value={excuseType} onChange={e => setExcuseType(e.target.value)}
                  className={inp} style={{ colorScheme: "dark" }}>
                  {Object.entries(excuseLabels).map(([v, l]) => (
                    <option key={v} value={v}>{l}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">ملاحظة (اختياري)</label>
                <textarea value={excuseNote} onChange={e => setExcuseNote(e.target.value)}
                  rows={3} placeholder="اكتب تفاصيل إضافية..."
                  className={inp + " resize-none"}/>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-400 mb-1.5 block">رفع المستند (اختياري — صورة أو PDF حتى 2MB)</label>
                <label className="flex items-center gap-3 cursor-pointer px-4 py-3 rounded-xl border border-dashed border-white/15 hover:border-neon-cyan/40 transition-colors">
                  <FileUp size={18} className="text-neon-cyan shrink-0"/>
                  <span className="text-sm text-gray-400 truncate">{fileName || "اضغط لاختيار ملف"}</span>
                  <input type="file" accept="image/*,.pdf" onChange={handleFile} className="hidden"/>
                </label>
              </div>

              {submitError && <p className="text-red-400 text-sm bg-red-500/10 rounded-xl px-4 py-2">{submitError}</p>}

              <button type="submit" disabled={submitting}
                className="py-3 bg-neon-cyan text-dark-bg font-black rounded-xl text-sm disabled:opacity-60">
                {submitting ? <Loader2 size={16} className="animate-spin mx-auto"/> : "إرسال العذر"}
              </button>
            </form>
          )
        )}

        {stage === "done" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={52} className="text-green-400"/>
            <p className="text-white font-black text-xl">تم إرسال العذر</p>
            <p className="text-gray-400 text-sm">سيراجعه المدير وتصلك النتيجة قريباً</p>
          </div>
        )}

      </div>
    </div>
  );
}
