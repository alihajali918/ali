"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "محمد العلي",
    role: "مدير تقنية المعلومات · البلدي القابضة",
    quote:
      "علي قدّم لنا موقعاً احترافياً يفوق التوقعات، الأداء ممتاز والتصميم يعكس هوية الشركة بشكل رائع. لن نتعامل مع أي مطور آخر.",
    rating: 5,
    avatar: "م",
    color: "#00F5D4",
  },
  {
    name: "سارة القحطاني",
    role: "مديرة التسويق · فيليرو مول",
    quote:
      "المتجر الإلكتروني الذي بناه تجاوز كل توقعاتنا من ناحية السرعة وتجربة المستخدم. المبيعات ارتفعت 40% بعد إطلاق الموقع.",
    rating: 5,
    avatar: "س",
    color: "#7B61FF",
  },
  {
    name: "خالد الدوسري",
    role: "الرئيس التنفيذي · تارجت",
    quote:
      "لوحة التحكم التي طورها تساعدنا يومياً في إدارة العمليات. الاحترافية والالتزام بالمواعيد ميّزاه عن كل من تعاملنا معهم.",
    rating: 5,
    avatar: "خ",
    color: "#F59E0B",
  },
];

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function Testimonials() {
  return (
    <section className="py-32 px-4 md:px-8 relative overflow-hidden">
      {/* خلفية */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
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
          <span className="section-badge mb-6 inline-flex">TESTIMONIALS</span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            ماذا يقول <span className="text-gradient">عملاؤنا</span>
          </h2>
        </motion.div>

        {/* الكروت */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-6"
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              variants={item}
              className="glass-card rounded-3xl p-8 flex flex-col gap-6 hover:border-white/12 transition-all duration-400"
              style={{
                borderColor: i === 0 ? "rgba(0,245,212,0.1)" : undefined,
              }}
            >
              {/* نجوم */}
              <div className="flex gap-1">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star
                    key={j}
                    size={14}
                    fill={t.color}
                    color={t.color}
                  />
                ))}
              </div>

              {/* الاقتباس */}
              <p className="text-gray-300 text-sm leading-loose flex-1">
                &ldquo;{t.quote}&rdquo;
              </p>

              {/* الشخص */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center text-dark-bg font-black text-sm flex-shrink-0"
                  style={{ background: t.color }}
                >
                  {t.avatar}
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{t.name}</p>
                  <p className="text-gray-600 text-xs mt-0.5">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
