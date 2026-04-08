"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Zap } from "lucide-react";

const stats = [
  { value: "3",    label: "منتجات رقمية" },
  { value: "مجاني", label: "QR Code" },
  { value: "فوري", label: "وصول بعد الدفع" },
  { value: "24/7", label: "متاح دائماً" },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11 } },
};

const item = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-12">

      {/* خلفية */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[5%] w-[500px] h-[500px] rounded-full bg-neon-cyan/5 blur-[120px] animate-orb" />
        <div className="absolute bottom-[10%] right-[5%] w-[550px] h-[550px] rounded-full bg-neon-purple/5 blur-[140px] animate-orb"
          style={{ animationDelay: "-5s", animationDuration: "15s" }} />
        <div className="absolute inset-0 opacity-[0.025]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
      </div>

      {/* المحتوى */}
      <motion.div className="relative z-10 text-center max-w-4xl mx-auto w-full"
        variants={container} initial="hidden" animate="visible"
      >
        {/* شارة */}
        <motion.div variants={item} className="mb-5 flex justify-center">
          <span className="section-badge">
            <Zap size={11} />
            أدوات رقمية جاهزة · مصنوعة في قطر
          </span>
        </motion.div>

        {/* العنوان */}
        <motion.h1 variants={item}
          className="text-4xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tight mb-5"
        >
          أدوات جاهزة،
          <br />
          <span className="text-gradient">تحل مشاكل حقيقية</span>
        </motion.h1>

        {/* وصف */}
        <motion.p variants={item}
          className="text-gray-400 text-base md:text-lg max-w-xl mx-auto mb-8 leading-relaxed"
        >
          منتجات رقمية مستقلة — تشتريها وتستخدمها
          <span className="text-white font-semibold"> فوراً بدون انتظار</span>.
          بدون عقود، بدون تعقيد.
        </motion.p>

        {/* أزرار */}
        <motion.div variants={item} className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          <Link href="/products"
            className="btn-shimmer group flex items-center gap-2 px-7 py-3.5 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform duration-200"
          >
            استعرض المنتجات
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
          </Link>
          <Link href="/tools/qrcode"
            className="flex items-center gap-2 px-7 py-3.5 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all duration-300"
          >
            جرّب QR Code مجاناً
          </Link>
        </motion.div>

        {/* تقنيات */}
        <motion.div variants={item} className="mt-10 flex flex-wrap justify-center gap-2">
          {["Next.js 15", "React 19", "TypeScript", "Tailwind CSS 4", "Framer Motion"].map((t) => (
            <span key={t} className="px-3 py-1 text-xs font-semibold text-gray-600 border border-glass-border rounded-lg bg-glass">
              {t}
            </span>
          ))}
        </motion.div>
      </motion.div>

      {/* شريط الإحصاءات */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 mt-10 w-full max-w-2xl mx-auto"
      >
        <div className="glass-card rounded-2xl py-4 grid grid-cols-2 sm:grid-cols-4 divide-x divide-x-reverse divide-glass-border">
          {stats.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5 px-3 py-1">
              <span className="text-xl md:text-2xl font-black text-gradient-cyan">{value}</span>
              <span className="text-[11px] text-gray-500 font-medium text-center">{label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
