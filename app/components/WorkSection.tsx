"use client";

import { motion, useScroll, useTransform, useInView } from "framer-motion";
import Link from "next/link";
import { QrCode, Award, FileText, ArrowLeft, Zap } from "lucide-react";
import { useRef } from "react";

const tools = [
  {
    icon: QrCode,
    title: "مولّد QR Code",
    category: "أداة مجانية",
    description: "أنشئ QR Code احترافي لأي رابط أو نص — مع تخصيص كامل للألوان والشكل. مجانية 100% بدون تسجيل.",
    accent: "#00F5D4",
    tags: ["مجاني 100%", "بدون تسجيل", "تحميل فوري"],
    href: "/tools/qrcode",
    num: "01",
  },
  {
    icon: Award,
    title: "صانع الشهادات",
    category: "أداة احترافية",
    description: "شهادات إتمام دورات بتصاميم فاخرة مناسبة لمراكز التدريب والمؤسسات التعليمية.",
    accent: "#7B61FF",
    tags: ["قوالب متعددة", "شعار مخصص", "PDF/PNG"],
    href: "/tools/certs",
    num: "02",
  },
  {
    icon: FileText,
    title: "مولّد التقارير",
    category: "أداة بيانات",
    description: "حوّل بياناتك إلى تقارير Excel منظمة وجاهزة في ثوانٍ. بدون أي خبرة تقنية.",
    accent: "#F59E0B",
    tags: ["Excel تلقائي", "بيانات منظمة", "سريع جداً"],
    href: "/tools/reports",
    num: "03",
  },
];

function ToolCard({ t, i }: { t: typeof tools[0]; i: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const Icon = t.icon;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.13 }}
      className="group relative rounded-3xl overflow-hidden border border-glass-border cursor-pointer"
      style={{ minHeight: "340px" }}
      whileHover={{ borderColor: `${t.accent}30`, transition: { duration: 0.3 } }}
    >
      {/* bg */}
      <div className="absolute inset-0 bg-dark-card" />
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${t.accent}10, transparent 60%)` }}
      />
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

      {/* top line */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-[1px]"
        initial={{ scaleX: 0 }}
        whileHover={{ scaleX: 1 }}
        style={{ background: `linear-gradient(90deg, transparent, ${t.accent}70, transparent)`, transformOrigin: "left" }}
        transition={{ duration: 0.5 }}
      />

      <Link href={t.href} className="relative z-10 p-8 flex flex-col h-full" style={{ minHeight: "340px" }}>
        <div className="flex items-start justify-between mb-auto">
          {/* parallax number */}
          <motion.span
            className="text-[6rem] font-black leading-none opacity-[0.07] select-none"
            style={{ color: t.accent }}
            initial={{ y: 20 }}
            animate={isInView ? { y: 0 } : {}}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.13 + 0.2 }}
          >
            {t.num}
          </motion.span>

          <motion.div
            className="w-11 h-11 rounded-2xl flex items-center justify-center"
            style={{ background: `${t.accent}12`, color: t.accent }}
            whileHover={{ scale: 1.15, rotate: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Icon size={22} />
          </motion.div>
        </div>

        <div className="mt-4">
          <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: t.accent }}>
            {t.category}
          </span>
          <h3 className="text-2xl font-black text-white mb-3">{t.title}</h3>
          <p className="text-gray-500 text-sm leading-relaxed mb-6">{t.description}</p>

          <div className="flex flex-wrap gap-2">
            {t.tags.map((tag) => (
              <span key={tag} className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 bg-glass border border-glass-border rounded-lg">
                {tag}
              </span>
            ))}
          </div>
        </div>

        <motion.div
          className="mt-8 flex items-center gap-2 text-sm font-bold"
          style={{ color: t.accent }}
          initial={{ opacity: 0.4 }}
          whileHover={{ opacity: 1 }}
        >
          <span>جرّب الأداة</span>
          <motion.span
            animate={{ x: [0, -4, 0] }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
          >
            <ArrowLeft size={14} />
          </motion.span>
        </motion.div>
      </Link>
    </motion.div>
  );
}

export default function WorkSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "end start"] });
  const bgY = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);
  const headRef = useRef<HTMLDivElement>(null);
  const headInView = useInView(headRef, { once: true, margin: "-60px" });

  return (
    <section ref={sectionRef} className="py-32 px-4 md:px-8 relative">
      {/* parallax bg glow */}
      <motion.div aria-hidden style={{ y: bgY }}
        className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-cyan/3 blur-[160px] rounded-full" />
      </motion.div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* header */}
        <div ref={headRef} className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <motion.span
              className="section-badge mb-5 inline-flex"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={headInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.5 }}
            >
              <Zap size={11} /> TOOLS
            </motion.span>

            <div className="overflow-hidden">
              <motion.h2
                className="text-3xl md:text-5xl font-black leading-tight"
                initial={{ y: "100%" }}
                animate={headInView ? { y: 0 } : {}}
                transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
              >
                أدوات <span className="text-gradient">تشتغل لك</span>
              </motion.h2>
            </div>

            <motion.p
              className="text-gray-500 text-base mt-3 max-w-md"
              initial={{ opacity: 0 }}
              animate={headInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.3 }}
            >
              مش بس تصميم — أدوات حقيقية توفر ساعات من عملك
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={headInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.4 }}
          >
            <Link href="/products"
              className="group text-neon-cyan font-bold text-sm hover:text-white transition-colors flex items-center gap-2">
              كل الأدوات
              <motion.span
                className="group-hover:-translate-x-1 transition-transform"
                animate={{ x: [0, -3, 0] }}
                transition={{ repeat: Infinity, duration: 1.8 }}
              >
                <ArrowLeft size={14} />
              </motion.span>
            </Link>
          </motion.div>
        </div>

        {/* cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((t, i) => <ToolCard key={i} t={t} i={i} />)}
        </div>
      </div>
    </section>
  );
}
