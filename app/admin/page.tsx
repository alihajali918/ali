"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Eye, QrCode, Award, FileText, Mail,
  TrendingUp, Monitor, Smartphone, Tablet,
  Chrome, LogOut, RefreshCw, Loader2, Trash2, UserPlus, ShieldCheck, X,
} from "lucide-react";

// ─── أنواع ───
interface Stats {
  visitors:  { today: number; week: number; month: number; total: number };
  topPages:  { page: string; views: number }[];
  devices:   { device: string; count: number }[];
  browsers:  { browser: string; count: number }[];
  recentVisitors: { ip: string; page: string; device: string; browser: string; os: string; createdAt: string }[];
  tools:     { qr: { total: number; today: number }; cert: { total: number; today: number }; report: { total: number; today: number } };
  contacts:  { unread: number; total: number };
  dailyViews:{ date: string; views: number }[];
}

// ─── مكونات صغيرة ───
function StatCard({ label, value, sub, icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-black text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function DeviceIcon({ d }: { d: string }) {
  if (d === "mobile")  return <Smartphone size={14} />;
  if (d === "tablet")  return <Tablet size={14} />;
  return <Monitor size={14} />;
}

function formatPage(p: string) {
  if (p === "/") return "الرئيسية";
  return p.replace("/tools/", "أداة: ").replace("/admin", "الأدمن").replace("/products", "المنتجات").replace("/portfolio", "الأعمال").replace("/pricing", "التسعير");
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-glass-border rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── الصفحة ───
interface UserRow {
  id: number; name: string; email: string; role: string; emailVerified: boolean; createdAt: string;
}

function UsersSection() {
  const [users,   setUsers]   = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form,    setForm]    = useState({ name: "", email: "", password: "", role: "user" });
  const [saving,  setSaving]  = useState(false);
  const [err,     setErr]     = useState("");

  const load = () => {
    setLoading(true);
    fetch("/api/admin/users").then(r => r.json()).then(data => { setUsers(Array.isArray(data) ? data : []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const addUser = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setErr("");
    const res = await fetch("/api/admin/users", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setErr(data.error || "خطأ"); setSaving(false); return; }
    setShowAdd(false); setForm({ name: "", email: "", password: "", role: "user" }); load();
    setSaving(false);
  };

  const deleteUser = async (id: number, name: string) => {
    if (!confirm(`حذف "${name}"؟`)) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  };

  return (
    <section className="glass-card rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-glass-border flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users size={16} className="text-neon-cyan" />
          <p className="text-sm font-black text-white">إدارة المستخدمين</p>
          <span className="text-xs text-gray-600">({users.length})</span>
        </div>
        <button onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-neon-cyan text-dark-bg text-xs font-black rounded-xl hover:scale-105 transition-transform">
          {showAdd ? <X size={13} /> : <UserPlus size={13} />}
          {showAdd ? "إلغاء" : "إضافة مستخدم"}
        </button>
      </div>

      {/* فورم الإضافة */}
      {showAdd && (
        <form onSubmit={addUser} className="px-5 py-4 border-b border-glass-border bg-glass flex flex-wrap gap-3 items-end">
          <div className="flex flex-col gap-1 flex-1 min-w-32">
            <label className="text-[10px] text-gray-500 font-bold">الاسم</label>
            <input value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} required
              className="bg-dark-bg border border-glass-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan/40" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-40">
            <label className="text-[10px] text-gray-500 font-bold">البريد</label>
            <input type="email" value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} required dir="ltr"
              className="bg-dark-bg border border-glass-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan/40" />
          </div>
          <div className="flex flex-col gap-1 flex-1 min-w-32">
            <label className="text-[10px] text-gray-500 font-bold">كلمة المرور</label>
            <input type="password" value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} required dir="ltr"
              className="bg-dark-bg border border-glass-border rounded-lg px-3 py-2 text-xs text-white outline-none focus:border-neon-cyan/40" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500 font-bold">الدور</label>
            <select value={form.role} onChange={e => setForm(f => ({...f, role: e.target.value}))}
              className="bg-dark-bg border border-glass-border rounded-lg px-3 py-2 text-xs text-white outline-none">
              <option value="user">مستخدم</option>
              <option value="admin">أدمن</option>
            </select>
          </div>
          <button type="submit" disabled={saving}
            className="px-4 py-2 bg-neon-cyan text-dark-bg text-xs font-black rounded-lg disabled:opacity-60">
            {saving ? <Loader2 size={13} className="animate-spin" /> : "حفظ"}
          </button>
          {err && <p className="w-full text-red-400 text-xs">{err}</p>}
        </form>
      )}

      {/* جدول المستخدمين */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center py-8"><Loader2 size={20} className="text-neon-cyan animate-spin" /></div>
        ) : (
          <table className="w-full text-xs">
            <thead><tr className="border-b border-glass-border">
              {["الاسم", "البريد", "الدور", "البريد مؤكد", "تاريخ التسجيل", ""].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-gray-600 font-bold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-glass-border/40 hover:bg-glass transition-colors">
                  <td className="px-4 py-2.5 text-white font-bold">{u.name}</td>
                  <td className="px-4 py-2.5 text-gray-400" dir="ltr">{u.email}</td>
                  <td className="px-4 py-2.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${u.role === "admin" ? "bg-neon-purple/20 text-neon-purple" : "bg-neon-cyan/10 text-neon-cyan"}`}>
                      {u.role === "admin" ? "أدمن" : "مستخدم"}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    {u.emailVerified
                      ? <ShieldCheck size={14} className="text-neon-cyan" />
                      : <span className="text-yellow-600 text-[10px]">غير مؤكد</span>}
                  </td>
                  <td className="px-4 py-2.5 text-gray-600" dir="ltr">
                    {new Date(u.createdAt).toLocaleDateString("ar-QA")}
                  </td>
                  <td className="px-4 py-2.5">
                    {u.role !== "admin" && (
                      <button onClick={() => deleteUser(u.id, u.name)}
                        className="p-1.5 rounded-lg text-gray-700 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <Trash2 size={13} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-700">لا يوجد مستخدمون</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default function AdminPage() {
  const router = useRouter();
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  const fetchStats = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/admin/stats");
      if (res.status === 401) { router.push("/admin/login"); return; }
      if (!res.ok) throw new Error();
      setStats(await res.json());
    } catch {
      setError("تعذّر جلب البيانات");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <Loader2 size={32} className="text-neon-cyan animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-dark-bg flex flex-col items-center justify-center gap-4">
      <p className="text-red-400 font-bold">{error}</p>
      <button onClick={fetchStats} className="px-5 py-2 bg-neon-cyan text-dark-bg rounded-xl font-bold text-sm">إعادة المحاولة</button>
    </div>
  );

  const s = stats!;
  const maxPageViews = Math.max(...s.topPages.map((p) => p.views), 1);
  const totalDevices = s.devices.reduce((a, b) => a + b.count, 0);

  return (
    <div className="min-h-screen bg-dark-bg" dir="rtl">
      {/* شريط علوي */}
      <header className="border-b border-glass-border px-6 py-4 flex items-center justify-between sticky top-0 bg-dark-bg/90 backdrop-blur-xl z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-neon-cyan flex items-center justify-center">
            <span className="text-dark-bg font-black text-xs">AH</span>
          </div>
          <div>
            <p className="font-black text-white text-sm">لوحة التحكم</p>
            <p className="text-[10px] text-gray-600">Ali Hajali · Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={fetchStats}
            className="p-2 rounded-xl text-gray-500 hover:text-neon-cyan hover:bg-neon-cyan/8 transition-all">
            <RefreshCw size={15} />
          </button>
          <button onClick={logout}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all text-xs font-bold">
            <LogOut size={14} /> خروج
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 flex flex-col gap-8">

        {/* ── إحصاءات الزوار ── */}
        <section>
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">الزوار</p>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="اليوم"     value={s.visitors.today} icon={<Eye size={16}/>}       color="#00F5D4" />
            <StatCard label="الأسبوع"  value={s.visitors.week}  icon={<TrendingUp size={16}/>} color="#7B61FF" />
            <StatCard label="الشهر"    value={s.visitors.month} icon={<Users size={16}/>}       color="#F59E0B" />
            <StatCard label="الإجمالي" value={s.visitors.total} icon={<Users size={16}/>}       color="#3B82F6" />
          </div>
        </section>

        {/* ── إحصاءات الأدوات ── */}
        <section>
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">استخدام الأدوات</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="QR Code"    value={s.tools.qr.total}     sub={`اليوم: ${s.tools.qr.today}`}     icon={<QrCode size={16}/>}   color="#00F5D4" />
            <StatCard label="الشهادات"  value={s.tools.cert.total}   sub={`اليوم: ${s.tools.cert.today}`}   icon={<Award size={16}/>}    color="#F59E0B" />
            <StatCard label="التقارير"  value={s.tools.report.total} sub={`اليوم: ${s.tools.report.today}`} icon={<FileText size={16}/>} color="#7B61FF" />
          </div>
        </section>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* أكثر الصفحات زيارة */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 mb-4">أكثر الصفحات زيارةً (30 يوم)</p>
            <div className="flex flex-col gap-3">
              {s.topPages.slice(0, 8).map((p) => (
                <div key={p.page} className="flex items-center gap-3">
                  <span className="text-xs text-gray-300 font-medium w-28 shrink-0 truncate">{formatPage(p.page)}</span>
                  <Bar value={p.views} max={maxPageViews} color="#00F5D4" />
                  <span className="text-xs font-black text-neon-cyan w-10 text-left shrink-0">{p.views}</span>
                </div>
              ))}
              {s.topPages.length === 0 && <p className="text-gray-700 text-xs">لا توجد بيانات بعد</p>}
            </div>
          </div>

          {/* الأجهزة */}
          <div className="glass-card rounded-2xl p-5">
            <p className="text-xs font-bold text-gray-400 mb-4">الأجهزة (30 يوم)</p>
            <div className="flex flex-col gap-4">
              {s.devices.map((d) => {
                const pct = totalDevices > 0 ? Math.round((d.count / totalDevices) * 100) : 0;
                const color = d.device === "mobile" ? "#00F5D4" : d.device === "tablet" ? "#F59E0B" : "#7B61FF";
                return (
                  <div key={d.device} className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-300">
                        <DeviceIcon d={d.device} />
                        <span className="capitalize">{d.device === "mobile" ? "جوال" : d.device === "tablet" ? "تابلت" : "كمبيوتر"}</span>
                      </div>
                      <span className="text-xs font-black" style={{ color }}>{pct}%</span>
                    </div>
                    <div className="h-2 bg-glass-border rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <span className="text-[10px] text-gray-700">{d.count.toLocaleString()} زيارة</span>
                  </div>
                );
              })}
              {s.devices.length === 0 && <p className="text-gray-700 text-xs">لا توجد بيانات بعد</p>}
            </div>

            {/* المتصفحات */}
            <p className="text-xs font-bold text-gray-400 mt-6 mb-3">المتصفحات</p>
            <div className="flex flex-wrap gap-2">
              {s.browsers.map((b) => (
                <span key={b.browser}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-glass border border-glass-border rounded-xl text-xs text-gray-400">
                  <Chrome size={11} />
                  {b.browser} <span className="text-neon-cyan font-bold">{b.count}</span>
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* آخر الزيارات */}
        <section className="glass-card rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-glass-border flex items-center justify-between">
            <p className="text-xs font-bold text-gray-400">آخر الزيارات</p>
            <span className="text-[10px] text-gray-700">آخر 20 زيارة</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-glass-border">
                  {["الصفحة", "الجهاز", "المتصفح", "النظام", "IP", "الوقت"].map((h) => (
                    <th key={h} className="px-4 py-2.5 text-right text-gray-600 font-bold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.recentVisitors.map((v, i) => (
                  <tr key={i} className="border-b border-glass-border/40 hover:bg-glass transition-colors">
                    <td className="px-4 py-2.5 text-gray-300">{formatPage(v.page)}</td>
                    <td className="px-4 py-2.5 text-gray-500 capitalize">{v.device}</td>
                    <td className="px-4 py-2.5 text-gray-500">{v.browser}</td>
                    <td className="px-4 py-2.5 text-gray-500">{v.os}</td>
                    <td className="px-4 py-2.5 text-gray-600 font-mono" dir="ltr">{v.ip}</td>
                    <td className="px-4 py-2.5 text-gray-600" dir="ltr">
                      {new Date(v.createdAt).toLocaleTimeString("ar-QA", { hour: "2-digit", minute: "2-digit" })}
                    </td>
                  </tr>
                ))}
                {s.recentVisitors.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-700">لا توجد زيارات بعد</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* إدارة المستخدمين */}
        <UsersSection />

        {/* رسائل التواصل */}
        <section className="glass-card rounded-2xl p-5">
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-neon-cyan" />
            <div>
              <p className="text-sm font-black text-white">رسائل التواصل</p>
              <p className="text-xs text-gray-500 mt-0.5">
                {s.contacts.unread > 0
                  ? <span className="text-neon-cyan font-bold">{s.contacts.unread} رسالة غير مقروءة</span>
                  : "لا توجد رسائل جديدة"
                }
                {" "}· الإجمالي: {s.contacts.total}
              </p>
            </div>
            {s.contacts.unread > 0 && (
              <span className="mr-auto w-6 h-6 rounded-full bg-neon-cyan text-dark-bg text-xs font-black flex items-center justify-center">
                {s.contacts.unread}
              </span>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}
