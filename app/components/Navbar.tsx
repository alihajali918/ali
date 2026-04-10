"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";

const links = [
  { href: "/", label: "الرئيسية" },
  { href: "/products", label: "المنتجات" },
  { href: "/portfolio", label: "الأعمال" },
  { href: "/pricing", label: "التسعير" },
];

interface NavUser { name: string; role: string; }

export default function Navbar({ initialUser }: { initialUser: NavUser | null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [user,     setUser]     = useState<NavUser | null>(initialUser);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    // جيب المستخدم عند التحميل إذا ما وصلنا إياه من السيرفر
    if (!initialUser) {
      fetch("/api/auth/me")
        .then(r => r.json())
        .then(d => setUser(d.user ? { name: d.user.name, role: d.user.role } : null))
        .catch(() => {});
    }

    const refresh = () => {
      fetch("/api/auth/me")
        .then(r => r.json())
        .then(d => setUser(d.user ? { name: d.user.name, role: d.user.role } : null))
        .catch(() => {});
    };
    window.addEventListener("auth-change", refresh);
    return () => window.removeEventListener("auth-change", refresh);
  }, []);

  const logout = async () => {
    await fetch("/api/auth/user-logout", { method: "POST" });
    setUser(null);
    window.dispatchEvent(new CustomEvent("auth-change"));
    router.push("/");
    router.refresh();
  };

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 px-4 md:px-8 transition-all duration-500 ${scrolled ? "pt-3" : "pt-5"}`}>
        <div className={`max-w-7xl mx-auto rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? "nav-pill-scrolled shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "nav-pill"}`}>

          <Link href="/" className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-xl bg-neon-cyan flex items-center justify-center flex-shrink-0">
              <span className="text-dark-bg font-black text-xs tracking-tight">AH</span>
            </div>
            <span className="font-black text-white text-sm tracking-wide hidden sm:block">
              Ali <span className="text-neon-cyan">Hajali</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
                    active ? "text-neon-cyan bg-neon-cyan/8" : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}>
                  {label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <LayoutDashboard size={14} />
                  {user.name.split(" ")[0]}
                </Link>
                <button onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/8 rounded-xl transition-all">
                  <LogOut size={14} /> خروج
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="px-4 py-2 text-sm font-semibold text-gray-400 hover:text-white transition-colors">
                  دخول
                </Link>
                <Link href="/register"
                  className="btn-shimmer px-5 py-2 bg-neon-cyan text-dark-bg text-sm font-black rounded-xl glow-cyan-sm hover:scale-105 active:scale-95 transition-transform duration-200">
                  إنشاء حساب
                </Link>
              </>
            )}
          </div>

          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="القائمة">
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 pt-24 px-4 bg-dark-bg/98 backdrop-blur-2xl md:hidden">
          <div className="flex flex-col gap-1.5">
            {links.map(({ href, label }) => {
              const active = pathname === href;
              return (
                <Link key={href} href={href}
                  className={`px-5 py-4 text-base font-bold rounded-2xl transition-all ${
                    active ? "text-neon-cyan bg-neon-cyan/8 border border-neon-cyan/15" : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}>
                  {label}
                </Link>
              );
            })}
            <div className="mt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <Link href={user.role === "admin" ? "/admin" : "/dashboard"}
                    className="text-center px-5 py-3.5 text-sm font-bold text-neon-cyan border border-neon-cyan/20 rounded-2xl">
                    لوحة التحكم — {user.name.split(" ")[0]}
                  </Link>
                  <button onClick={logout}
                    className="text-center px-5 py-3.5 text-sm font-bold text-red-400 border border-red-500/20 rounded-2xl">
                    خروج
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login"
                    className="text-center px-5 py-3.5 text-sm font-semibold text-gray-400 border border-glass-border rounded-2xl hover:border-white/20 transition-colors">
                    دخول
                  </Link>
                  <Link href="/register"
                    className="text-center px-5 py-3.5 text-base font-black bg-neon-cyan text-dark-bg rounded-2xl">
                    إنشاء حساب
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
