"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye, Mail,
  TrendingUp, Monitor, Smartphone, Tablet, Chrome,
  LogOut, RefreshCw, Loader2, X,
  LayoutDashboard, MessageSquare, DatabaseZap, Download, Menu, ExternalLink,
  Users,
} from "lucide-react";
import * as XLSX from "xlsx";

// ─── Types ───
interface Stats {
  visitors:       { today: number; week: number; month: number; total: number };
  topPages:       { page: string; views: number }[];
  devices:        { device: string; count: number }[];
  browsers:       { browser: string; count: number }[];
  recentVisitors: { ip: string; page: string; device: string; browser: string; os: string; createdAt: string }[];
  contacts:       { unread: number; total: number };
  dailyViews:     { date: string; views: number }[];
}

// ─── Helpers ───
function StatCard({ label, value, sub, icon, color }: { label: string; value: number | string; sub?: string; icon: React.ReactNode; color: string }) {
  return (
    <div className="glass-card rounded-2xl p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-bold text-gray-500">{label}</p>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${color}15`, color }}>{icon}</div>
      </div>
      <div>
        <p className="text-3xl font-black text-white">{typeof value === "number" ? value.toLocaleString() : value}</p>
        {sub && <p className="text-xs text-gray-600 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="flex-1 h-1.5 bg-glass-border rounded-full overflow-hidden">
      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

function DeviceIcon({ d }: { d: string }) {
  if (d === "mobile") return <Smartphone size={14} />;
  if (d === "tablet") return <Tablet size={14} />;
  return <Monitor size={14} />;
}

function formatPage(p: string) {
  if (p === "/") return "الرئيسية";
  return p.replace("/admin", "الأدمن").replace("/services", "الخدمات").replace("/portfolio", "الأعمال").replace("/pricing", "التسعير");
}

// ─── Sections ───
function OverviewSection({ s }: { s: Stats }) {
  const maxPageViews = Math.max(...s.topPages.map(p => p.views), 1);
  const totalDevices = s.devices.reduce((a, b) => a + b.count, 0);
  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="اليوم"     value={s.visitors.today} icon={<Eye size={16}/>}       color="#00F5D4" />
        <StatCard label="الأسبوع"  value={s.visitors.week}  icon={<TrendingUp size={16}/>} color="#7B61FF" />
        <StatCard label="الشهر"    value={s.visitors.month} icon={<Users size={16}/>}       color="#F59E0B" />
        <StatCard label="الإجمالي" value={s.visitors.total} icon={<Users size={16}/>}       color="#3B82F6" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-bold text-gray-400 mb-4">أكثر الصفحات زيارةً (30 يوم)</p>
          <div className="flex flex-col gap-3">
            {s.topPages.slice(0, 8).map(p => (
              <div key={p.page} className="flex items-center gap-3">
                <span className="text-xs text-gray-300 w-28 shrink-0 truncate">{formatPage(p.page)}</span>
                <Bar value={p.views} max={maxPageViews} color="#00F5D4" />
                <span className="text-xs font-black text-neon-cyan w-10 text-left shrink-0">{p.views}</span>
              </div>
            ))}
            {s.topPages.length === 0 && <p className="text-gray-700 text-xs">لا توجد بيانات بعد</p>}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-bold text-gray-400 mb-4">الأجهزة (30 يوم)</p>
          <div className="flex flex-col gap-4">
            {s.devices.map(d => {
              const pct = totalDevices > 0 ? Math.round((d.count / totalDevices) * 100) : 0;
              const color = d.device === "mobile" ? "#00F5D4" : d.device === "tablet" ? "#F59E0B" : "#7B61FF";
              return (
                <div key={d.device} className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-300">
                      <DeviceIcon d={d.device} />
                      <span>{d.device === "mobile" ? "جوال" : d.device === "tablet" ? "تابلت" : "كمبيوتر"}</span>
                    </div>
                    <span className="text-xs font-black" style={{ color }}>{pct}%</span>
                  </div>
                  <div className="h-2 bg-glass-border rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="text-xs font-bold text-gray-400 mt-6 mb-3">المتصفحات</p>
          <div className="flex flex-wrap gap-2">
            {s.browsers.map(b => (
              <span key={b.browser} className="flex items-center gap-1.5 px-3 py-1.5 bg-glass border border-glass-border rounded-xl text-xs text-gray-400">
                <Chrome size={11} /> {b.browser} <span className="text-neon-cyan font-bold">{b.count}</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-glass-border">
          <p className="text-xs font-bold text-gray-400">آخر الزيارات</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="border-b border-glass-border">
              {["الصفحة","الجهاز","المتصفح","النظام","IP","الوقت"].map(h => (
                <th key={h} className="px-4 py-2.5 text-right text-gray-600 font-bold">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {s.recentVisitors.map((v, i) => (
                <tr key={i} className="border-b border-glass-border/40 hover:bg-glass">
                  <td className="px-4 py-2.5 text-gray-300">{formatPage(v.page)}</td>
                  <td className="px-4 py-2.5 text-gray-500">{v.device}</td>
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
      </div>
    </div>
  );
}

function ContactsSection({ s }: { s: Stats }) {
  const [contacts, setContacts] = useState<any[]>([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    fetch("/api/admin/contacts")
      .then(r => r.ok ? r.json() : [])
      .then(data => { setContacts(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const markRead = async (id: number) => {
    await fetch("/api/admin/contacts", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setContacts(c => c.map(x => x.id === id ? { ...x, read: true } : x));
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <p className="text-sm font-bold text-gray-400">الإجمالي: {s.contacts.total}</p>
        {s.contacts.unread > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-neon-cyan/15 text-neon-cyan text-xs font-black">{s.contacts.unread} غير مقروءة</span>
        )}
      </div>
      {loading ? (
        <div className="flex justify-center py-8"><Loader2 size={20} className="text-neon-cyan animate-spin" /></div>
      ) : (
        <div className="flex flex-col gap-3">
          {contacts.map(c => (
            <div key={c.id} className={`glass-card rounded-2xl p-5 flex flex-col gap-2 ${!c.read ? "border border-neon-cyan/20" : ""}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-black text-white">{c.name}</p>
                  <p className="text-xs text-gray-500" dir="ltr">{c.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  {!c.read && (
                    <button onClick={() => markRead(c.id)}
                      className="px-3 py-1 bg-neon-cyan/15 text-neon-cyan text-xs font-bold rounded-lg hover:bg-neon-cyan/25 transition-all">
                      تم القراءة
                    </button>
                  )}
                  <span className="text-[10px] text-gray-600" dir="ltr">
                    {new Date(c.createdAt).toLocaleDateString("ar-QA")}
                  </span>
                </div>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed">{c.message}</p>
            </div>
          ))}
          {contacts.length === 0 && <p className="text-center text-gray-700 py-8">لا توجد رسائل</p>}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar nav ───
const NAV = [
  { id: "overview",  label: "الإحصاءات",    icon: LayoutDashboard },
  { id: "contacts",  label: "الرسائل",       icon: MessageSquare },
];

// ─── Main ───
export default function AdminPage() {
  const router  = useRouter();
  const [stats,         setStats]         = useState<Stats | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState("");
  const [active,        setActive]        = useState("overview");
  const [clearingStats,   setClearingStats]   = useState(false);
  const [exportingStats,  setExportingStats]  = useState(false);
  const [mobileSidebar, setMobileSidebar]   = useState(false);

  const fetchStats = useCallback(async () => {
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
  }, [router]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin/login");
  };

  const exportStats = async () => {
    setExportingStats(true);
    try {
      const res = await fetch("/api/admin/export");
      if (!res.ok) return;
      const { visitors, pageViews } = await res.json();

      const wb = XLSX.utils.book_new();

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(visitors.map((v: any) => ({
        "الجلسة": v.sessionId,
        "IP": v.ip,
        "الصفحة": v.page,
        "المصدر": v.referrer || "",
        "الجهاز": v.device || "",
        "المتصفح": v.browser || "",
        "النظام": v.os || "",
        "التاريخ": new Date(v.createdAt).toLocaleString("ar-QA"),
      }))), "الزيارات");

      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(pageViews.map((p: any) => ({
        "الصفحة": p.page,
        "التاريخ": new Date(p.date).toLocaleDateString("ar-QA"),
        "المشاهدات": p.views,
      }))), "مشاهدات الصفحات");

      const date = new Date().toISOString().split("T")[0];
      XLSX.writeFile(wb, `stats-${date}.xlsx`);
    } finally {
      setExportingStats(false);
    }
  };

  const clearStats = async () => {
    if (!confirm("هل أنت متأكد من مسح جميع الإحصاءات؟\n(الزيارات ومشاهدات الصفحات)\n\nلا يمكن التراجع عن هذا الإجراء.")) return;
    setClearingStats(true);
    try {
      const res = await fetch("/api/admin/clear-stats", { method: "DELETE" });
      if (res.ok) { await fetchStats(); }
    } finally {
      setClearingStats(false);
    }
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
  const activeNav = NAV.find(n => n.id === active)!;

  const selectNav = (id: string) => {
    setActive(id);
    setMobileSidebar(false);
  };

  return (
    <div className="min-h-screen bg-dark-bg flex flex-col md:flex-row" dir="rtl">

      {/* شريط علوي — جوال */}
      <header className="md:hidden sticky top-0 z-30 flex items-center justify-between gap-3 px-4 py-3 border-b border-glass-border bg-dark-bg/95 backdrop-blur-xl">
        <button
          type="button"
          onClick={() => setMobileSidebar(true)}
          className="p-2 rounded-xl text-gray-300 hover:bg-white/5"
          aria-expanded={mobileSidebar}
          aria-controls="admin-sidebar"
          aria-label="فتح القائمة"
        >
          <Menu size={20} />
        </button>
        <p className="text-sm font-black text-white truncate flex-1 text-center">{activeNav.label}</p>
        <Link
          href="/"
          className="p-2 rounded-xl text-gray-400 hover:text-neon-cyan hover:bg-white/5 shrink-0"
          aria-label="الموقع العام"
        >
          <ExternalLink size={18} />
        </Link>
      </header>

      {mobileSidebar && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          aria-label="إغلاق القائمة"
          onClick={() => setMobileSidebar(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        id="admin-sidebar"
        className={`max-md:fixed max-md:z-50 max-md:inset-y-0 max-md:right-0 max-md:w-[min(17rem,88vw)] w-56 shrink-0 border-l border-glass-border flex flex-col bg-dark-bg transition-transform duration-200 ease-out md:sticky md:top-0 md:h-screen md:translate-x-0 ${
          mobileSidebar ? "translate-x-0" : "translate-x-full md:translate-x-0"
        }`}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b border-glass-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-xl bg-neon-cyan flex items-center justify-center shrink-0">
                <span className="text-dark-bg font-black text-xs">AH</span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-black text-white truncate">لوحة التحكم</p>
                <p className="text-[10px] text-gray-600">Admin</p>
              </div>
            </div>
            <button
              type="button"
              className="md:hidden p-2 rounded-xl text-gray-500 hover:text-white hover:bg-white/5"
              onClick={() => setMobileSidebar(false)}
              aria-label="إغلاق القائمة"
            >
              <X size={18} />
            </button>
          </div>
          <Link
            href="/"
            className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-[11px] font-bold text-gray-500 border border-glass-border hover:text-neon-cyan hover:border-neon-cyan/25 transition-colors"
          >
            <ExternalLink size={12} />
            عرض الموقع العام
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
          {NAV.map(item => {
            const Icon = item.icon;
            const isActive = active === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => selectNav(item.id)}
                aria-current={isActive ? "page" : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all text-right ${
                  isActive ? "bg-neon-cyan/10 text-neon-cyan" : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon size={16} aria-hidden />
                {item.label}
                {item.id === "contacts" && s.contacts.unread > 0 && (
                  <span className="mr-auto min-w-[1.25rem] h-5 px-1 rounded-full bg-neon-cyan text-dark-bg text-[10px] font-black flex items-center justify-center">
                    {s.contacts.unread}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-glass-border flex flex-col gap-2 shrink-0">
          <button
            type="button"
            onClick={() => { fetchStats(); setMobileSidebar(false); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-neon-cyan hover:bg-neon-cyan/8 transition-all text-xs font-bold"
          >
            <RefreshCw size={14} /> تحديث البيانات
          </button>
          <button type="button" onClick={exportStats} disabled={exportingStats}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-green-400 hover:bg-green-500/8 transition-all text-xs font-bold disabled:opacity-50">
            {exportingStats ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            تصدير Excel
          </button>
          <button type="button" onClick={clearStats} disabled={clearingStats}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-orange-400 hover:bg-orange-500/8 transition-all text-xs font-bold disabled:opacity-50">
            {clearingStats ? <Loader2 size={14} className="animate-spin" /> : <DatabaseZap size={14} />}
            مسح الإحصاءات
          </button>
          <button type="button" onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-gray-600 hover:text-red-400 hover:bg-red-500/8 transition-all text-xs font-bold">
            <LogOut size={14} /> خروج
          </button>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto min-h-0 min-w-0 w-full">
        <div className="px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto">
          <div className="mb-6 hidden md:block">
            <p className="text-xl font-black text-white">{activeNav.label}</p>
          </div>

          {active === "overview"  && <OverviewSection s={s} />}
          {active === "contacts"  && <ContactsSection s={s} />}
        </div>
      </main>

    </div>
  );
}
