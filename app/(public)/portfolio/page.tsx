export const dynamic = "force-static";

import type { Metadata } from "next";
import Footer from "../../components/Footer";
import { getSiteUrl } from "../../lib/site-url";
import {
  DoorOpen, Building2, Briefcase, ShoppingBag, HeartHandshake,
  BookOpen, Gauge, GraduationCap, Mic, ArrowUpRight, Briefcase as BriefcaseIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: "الأعمال",
  description: "معرض مشاريع ويب حقيقية أنجزتها لعملاء في قطر ولندن — مواقع مؤسسية، متاجر إلكترونية، ومنصات تعليمية.",
  alternates: { canonical: `${getSiteUrl()}/portfolio` },
};

const projects = [
  {
    icon: DoorOpen,
    title: "Door Technology Qatar",
    url: "https://door-technology.com/",
    category: "موقع مؤسسي · قطر",
    description: "موقع تعريفي لشركة متخصصة بأنظمة الأبواب والبوابات الأوتوماتيكية الذكية — عرض الخدمات والعلامات العالمية وطلب صيانة مباشر.",
    accent: "#00F5D4",
    tags: ["قطر", "خدمات هندسية"],
  },
  {
    icon: ShoppingBag,
    title: "Nasamat Al Doha",
    url: "https://nasamataldoha.com/",
    category: "متجر إلكتروني · قطر",
    description: "متجر إلكتروني لهدايا ومنتجات مخصصة حسب الطلب بجانب تشكيلة عامة من الإلكترونيات والأزياء.",
    accent: "#F59E0B",
    tags: ["قطر", "E-commerce"],
  },
  {
    icon: BookOpen,
    title: "Post Quran",
    url: "https://www.postquran.com/",
    category: "متجر إلكتروني · قطر",
    description: "متجر متخصص باستيراد وتوزيع المصاحف وكتب التفسير بإصدارات ومقاسات متعددة، معتمد من الجهات الدينية بقطر.",
    accent: "#7B61FF",
    tags: ["قطر", "E-commerce"],
  },
  {
    icon: Building2,
    title: "Ajnee",
    url: "https://ajnee.com/",
    category: "علامة أم · لندن وقطر",
    description: "الموقع الرئيسي لمجموعة Ajnee — شركة استثمار معرفي تجمع ثلاث منصات فرعية تحت هوية واحدة.",
    accent: "#00F5D4",
    tags: ["لندن · قطر", "تطوير مهني"],
  },
  {
    icon: BriefcaseIcon,
    title: "Career For Everyone",
    url: "https://careerforeveryone.com/",
    category: "منصة تطوير مهني",
    description: "منصة تساعد الأفراد يكتشفوا اهتماماتهم ونقاط قوتهم المهنية عبر مراحل حياتهم — ورش عمل وتقييمات معتمدة.",
    accent: "#F59E0B",
    tags: ["منصة تعليمية", "Ajnee"],
  },
  {
    icon: HeartHandshake,
    title: "Harmony",
    url: "https://harmonymold.com/",
    category: "تطوير شخصي · Ajnee",
    description: "أحد مسارات مجموعة Ajnee الثلاثة، مخصص للتوازن والتناغم الشخصي والمهني ضمن منظومة التطوير المتكاملة.",
    accent: "#7B61FF",
    tags: ["Ajnee", "تطوير شخصي"],
  },
  {
    icon: Gauge,
    title: "The Business Clock",
    url: "https://www.thebusinessclock.com/",
    category: "منصة إدارة أعمال · Ajnee",
    description: "نظام إدارة متكامل من ابتكار Ajnee بالشراكة مع Loida British — تدريب واستشارات ودعم لرفع كفاءة الشركات ونموها.",
    accent: "#00F5D4",
    tags: ["Ajnee", "استشارات أعمال"],
  },
  {
    icon: GraduationCap,
    title: "Loida British",
    url: "https://www.loidabritish.com/",
    category: "تدريب وتطوير مهني · لندن",
    description: "شركة بريطانية بخبرة تفوق 30 عاماً بمجال التدريب — دورات لغة، مهارات حياتية، وإرشاد أعمال.",
    accent: "#F59E0B",
    tags: ["لندن", "تدريب مهني"],
  },
  {
    icon: Mic,
    title: "نادي تميم توستماسترز",
    url: "https://alihajali.com/tamimtoastmasterclub",
    category: "تطبيق ويب · قطر",
    description: "صفحة نادٍ مستقلة مع لوحة تحكم خاصة مبنية بالكامل من الصفر — إدارة محتوى، روابط ديناميكية، وتصويت مباشر على الخطباء.",
    accent: "#7B61FF",
    tags: ["قطر", "تطبيق ويب مخصص"],
  },
];

export default function PortfolioPage() {
  return (
    <main className="min-h-screen">
      <div className="pt-40 pb-20 px-4 md:px-8 max-w-7xl mx-auto">

        {/* رأس الصفحة */}
        <div className="text-center mb-16">
          <span className="section-badge mb-6 inline-flex">PORTFOLIO</span>
          <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
            أعمال <span className="text-gradient">تحكي عني</span>
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            مشاريع حقيقية لعملاء في قطر ولندن — والقائمة بتزيد قريباً
          </p>
        </div>

        {/* الشبكة */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p, i) => {
            const Icon = p.icon;
            return (
              <a
                key={i}
                href={p.url}
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-3xl border border-glass-border bg-dark-card overflow-hidden flex flex-col hover:border-white/15 transition-all duration-300"
              >
                <div className="absolute top-0 left-0 right-0 h-[2px]"
                  style={{ background: `linear-gradient(90deg, transparent, ${p.accent}60, transparent)` }} />

                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
                      style={{ background: `${p.accent}12`, color: p.accent }}>
                      <Icon size={20} />
                    </div>
                    <ArrowUpRight size={15} className="text-gray-600 group-hover:text-white group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
                  </div>

                  <p className="text-[11px] font-black tracking-widest uppercase mb-1.5" style={{ color: p.accent }}>
                    {p.category}
                  </p>
                  <h2 className="text-lg font-black text-white mb-2">{p.title}</h2>
                  <p className="text-gray-500 text-sm leading-relaxed mb-5 flex-1">{p.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {p.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 text-[11px] font-semibold text-gray-400 bg-glass border border-glass-border rounded-lg">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            );
          })}
        </div>
      </div>

      <Footer />
    </main>
  );
}
