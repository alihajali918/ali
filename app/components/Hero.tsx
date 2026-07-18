"use client";

import {
  motion, useScroll, useTransform, useSpring,
  useMotionValue,
} from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Code2, Layers, Rocket, Zap } from "lucide-react";
import { useRef } from "react";
import { useIsDesktop } from "../lib/useIsDesktop";

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
            initial={{ y: "40%", opacity: 0.01 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, ease: [0.33, 1, 0.68, 1], delay: delay + i * 0.05 }}
          >
            {word}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/* ─── 3D floating browser mockup ─── */
function Hero3D() {
  const ref   = useRef<HTMLDivElement>(null);
  const mx    = useMotionValue(0);
  const my    = useMotionValue(0);
  const rx    = useSpring(useTransform(my, [-0.5, 0.5], [18, -18]), { stiffness: 180, damping: 25 });
  const ry    = useSpring(useTransform(mx, [-0.5, 0.5], [-18, 18]), { stiffness: 180, damping: 25 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width  - 0.5);
    my.set((e.clientY - r.top)  / r.height - 0.5);
  };
  const onLeave = () => { mx.set(0); my.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.9, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="relative w-full flex items-center justify-center"
      style={{ perspective: "900px", minHeight: "420px" }}
    >
      {/* outer glow */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full blur-[100px] opacity-30"
          style={{ background: "radial-gradient(circle, #00F5D4 0%, #7B61FF 60%, transparent 100%)" }}/>
      </div>

      <motion.div
        style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
        animate={{ y: [0, -12, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
        className="relative w-72 h-[420px] md:w-80 md:h-[460px]"
      >
        {/* shadow layer */}
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-48 h-8 rounded-full blur-2xl opacity-40"
          style={{ background: "linear-gradient(90deg,#00F5D4,#7B61FF)", transform: "translateZ(-40px)" }}/>

        {/* main card — browser window */}
        <div className="absolute inset-0 rounded-3xl border"
          style={{
            background: "linear-gradient(145deg, #161616, #0d0d0d)",
            border: "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.04) inset",
            transform: "translateZ(0px)",
          }}>
          {/* top gradient strip */}
          <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-3xl"
            style={{ background: "linear-gradient(90deg, #00F5D4, #7B61FF)" }}/>

          {/* inner content */}
          <div className="p-6 flex flex-col h-full" style={{ transform: "translateZ(20px)" }}>
            {/* browser bar */}
            <div className="flex items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              </div>
              <div className="flex-1 h-5 rounded-full bg-white/5 flex items-center px-3">
                <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan" />
              </div>
            </div>

            {/* fake website preview */}
            <div className="flex-1 rounded-2xl flex flex-col gap-3 p-4 mb-4"
              style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)" }}>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg" style={{ background: "rgba(0,245,212,0.15)" }} />
                <div className="h-1.5 w-16 rounded-full bg-white/10" />
                <div className="mr-auto h-1.5 w-8 rounded-full bg-white/5" />
              </div>

              <motion.div
                className="w-full h-20 rounded-xl mt-2"
                style={{ background: "linear-gradient(135deg, rgba(0,245,212,0.12), rgba(123,97,255,0.12))" }}
                animate={{ opacity: [0.7, 1, 0.7] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              />

              <div className="grid grid-cols-2 gap-2 mt-2">
                {[0, 1].map(i => (
                  <div key={i} className="rounded-lg p-2.5 flex flex-col gap-1.5"
                    style={{ background: "rgba(255,255,255,0.03)" }}>
                    <div className="h-1.5 w-3/4 rounded-full bg-white/10" />
                    <div className="h-1.5 w-1/2 rounded-full bg-white/5" />
                  </div>
                ))}
              </div>
            </div>

            {/* bottom stack row */}
            <div className="flex gap-2">
              {[{ I: Code2, c: "#00F5D4" }, { I: Layers, c: "#7B61FF" }, { I: Rocket, c: "#F59E0B" }].map(({ I, c }, i) => (
                <motion.div key={i}
                  className="flex-1 h-12 rounded-xl flex items-center justify-center"
                  style={{ background: `${c}10`, border: `1px solid ${c}20` }}
                  whileHover={{ scale: 1.08 }}
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ repeat: Infinity, duration: 2 + i * 0.5, delay: i * 0.3 }}>
                  <I size={16} style={{ color: c }}/>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* floating badge — top */}
        <motion.div
          className="absolute -top-4 -right-6 px-3 py-1.5 rounded-xl text-[11px] font-black"
          style={{ background:"rgba(0,245,212,0.12)", border:"1px solid rgba(0,245,212,0.3)", color:"#00F5D4", transform:"translateZ(50px)" }}
          animate={{ y:[0,-6,0] }}
          transition={{ repeat:Infinity, duration:3, ease:"easeInOut", delay:0.5 }}>
          ✦ Next.js 15
        </motion.div>

        {/* floating badge — bottom */}
        <motion.div
          className="absolute -bottom-4 -left-6 px-3 py-1.5 rounded-xl text-[11px] font-black"
          style={{ background:"rgba(123,97,255,0.12)", border:"1px solid rgba(123,97,255,0.3)", color:"#7B61FF", transform:"translateZ(50px)" }}
          animate={{ y:[0,6,0] }}
          transition={{ repeat:Infinity, duration:3.5, ease:"easeInOut" }}>
          ⚡ أداء 100/100
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  const heroRef = useRef<HTMLElement>(null);
  const isDesktop = useIsDesktop();
  const { scrollY, scrollYProgress } = useScroll();
  const orbY1 = useTransform(scrollY, [0, 600], [0,  80]);
  const orbY2 = useTransform(scrollY, [0, 600], [0, -60]);
  const orbOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const progressScaleX = useSpring(scrollYProgress, { stiffness: 200, damping: 30 });

  return (
    <>
      {/* scroll progress */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[2px] z-[999] pointer-events-none origin-left"
        style={{
          scaleX: progressScaleX,
          background: "linear-gradient(90deg,#00F5D4,#7B61FF)",
        }}
      />

      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden px-4 pt-24 pb-16">

        {/* ── parallax orbs — smaller/cheaper blur on mobile, full size on desktop ── */}
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <motion.div style={{ y: orbY1, opacity: orbOpacity }}
            className="absolute top-[5%] right-[0%] w-[280px] h-[280px] md:w-[700px] md:h-[700px] rounded-full bg-neon-cyan/5 blur-[60px] md:blur-[160px]" />
          <motion.div style={{ y: orbY2, opacity: orbOpacity }}
            className="absolute bottom-[0%] left-[0%] w-[240px] h-[240px] md:w-[600px] md:h-[600px] rounded-full bg-neon-purple/5 blur-[50px] md:blur-[140px]" />
          <div className="absolute inset-0"
            style={{ backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.022) 1px, transparent 1px)", backgroundSize: "44px 44px" }} />
          <div className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 30%, #0A0A0A 95%)" }} />
        </div>

        {/* ── floating dots — desktop only, purely decorative ── */}
        {isDesktop && [...Array(8)].map((_, i) => (
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
                متاح لمشاريع جديدة 🇶🇦
              </span>
            </motion.div>

            {/* headline — word reveal */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
              <WordReveal text="مبرمج مواقع" delay={0.1} />
              <br />
              <span className="text-gradient">
                <WordReveal text="يحوّل فكرتك" delay={0.3} />
              </span>
              <br />
              <span className="text-white/55">
                <WordReveal text="لموقع يشتغل ويبيع" delay={0.5} />
              </span>
            </h1>

            {/* sub — static so browser counts it as LCP immediately */}
            <p className="text-gray-400 text-base md:text-lg max-w-md mb-10 leading-relaxed">
              أبني مواقع{" "}
              <span className="text-white font-semibold">Next.js</span>{" "}
              سريعة وواجهات فاخرة لأصحاب الأعمال والشركات في{" "}
              <span className="text-white font-semibold">قطر</span> — من الفكرة إلى الإطلاق.
            </p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.0, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              {/* magnetic primary */}
              <MagneticLink href="/portfolio"
                className="btn-shimmer group relative flex items-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan cursor-pointer overflow-hidden">
                <span className="relative z-10 flex items-center gap-2">
                  شوف أعمالي
                  <motion.span
                    animate={{ x: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut", delay: 1.5 }}
                  >
                    <ArrowLeft size={16} />
                  </motion.span>
                </span>
              </MagneticLink>

              <Link href="/contact"
                className="flex items-center gap-2 px-8 py-4 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all duration-300">
                ناقش مشروعك
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

          {/* ── 3D — desktop only; mouse-tracking is pointless on touch and it's the priciest thing to paint ── */}
          {isDesktop && (
            <div className="order-first lg:order-last flex items-center justify-center">
              <Hero3D />
            </div>
          )}

        </div>
      </section>
    </>
  );
}
