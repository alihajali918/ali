"use client";

import {
  motion, useScroll, useTransform, useSpring,
  useMotionValue, AnimatePresence,
} from "framer-motion";
import Link from "next/link";
import { ArrowLeft, QrCode, Award, FileText, Zap } from "lucide-react";
import { useRef, useState, useEffect } from "react";

/* ─── scroll progress bar ─── */
function ScrollBar() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });
  return (
    <motion.div
      style={{ scaleX, transformOrigin: "left", background: "linear-gradient(90deg,#00F5D4,#7B61FF)" }}
      className="fixed top-0 left-0 right-0 h-[2px] z-[999] pointer-events-none"
    />
  );
}

/* ─── magnetic button ─── */
function MagneticLink({ href, children, className }: { href: string; children: React.ReactNode; className: string }) {
  const ref  = useRef<HTMLAnchorElement>(null);
  const x    = useMotionValue(0);
  const y    = useMotionValue(0);
  const sx   = useSpring(x, { stiffness: 350, damping: 25 });
  const sy   = useSpring(y, { stiffness: 350, damping: 25 });

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    x.set((e.clientX - r.left - r.width  / 2) * 0.3);
    y.set((e.clientY - r.top  - r.height / 2) * 0.3);
  };
  const onLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={className}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  );
}

/* ─── word reveal ─── */
function WordReveal({ text, className, delay = 0 }: { text: string; className?: string; delay?: number }) {
  const words = text.split(" ");
  return (
    <span className={className} style={{ display: "inline" }}>
      {words.map((word, i) => (
        <span key={i} style={{ overflow: "hidden", display: "inline-block", marginLeft: "0.22em" }}>
          <motion.span
            style={{ display: "inline-block" }}
            initial={{ y: "110%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: [0.33, 1, 0.68, 1], delay: delay + i * 0.07 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ─── spotlight card ─── */
const tools = [
  { icon: QrCode,   label: "QR Code",   sub: "جاهز في ثانية",   color: "#00F5D4", href: "/tools/qrcode", delay: 0    },
  { icon: Award,    label: "الشهادات",  sub: "احترافية وسريعة", color: "#7B61FF", href: "/tools/certs",  delay: 0.12 },
  { icon: FileText, label: "التقارير",  sub: "Excel تلقائي",    color: "#F59E0B", href: "/tools/reports",delay: 0.24 },
];

function SpotlightCard({ icon: Icon, label, sub, color, href, delay }: typeof tools[0]) {
  const cardRef = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [8, -8]),  { stiffness: 300, damping: 28 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-8, 8]),  { stiffness: 300, damping: 28 });
  const bg = useMotionValue(`radial-gradient(circle at 50% 50%, ${color}00, transparent)`);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const px = ((e.clientX - r.left) / r.width)  * 100;
    const py = ((e.clientY - r.top)  / r.height) * 100;
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
    bg.set(`radial-gradient(circle at ${px}% ${py}%, ${color}20, transparent 65%)`);
  };
  const onLeave = () => { mx.set(0); my.set(0); bg.set(`radial-gradient(circle at 50% 50%, ${color}00, transparent)`); };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.5 + delay, duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ scale: 1.03 }}
      className="relative rounded-2xl border border-white/8 bg-[#0d0d0d] p-5 cursor-pointer overflow-hidden"
    >
      <motion.div className="absolute inset-0 pointer-events-none rounded-2xl" style={{ background: bg }} />
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${color}60, transparent)` }} />

      <div className="flex items-center gap-3" style={{ transform: "translateZ(12px)" }}>
        <motion.div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}15`, color }}
          whileHover={{ scale: 1.12, rotate: -6 }}
          transition={{ type: "spring", stiffness: 400 }}
        >
          <Icon size={20} />
        </motion.div>
        <div>
          <p className="text-sm font-black text-white">{label}</p>
          <p className="text-[11px] text-gray-500">{sub}</p>
        </div>
        <motion.div
          className="mr-auto w-2 h-2 rounded-full"
          style={{ background: color }}
          animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
      </div>
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const { scrollY } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 600], [0,  80]);
  const orbY2 = useTransform(scrollY, [0, 600], [0, -60]);
  const orbOpacity = useTransform(scrollY, [0, 400], [1, 0]);

  return (
    <>
      {/* scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[999] pointer-events-none origin-left"
        style={{
          scaleX: useSpring(useScroll().scrollYProgress, { stiffness: 200, damping: 30 }),
          background: "linear-gradient(90deg,#00F5D4,#7B61FF)",
        }}
      />

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-24 pb-16">

        {/* ── parallax orbs ── */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <motion.div style={{ y: orbY1, opacity: orbOpacity }}
            className="absolute top-[5%] right-[0%] w-[700px] h-[700px] rounded-full bg-neon-cyan/5 blur-[160px]" />
          <motion.div style={{ y: orbY2, opacity: orbOpacity }}
            className="absolute bottom-[0%] left-[0%] w-[600px] h-[600px] rounded-full bg-neon-purple/5 blur-[140px]" />
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 30%, #0A0A0A 95%)" }} />
        </div>

        {/* ── floating dots ── */}
        {[...Array(8)].map((_, i) => (
          <motion.div key={i} aria-hidden
            className="absolute w-1 h-1 rounded-full pointer-events-none"
            style={{ background: i % 2 === 0 ? "#00F5D4" : "#7B61FF", left: `${10 + i * 11}%`, top: `${15 + (i % 4) * 18}%` }}
            animate={{ y: [0, -16, 0], opacity: [0.15, 0.5, 0.15] }}
            transition={{ repeat: Infinity, duration: 2.8 + i * 0.5, ease: "easeInOut", delay: i * 0.35 }}
          />
        ))}

        <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-[1fr_400px] gap-14 items-center">

          {/* ── TEXT ── */}
          <div className="flex flex-col items-start">

            {/* badge */}
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="mb-6"
            >
              <span className="section-badge">
                <motion.span animate={{ rotate: [0, 15, 0, -10, 0] }} transition={{ repeat: Infinity, duration: 3, delay: 2 }}>
                  <Zap size={11} />
                </motion.span>
                أدوات مصنوعة في قطر 🇶🇦
              </span>
            </motion.div>

            {/* headline — word reveal */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              <WordReveal text="أدوات ذكية" delay={0.1} />
              <br />
              <span className="text-gradient">
                <WordReveal text="لتسهيل حياتك" delay={0.3} />
              </span>
              <br />
              <span className="text-white/55">
                <WordReveal text="وتطوير عملك" delay={0.5} />
              </span>
            </h1>

            {/* sub */}
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.6 }}
              className="text-gray-400 text-base md:text-lg max-w-md mb-10 leading-relaxed"
            >
              مش بس مواقع — أبني{" "}
              <span className="text-white font-semibold">أدوات تشتغل لك</span>.
              توفر وقتك، تسرّع عملك، وتحل مشاكل حقيقية.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {/* magnetic primary */}
              <MagneticLink href="/products"
                className="btn-shimmer group relative flex items-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan cursor-pointer overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  استعرض الأدوات
                  <motion.span
                    animate={{ x: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 1.5 }}
                  >
                    <ArrowLeft size={16} />
                  </motion.span>
                </span>
              </MagneticLink>

              <Link href="/tools/qrcode"
                className="flex items-center gap-2 px-8 py-4 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all duration-300">
                جرّب QR مجاناً
              </Link>
            </motion.div>

            {/* scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.8 }}
              className="mt-12 flex items-center gap-2"
            >
              <motion.div
                className="w-[1px] h-8 bg-gradient-to-b from-transparent via-neon-cyan/40 to-transparent"
                animate={{ scaleY: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}
              />
              <span className="text-[10px] text-gray-700 font-bold tracking-[0.2em] uppercase">scroll</span>
            </motion.div>
          </div>

          {/* ── CARDS ── */}
          <div className="flex flex-col gap-4 order-first lg:order-last">
            {tools.map((t) => <SpotlightCard key={t.label} {...t} />)}

            {/* instant badge */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="relative rounded-2xl p-4 flex items-center gap-3 overflow-hidden"
              style={{ background: "rgba(0,245,212,0.04)", border: "1px solid rgba(0,245,212,0.12)" }}
            >
              <motion.div
                className="absolute inset-0 rounded-2xl pointer-events-none"
                style={{ border: "1px solid rgba(0,245,212,0.2)" }}
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ repeat: Infinity, duration: 2.5 }}
              />
              <motion.div
                className="w-8 h-8 rounded-xl bg-neon-cyan/12 flex items-center justify-center shrink-0"
                animate={{ rotate: [0, 10, 0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              >
                <Zap size={15} className="text-neon-cyan" />
              </motion.div>
              <div>
                <p className="text-xs font-black text-neon-cyan">بدون تسجيل · بدون انتظار</p>
                <p className="text-[11px] text-gray-600">افتح الأداة واستخدمها فوراً</p>
              </div>
            </motion.div>
          </div>

        </div>
      </section>
    </>
  );
}
