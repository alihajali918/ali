"use client";

import { use, useEffect, useState } from "react";
import { startAuthentication } from "@simplewebauthn/browser";
import { Loader2, FileUp, CheckCircle2, XCircle, Clock, AlertCircle, Fingerprint } from "lucide-react";

type AbsenceRecord = {
  id: string; date: string;
  excuseType: string | null; excuseNote: string | null; excuseApproved: boolean | null;
};

const excuseLabels: Record<string, string> = {
  SICK:     "تقرير طبي",
  VACATION: "إجازة",
  PERSONAL: "ظرف شخصي",
  OTHER:    "سبب آخر",
};

export default function ExcusePage({ params }: { params: Promise<{ org: string }> }) {
  const { org } = use(params);
  const [stage, setStage] = useState<"login" | "webauthn" | "list" | "submit" | "done">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pendingEmpId, setPendingEmpId] = useState<number | null>(null);
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [records, setRecords] = useState<AbsenceRecord[]>([]);
  const [listLoading, setListLoading] = useState(false);
  const [selected, setSelected] = useState<AbsenceRecord | null>(null);
  const [form, setForm] = useState({ excuseType: "SICK", excuseNote: "", excuseFile: "" });
  const [fileName, setFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true); setLoginError("");
    try {
      const res = await fetch(`/api/attend/${org}/auth/employee-login`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setLoginError(data.error); return; }
      if (data.needsWebAuthn) {
        setPendingEmpId(data.employeeId);
        setStage("webauthn");
        return;
      }
      loadRecords();
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
      loadRecords();
    } catch (e: unknown) {
      setLoginError(e instanceof Error ? e.message : "فشل التحقق بالبصمة");
    } finally { setLoginLoading(false); }
  };

  const loadRecords = async () => {
    setStage("list"); setListLoading(true);
    const res  = await fetch(`/api/attend/${org}/excuse`);
    const data = await res.json();
    setRecords(data.records ?? []);
    setListLoading(false);
  };

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setSubmitError("الحجم الأقصى 2 ميغابايت"); return; }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setForm(f => ({ ...f, excuseFile: reader.result as string }));
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true); setSubmitError("");
    try {
      const res = await fetch(`/api/attend/${org}/excuse`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recordId:   selected.id,
          excuseType: form.excuseType,
          excuseNote: form.excuseNote,
          excuseFile: form.excuseFile || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setSubmitError(data.error); return; }
      setStage("done");
    } finally { setSubmitting(false); }
  };

  const inp = "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm focus:outline-none focus:border-neon-cyan/40";

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("ar-SA", { weekday: "long", year: "numeric", month: "long", day: "numeric" });

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

        {/* Login */}
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

        {/* WebAuthn step */}
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


        {/* Absence list */}
        {stage === "list" && (
          <div className="flex flex-col gap-3">
            {listLoading ? (
              <div className="glass-card rounded-2xl p-10 flex justify-center">
                <Loader2 size={28} className="animate-spin text-neon-cyan"/>
              </div>
            ) : records.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-gray-400">
                <CheckCircle2 size={40} className="text-green-400 mx-auto mb-3"/>
                <p className="font-black text-white">لا يوجد غياب مسجّل</p>
              </div>
            ) : (
              <>
                <p className="text-gray-500 text-xs mb-1">اختر يوم الغياب لتقديم العذر</p>
                {records.map(r => (
                  <button key={r.id} onClick={() => {
                    setSelected(r);
                    setForm({ excuseType: r.excuseType ?? "SICK", excuseNote: r.excuseNote ?? "", excuseFile: "" });
                    setFileName("");
                    setSubmitError("");
                    setStage("submit");
                  }}
                    className="glass-card rounded-2xl p-5 text-right flex items-start justify-between hover:border-neon-cyan/30 transition-colors">
                    <div>
                      <p className="text-white font-bold text-sm">{fmtDate(r.date)}</p>
                      {r.excuseType && (
                        <p className="text-xs text-gray-500 mt-1">{excuseLabels[r.excuseType] ?? r.excuseType}</p>
                      )}
                    </div>
                    <div className="shrink-0 mt-0.5">
                      {r.excuseApproved === true  && <CheckCircle2 size={18} className="text-green-400"/>}
                      {r.excuseApproved === false && <XCircle size={18} className="text-red-400"/>}
                      {r.excuseApproved === null  && r.excuseType && <Clock size={18} className="text-yellow-400"/>}
                      {!r.excuseType             && <AlertCircle size={18} className="text-gray-500"/>}
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}

        {/* Submit excuse */}
        {stage === "submit" && selected && (
          <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-8 flex flex-col gap-4">
            <div>
              <p className="text-gray-500 text-xs">تقديم عذر ليوم</p>
              <p className="text-white font-black">{fmtDate(selected.date)}</p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">نوع العذر</label>
              <select value={form.excuseType} onChange={e => setForm(f => ({ ...f, excuseType: e.target.value }))}
                className={inp} style={{ colorScheme: "dark" }}>
                {Object.entries(excuseLabels).map(([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 mb-1.5 block">ملاحظة (اختياري)</label>
              <textarea value={form.excuseNote} onChange={e => setForm(f => ({ ...f, excuseNote: e.target.value }))}
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

            <div className="flex gap-3">
              <button type="submit" disabled={submitting}
                className="flex-1 py-3 bg-neon-cyan text-dark-bg font-black rounded-xl text-sm disabled:opacity-60">
                {submitting ? <Loader2 size={16} className="animate-spin mx-auto"/> : "إرسال العذر"}
              </button>
              <button type="button" onClick={() => setStage("list")}
                className="flex-1 py-3 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20">
                رجوع
              </button>
            </div>
          </form>
        )}

        {/* Done */}
        {stage === "done" && (
          <div className="glass-card rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
            <CheckCircle2 size={52} className="text-green-400"/>
            <p className="text-white font-black text-xl">تم إرسال العذر</p>
            <p className="text-gray-400 text-sm">سيراجعه المدير وتصلك النتيجة قريباً</p>
            <button onClick={() => { setStage("list"); loadRecords(); }}
              className="mt-2 px-6 py-2.5 bg-white/10 text-gray-300 font-bold rounded-xl text-sm hover:bg-white/20">
              عرض الغيابات
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
