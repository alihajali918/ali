"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "البلدي القابضة",
    category: "موقع شركة عقارية",
    description: "منصة ويب متكاملة لشركة عقارية رائدة، تشمل عرض المشاريع والتواصل مع العملاء.",
    gradient: "from-cyan-500/20 via-teal-500/10 to-transparent",
    accent: "#00F5D4",
    tags: ["Next.js", "Tailwind", "PostgreSQL"],
  },
  {
    title: "فيليرو مول",
    category: "منصة تسوق إلكترونية",
    description: "متجر إلكتروني فاخر بتجربة مستخدم سلسة وواجهة عربية متكاملة مع نظام دفع محلي.",
    gradient: "from-purple-500/20 via-violet-500/10 to-transparent",
    accent: "#7B61FF",
    tags: ["React", "Node.js", "Stripe"],
  },
  {
    title: "تارجت",
    category: "لوحة تحكم إدارية",
    description: "نظام إدارة محتوى متطور مع تحليلات متقدمة ولوحة بيانات تفاعلية في الوقت الفعلي.",
    gradient: "from-orange-500/20 via-amber-500/10 to-transparent",
    accent: "#F59E0B",
    tags: ["Next.js", "Prisma", "Charts"],
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15 } },
};

const item = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
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
            <span className="section-badge mb-5 inline-flex">PORTFOLIO</span>
            <h2 className="text-3xl md:text-5xl font-black leading-tight">
              أعمال <span className="text-gradient">استثنائية</span>
            </h2>
          </div>
          <Link
            href="/portfolio"
            className="text-neon-cyan font-bold text-sm hover:text-white transition-colors flex items-center gap-2 self-start md:self-auto"
          >
            عرض كل الأعمال
            <ExternalLink size={14} />
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
          {projects.map((p, i) => (
            <motion.div
              key={i}
              variants={item}
              className="group relative rounded-3xl overflow-hidden border border-glass-border hover:border-white/12 transition-all duration-500 cursor-pointer"
              style={{ minHeight: "340px" }}
            >
              {/* خلفية متدرجة */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`}
              />
              <div className="absolute inset-0 bg-dark-card" style={{ zIndex: -1 }} />

              {/* شبكة نقاط */}
              <div
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "32px 32px",
                }}
              />

              {/* خط علوي ملوّن */}
              <div
                className="absolute top-0 right-0 left-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${p.accent}60, transparent)` }}
              />

              {/* المحتوى */}
              <div className="relative z-10 p-8 flex flex-col h-full" style={{ minHeight: "340px" }}>
                {/* أيقونة رقم */}
                <span
                  className="text-5xl font-black opacity-10 select-none"
                  style={{ color: p.accent }}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                <div className="mt-auto">
                  <span
                    className="text-xs font-bold tracking-widest uppercase mb-3 block"
                    style={{ color: p.accent }}
                  >
                    {p.category}
                  </span>
                  <h3 className="text-2xl font-black text-white mb-3">{p.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6">{p.description}</p>

                  {/* تاجات */}
                  <div className="flex flex-wrap gap-2">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 bg-glass border border-glass-border rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* رابط */}
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-gray-600 group-hover:text-white transition-colors duration-300">
                  <span>دراسة الحالة</span>
                  <ExternalLink
                    size={14}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform duration-300"
                    style={{ transform: "scaleX(-1)" }}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
