"use client";

import { motion, useAnimationFrame, useMotionValue, useTransform } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { useRef, useState } from "react";

const testimonials = [
  {
    name: "محمد العلي",
    role: "مدير تقنية المعلومات",
    company: "شركة خليجية",
    quote: "علي قدّم لنا موقعاً احترافياً يفوق التوقعات، الأداء ممتاز والتصميم يعكس هوية الشركة. سرعة التسليم كانت مذهلة.",
    rating: 5,
    avatar: "م",
    color: "#00F5D4",
  },
  {
    name: "سارة القحطاني",
    role: "مديرة التسويق",
    company: "متجر إلكتروني",
    quote: "المتجر الإلكتروني تجاوز كل توقعاتنا من ناحية السرعة وتجربة المستخدم. المبيعات ارتفعت بعد الإطلاق مباشرة.",
    rating: 5,
    avatar: "س",
    color: "#7B61FF",
  },
  {
    name: "خالد الدوسري",
    role: "الرئيس التنفيذي",
    company: "شركة ناشئة",
    quote: "لوحة التحكم التي طورها تساعدنا يومياً في إدارة العمليات. الاحترافية والالتزام بالمواعيد ميّزاه.",
    rating: 5,
    avatar: "خ",
    color: "#F59E0B",
  },
  {
    name: "نورة المطيري",
    role: "مديرة مركز تدريب",
    company: "مؤسسة تعليمية",
    quote: "أداة الشهادات وفّرت علينا ساعات من العمل. الآن ننشئ شهادات احترافية في دقائق. شكراً علي!",
    rating: 5,
    avatar: "ن",
    color: "#00F5D4",
  },
  {
    name: "فيصل الشمري",
    role: "مدير مشاريع",
    company: "مكتب استشاري",
    quote: "من أفضل المطورين اللي تعاملت معهم، يفهم المشكلة من أول مرة ويقدم حلولاً عملية وذكية.",
    rating: 5,
    avatar: "ف",
    color: "#7B61FF",
  },
];

/* duplicate for seamless loop */
const all = [...testimonials, ...testimonials];

function TestimonialCard({ t }: { t: typeof testimonials[0] }) {
  return (
    <div className="relative rounded-3xl p-7 flex flex-col gap-5 w-[320px] shrink-0 mx-3 overflow-hidden"
      style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}>
      {/* top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px]"
        style={{ background: `linear-gradient(90deg, transparent, ${t.color}50, transparent)` }} />

      <Quote size={22} style={{ color: t.color, opacity: 0.4 }} />

      <div className="flex gap-1">
        {Array.from({ length: t.rating }).map((_, j) => (
          <Star key={j} size={12} fill={t.color} color={t.color} />
        ))}
      </div>

      <p className="text-gray-300 text-sm leading-relaxed flex-1">"{t.quote}"</p>

      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-bg font-black text-sm shrink-0"
          style={{ background: t.color }}>
          {t.avatar}
        </div>
        <div>
          <p className="text-white font-bold text-sm">{t.name}</p>
          <p className="text-gray-600 text-xs">{t.role} · {t.company}</p>
        </div>
      </div>
    </div>
  );
}

/* ── infinite marquee ── */
function Marquee({ reversed = false }: { reversed?: boolean }) {
  const baseVelocity  = reversed ? 0.4 : -0.4;
  const x             = useMotionValue(0);
  const [paused, setPaused] = useState(false);
  const directionRef  = useRef(1);
  const prevT         = useRef(0);

  useAnimationFrame((t) => {
    if (paused) return;
    const delta = t - prevT.current;
    prevT.current = t;
    x.set(x.get() + baseVelocity * directionRef.current * (delta / 16));

    // reset for seamless loop (half the total width)
    const halfWidth = all.length / 2 * (320 + 24); // card width + gap
    if (Math.abs(x.get()) >= halfWidth) x.set(0);
  });

  return (
    <div
      className="overflow-hidden"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <motion.div className="flex" style={{ x }}>
        {all.map((t, i) => <TestimonialCard key={i} t={t} />)}
      </motion.div>
    </div>
  );
}

export default function Testimonials() {
  return (
    <section className="py-32 relative overflow-hidden">
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-glass-border to-transparent" />
      </div>

      {/* fade edges */}
      <div className="absolute top-0 bottom-0 left-0 w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to right, #0A0A0A, transparent)" }} />
      <div className="absolute top-0 bottom-0 right-0 w-32 z-10 pointer-events-none"
        style={{ background: "linear-gradient(to left, #0A0A0A, transparent)" }} />

      <div className="max-w-7xl mx-auto px-4 md:px-8 relative z-10 mb-14">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <span className="section-badge mb-6 inline-flex">TESTIMONIALS</span>
          <h2 className="text-3xl md:text-5xl font-black leading-tight">
            ماذا يقول <span className="text-gradient">عملاؤنا</span>
          </h2>
        </motion.div>
      </div>

      <div className="flex flex-col gap-5">
        <Marquee />
        <Marquee reversed />
      </div>
    </section>
  );
}
