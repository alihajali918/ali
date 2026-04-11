export const dynamic = "force-static";

import Footer from "../../components/Footer";
import Link from "next/link";
import { QrCode, Award, FileText, ArrowLeft, Zap } from "lucide-react";

const tools = [
  {
    icon: QrCode,
    title: "مولّد QR Code",
    category: "أداة مجانية · متاحة الآن",
    description:
      "أنشئ QR Code احترافي لأي رابط أو نص أو بيانات تواصل — مع تخصيص كامل للألوان والشكل والشعار. مجانية 100% بدون تسجيل.",
    gradient: "from-cyan-500/25 via-teal-400/10 to-transparent",
    accent: "#00F5D4",
    tags: ["Next.js 15", "Canvas API", "مجاني", "بدون تسجيل"],
    href: "/tools/qrcode",
    num: "01",
  },
  {
    icon: Award,
    title: "صانع الشهادات",
    category: "أداة احترافية · متاحة الآن",
    description:
      "منصة إنشاء شهادات إتمام دورات بتصاميم فاخرة — مناسبة لمراكز التدريب والمؤسسات التعليمية. قوالب متعددة وتخصيص كامل.",
    gradient: "from-purple-500/25 via-violet-400/10 to-transparent",
    accent: "#7B61FF",
    tags: ["Next.js 15", "html2canvas", "PDF/PNG", "قوالب متعددة"],
    href: "/tools/certs",
    num: "02",
  },
  {
    icon: FileText,
    title: "مولّد التقارير",
    category: "أداة بيانات · متاحة الآن",
    description:
      "حوّل بياناتك إلى تقارير Excel منظمة وجاهزة في ثوانٍ. بدون خبرة تقنية — أدخل البيانات وحمّل الملف.",
    gradient: "from-amber-500/25 via-orange-400/10 to-transparent",
    accent: "#F59E0B",
    tags: ["Next.js 15", "XLSX", "Excel", "سريع جداً"],
    href: "/tools/reports",
    num: "03",
  },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen">
      <div className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto">

        {/* رأس الصفحة */}
        <div className="text-center mb-20">
          <span className="section-badge mb-6 inline-flex">
            <Zap size={11} />
            TOOLS
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            أدوات <span className="text-gradient">تشتغل لك</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            كل أداة حُلّ لمشكلة حقيقية — توفر وقتك وتسرّع عملك
          </p>
        </div>

        {/* الكروت */}
        <div className="flex flex-col gap-8">
          {tools.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i}
                className="group relative rounded-3xl overflow-hidden border border-glass-border hover:border-white/12 transition-all duration-500"
              >
                {/* خلفية */}
                <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient}`} />
                <div className="absolute inset-0 bg-dark-card" style={{ zIndex: -1 }} />
                <div aria-hidden className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                {/* خط علوي */}
                <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${t.accent}50, transparent)` }} />

                {/* محتوى */}
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start gap-10">
                  {/* رقم كبير */}
                  <span className="text-8xl md:text-[10rem] font-black leading-none opacity-[0.08] select-none flex-shrink-0"
                    style={{ color: t.accent }}>
                    {t.num}
                  </span>

                  {/* تفاصيل */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${t.accent}15`, color: t.accent }}>
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-black tracking-widest uppercase" style={{ color: t.accent }}>
                        {t.category}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{t.title}</h2>
                    <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">{t.description}</p>

                    {/* تاجات */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {t.tags.map((tag) => (
                        <span key={tag}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-glass border border-glass-border rounded-xl">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* رابط */}
                    <Link href={t.href}
                      className="inline-flex items-center gap-2 text-sm font-black px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                      style={{ background: `${t.accent}15`, color: t.accent, border: `1px solid ${t.accent}30` }}>
                      جرّب الأداة الآن
                      <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
