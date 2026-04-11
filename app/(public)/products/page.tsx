"use client";

export const dynamic = "force-static";

import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import {
  QrCode,
  FileText,
  Award,
  Check,
  ArrowLeft,
  Zap,
  Lock,
} from "lucide-react";

const products = [
  {
    id: "qrcode",
    icon: <QrCode size={30} />,
    name: "صانع QR Code",
    tagline: "حوّل أي رابط أو نص إلى رمز QR احترافي في ثوانٍ",
    type: "مجاني",
    typeBadge: "free",
    price: null,
    priceLabel: "مجاني تماماً",
    color: "#00F5D4",
    href: "/tools/qrcode",
    btnLabel: "استخدم الآن",
    features: [
      "رابط · نص · إيميل · هاتف · بزنس كارد",
      "تحميل PNG و SVG",
      "تخصيص الألوان والزوايا",
      "إضافة شعار في المنتصف",
      "توليد جماعي من Excel + ZIP",
    ],
    available: true,
  },
  {
    id: "reports",
    icon: <FileText size={30} />,
    name: "صانع التقارير",
    tagline: "أدخل بيانات شركتك واطبع تقريراً احترافياً في دقيقة",
    type: "مجاني",
    typeBadge: "free",
    price: null,
    priceLabel: "مجاني تماماً",
    color: "#7B61FF",
    href: "/tools/reports",
    btnLabel: "استخدم الآن",
    features: [
      "5 أنواع تقارير جاهزة",
      "جدول بيانات ديناميكي",
      "شعار وألوان مخصصة",
      "طباعة مباشرة أو PDF",
    ],
    available: true,
  },
  {
    id: "certs",
    icon: <Award size={30} />,
    name: "صانع الشهادات",
    tagline: "3 قوالب احترافية — خصّص وحمّل بدقة عالية PNG",
    type: "مجاني",
    typeBadge: "free",
    price: null,
    priceLabel: "مجاني تماماً",
    color: "#F59E0B",
    href: "/tools/certs",
    btnLabel: "استخدم الآن",
    features: [
      "3 قوالب: كلاسيكي، داكن، مؤسسي",
      "تخصيص الألوان والشعار",
      "توليد جماعي (حتى 500 شهادة بضغطة زر)",
      "تحميل PNG بدقة 1200×848",
      "طباعة مباشرة",
    ],
    available: true,
  },
];

const badgeStyles: Record<string, string> = {
  free: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
  onetime: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  subscription: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const card = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      <div className="pt-36 pb-24 px-4 md:px-8 max-w-6xl mx-auto">
        {/* رأس الصفحة */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
          className="text-center mb-16"
        >
          <span className="section-badge mb-5 inline-flex">
            منتجاتي الرقمية
          </span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            أدوات جاهزة، <span className="text-gradient">تحل مشاكل حقيقية</span>
          </h1>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            اشترِ مرة أو اشترك شهرياً — كل أداة مستقلة وجاهزة للاستخدام فور
            الدفع.
          </p>
        </motion.div>

        {/* كروت المنتجات */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="visible"
          className="grid md:grid-cols-3 gap-6"
        >
          {products.map((p) => (
            <motion.div
              key={p.id}
              variants={card}
              className="relative flex flex-col rounded-3xl border border-glass-border bg-dark-card overflow-hidden group hover:border-white/12 transition-all duration-400"
            >
              {/* خط علوي ملوّن */}
              <div
                className="absolute top-0 left-0 right-0 h-[2px]"
                style={{
                  background: `linear-gradient(90deg, transparent, ${p.color}60, transparent)`,
                }}
              />

              {/* "قريباً" overlay */}
              {!p.available && (
                <div className="absolute inset-0 bg-dark-bg/60 backdrop-blur-[2px] z-20 flex flex-col items-center justify-center gap-3 rounded-3xl">
                  <Lock size={28} className="text-gray-500" />
                  <span className="text-white font-black text-lg">قريباً</span>
                  <span className="text-gray-500 text-xs">جارٍ التطوير</span>
                </div>
              )}

              <div className="p-7 flex flex-col flex-1">
                {/* أيقونة + شارة النوع */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="w-14 h-14 flex items-center justify-center rounded-2xl"
                    style={{ color: p.color, background: `${p.color}12` }}
                  >
                    {p.icon}
                  </div>
                  <span
                    className={`text-[10px] font-black tracking-wider uppercase px-3 py-1 rounded-full border ${badgeStyles[p.typeBadge]}`}
                  >
                    {p.type}
                  </span>
                </div>

                {/* اسم المنتج */}
                <h2 className="text-xl font-black text-white mb-2">{p.name}</h2>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">
                  {p.tagline}
                </p>

                {/* مميزات */}
                <ul className="flex flex-col gap-2.5 flex-1 mb-7">
                  {p.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2.5 text-sm text-gray-400"
                    >
                      <Check
                        size={14}
                        className="mt-0.5 flex-shrink-0"
                        style={{ color: p.color }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* سعر + زر */}
                <div className="border-t border-glass-border pt-5 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-600 mb-0.5">السعر</p>
                    <p className="text-lg font-black text-white">
                      {p.priceLabel}
                    </p>
                  </div>
                  <a
                    href={p.href}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 hover:scale-105 active:scale-95"
                    style={{
                      background: p.price ? p.color : `${p.color}15`,
                      color: p.price ? "#0A0A0A" : p.color,
                      border: p.price ? "none" : `1px solid ${p.color}30`,
                    }}
                  >
                    {p.btnLabel}
                    <ArrowLeft size={14} style={{ transform: "scaleX(1)" }} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ملاحظة ضمان */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-12 flex items-center justify-center gap-2 text-gray-600 text-sm"
        >
          <Zap size={14} className="text-neon-cyan" />
          وصول فوري بعد الدفع · دعم عبر الواتساب · ضمان استرداد 7 أيام
        </motion.div>
      </div>

      <Footer />
    </main>
  );
}
