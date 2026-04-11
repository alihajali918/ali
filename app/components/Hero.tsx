"use client";

import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import Link from "next/link";
import { ArrowLeft, Code2, Terminal, Layers, Sparkles } from "lucide-react";
import { useRef } from "react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden:   { opacity: 0, y: 24 },
  visible:  { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] } },
};

const codeLines = [
  { indent: 0, tokens: [{ t: "const ",     c: "text-neon-purple" }, { t: "developer",  c: "text-neon-cyan"   }, { t: " = {",      c: "text-gray-300"  }] },
  { indent: 1, tokens: [{ t: "name",       c: "text-blue-400"   }, { t: ": ",         c: "text-gray-300"   }, { t: '"Ali Hajali"', c: "text-green-400" }, { t: ",", c: "text-gray-300" }] },
  { indent: 1, tokens: [{ t: "role",       c: "text-blue-400"   }, { t: ": ",         c: "text-gray-300"   }, { t: '"Full Stack"', c: "text-green-400" }, { t: ",", c: "text-gray-300" }] },
  { indent: 1, tokens: [{ t: "stack",      c: "text-blue-400"   }, { t: ": [",        c: "text-gray-300"   }] },
  { indent: 2, tokens: [{ t: '"Next.js"',  c: "text-yellow-400" }, { t: ", ",         c: "text-gray-300"   }, { t: '"React"',     c: "text-yellow-400" }, { t: ",", c: "text-gray-300" }] },
  { indent: 2, tokens: [{ t: '"TypeScript"', c: "text-yellow-400" }, { t: ", ",       c: "text-gray-300"   }, { t: '"Tailwind"',  c: "text-yellow-400" }] },
  { indent: 1, tokens: [{ t: "],",          c: "text-gray-300"   }] },
  { indent: 1, tokens: [{ t: "location",   c: "text-blue-400"   }, { t: ": ",         c: "text-gray-300"   }, { t: '"Qatar 🇶🇦"',   c: "text-green-400" }] },
  { indent: 0, tokens: [{ t: "};",          c: "text-gray-300"   }] },
];

function CodeCard() {
  const cardRef  = useRef<HTMLDivElement>(null);
  const mouseX   = useMotionValue(0);
  const mouseY   = useMotionValue(0);

  const rotateX  = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]),  { stiffness: 200, damping: 30 });
  const rotateY  = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]),  { stiffness: 200, damping: 30 });
  const glowX    = useTransform(mouseX, [-0.5, 0.5], [20, 80]);
  const glowY    = useTransform(mouseY, [-0.5, 0.5], [20, 80]);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = cardRef.current?.getBoundingClientRect();
    if (!rect) return;
    mouseX.set((e.clientX - rect.left) / rect.width  - 0.5);
    mouseY.set((e.clientY - rect.top)  / rect.height - 0.5);
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={() => { mouseX.set(0); mouseY.set(0); }}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d", perspective: 800 }}
      className="relative w-full max-w-sm mx-auto cursor-pointer select-none"
      initial={{ opacity: 0, y: 40, rotateX: 10 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ delay: 0.4, duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* glow behind card */}
      <motion.div
        className="absolute inset-0 rounded-2xl blur-2xl opacity-30 pointer-events-none"
        style={{
          background: useTransform(
            [glowX, glowY],
            ([x, y]) => `radial-gradient(circle at ${x}% ${y}%, #00F5D4, #7B61FF)`
          ),
        }}
      />

      {/* card body */}
      <div className="relative rounded-2xl border border-white/10 bg-[#0d0d0d] overflow-hidden shadow-2xl"
        style={{ transform: "translateZ(20px)" }}>

        {/* title bar */}
        <div className="flex items-center gap-2 px-4 py-3 bg-white/[0.03] border-b border-white/[0.06]">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <div className="flex-1 flex items-center justify-center gap-1.5">
            <Terminal size={11} className="text-gray-600" />
            <span className="text-[11px] text-gray-600 font-mono">developer.ts</span>
          </div>
        </div>

        {/* code */}
        <div className="px-5 py-4 font-mono text-[12.5px] leading-6">
          {codeLines.map((line, i) => (
            <motion.div key={i} className="flex"
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.07, duration: 0.35 }}
            >
              <span className="text-gray-700 w-5 text-right shrink-0 ml-3 select-none text-[10px] mt-0.5">
                {i + 1}
              </span>
              <span style={{ paddingRight: `${line.indent * 16}px` }} className="flex flex-wrap items-center gap-0">
                {line.tokens.map((tok, j) => (
                  <span key={j} className={tok.c}>{tok.t}</span>
                ))}
              </span>
            </motion.div>
          ))}

          {/* cursor blink */}
          <motion.div className="flex mt-1">
            <span className="text-gray-700 w-5 text-right shrink-0 ml-3 select-none text-[10px]" />
            <motion.span
              className="inline-block w-2 h-4 bg-neon-cyan/80 rounded-sm"
              animate={{ opacity: [1, 0] }}
              transition={{ repeat: Infinity, duration: 1, ease: "steps(1)" }}
            />
          </motion.div>
        </div>
      </div>

      {/* floating badges */}
      <motion.div
        className="absolute -top-3 -right-3 px-2.5 py-1.5 rounded-xl bg-neon-cyan/10 border border-neon-cyan/25 text-neon-cyan text-[11px] font-black flex items-center gap-1"
        style={{ transform: "translateZ(40px)" }}
        animate={{ y: [0, -4, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <Code2 size={11} /> Next.js 15
      </motion.div>

      <motion.div
        className="absolute -bottom-3 -left-3 px-2.5 py-1.5 rounded-xl bg-neon-purple/10 border border-neon-purple/25 text-neon-purple text-[11px] font-black flex items-center gap-1"
        style={{ transform: "translateZ(40px)" }}
        animate={{ y: [0, 4, 0] }}
        transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut", delay: 0.5 }}
      >
        <Layers size={11} /> Full Stack
      </motion.div>
    </motion.div>
  );
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 pt-24 pb-16">

      {/* background */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[10%] left-[0%] w-[600px] h-[600px] rounded-full bg-neon-cyan/4 blur-[140px] animate-orb" />
        <div className="absolute bottom-[5%] right-[0%] w-[600px] h-[600px] rounded-full bg-neon-purple/4 blur-[160px] animate-orb"
          style={{ animationDelay: "-6s", animationDuration: "16s" }} />
        {/* grid */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="relative z-10 w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">

        {/* ── left: text ── */}
        <motion.div variants={container} initial="hidden" animate="visible" className="flex flex-col items-start text-right lg:text-right order-2 lg:order-1">

          <motion.div variants={item} className="mb-5">
            <span className="section-badge">
              <Sparkles size={11} />
              مبرمج مواقع · قطر 🇶🇦
            </span>
          </motion.div>

          <motion.h1 variants={item}
            className="text-4xl sm:text-5xl md:text-6xl font-black leading-[1.1] tracking-tight mb-5"
          >
            أبني مواقع
            <br />
            <span className="text-gradient">تشتغل فعلاً</span>
          </motion.h1>

          <motion.p variants={item}
            className="text-gray-400 text-base md:text-lg max-w-md mb-8 leading-relaxed"
          >
            مبرمج Full Stack متخصص في{" "}
            <span className="text-white font-semibold">Next.js</span> —
            أبني مواقع سريعة وأدوات رقمية تحل مشاكل حقيقية.
          </motion.p>

          <motion.div variants={item} className="flex flex-col sm:flex-row gap-3">
            <Link href="/portfolio"
              className="btn-shimmer group flex items-center gap-2 px-7 py-3.5 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform duration-200"
            >
              شوف أعمالي
              <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform duration-300" />
            </Link>
            <Link href="/pricing"
              className="flex items-center gap-2 px-7 py-3.5 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all duration-300"
            >
              الأسعار والباقات
            </Link>
          </motion.div>

          {/* tech stack pills */}
          <motion.div variants={item} className="mt-8 flex flex-wrap gap-2">
            {["Next.js", "React", "TypeScript", "Tailwind", "PostgreSQL", "Prisma"].map((t) => (
              <span key={t} className="px-3 py-1 text-xs font-semibold text-gray-600 border border-glass-border rounded-lg bg-glass">
                {t}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ── right: 3D code card ── */}
        <div className="order-1 lg:order-2">
          <CodeCard />
        </div>

      </div>
    </section>
  );
}
