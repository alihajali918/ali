"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, Shield, Loader2, CheckCircle, Edit2, Lock, Send, X, Eye, EyeOff, Home, LogOut } from "lucide-react";
import Link from "next/link";

interface UserInfo {
  id: number; name: string; email: string;
  role: string; emailVerified: boolean; createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  // تعديل الاسم
  const [editName,  setEditName]  = useState(false);
  const [nameVal,   setNameVal]   = useState("");
  const [nameSaving,setNameSaving]= useState(false);
  const [nameMsg,   setNameMsg]   = useState("");

  // تغيير كلمة المرور
  const [editPass,   setEditPass]   = useState(false);
  const [currPass,   setCurrPass]   = useState("");
  const [newPass,    setNewPass]    = useState("");
  const [showCurr,   setShowCurr]   = useState(false);
  const [showNew,    setShowNew]    = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [passMsg,    setPassMsg]    = useState("");

  // إعادة التحقق
  const [sending,   setSending]   = useState(false);
  const [sentMsg,   setSentMsg]   = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (!data.user) {
          router.push("/login");
          return;
        }
        setUser(data.user as UserInfo);
        setNameVal(data.user.name);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) router.push("/login");
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/user-logout", { method: "POST" });
    window.dispatchEvent(new CustomEvent("auth-change"));
    router.push("/login");
    router.refresh();
  };

  const saveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameSaving(true); setNameMsg("");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: nameVal }),
    });
    const data = await res.json();
    setNameSaving(false);
    if (!res.ok) { setNameMsg(data.error); return; }
    setUser(data.user);
    setNameMsg("تم الحفظ ✓");
    setEditName(false);
    window.dispatchEvent(new CustomEvent("auth-change"));
    setTimeout(() => setNameMsg(""), 3000);
  };

  const savePass = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassSaving(true); setPassMsg("");
    const res = await fetch("/api/auth/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ currentPassword: currPass, newPassword: newPass }),
    });
    const data = await res.json();
    setPassSaving(false);
    if (!res.ok) { setPassMsg(data.error); return; }
    setPassMsg("تم تغيير كلمة المرور ✓");
    setEditPass(false);
    setCurrPass(""); setNewPass("");
    setTimeout(() => setPassMsg(""), 3000);
  };

  const resendVerify = async () => {
    setSending(true); setSentMsg("");
    const res = await fetch("/api/auth/resend-verify", { method: "POST" });
    const data = await res.json();
    setSending(false);
    setSentMsg(res.ok ? "تم الإرسال! تحقق من بريدك." : data.error || "خطأ");
    setTimeout(() => setSentMsg(""), 5000);
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <Loader2 size={32} className="text-neon-cyan animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg glow-mesh" dir="rtl">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-dark-bg/85 backdrop-blur-xl">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-400 hover:text-neon-cyan transition-colors shrink-0"
          >
            <Home size={15} className="shrink-0" />
            الموقع
          </Link>
          <h1 className="text-sm font-black text-white truncate text-center flex-1">حسابي</h1>
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-gray-500 hover:text-red-400 px-2 py-1.5 rounded-xl hover:bg-red-500/10 transition-colors shrink-0"
          >
            <LogOut size={15} className="shrink-0" />
            <span className="hidden sm:inline">خروج</span>
          </button>
        </div>
      </header>

      <div className="max-w-2xl mx-auto px-4 pt-6 pb-12 flex flex-col gap-5">

        {/* بطاقة الترحيب */}
        <div className="glass-card rounded-2xl p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center flex-shrink-0">
            <span className="text-neon-cyan font-black text-xl">
              {user?.name?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-white font-black text-lg">مرحباً، {user?.name}!</p>
            <p className="text-gray-500 text-sm mt-0.5">{user?.email}</p>
          </div>
        </div>

        {/* تنبيه التحقق */}
        {!user?.emailVerified && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-yellow-500/8 border border-yellow-500/20 rounded-2xl px-5 py-4">
            <div className="flex items-start gap-2 min-w-0">
              <Shield size={16} className="text-yellow-400 shrink-0 mt-0.5" />
              <p className="text-yellow-400 text-sm font-bold leading-snug">
                بريدك غير مؤكد — أكّده لتفعيل حسابك كاملاً
              </p>
            </div>
            <button
              type="button"
              onClick={resendVerify}
              disabled={sending}
              className="flex items-center justify-center gap-1.5 px-3 py-2.5 sm:py-1.5 bg-yellow-500/15 text-yellow-400 text-xs font-black rounded-xl hover:bg-yellow-500/25 transition-all shrink-0 disabled:opacity-60 w-full sm:w-auto"
            >
              {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              إعادة إرسال رابط التحقق
            </button>
          </div>
        )}
        {sentMsg && (
          <p className={`text-xs font-bold text-center px-4 py-2 rounded-xl ${sentMsg.includes("تم") ? "text-neon-cyan bg-neon-cyan/10" : "text-red-400 bg-red-500/10"}`}>
            {sentMsg}
          </p>
        )}

        {/* معلومات الحساب */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-glass-border">
            <p className="text-xs font-black text-gray-500 uppercase tracking-widest">معلومات الحساب</p>
          </div>
          <div className="divide-y divide-glass-border/50">

            {/* الاسم */}
            <div className="px-5 py-4">
              {editName ? (
                <form onSubmit={saveName} className="flex flex-wrap items-center gap-2">
                  <User size={15} className="text-gray-600 shrink-0" aria-hidden />
                  <input
                    id="dashboard-name"
                    value={nameVal}
                    onChange={e => setNameVal(e.target.value)}
                    required
                    minLength={2}
                    maxLength={100}
                    aria-label="الاسم"
                    className="flex-1 min-w-[10rem] bg-glass border border-neon-cyan/30 rounded-xl px-3 py-1.5 text-sm text-white outline-none focus:border-neon-cyan/50"
                  />
                  <button type="submit" disabled={nameSaving}
                    className="px-3 py-1.5 bg-neon-cyan text-dark-bg text-xs font-black rounded-xl disabled:opacity-60">
                    {nameSaving ? <Loader2 size={13} className="animate-spin" /> : "حفظ"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setEditName(false); setNameVal(user?.name || ""); }}
                    className="p-1.5 text-gray-500 hover:text-white rounded-xl"
                    aria-label="إلغاء تعديل الاسم"
                  >
                    <X size={14} />
                  </button>
                </form>
              ) : (
                <div className="flex items-center gap-3">
                  <User size={15} className="text-gray-600" />
                  <span className="text-xs text-gray-500">الاسم</span>
                  <span className="text-sm text-white font-bold mr-auto">{user?.name}</span>
                  <button
                    type="button"
                    onClick={() => { setEditName(true); setNameVal(user?.name || ""); }}
                    className="p-1.5 text-gray-600 hover:text-neon-cyan rounded-xl transition-colors"
                    aria-label="تعديل الاسم"
                  >
                    <Edit2 size={13} />
                  </button>
                </div>
              )}
              {nameMsg && <p className="text-xs text-neon-cyan mt-1 mr-6">{nameMsg}</p>}
            </div>

            {/* البريد */}
            <div className="px-5 py-4 flex items-center gap-3">
              <Mail size={15} className="text-gray-600" />
              <span className="text-xs text-gray-500">البريد</span>
              <span className="text-sm text-white font-bold mr-auto" dir="ltr">{user?.email}</span>
            </div>

            {/* حالة البريد */}
            <div className="px-5 py-4 flex items-center gap-3">
              <Shield size={15} className="text-gray-600" />
              <span className="text-xs text-gray-500">حالة البريد</span>
              {user?.emailVerified
                ? <span className="mr-auto flex items-center gap-1 text-xs font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-full">
                    <CheckCircle size={11} /> مؤكّد
                  </span>
                : <span className="mr-auto text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">غير مؤكّد</span>
              }
            </div>

            {/* تاريخ التسجيل */}
            <div className="px-5 py-4 flex items-center gap-3">
              <Calendar size={15} className="text-gray-600" />
              <span className="text-xs text-gray-500">تاريخ التسجيل</span>
              <span className="text-sm text-white font-bold mr-auto" dir="ltr">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString("ar-QA") : "-"}
              </span>
            </div>

          </div>
        </div>

        {/* تغيير كلمة المرور */}
        <div className="glass-card rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setEditPass(v => !v)}
            aria-expanded={editPass}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-glass transition-colors text-right"
          >
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-gray-500" aria-hidden />
              <span className="text-sm font-bold text-gray-300">تغيير كلمة المرور</span>
            </div>
            <Edit2 size={13} className={`transition-colors shrink-0 ${editPass ? "text-neon-cyan" : "text-gray-600"}`} aria-hidden />
          </button>

          {editPass && (
            <form onSubmit={savePass} className="px-5 pb-5 flex flex-col gap-3 border-t border-glass-border">
              <div className="mt-4">
                <label htmlFor="dash-curr-pass" className="text-[10px] font-bold text-gray-500 mb-1 block">كلمة المرور الحالية</label>
                <div className="relative">
                  <input
                    id="dash-curr-pass"
                    type={showCurr ? "text" : "password"}
                    value={currPass}
                    onChange={e => setCurrPass(e.target.value)}
                    required
                    autoComplete="current-password"
                    dir="ltr"
                    className="w-full bg-glass border border-glass-border rounded-xl px-3 pr-10 py-2 text-sm text-white outline-none focus:border-neon-cyan/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurr(v => !v)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500 hover:text-gray-300 p-0.5 rounded-md"
                    aria-label={showCurr ? "إخفاء كلمة المرور الحالية" : "إظهار كلمة المرور الحالية"}
                  >
                    {showCurr ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              <div>
                <label htmlFor="dash-new-pass" className="text-[10px] font-bold text-gray-500 mb-1 block">كلمة المرور الجديدة</label>
                <div className="relative">
                  <input
                    id="dash-new-pass"
                    type={showNew ? "text" : "password"}
                    value={newPass}
                    onChange={e => setNewPass(e.target.value)}
                    required
                    minLength={6}
                    autoComplete="new-password"
                    dir="ltr"
                    className="w-full bg-glass border border-glass-border rounded-xl px-3 pr-10 py-2 text-sm text-white outline-none focus:border-neon-cyan/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(v => !v)}
                    className="absolute top-1/2 -translate-y-1/2 right-3 text-gray-500 hover:text-gray-300 p-0.5 rounded-md"
                    aria-label={showNew ? "إخفاء كلمة المرور الجديدة" : "إظهار كلمة المرور الجديدة"}
                  >
                    {showNew ? <EyeOff size={13} /> : <Eye size={13} />}
                  </button>
                </div>
              </div>
              {passMsg && <p className={`text-xs font-bold ${passMsg.includes("تم") ? "text-neon-cyan" : "text-red-400"}`}>{passMsg}</p>}
              <div className="flex gap-2 mt-1">
                <button type="submit" disabled={passSaving}
                  className="flex-1 py-2 bg-neon-cyan text-dark-bg text-sm font-black rounded-xl disabled:opacity-60">
                  {passSaving ? <Loader2 size={14} className="animate-spin mx-auto" /> : "حفظ"}
                </button>
                <button type="button" onClick={() => { setEditPass(false); setCurrPass(""); setNewPass(""); setPassMsg(""); }}
                  className="px-4 py-2 bg-glass border border-glass-border text-gray-400 text-sm font-bold rounded-xl">
                  إلغاء
                </button>
              </div>
            </form>
          )}
        </div>

        {/* روابط سريعة */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">استكشف الأدوات</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { href: "/tools/qrcode", label: "QR Code" },
              { href: "/tools/compress", label: "ضغط ملفات" },
              { href: "/tools/img2pdf", label: "صور → PDF" },
              { href: "/tools/pdf-merge", label: "دمج PDF" },
              { href: "/tools/certs", label: "الشهادات" },
              { href: "/tools/reports", label: "التقارير" },
            ].map(t => (
              <Link
                key={t.href}
                href={t.href}
                className="flex items-center justify-center py-3 px-2 rounded-xl bg-glass border border-glass-border text-xs font-bold text-gray-300 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all text-center leading-tight"
              >
                {t.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
