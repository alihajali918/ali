"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { QrCode, Award, FileText, ArrowLeft, Zap } from "lucide-react";

const tools = [
  {
    icon: QrCode,
    title: "مولّد QR Code",
    category: "أداة مجانية",
    description: "أنشئ QR Code احترافي لأي رابط أو نص أو بيانات تواصل — مع تخصيص كامل للألوان والشكل.",
    gradient: "from-cyan-500/20 via-teal-500/10 to-transparent",
    accent: "#00F5D4",
    tags: ["مجاني 100%", "بدون تسجيل", "تحميل فوري"],
    href: "/tools/qrcode",
    num: "01",
  },
  {
    icon: Award,
    title: "صانع الشهادات",
    category: "أداة احترافية",
    description: "أنشئ شهادات إتمام دورات بتصاميم فاخرة ومخصصة — مناسبة لمراكز التدريب والمؤسسات التعليمية.",
    gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
    accent: "#7B61FF",
    tags: ["قوالب متعددة", "شعار مخصص", "PDF/PNG"],
    href: "/tools/certs",
    num: "02",
  },
  {
    icon: FileText,
    title: "مولّد التقارير",
    category: "أداة بيانات",
    description: "حوّل بياناتك إلى تقارير Excel منظمة وجاهزة للطباعة في ثوانٍ بدون أي خبرة تقنية.",
    gradient: "from-amber-500/20 via-orange-500/10 to-transparent",
    accent: "#F59E0B",
    tags: ["Excel تلقائي", "بيانات منظمة", "سريع جداً"],
    href: "/tools/reports",
    num: "03",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] } },
};

export default function WorkSection() {
  return (
    <section className="py-32 px-4 md:px-8 relative">
      <div className="max-w-7xl mx-auto">

        {/* رأس القسم */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16"
        >
          <div>
            <span className="section-badge mb-5 inline-flex">
              <Zap size={11} />
              TOOLS
            </span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              أدوات <span className="text-gradient">تشتغل لك</span>
            </h2>
            <p className="text-gray-500 text-base mt-3 max-w-md">
              مش بس تصميم — أدوات حقيقية توفر ساعات من عملك
            </p>
          </div>
          <Link
            href="/products"
            className="text-neon-cyan font-bold text-sm hover:text-white transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            كل الأدوات
            <ArrowLeft size={14} />
          </Link>
        </motion.div>

        {/* الكروت */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <motion.div
                key={i}
                variants={item}
                className="group relative rounded-3xl overflow-hidden border border-glass-border hover:border-white/12 transition-all duration-500 cursor-pointer"
                style={{ minHeight: "340px" }}
              >
                {/* خلفية متدرجة */}
                <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient}`} />
                <div className="absolute inset-0 bg-dark-card" style={{ zIndex: -1 }} />

                {/* شبكة نقاط */}
                <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

                {/* خط علوي ملوّن */}
                <div className="absolute top-0 right-0 left-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${t.accent}60, transparent)` }} />

                <Link href={t.href} className="relative z-10 p-8 flex flex-col h-full" style={{ minHeight: "340px" }}>
                  {/* رقم + أيقونة */}
                  <div className="flex items-start justify-between">
                    <span className="text-5xl font-black opacity-10 select-none" style={{ color: t.accent }}>
                      {t.num}
                    </span>
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: `${t.accent}15`, color: t.accent }}>
                      <Icon size={22} />
                    </div>
                  </div>

                  <div className="mt-auto">
                    <span className="text-xs font-bold tracking-widest uppercase mb-3 block" style={{ color: t.accent }}>
                      {t.category}
                    </span>
                    <h3 className="text-2xl font-black text-white mb-3">{t.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed mb-6">{t.description}</p>

                    {/* تاجات */}
                    <div className="flex flex-wrap gap-2">
                      {t.tags.map((tag) => (
                        <span key={tag}
                          className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 bg-glass border border-glass-border rounded-lg">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* رابط */}
                  <div className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-600 group-hover:text-white transition-colors duration-300">
                    <span>جرّب الأداة</span>
                    <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-300" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
