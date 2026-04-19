"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard, Users, ClipboardList,
  Clock, QrCode, LogOut, Menu, X, Monitor, Settings, Archive,
} from "lucide-react";
import { useState, use } from "react";

const navItems = (org: string) => [
  { href: `/attend/${org}/admin`,           label: "الرئيسية",   icon: LayoutDashboard },
  { href: `/attend/${org}/admin/employees`, label: "الموظفون",   icon: Users },
  { href: `/attend/${org}/admin/records`,   label: "السجلات",    icon: ClipboardList },
  { href: `/attend/${org}/admin/shifts`,    label: "الورديات",   icon: Clock },
  { href: `/attend/${org}/admin/qr`,        label: "QR (أدمن)",  icon: QrCode },
  { href: `/attend/${org}/display`,         label: "شاشة العرض", icon: Monitor },
  { href: `/attend/${org}/admin/archive`,   label: "الأرشيف",    icon: Archive },
  { href: `/attend/${org}/admin/settings`,  label: "الإعدادات",  icon: Settings },
];

export default function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}) {
  const { org }    = use(params);
  const pathname   = usePathname();
  const router     = useRouter();
  const [open, setOpen] = useState(false);

  const logout = async () => {
    await fetch(`/api/attend/${org}/auth/logout`, { method: "POST" });
    router.push(`/attend/${org}/admin/login`);
  };

  return (
    <div className="flex min-h-screen">
      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-[#111] border-l border-white/6
        flex flex-col transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0 md:static md:flex
      `}>
        {/* logo */}
        <div className="px-6 py-5 border-b border-white/6">
          <p className="text-xs text-gray-600 mb-1">لوحة تحكم</p>
          <p className="text-white font-black text-lg capitalize">{org}</p>
        </div>

        {/* nav */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {navItems(org).map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  active
                    ? "bg-neon-cyan/10 text-neon-cyan"
                    : "text-gray-500 hover:text-white hover:bg-white/5"
                }`}>
                <Icon size={17}/>
                {label}
              </Link>
            );
          })}
        </nav>

        {/* logout */}
        <div className="p-4 border-t border-white/6">
          <button onClick={logout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all">
            <LogOut size={17}/> تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ── */}
      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden"
          onClick={() => setOpen(false)}/>
      )}

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-4 border-b border-white/6 bg-[#111]">
          <p className="text-white font-black capitalize">{org}</p>
          <button onClick={() => setOpen(v => !v)} className="text-gray-400">
            {open ? <X size={22}/> : <Menu size={22}/>}
          </button>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
