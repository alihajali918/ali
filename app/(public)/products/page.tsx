"use client";

export const dynamic = "force-static";

import Footer from "../../components/Footer";
import { motion } from "framer-motion";
import {
  QrCode, FileText, Award, Check, ArrowLeft,
  Zap, Lock, ImageDown, FileImage, FilePlus2,
  Building2, Wrench,
} from "lucide-react";

/* ─── tools — للجميع ─────────────────────────────────── */
const tools = [
  {
    id: "qrcode", icon: <QrCode size={26} />,
    name: "مولّد QR Code",
    tagline: "حوّل أي رابط أو نص إلى رمز QR احترافي في ثوانٍ",
    color: "#00F5D4", href: "/tools/qrcode",
    features: ["رابط · نص · إيميل · هاتف · بزنس كارد", "تحميل PNG و SVG", "تخصيص الألوان والزوايا", "إضافة شعار في المنتصف"],
  },
  {
    id: "compress", icon: <ImageDown size={26} />,
    name: "ضاغط الملفات",
    tagline: "قلّل حجم صورك وملفات PDF بدون فقدان ملحوظ في الجودة",
    color: "#00F5D4", href: "/tools/compress",
    features: ["ضغط صور: JPEG · WebP · PNG", "ضغط ملفات PDF بإعادة البناء", "تحكم بالجودة والحجم الأقصى", "تحميل الكل كملف ZIP"],
  },
  {
    id: "img2pdf", icon: <FileImage size={26} />,
    name: "صور إلى PDF",
    tagline: "حوّل صورك إلى ملف PDF احترافي بنقرة واحدة",
    color: "#7B61FF", href: "/tools/img2pdf",
    features: ["دعم JPG · PNG · WEBP · HEIC", "مقاسات مخصصة أو مقاس الصورة", "هامش قابل للتعديل", "تحميل مباشر بدون نافذة"],
  },
  {
    id: "pdf-merge", icon: <FilePlus2 size={26} />,
    name: "دمج PDF",
    tagline: "ادمج ملفات PDF وصور في ملف واحد — حتى 50 صفحة",
    color: "#F59E0B", href: "/tools/pdf-merge",
    features: ["دمج PDF + صور في ملف واحد", "ترتيب الصفحات بالسحب والإفلات", "معاينة الصفحات قبل الدمج", "تحميل مباشر حتى 50 صفحة"],
  },
];

/* ─── enterprise — للمؤسسات ──────────────────────────── */
const enterprise = [
  {
    id: "certs", icon: <Award size={28} />,
    name: "صانع الشهادات",
    tagline: "حل متكامل لمراكز التدريب والمؤسسات التعليمية",
    color: "#F59E0B",
    features: ["6 قوالب احترافية: كلاسيكي، ملكي، داكن وأكثر", "توليد جماعي من Excel (حتى 500 شهادة)", "تخصيص الشعار والهوية البصرية", "تصدير PNG وPDF · روابط تحقق ذكية", "مدعوم بالذكاء الاصطناعي"],
    audience: "مراكز التدريب · المدارس · الجامعات",
  },
  {
    id: "reports", icon: <FileText size={28} />,
    name: "صانع التقارير",
    tagline: "تقارير احترافية للشركات جاهزة في دقيقة",
    color: "#7B61FF",
    features: ["5 أنواع تقارير قابلة للتخصيص", "جدول بيانات ديناميكي", "شعار وألوان مؤسستك", "طباعة مباشرة أو تصدير PDF"],
    audience: "الشركات · المؤسسات · رواد الأعمال",
  },
];

const card = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] } },
};
const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

export default function ProductsPage() {
  return (
    <main className="min-h-screen">
      <div className="pt-36 pb-24 px-4 md:px-8 max-w-6xl mx-auto">

        {/* ── header ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }} className="text-center mb-20"
        >
          <span className="section-badge mb-5 inline-flex"><Zap size={11}/> أدوات وحلول مؤسسية</span>
          <h1 className="text-4xl md:text-6xl font-black leading-tight mb-4">
            تقنية تخدم <span className="text-gradient">الجميع</span>
          </h1>
          <p className="text-gray-500 text-base max-w-xl mx-auto">
            أدوات مجانية لأصحاب الأعمال والموظفين — وحلول مؤسسية متكاملة للشركات والمراكز التدريبية
          </p>
        </motion.div>

        {/* ══ قسم الأدوات ══ */}
        <div className="mb-20">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-neon-cyan/10 flex items-center justify-center">
              <Wrench size={16} className="text-neon-cyan"/>
            </div>
            <div>
              <h2 className="text-xl font-black text-white">الأدوات المجانية</h2>
              <p className="text-[12px] text-gray-600">لأصحاب الأعمال والموظفين — بدون تسجيل</p>
            </div>
            <span className="mr-auto text-[10px] font-black px-3 py-1 rounded-full bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">
              مجاني 100%
            </span>
          </div>

          <motion.div variants={container} initial="hidden" animate="visible"
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map(t => (
              <motion.a key={t.id} href={t.href} variants={card}
                className="relative flex flex-col rounded-2xl border border-glass-border bg-dark-card overflow-hidden group hover:border-white/12 transition-all duration-300 p-5">
                <div className="absolute top-0 left-0 right-0 h-[1px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${t.color}50, transparent)` }}/>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ color: t.color, background: `${t.color}12` }}>
                  {t.icon}
                </div>
                <h3 className="text-sm font-black text-white mb-1">{t.name}</h3>
                <p className="text-[11px] text-gray-600 mb-4 leading-relaxed flex-1">{t.tagline}</p>
                <ul className="flex flex-col gap-1.5 mb-4">
                  {t.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-[11px] text-gray-500">
                      <Check size={11} className="mt-0.5 shrink-0" style={{ color: t.color }}/>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center gap-1.5 text-[11px] font-black mt-auto pt-3 border-t border-white/5"
                  style={{ color: t.color }}>
                  استخدم الآن <ArrowLeft size={11}/>
                </div>
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* ══ قسم المؤسسات ══ */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <Building2 size={16} className="text-amber-400"/>
            </div>
            <div>
              <h2 className="text-xl font-black text-white">الحلول المؤسسية</h2>
              <p className="text-[12px] text-gray-600">حلول مخصصة للشركات والمؤسسات</p>
            </div>
            <span className="mr-auto text-[10px] font-black px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
              قريباً
            </span>
          </div>

          <motion.div variants={container} initial="hidden" animate="visible"
            className="grid md:grid-cols-2 gap-6">
            {enterprise.map(e => (
              <motion.div key={e.id} variants={card}
                className="relative flex flex-col rounded-3xl border border-glass-border bg-dark-card overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${e.color}60, transparent)` }}/>

                {/* lock overlay */}
                <div className="absolute inset-0 z-10 rounded-3xl flex flex-col items-center justify-center gap-3"
                  style={{ backdropFilter:"blur(14px)", WebkitBackdropFilter:"blur(14px)", background:"rgba(10,10,10,0.50)" }}>
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ background:"rgba(245,158,11,0.12)", border:"1px solid rgba(245,158,11,0.25)", boxShadow:"0 0 30px rgba(245,158,11,0.12)" }}>
                    <Lock size={22} style={{ color:"#F59E0B" }}/>
                  </div>
                  <span className="text-white font-black text-base">قريباً</span>
                  <span className="text-[11px] text-gray-500 tracking-widest">جارٍ التطوير</span>
                </div>

                <div className="p-7 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-5">
                    <div className="w-14 h-14 flex items-center justify-center rounded-2xl"
                      style={{ color: e.color, background: `${e.color}12` }}>
                      {e.icon}
                    </div>
                    <span className="text-[10px] font-bold text-gray-500 bg-white/4 border border-white/8 px-3 py-1 rounded-full">
                      {e.audience}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mb-2">{e.name}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5">{e.tagline}</p>
                  <ul className="flex flex-col gap-2.5">
                    {e.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-gray-400">
                        <Check size={14} className="mt-0.5 shrink-0" style={{ color: e.color }}/>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

      </div>
      <Footer />
    </main>
  );
}
