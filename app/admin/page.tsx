"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users, Eye, QrCode, Award, FileText, Mail,
  TrendingUp, Monitor, Smartphone, Tablet,
  Chrome, LogOut, RefreshCw, Loader2,
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
