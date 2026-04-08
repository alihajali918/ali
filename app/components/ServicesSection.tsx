"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Code2, Palette, Fingerprint, ArrowLeft, BarChart3, Award } from "lucide-react";

const services = [
  {
    icon: <Code2 size={28} />,
    title: "برمجة Next.js",
    desc: "تطوير مواقع وتطبيقات ويب عالية الأداء باستخدام أحدث تقنيات React وNext.js مع تحسين SEO وسرعة التحميل.",
    color: "cyan",
  },
  {
    icon: <Palette size={28} />,
    title: "تصميم UI/UX",
    desc: "تصميم واجهات مستخدم فاخرة وتجارب سلسة تعكس هوية علامتك التجارية وتُحوّل الزوار إلى عملاء.",
    color: "purple",
  },
  {
    icon: <Fingerprint size={28} />,
    title: "هوية بصرية",
    desc: "بناء هوية بصرية متكاملة للعلامة التجارية من شعار وألوان وخطوط وعناصر تصميم متناسقة.",
    color: "cyan",
  },
  {
    icon: <BarChart3 size={28} />,
    title: "لوحات التحكم",
    desc: "تطوير لوحات تحكم احترافية وأنظمة إدارة محتوى مخصصة لإدارة أعمالك بكفاءة عالية.",
    color: "purple",
  },
  {
    icon: <Award size={28} />,
    title: "صانع الشهادات",
    desc: "منصة SaaS لمراكز التدريب لإنشاء شهادات احترافية بالذكاء الاصطناعي مع تخصيص كامل للألوان والعناصر.",
    color: "cyan",
    badge: "قريباً",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const card = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function ServicesSection() {
  return (
    <section className="py-32 px-4 md:px-8 relative">
      {/* تدرج خلفي خفيف */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-neon-purple/4 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* رأس القسم */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-6 inline-flex">SERVICES</span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight mb-4">
            خدمات <span className="text-gradient">ذكية</span> ومتكاملة
          </h2>
          <p className="text-gray-500 text-lg max-w-xl mx-auto">
            من الفكرة حتى الإطلاق — كل ما تحتاجه في مكان واحد
          </p>
        </motion.div>

        {/* الكروت */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
        >
          {services.map((s, i) => (
            <motion.div
              key={i}
              variants={card}
              className="glass-card-hover relative rounded-3xl p-8 group cursor-pointer"
            >
              {/* شارة اختيارية */}
              {s.badge && (
                <span className="absolute top-5 left-5 px-2.5 py-1 text-[10px] font-black bg-neon-purple/15 text-neon-purple border border-neon-purple/20 rounded-full tracking-widest uppercase">
                  {s.badge}
                </span>
              )}

              {/* أيقونة */}
              <div
                className={`w-14 h-14 flex items-center justify-center rounded-2xl mb-6 transition-all duration-300 ${
                  s.color === "cyan"
                    ? "text-neon-cyan bg-neon-cyan/8 group-hover:bg-neon-cyan/15 group-hover:glow-cyan-sm"
                    : "text-neon-purple bg-neon-purple/8 group-hover:bg-neon-purple/15"
                }`}
              >
                {s.icon}
              </div>

              {/* عنوان */}
              <h3 className="text-xl font-black mb-3 text-white">{s.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>

              {/* خط سفلي */}
              <div
                className={`mt-8 h-[2px] w-8 rounded-full transition-all duration-500 group-hover:w-full ${
                  s.color === "cyan" ? "bg-neon-cyan" : "bg-neon-purple"
                }`}
              />
            </motion.div>
          ))}

          {/* كارت "عرض الكل" */}
          <motion.div variants={card}>
            <Link
              href="/services"
              className="glass-card-hover h-full min-h-[200px] rounded-3xl p-8 flex flex-col items-center justify-center gap-4 border-dashed border-white/10 hover:border-neon-cyan/20 transition-all duration-300 group"
            >
              <span className="w-14 h-14 flex items-center justify-center rounded-2xl bg-neon-cyan/8 text-neon-cyan group-hover:scale-110 transition-transform">
                <ArrowLeft size={24} />
              </span>
              <span className="text-white font-bold text-lg">عرض جميع الخدمات</span>
              <span className="text-gray-600 text-sm text-center">اكتشف كل ما نقدمه من حلول برمجية</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
