export const dynamic = "force-static";

import type { Metadata } from "next";
import Footer from "../../components/Footer";
import { getSiteUrl } from "../../lib/site-url";
import Link from "next/link";
import { Building2, ShoppingBag, LayoutDashboard, ArrowLeft, Briefcase } from "lucide-react";

export const metadata: Metadata = {
  title: "الأعمال",
  description: "معرض أعمال ومشاريع ويب: مواقع شركات، متاجر إلكترونية، ولوحات تحكم مخصصة.",
  alternates: { canonical: `${getSiteUrl()}/portfolio` },
};

const projects = [
  {
    icon: Building2,
    title: "موقع شركة عقارية",
    category: "موقع تعريفي · نموذج مشروع",
    description:
      "موقع تعريفي فاخر لشركة عقارات — عرض مشاريع سكنية وتجارية، نموذج طلب معاينة، وتصميم يعكس هوية الشركة بالكامل.",
    gradient: "from-cyan-500/25 via-teal-400/10 to-transparent",
    accent: "#00F5D4",
    tags: ["Next.js 15", "Tailwind CSS", "SEO", "متجاوب بالكامل"],
    num: "01",
  },
  {
    icon: ShoppingBag,
    title: "متجر إلكتروني",
    category: "E-commerce · نموذج مشروع",
    description:
      "متجر كامل لبيع المنتجات أونلاين — سلة شراء، بوابة دفع، وإدارة مخزون وطلبات من لوحة تحكم مخصصة.",
    gradient: "from-amber-500/25 via-orange-400/10 to-transparent",
    accent: "#F59E0B",
    tags: ["Next.js 15", "بوابة دفع", "لوحة تحكم", "قاعدة بيانات"],
    num: "02",
  },
  {
    icon: LayoutDashboard,
    title: "لوحة تحكم SaaS",
    category: "تطبيق ويب · نموذج مشروع",
    description:
      "نظام إدارة داخلي مخصص لتتبع البيانات والعمليات — صلاحيات متعددة المستويات وتقارير لحظية قابلة للتصدير.",
    gradient: "from-purple-500/25 via-violet-400/10 to-transparent",
    accent: "#7B61FF",
    tags: ["Next.js 15", "PostgreSQL", "مصادقة", "تقارير"],
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
            <Briefcase size={11} />
            PORTFOLIO
          </span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            أعمال <span className="text-gradient">تحكي عني</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            نماذج من نوعية المشاريع التي أبنيها — كل مشروع مصمم ليخدم هدف عمل حقيقي
          </p>
        </div>

        {/* الكروت */}
        <div className="flex flex-col gap-8">
          {projects.map((p, i) => {
            const Icon = p.icon;
            return (
              <div key={i}
                className="group relative rounded-3xl overflow-hidden border border-glass-border hover:border-white/12 transition-all duration-500"
              >
                {/* خلفية */}
                <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
                <div className="absolute inset-0 bg-dark-card" style={{ zIndex: -1 }} />
                <div aria-hidden className="absolute inset-0 opacity-[0.03] pointer-events-none"
                  style={{ backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)", backgroundSize: "40px 40px" }} />

                {/* خط علوي */}
                <div className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  style={{ background: `linear-gradient(90deg, transparent, ${p.accent}50, transparent)` }} />

                {/* محتوى */}
                <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start gap-10">
                  {/* رقم كبير */}
                  <span className="text-8xl md:text-[10rem] font-black leading-none opacity-[0.08] select-none flex-shrink-0"
                    style={{ color: p.accent }}>
                    {p.num}
                  </span>

                  {/* تفاصيل */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{ background: `${p.accent}15`, color: p.accent }}>
                        <Icon size={20} />
                      </div>
                      <span className="text-xs font-black tracking-widest uppercase" style={{ color: p.accent }}>
                        {p.category}
                      </span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{p.title}</h2>
                    <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">{p.description}</p>

                    {/* تاجات */}
                    <div className="flex flex-wrap gap-2 mb-8">
                      {p.tags.map((tag) => (
                        <span key={tag}
                          className="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-glass border border-glass-border rounded-xl">
                          {tag}
                        </span>
                      ))}
                    </div>

                    {/* رابط */}
                    <Link href="/contact"
                      className="inline-flex items-center gap-2 text-sm font-black px-6 py-3 rounded-2xl transition-all duration-300 hover:scale-105"
                      style={{ background: `${p.accent}15`, color: p.accent, border: `1px solid ${p.accent}30` }}>
                      أريد مشروعاً مشابهاً
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
