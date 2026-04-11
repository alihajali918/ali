"use client";

import { motion, useMotionValue, useMotionTemplate, useSpring, useInView } from "framer-motion";
import Link from "next/link";
import { Code2, Palette, Fingerprint, ArrowLeft, BarChart3, Award } from "lucide-react";
import { useRef } from "react";

const services = [
  { icon: Code2,        title: "برمجة Next.js",    desc: "مواقع وتطبيقات عالية الأداء بأحدث تقنيات React وNext.js — سرعة تحميل خارقة وSEO مثالي.", color: "#00F5D4" },
  { icon: Palette,      title: "تصميم UI/UX",       desc: "واجهات فاخرة وتجارب سلسة تعكس هوية علامتك وتحوّل الزوار إلى عملاء.",                    color: "#7B61FF" },
  { icon: BarChart3,    title: "لوحات التحكم",      desc: "أنظمة إدارة مخصصة ولوحات بيانات تفاعلية تساعدك تدير عملك بكفاءة.",                       color: "#00F5D4" },
  { icon: Award,        title: "صانع الشهادات",     desc: "أداة لمراكز التدريب لإنشاء شهادات احترافية مخصصة بضغطة زر.",                              color: "#7B61FF", badge: "متاح الآن" },
  { icon: Fingerprint,  title: "هوية بصرية",        desc: "هوية متكاملة من شعار وألوان وخطوط تعكس شخصية علامتك التجارية.",                          color: "#F59E0B" },
];

/* ── spotlight card with mouse glow ── */
function ServiceCard({ s, i }: { s: typeof services[0]; i: number }) {
  const ref  = useRef<HTMLDivElement>(null);
  const mx   = useMotionValue(0);
  const my   = useMotionValue(0);
  const glow = useMotionTemplate`radial-gradient(220px circle at ${mx}px ${my}px, ${s.color}18, transparent 80%)`;
  const rx   = useSpring(useMotionValue(0), { stiffness: 300, damping: 28 });
  const ry   = useSpring(useMotionValue(0), { stiffness: 300, damping: 28 });

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };

  const isInView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => { mx.set(-999); my.set(-999); }}
      style={{ rotateX: rx, rotateY: ry, transformStyle: "preserve-3d" }}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94], delay: i * 0.09 }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="glass-card relative rounded-3xl p-8 group cursor-pointer overflow-hidden"
    >
      {/* spotlight glow */}
      <motion.div className="absolute inset-0 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glow }} />

      {/* top border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />

      {/* badge */}
      {s.badge && (
        <motion.span
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: i * 0.09 + 0.3, type: "spring", stiffness: 400 }}
          className="absolute top-5 left-5 px-2.5 py-1 text-[10px] font-black rounded-full tracking-widest uppercase"
          style={{ background: `${s.color}18`, color: s.color, border: `1px solid ${s.color}30` }}
        >
          {s.badge}
        </motion.span>
      )}

      {/* icon */}
      <motion.div
        className="w-13 h-13 flex items-center justify-center rounded-2xl mb-6"
        style={{ background: `${s.color}10`, color: s.color }}
        whileHover={{ scale: 1.15, rotate: -8 }}
        transition={{ type: "spring", stiffness: 400, damping: 15 }}
      >
        <s.icon size={26} />
      </motion.div>

      <h3 className="text-xl font-black mb-3 text-white" style={{ transform: "translateZ(8px)" }}>{s.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>

      {/* animated bottom line */}
      <motion.div
        className="mt-8 h-[2px] rounded-full"
        style={{ background: s.color }}
        initial={{ width: "2rem" }}
        whileHover={{ width: "100%" }}
        transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      />
    </motion.div>
  );
}

export default function ServicesSection() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section className="py-32 px-4 md:px-8 relative">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[400px] bg-neon-purple/3 blur-[140px] rounded-full" />
      </div>

      <div ref={ref} className="max-w-7xl mx-auto relative z-10">
        {/* header */}
        <div className="text-center mb-16">
          <motion.span
            className="section-badge mb-6 inline-flex"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
          >
            SERVICES
          </motion.span>

          <div className="overflow-hidden">
            <motion.h2
              className="text-3xl md:text-5xl font-black leading-tight mb-4"
              initial={{ y: "100%" }}
              animate={isInView ? { y: 0 } : {}}
              transition={{ duration: 0.7, ease: [0.33, 1, 0.68, 1], delay: 0.1 }}
            >
              خدمات <span className="text-gradient">ذكية</span> ومتكاملة
            </motion.h2>
          </div>

          <motion.p
            className="text-gray-500 text-lg max-w-xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            من الفكرة حتى الإطلاق — كل ما تحتاجه في مكان واحد
          </motion.p>
        </div>

        {/* cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((s, i) => (
            <ServiceCard key={i} s={s} i={i} />
          ))}

          {/* CTA card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.65, delay: services.length * 0.09 }}
          >
            <Link href="/services"
              className="glass-card-hover h-full min-h-[200px] rounded-3xl p-8 flex flex-col items-center justify-center gap-4 border-dashed hover:border-neon-cyan/20 transition-all duration-300 group block">
              <motion.span
                className="w-14 h-14 flex items-center justify-center rounded-2xl bg-neon-cyan/8 text-neon-cyan"
                whileHover={{ scale: 1.15, rotate: -180 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <ArrowLeft size={24} />
              </motion.span>
              <span className="text-white font-bold text-lg">عرض جميع الخدمات</span>
              <span className="text-gray-600 text-sm text-center">اكتشف كل الحلول البرمجية</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
