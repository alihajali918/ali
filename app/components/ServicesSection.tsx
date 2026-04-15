"use client";

import { motion, useMotionValue, useMotionTemplate, useSpring, useInView } from "framer-motion";
import Link from "next/link";
import {
  Wrench, Building2, Code2, BarChart3,
  ArrowLeft, CheckCircle2,
} from "lucide-react";
import { useRef } from "react";

const services = [
  {
    icon: Wrench,
    title: "أدوات تقنية مجانية",
    desc: "QR Code، ضغط الملفات، تحويل الصور — أدوات يومية جاهزة بدون تسجيل.",
    color: "#00F5D4",
    badge: "مجاني 100%",
    points: ["مولّد QR Code متكامل", "ضاغط صور وPDF", "صور إلى PDF في ثانية"],
    href: "/tools/qrcode",
  },
  {
    icon: Building2,
    title: "حلول مؤسسية متكاملة",
    desc: "شهادات احترافية وتقارير تلقائية بهوية مؤسستك — استثمر مرة واستفد للأبد.",
    color: "#F59E0B",
    badge: "قريباً",
    points: ["شهادات جماعية من Excel", "تقارير بشعار مؤسستك", "روابط تحقق ذكية"],
    href: "/products",
  },
  {
    icon: Code2,
    title: "تطوير أدوات مخصصة",
    desc: "عندك عملية متكررة تستهلك وقت فريقك؟ نبنيها لك كأداة ويب تشتغل 24/7.",
    color: "#7B61FF",
    badge: "مخصص",
    points: ["تحليل المشكلة وتصميم الحل", "بناء وتطوير كامل", "دعم وتحديث مستمر"],
    href: "/contact",
  },
  {
    icon: BarChart3,
    title: "لوحات تحكم وأنظمة إدارة",
    desc: "قرارات مبنية على أرقام لا تخمين — بيانات عملك في مكان واحد، لحظياً.",
    color: "#00F5D4",
    badge: "مشروع",
    points: ["تتبع المبيعات والأداء", "تقارير تفاعلية قابلة للتصدير", "صلاحيات لكل الفريق"],
    href: "/contact",
  },
];

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
      className="glass-card relative rounded-3xl p-7 group cursor-pointer overflow-hidden flex flex-col"
    >
      {/* spotlight glow */}
      <motion.div className="absolute inset-0 pointer-events-none rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: glow }} />

      {/* top border line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"
        style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }} />

      {/* header */}
      <div className="flex items-start justify-between mb-5">
        <motion.div
          className="w-12 h-12 flex items-center justify-center rounded-2xl"
          style={{ background: `${s.color}10`, color: s.color }}
          whileHover={{ scale: 1.15, rotate: -8 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          <s.icon size={24} />
        </motion.div>

        <motion.span
          initial={{ scale: 0 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ delay: i * 0.09 + 0.3, type: "spring", stiffness: 400 }}
          className="text-[10px] font-black px-3 py-1 rounded-full tracking-wider"
          style={{ background: `${s.color}12`, color: s.color, border: `1px solid ${s.color}25` }}
        >
          {s.badge}
        </motion.span>
      </div>

      <h3 className="text-lg font-black mb-2 text-white">{s.title}</h3>
      <p className="text-gray-500 text-sm leading-relaxed mb-5">{s.desc}</p>

      {/* bullet points */}
      <ul className="flex flex-col gap-2 flex-1 mb-6">
        {s.points.map(p => (
          <li key={p} className="flex items-center gap-2 text-[12px] text-gray-400">
            <CheckCircle2 size={13} className="shrink-0" style={{ color: s.color }} />
            {p}
          </li>
        ))}
      </ul>

      {/* animated bottom line */}
      <motion.div
        className="h-[2px] rounded-full"
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
              تقنية تخدم <span className="text-gradient">الجميع</span>
            </motion.h2>
          </div>

          <motion.p
            className="text-gray-500 text-lg max-w-xl mx-auto"
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.25 }}
          >
            أدوات مجانية لأصحاب الأعمال — وحلول احترافية للمؤسسات والشركات
          </motion.p>
        </div>

        {/* cards grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {services.map((s, i) => (
            <ServiceCard key={i} s={s} i={i} />
          ))}
        </div>

        {/* CTA row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
        >
          <Link href="/services"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform">
            استكشف جميع الخدمات <ArrowLeft size={15}/>
          </Link>
          <Link href="/tools/qrcode"
            className="inline-flex items-center justify-center gap-2 px-7 py-3.5 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all">
            جرّب الأدوات مجاناً
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
