"use client";

import { motion, useMotionValue, useTransform, useSpring, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, QrCode, Award, FileText, Zap, Clock, TrendingUp } from "lucide-react";
import { useRef, useState, useEffect } from "react";

/* ── floating tool cards data ── */
const tools = [
  { icon: QrCode,    label: "QR Code",    sub: "جاهز في ثانية",      color: "#00F5D4", delay: 0    },
  { icon: Award,     label: "الشهادات",   sub: "احترافية وسريعة",    color: "#7B61FF", delay: 0.15 },
  { icon: FileText,  label: "التقارير",   sub: "Excel تلقائي",       color: "#F59E0B", delay: 0.3  },
];

/* ── counter animation ── */
function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(to / 40);
    const t = setInterval(() => {
      start += step;
      if (start >= to) { setVal(to); clearInterval(t); }
      else setVal(start);
    }, 30);
    return () => clearInterval(t);
  }, [to]);
  return <>{val}{suffix}</>;
}

/* ── 3D tilt card ── */
function TiltCard({ icon: Icon, label, sub, color, delay }: typeof tools[0]) {
  const ref   = useRef<HTMLDivElement>(null);
  const mx    = useMotionValue(0);
  const my    = useMotionValue(0);
  const rx    = useSpring(useTransform(my, [-0.5, 0.5], [10, -10]), { stiffness: 300, damping: 30 });
  const ry    = useSpring(useTransform(mx, [-0.5, 0.5], [-10, 10]), { stiffness: 300, damping: 30 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={e => {
        const r = ref.current?.getBoundingClientRect();
        if (!r) return;
        mx.set((e.clientX - r.left) / r.width  - 0.5);
        my.set((e.clientY - r.top)  / r.height - 0.5);
      }}
      onMouseLeave={() => { mx.set(0); my.set(0); }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 30, scale: 0.9 }}
      animate={{ opacity: 1, y: 0,  scale: 1   }}
      transition={{ delay: 0.5 + delay, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.04 }}
      className="relative rounded-2xl border border-white/8 bg-[#0d0d0d] p-5 cursor-pointer overflow-hidden"
    >
      {/* glow bg */}
      <div className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-2xl"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}18, transparent 70%)` }} />

      {/* top line */}
      <div className="absolute top-0 left-0 right-0 h-[1.5px] rounded-t-2xl"
        style={{ background: `linear-gradient(90deg, transparent, ${color}80, transparent)` }} />

      <div className="flex items-center gap-3" style={{ transform: "translateZ(16px)" }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, color }}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm font-black text-white">{label}</p>
          <p className="text-[11px] text-gray-500">{sub}</p>
        </div>
        <div className="mr-auto w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />
      </div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-24 pb-16">

      {/* ── background effects ── */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        {/* orbs */}
        <div className="absolute top-[8%] right-[5%] w-[700px] h-[700px] rounded-full bg-neon-cyan/5 blur-[160px] animate-orb" />
        <div className="absolute bottom-[0%] left-[0%] w-[600px] h-[600px] rounded-full bg-neon-purple/5 blur-[140px] animate-orb"
          style={{ animationDelay: "-7s", animationDuration: "18s" }} />
        <div className="absolute top-[40%] left-[40%] w-[400px] h-[400px] rounded-full bg-amber-500/3 blur-[120px] animate-orb"
          style={{ animationDelay: "-3s", animationDuration: "14s" }} />

        {/* grid */}
        <div className="absolute inset-0"
          style={{
            backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }} />

        {/* vignette */}
        <div className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, #0A0A0A 100%)" }} />
      </div>

      {/* ── floating particles ── */}
      {[...Array(6)].map((_, i) => (
        <motion.div key={i} aria-hidden
          className="absolute w-1 h-1 rounded-full pointer-events-none"
          style={{ background: i % 2 === 0 ? "#00F5D4" : "#7B61FF", left: `${15 + i * 14}%`, top: `${20 + (i % 3) * 20}%` }}
          animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ repeat: Infinity, duration: 3 + i * 0.7, ease: "easeInOut", delay: i * 0.4 }}
        />
      ))}

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-[1fr_420px] gap-16 items-center">

        {/* ── RIGHT: text ── */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col items-start"
        >
          {/* badge */}
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="mb-6">
            <span className="section-badge">
              <Zap size={11} />
              أدوات مصنوعة في قطر 🇶🇦
            </span>
          </motion.div>

          {/* headline */}
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25,0.46,0.45,0.94] } } }}
            className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6"
          >
            أدوات ذكية
            <br />
            <span className="text-gradient">لتسهيل حياتك</span>
            <br />
            <span className="text-white/60 text-4xl sm:text-5xl md:text-6xl">وتطوير عملك</span>
          </motion.h1>

          {/* sub */}
          <motion.p
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="text-gray-400 text-base md:text-lg max-w-md mb-10 leading-relaxed"
          >
            مش بس مواقع — أبني{" "}
            <span className="text-white font-semibold">أدوات تشتغل لك</span>.
            توفر وقتك، تسرّع عملك، وتحل مشاكل حقيقية.
          </motion.p>

          {/* stats row */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="flex items-center gap-6 mb-10"
          >
            {[
              { icon: Clock,      val: 0,   suffix: "s",  label: "وقت الإنشاء",   color: "#00F5D4" },
              { icon: TrendingUp, val: 100, suffix: "%",  label: "مجاني الآن",    color: "#7B61FF" },
              { icon: Zap,        val: 3,   suffix: "+",  label: "أدوات جاهزة",   color: "#F59E0B" },
            ].map(({ icon: Icon, val, suffix, label, color }) => (
              <div key={label} className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-1">
                  <Icon size={13} style={{ color }} />
                  <span className="text-2xl font-black" style={{ color }}>
                    <Counter to={val} suffix={suffix} />
                  </span>
                </div>
                <span className="text-[10px] text-gray-600 font-medium">{label}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA */}
          <motion.div
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6 } } }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <Link href="/products"
              className="btn-shimmer group flex items-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              استعرض الأدوات
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
            </Link>
            <Link href="/tools/qrcode"
              className="flex items-center gap-2 px-8 py-4 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all duration-300"
            >
              جرّب QR مجاناً
            </Link>
          </motion.div>
        </motion.div>

        {/* ── LEFT: tool cards ── */}
        <div className="flex flex-col gap-4 lg:order-2 order-first">
          {tools.map((t) => (
            <TiltCard key={t.label} {...t} />
          ))}

          {/* bottom glow card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.1, duration: 0.6 }}
            className="relative rounded-2xl border border-neon-cyan/15 bg-neon-cyan/3 p-4 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-xl bg-neon-cyan/15 flex items-center justify-center shrink-0">
              <Zap size={15} className="text-neon-cyan" />
            </div>
            <div>
              <p className="text-xs font-black text-neon-cyan">بدون تسجيل · بدون انتظار</p>
              <p className="text-[11px] text-gray-600">افتح الأداة واستخدمها فوراً</p>
            </div>
            <motion.div
              className="absolute inset-0 rounded-2xl border border-neon-cyan/20 pointer-events-none"
              animate={{ opacity: [0.3, 0.8, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
            />
          </motion.div>
        </div>

      </div>
    </section>
  );
}
