"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Calendar, LogOut, Shield, Loader2 } from "lucide-react";
import Link from "next/link";

interface UserInfo {
  id: number;
  name: string;
  email: string;
  role: string;
  emailVerified: boolean;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user,    setUser]    = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(data => {
        if (!data.user) { router.push("/login"); return; }
        setUser(data.user as UserInfo);
        setLoading(false);
      });
  }, [router]);

  const logout = async () => {
    await fetch("/api/auth/user-logout", { method: "POST" });
    router.push("/login");
  };

  if (loading) return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <Loader2 size={32} className="text-neon-cyan animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-dark-bg" dir="rtl">
      {/* Header */}
      <header className="border-b border-glass-border px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-neon-cyan flex items-center justify-center">
            <span className="text-dark-bg font-black text-xs">AH</span>
          </div>
          <span className="font-black text-white text-sm">Ali <span className="text-neon-cyan">Hajali</span></span>
        </Link>
        <button onClick={logout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-500/8 transition-all text-xs font-bold">
          <LogOut size={14} /> خروج
        </button>
      </header>

      <div className="max-w-2xl mx-auto px-4 py-10 flex flex-col gap-6">

        {/* بطاقة المرحبة */}
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

        {/* معلومات الحساب */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">معلومات الحساب</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <User size={15} className="text-gray-600" />
              <span className="text-xs text-gray-500">الاسم</span>
              <span className="text-sm text-white font-bold mr-auto">{user?.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={15} className="text-gray-600" />
              <span className="text-xs text-gray-500">البريد</span>
              <span className="text-sm text-white font-bold mr-auto" dir="ltr">{user?.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={15} className="text-gray-600" />
              <span className="text-xs text-gray-500">حالة البريد</span>
              {user?.emailVerified
                ? <span className="mr-auto text-xs font-bold text-neon-cyan bg-neon-cyan/10 px-2 py-0.5 rounded-full">مؤكّد ✓</span>
                : <span className="mr-auto text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full">غير مؤكّد</span>
              }
            </div>
            <div className="flex items-center gap-3">
              <Calendar size={15} className="text-gray-600" />
              <span className="text-xs text-gray-500">تاريخ التسجيل</span>
              <span className="text-sm text-white font-bold mr-auto" dir="ltr">
                {user?.createdAt ? new Date(user.createdAt as string).toLocaleDateString("ar-QA") : "-"}
              </span>
            </div>
          </div>
        </div>

        {/* روابط سريعة */}
        <div className="glass-card rounded-2xl p-5">
          <p className="text-xs font-black text-gray-600 uppercase tracking-widest mb-4">استكشف الأدوات</p>
          <div className="grid grid-cols-3 gap-3">
            {[
              { href: "/tools/qrcode", label: "QR Code" },
              { href: "/tools/certs", label: "الشهادات" },
              { href: "/tools/reports", label: "التقارير" },
            ].map(t => (
              <Link key={t.href} href={t.href}
                className="flex items-center justify-center py-3 rounded-xl bg-glass border border-glass-border text-xs font-bold text-gray-300 hover:text-neon-cyan hover:border-neon-cyan/30 transition-all">
                {t.label}
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
