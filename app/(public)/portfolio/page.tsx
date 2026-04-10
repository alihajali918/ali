export const dynamic = "force-static";

import Footer from "../components/Footer";
import { ExternalLink } from "lucide-react";

const projects = [
  {
    title: "البلدي القابضة",
    category: "موقع شركة عقارية",
    description:
      "منصة ويب متكاملة لشركة عقارية رائدة في قطر، تشمل عرض المشاريع والوحدات السكنية مع نظام تواصل متطور مع العملاء.",
    gradient: "from-cyan-500/25 via-teal-400/10 to-transparent",
    accent: "#00F5D4",
    tags: ["Next.js 15", "Tailwind CSS", "PostgreSQL", "Prisma"],
    year: "2025",
    type: "Full-Stack",
    num: "01",
  },
  {
    title: "فيليرو مول",
    category: "منصة تسوق إلكترونية",
    description:
      "متجر إلكتروني فاخر بتجربة مستخدم سلسة وواجهة عربية متكاملة، مع نظام دفع محلي ودولي وإدارة مخزون متقدمة.",
    gradient: "from-purple-500/25 via-violet-400/10 to-transparent",
    accent: "#7B61FF",
    tags: ["React 19", "Node.js", "Stripe", "MongoDB"],
    year: "2025",
    type: "E-Commerce",
    num: "02",
  },
  {
    title: "تارجت",
    category: "لوحة تحكم إدارية",
    description:
      "نظام إدارة محتوى متطور مع تحليلات متقدمة ولوحة بيانات تفاعلية في الوقت الفعلي وإدارة الصلاحيات.",
    gradient: "from-amber-500/25 via-orange-400/10 to-transparent",
    accent: "#F59E0B",
    tags: ["Next.js", "Prisma", "Charts.js", "Auth.js"],
    year: "2024",
    type: "Dashboard",
    num: "03",
  },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen">

      <div className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* رأس الصفحة */}
        <div className="text-center mb-20">
          <span className="section-badge mb-6 inline-flex">PORTFOLIO</span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            أعمال <span className="text-gradient">استثنائية</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            مشاريع حقيقية لعملاء حقيقيين — كل مشروع قصة نجاح بحد ذاتها
          </p>
        </div>

        {/* الكروت */}
        <div className="flex flex-col gap-8">
          {projects.map((p, i) => (
            <div
              key={i}
              className="group relative rounded-3xl overflow-hidden border border-glass-border hover:border-white/12 transition-all duration-500"
            >
              {/* خلفية */}
              <div className={`absolute inset-0 bg-gradient-to-br ${p.gradient}`} />
              <div className="absolute inset-0 bg-dark-card" style={{ zIndex: -1 }} />
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.03] pointer-events-none"
                style={{
                  backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
                  backgroundSize: "40px 40px",
                }}
              />

              {/* خط علوي */}
              <div
                className="absolute top-0 left-0 right-0 h-[1px] opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{ background: `linear-gradient(90deg, transparent, ${p.accent}50, transparent)` }}
              />

              {/* محتوى */}
              <div className="relative z-10 p-8 md:p-12 flex flex-col md:flex-row items-start gap-10">
                {/* رقم كبير */}
                <span
                  className="text-8xl md:text-[10rem] font-black leading-none opacity-8 select-none flex-shrink-0"
                  style={{ color: p.accent }}
                >
                  {p.num}
                </span>

                {/* تفاصيل */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span
                      className="text-xs font-black tracking-widest uppercase"
                      style={{ color: p.accent }}
                    >
                      {p.category}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="text-xs text-gray-600 font-semibold">{p.type}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-600" />
                    <span className="text-xs text-gray-600 font-semibold">{p.year}</span>
                  </div>

                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4">{p.title}</h2>
                  <p className="text-gray-400 text-base leading-relaxed mb-8 max-w-xl">{p.description}</p>

                  {/* تاجات */}
                  <div className="flex flex-wrap gap-2 mb-8">
                    {p.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 text-xs font-semibold text-gray-400 bg-glass border border-glass-border rounded-xl"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* رابط */}
                  <button
                    className="flex items-center gap-2 text-sm font-bold transition-all duration-300 group/btn"
                    style={{ color: p.accent }}
                  >
                    <span className="group-hover/btn:underline">عرض دراسة الحالة</span>
                    <ExternalLink
                      size={14}
                      className="group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform"
                      style={{ transform: "scaleX(-1)" }}
                    />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
