"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const STATIC_LINKS = [
  { href: "/#hadaya",   label: "هدايا" },
  { href: "/services",  label: "الخدمات" },
  { href: "/portfolio",  label: "الأعمال" },
  { href: "/pricing",   label: "التسعير" },
  { href: "/contact",   label: "تواصل" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

          {/* CTA */}
          <div className="hidden md:flex items-center gap-2">
            <Link href="/contact"
              className="btn-shimmer px-5 py-2 bg-neon-cyan text-dark-bg text-sm font-black rounded-xl glow-cyan-sm hover:scale-105 active:scale-95 transition-transform duration-200">
              ابدأ مشروعك
            </Link>
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

            {STATIC_LINKS.map(({ href, label }) => (
              <Link key={href} href={href}
                className={`px-5 py-4 text-base font-bold rounded-2xl transition-all ${
                  pathname === href ? "text-neon-cyan bg-neon-cyan/8 border border-neon-cyan/15" : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}>
                {label}
              </Link>
            ))}

            <Link href="/contact"
              className="mt-4 text-center px-5 py-3.5 text-base font-black bg-neon-cyan text-dark-bg rounded-2xl">
              ابدأ مشروعك
            </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
