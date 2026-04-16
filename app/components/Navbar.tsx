"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useRef, type ElementType } from "react";
import {
  Menu, X, LogOut, LayoutDashboard,
  QrCode, ImageDown, FileImage, FilePlus2,
  Award, FileText, ChevronDown, Wrench, Building2, Lock,
} from "lucide-react";

type ToolNavItem = { href: string; label: string; icon: ElementType; desc: string };
type ProductNavItem = { id: string; label: string; icon: ElementType; desc: string };
type NavItem = ToolNavItem | ProductNavItem;

/* ─── dropdown data ─────────────────────────────────── */
const TOOLS: ToolNavItem[] = [
  { href: "/tools/qrcode",    label: "مولّد QR Code",  icon: QrCode,     desc: "روابط ونصوص وبزنس كارد" },
  { href: "/tools/compress",  label: "ضاغط الملفات",   icon: ImageDown,  desc: "صور وPDF · JPEG · WebP · PNG" },
  { href: "/tools/img2pdf",   label: "صور إلى PDF",    icon: FileImage,  desc: "مقاسات مخصصة · تحميل مباشر" },
  { href: "/tools/pdf-merge", label: "دمج PDF",         icon: FilePlus2,  desc: "حتى 50 صفحة · PDF + صور" },
];

const PRODUCTS: ProductNavItem[] = [
  { id: "certs", label: "صانع الشهادات", icon: Award, desc: "6 قوالب · ذكاء اصطناعي · PDF" },
  { id: "reports", label: "صانع التقارير", icon: FileText, desc: "تقارير Excel/PDF احترافية" },
];

/* ─── reusable dropdown ─────────────────────────────── */
function NavDropdown({
  label, icon: Icon, items, active,
}: {
  label: string;
  icon: ElementType;
  items: NavItem[];
  active: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold rounded-xl transition-all duration-300 ${
          active || open ? "text-neon-cyan bg-neon-cyan/8" : "text-gray-400 hover:text-white hover:bg-white/5"
        }`}
      >
        <Icon size={14}/>
        {label}
        <ChevronDown size={12} className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}/>
      </button>

      {open && (
        <div className="absolute top-full mt-2 right-0 w-64 rounded-2xl border border-white/8 bg-[#111]/95 backdrop-blur-xl shadow-2xl overflow-hidden z-50 py-1.5">
          {items.map(item => {
            const ItemIcon = item.icon;
            const isProduct = "id" in item;
            const rowClass =
              "flex items-center gap-3 px-4 py-3 transition-all group w-full text-right " +
              (isProduct ? "opacity-70 cursor-default" : "hover:bg-white/4");
            const inner = (
              <>
                <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-neon-cyan/8 transition-colors">
                  <ItemIcon size={15} className={isProduct ? "text-gray-500" : "text-neon-cyan"}/>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white truncate">{item.label}</span>
                    {isProduct && (
                      <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                        <Lock size={8}/> قريباً
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-600 truncate">{item.desc}</p>
                </div>
              </>
            );
            if (isProduct) {
              return (
                <button
                  key={item.id}
                  type="button"
                  title="هذه الميزة قيد التطوير"
                  onClick={() => setOpen(false)}
                  className={rowClass}
                >
                  {inner}
                </button>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className={rowClass}
              >
                {inner}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* ─── static links ──────────────────────────────────── */
const STATIC_LINKS = [
  { href: "/portfolio", label: "الأعمال" },
  { href: "/pricing",   label: "التسعير" },
];

/* ─── main Navbar ───────────────────────────────────── */
interface NavUser { name: string; role: string; }

export default function Navbar({ initialUser }: { initialUser: NavUser | null }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [user,      setUser]      = useState<NavUser | null>(initialUser);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [menuOpen]);

  useEffect(() => {
    if (initialUser) return;
    fetch("/api/auth/me")
      .then(r => r.json())
      .then(d => setUser(d.user ? { name: d.user.name, role: d.user.role } : null))
      .catch(() => {});
    const refresh = () => {
      fetch("/api/auth/me")
        .then(r => r.json())
        .then(d => setUser(d.user ? { name: d.user.name, role: d.user.role } : null))
        .catch(() => {});
    };
    window.addEventListener("auth-change", refresh);
    return () => window.removeEventListener("auth-change", refresh);
  }, [initialUser]);

  const logout = async () => {
    await fetch("/api/auth/user-logout", { method: "POST" });
    setUser(null);
    window.dispatchEvent(new CustomEvent("auth-change"));
    router.push("/");
    router.refresh();
  };

  const isToolPath    = pathname.startsWith("/tools");
  const isProductPath = pathname === "/products";

  return (
    <>
      <nav className={`fixed top-0 w-full z-50 px-4 md:px-8 transition-all duration-500 ${scrolled ? "pt-3" : "pt-5"}`}>
        <div className={`max-w-7xl mx-auto rounded-2xl px-4 md:px-6 py-3 flex items-center justify-between transition-all duration-500 ${scrolled ? "nav-pill-scrolled shadow-[0_8px_32px_rgba(0,0,0,0.4)]" : "nav-pill"}`}>

          {/* logo */}
          <Link href="/" className="flex items-center gap-2.5 select-none">
            <div className="w-8 h-8 rounded-xl bg-neon-cyan flex items-center justify-center flex-shrink-0">
              <span className="text-dark-bg font-black text-xs tracking-tight">AH</span>
            </div>
            <span className="font-black text-white text-sm tracking-wide hidden sm:block">
              Ali <span className="text-neon-cyan">Hajali</span>
            </span>
          </Link>

          {/* desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {/* الأدوات dropdown */}
            <NavDropdown
              label="الأدوات"
              icon={Wrench}
              items={TOOLS}
              active={isToolPath}
            />

            {/* للمؤسسات dropdown */}
            <NavDropdown
              label="للمؤسسات"
              icon={Building2}
              items={PRODUCTS}
              active={isProductPath}
            />

            {/* static links */}
            {STATIC_LINKS.map(({ href, label }) => {
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

          {/* auth buttons */}
          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <>
                <Link href={user.role === "admin" ? "/admin" : "/dashboard"}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all">
                  <LayoutDashboard size={14}/>
                  {user.name.split(" ")[0]}
                </Link>
                <button onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-bold text-gray-500 hover:text-red-400 hover:bg-red-500/8 rounded-xl transition-all">
                  <LogOut size={14}/> خروج
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

          {/* mobile hamburger */}
          <button onClick={() => setMenuOpen(v => !v)}
            className="md:hidden p-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
            aria-label="القائمة">
            {menuOpen ? <X size={20}/> : <Menu size={20}/>}
          </button>
        </div>
      </nav>

      {/* mobile menu: tap dimmed area to close */}
      {menuOpen && (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="قائمة التنقل">
          <button
            type="button"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            aria-label="إغلاق القائمة"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative z-10 pt-24 px-4 max-h-full overflow-y-auto pointer-events-none">
            <div className="pointer-events-auto flex flex-col gap-1.5 pb-8">

            {/* الأدوات section */}
            <p className="px-4 pt-2 pb-1 text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
              <Wrench size={10}/> الأدوات
            </p>
            {TOOLS.map(item => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href}
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-300 hover:text-white hover:bg-white/5 transition-all">
                  <Icon size={16} className="text-neon-cyan shrink-0"/>
                  <span className="text-sm font-bold">{item.label}</span>
                </Link>
              );
            })}

            {/* للمؤسسات section */}
            <p className="px-4 pt-4 pb-1 text-[10px] font-black text-gray-600 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 size={10}/> للمؤسسات
            </p>
            {PRODUCTS.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  title="قيد التطوير"
                  className="flex items-center gap-3 px-4 py-3 rounded-2xl text-gray-500 opacity-60 w-full text-right cursor-default"
                >
                  <Icon size={16} className="text-amber-400 shrink-0"/>
                  <span className="text-sm font-bold">{item.label}</span>
                  <span className="mr-auto text-[9px] font-black px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    <Lock size={8}/> قريباً
                  </span>
                </button>
              );
            })}

            {/* divider */}
            <div className="my-3 border-t border-white/5"/>

            {/* static links */}
            {STATIC_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-5 py-4 text-base font-bold rounded-2xl transition-all ${
                  pathname === href ? "text-neon-cyan bg-neon-cyan/8 border border-neon-cyan/15" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}>
                {label}
              </Link>
            ))}

            {/* auth */}
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
        </div>
      )}
    </>
  );
}
