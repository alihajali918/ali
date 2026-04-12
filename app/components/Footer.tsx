"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Github, Twitter, Linkedin, Mail } from "lucide-react";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/services", label: "الخدمات" },
  { href: "/portfolio", label: "الأعمال" },
  { href: "/pricing", label: "التسعير" },
  { href: "/contact", label: "تواصل" },
];

const social = [
  { icon: <Github size={18} />, href: null as string | null, label: "GitHub" },
  { icon: <Twitter size={18} />, href: null, label: "Twitter" },
  { icon: <Linkedin size={18} />, href: null, label: "LinkedIn" },
  { icon: <Mail size={18} />, href: "/contact", label: "نموذج التواصل" },
];

export default function Footer() {
  return (
    <footer className="pt-24 pb-10 px-4 md:px-8 relative overflow-hidden">
      {/* خط علوي */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />

      {/* توهج خلفي */}
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-neon-cyan/4 blur-[80px] rounded-full pointer-events-none"
      />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* CTA كبير */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-[2rem] overflow-hidden mb-20 p-1 bg-gradient-to-br from-neon-cyan/20 via-neon-purple/10 to-transparent"
        >
          <div className="bg-dark-card rounded-[1.75rem] px-6 py-12 md:px-16 text-center">
            {/* شبكة */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            <div className="relative z-10">
              <span className="section-badge mb-6 inline-flex">ابدأ الآن</span>
              <h2 className="text-3xl md:text-5xl font-black mb-6">
                هل أنت مستعد{" "}
                <span className="text-gradient">للمستقبل؟</span>
              </h2>
              <p className="text-gray-400 text-lg mb-10 max-w-lg mx-auto">
                تواصل معي الآن ونحوّل فكرتك إلى منتج رقمي يضاهي المنافسين العالميين.
              </p>
              <Link
                href="/contact"
                className="btn-shimmer inline-flex items-center gap-2 px-7 py-4 bg-neon-cyan text-dark-bg font-black text-base rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                تواصل معي الآن
                <ArrowLeft size={20} />
              </Link>
            </div>
          </div>
        </motion.div>

        {/* قسم الروابط */}
        <div className="flex flex-col md:flex-row items-start justify-between gap-10 pb-10 border-b border-glass-border">
          {/* لوجو + وصف */}
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5 w-fit">
              <div className="w-8 h-8 rounded-xl bg-neon-cyan flex items-center justify-center flex-shrink-0">
                <span className="text-dark-bg font-black text-xs tracking-tight">AH</span>
              </div>
              <span className="font-black text-white text-sm tracking-wide">
                Ali <span className="text-neon-cyan">Hajali</span>
              </span>
            </Link>
            <p className="text-gray-600 text-sm mt-4 leading-relaxed">
              مبرمج مواقع احترافي متخصص في Next.js وتصميم واجهات فاخرة مقيم في قطر.
            </p>
          </div>

          {/* روابط التنقل */}
          <div>
            <p className="text-xs font-black tracking-widest text-gray-600 uppercase mb-4">الصفحات</p>
            <ul className="flex flex-col gap-3">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-gray-400 text-sm hover:text-neon-cyan transition-colors duration-200 font-medium"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* وسائل التواصل */}
          <div>
            <p className="text-xs font-black tracking-widest text-gray-600 uppercase mb-4">تواصل</p>
            <div className="flex gap-3">
              {social.map(({ icon, href, label }) =>
                href ? (
                  <Link
                    key={label}
                    href={href}
                    aria-label={label}
                    className="w-10 h-10 flex items-center justify-center glass-card rounded-xl text-gray-500 hover:text-neon-cyan hover:border-neon-cyan/20 transition-all duration-300"
                  >
                    {icon}
                  </Link>
                ) : (
                  <span
                    key={label}
                    title="قريباً"
                    aria-label={`${label} — قريباً`}
                    className="w-10 h-10 flex items-center justify-center glass-card rounded-xl text-gray-600 opacity-50 cursor-not-allowed"
                  >
                    {icon}
                  </span>
                )
              )}
            </div>
          </div>
        </div>

        {/* حقوق النشر */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-gray-700 text-xs font-bold tracking-[0.2em] uppercase">
            Ali Hajali · Qatar 2026
          </p>
          <p className="text-gray-700 text-xs">
            جميع الحقوق محفوظة &copy; {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
}
