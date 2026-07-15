import type { Metadata } from "next";
import Footer from "../../components/Footer";
import { getSiteUrl } from "../../lib/site-url";
import Link from "next/link";
import {
  Zap, TrendingUp, Clock, Shield,
  Globe, ShoppingBag, Code2, BarChart3,
  ArrowLeft, CheckCircle2, Sparkles,
} from "lucide-react";

export const metadata: Metadata = {
  title: "الخدمات",
  description: "برمجة مواقع Next.js، متاجر إلكترونية، وتطبيقات ويب مخصصة تسرّع عملك وترفع كفاءة فريقك.",
  alternates: { canonical: `${getSiteUrl()}/services` },
};

const painPoints = [
  { icon: Clock,     text: "موقعك الحالي بطيء ويخسّرك عملاء كل يوم" },
  { icon: TrendingUp, text: "منافسوك يتقدمون بواجهات أحدث وتجربة أفضل" },
  { icon: Shield,    text: "لا يوجد نظام واضح لإدارة بيانات عملك" },
];

const services = [
  {
    icon: <Globe size={28} />,
    color: "#00F5D4",
    title: "مواقع تعريفية للشركات",
    hook: "أول انطباع يبقى",
    desc: "موقع احترافي سريع يعكس هوية شركتك ويحوّل الزوار لعملاء فعليين — بتصميم مخصص لا قوالب جاهزة.",
    outcomes: [
      "تصميم UI/UX مخصص بالكامل",
      "أداء وسرعة تحميل عالية",
      "SEO أساسي مدمج من أول يوم",
      "متجاوب مع كل الأجهزة",
    ],
    cta: { label: "ابدأ مشروعك", href: "/contact" },
    badge: "الأكثر طلباً",
    badgeColor: "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20",
  },
  {
    icon: <ShoppingBag size={28} />,
    color: "#F59E0B",
    title: "متاجر إلكترونية",
    hook: "متجر يبيع فعلاً",
    desc: "من عرض المنتجات إلى الدفع الإلكتروني — متجر متكامل بلوحة تحكم لإدارة المنتجات والطلبات.",
    outcomes: [
      "سلة شراء وبوابة دفع محلية",
      "إدارة منتجات وطلبات",
      "لوحة تحكم كاملة للمتجر",
      "تجربة شراء سلسة على الجوال",
    ],
    cta: { label: "تواصل معنا", href: "/contact" },
    badge: "E-commerce",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  {
    icon: <Code2 size={28} />,
    color: "#7B61FF",
    title: "تطبيقات ويب مخصصة",
    hook: "أداتك = ميزتك التنافسية",
    desc: "عندك فكرة أو عملية متكررة تستهلك وقت فريقك؟ نبنيها لك كتطبيق ويب جاهز يشتغل 24/7.",
    outcomes: [
      "تحليل المشكلة وتصميم الحل",
      "بناء وتطوير التطبيق كاملاً",
      "واجهة سهلة لكل فريقك",
      "دعم وتطوير مستمر",
    ],
    cta: { label: "ناقش فكرتك", href: "/contact" },
    badge: "مخصص",
    badgeColor: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  },
  {
    icon: <BarChart3 size={28} />,
    color: "#7B61FF",
    title: "لوحات تحكم وأنظمة إدارة",
    hook: "بياناتك تخبرك بكل شيء — لو عرفت كيف تقرأها",
    desc: "لوحات تحكم مخصصة تجمع بيانات عملك في مكان واحد. قرارات مبنية على أرقام، لا تخمين.",
    outcomes: [
      "تتبع المبيعات والأداء لحظياً",
      "تقارير تفاعلية قابلة للتصدير",
      "إدارة الصلاحيات لكل الفريق",
      "تكامل مع أنظمتك الحالية",
    ],
    cta: { label: "ناقش مشروعك", href: "/contact" },
    badge: "مشروع",
    badgeColor: "bg-neon-purple/10 text-neon-purple border-neon-purple/20",
  },
];

const whyUs = [
  { title: "مش مجرد مطوّر", desc: "أفهم التسويق والعمليات — أبني أدوات تحل مشاكل حقيقية، مش بس كود جميل." },
  { title: "تسليم سريع", desc: "لا انتظار أشهر — معظم الأدوات تنطلق في أسابيع قليلة." },
  { title: "تفكير طويل الأمد", desc: "ما أبيعك مشروع لمرة. أبني معك نظام يكبر مع عملك." },
  { title: "دعم حقيقي", desc: "بعد التسليم ما تختفي — دعم مستمر وتحديثات دورية." },
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen">

      {/* ── hero ── */}
      <section className="pt-40 pb-24 px-4 md:px-8 max-w-5xl mx-auto text-center">
        <span className="section-badge mb-6 inline-flex">
          <Sparkles size={11}/> موقعك هو أول انطباع عن عملك
        </span>
        <h1 className="text-4xl md:text-6xl font-black leading-tight mb-6">
          مشروعك يستحق موقعاً{" "}
          <span className="text-gradient">يشتغل بجد</span>
        </h1>
        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
          موقع بطيء أو تصميم قديم يخسّرك عملاء كل يوم دون أن تشعر.
          التقنية الصح لا تكلّفك — <span className="text-white font-semibold">هي تستثمر لك</span>.
        </p>
        <Link href="/contact"
          className="inline-flex items-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform">
          ابدأ المحادثة مجاناً <ArrowLeft size={16}/>
        </Link>
      </section>

      {/* ── pain points ── */}
      <section className="pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4">
          {painPoints.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i} className="glass-card rounded-2xl p-5 flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                  <Icon size={16} className="text-red-400"/>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{p.text}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── services ── */}
      <section className="pb-24 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            الحل؟ <span className="text-gradient">تقنية تشتغل لك</span>
          </h2>
          <p className="text-gray-500 text-base max-w-lg mx-auto">
            ثلاث مسارات — كل واحد مصمم لمرحلة مختلفة من نمو عملك
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div key={i}
              className="relative rounded-3xl border border-glass-border bg-dark-card overflow-hidden flex flex-col group hover:border-white/10 transition-all duration-300">
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, transparent, ${s.color}60, transparent)` }}/>

              <div className="p-7 flex flex-col flex-1">
                {/* header */}
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ color: s.color, background: `${s.color}12` }}>
                    {s.icon}
                  </div>
                  <span className={`text-[10px] font-black tracking-wider px-3 py-1 rounded-full border ${s.badgeColor}`}>
                    {s.badge}
                  </span>
                </div>

                <p className="text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: s.color }}>
                  {s.hook}
                </p>
                <h3 className="text-xl font-black text-white mb-3">{s.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed mb-6">{s.desc}</p>

                {/* outcomes */}
                <ul className="flex flex-col gap-2.5 flex-1 mb-7">
                  {s.outcomes.map(o => (
                    <li key={o} className="flex items-start gap-2.5 text-sm text-gray-400">
                      <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: s.color }}/>
                      {o}
                    </li>
                  ))}
                </ul>

                {/* cta */}
                <Link href={s.cta.href}
                  className="self-start flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black transition-all duration-300 hover:scale-105 active:scale-95"
                  style={{ background: `${s.color}15`, color: s.color, border: `1px solid ${s.color}30` }}>
                  {s.cta.label} <ArrowLeft size={14}/>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── why us ── */}
      <section className="pb-24 px-4 md:px-8 max-w-5xl mx-auto">
        <div className="rounded-3xl border border-white/6 bg-[#0d0d0d] overflow-hidden">
          <div className="p-8 md:p-12">
            <div className="flex items-center gap-3 mb-10">
              <Zap size={18} className="text-neon-cyan"/>
              <h2 className="text-2xl md:text-3xl font-black text-white">
                ليش أنا وليش هلق؟
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {whyUs.map((w, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="w-8 h-8 rounded-xl bg-neon-cyan/10 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-xs font-black text-neon-cyan">0{i + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-black text-white mb-1">{w.title}</p>
                    <p className="text-sm text-gray-500 leading-relaxed">{w.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── final cta ── */}
      <section className="pb-32 px-4 md:px-8 max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
          خطوة واحدة تفصلك عن{" "}
          <span className="text-gradient">تحويل فريقك</span>
        </h2>
        <p className="text-gray-500 text-base mb-8 leading-relaxed">
          ما نطلب منك ميزانية الآن. نطلب منك 15 دقيقة تفهمنا فيها عملك —
          وأنا أريك كيف التقنية ترفعه للمستوى الجاي.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-neon-cyan text-dark-bg font-black text-sm rounded-2xl glow-cyan hover:scale-105 active:scale-95 transition-transform">
            احجز استشارة مجانية <ArrowLeft size={16}/>
          </Link>
          <Link href="/portfolio"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 glass-card text-white font-bold text-sm rounded-2xl hover:border-white/15 transition-all">
            شوف أعمالي أولاً
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
